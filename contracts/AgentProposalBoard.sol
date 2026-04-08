// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AgentSafeVault} from "./AgentSafeVault.sol";

contract AgentProposalBoard {
    enum ActionType {
        NativeTransfer,
        ContractCall
    }

    enum ProposalStatus {
        Pending,
        Approved,
        Rejected,
        Executed,
        Expired,
        Cancelled
    }

    struct PolicyConfig {
        bool approvalRequired;
        uint256 maxValuePerTx;
        uint64 cooldownSeconds;
        address[] allowedRecipients;
        address[] allowedTargets;
        bool allowNativeTransfers;
        bool allowContractCalls;
    }

    struct VaultConfig {
        address vault;
        address owner;
        string name;
        uint64 lastExecutedAt;
        bool exists;
    }

    struct Proposal {
        uint256 id;
        uint256 vaultId;
        address proposer;
        address target;
        uint256 value;
        bytes data;
        ActionType actionType;
        string reason;
        ProposalStatus status;
        uint64 createdAt;
        uint64 approvedAt;
        uint64 executedAt;
        uint64 expiresAt;
        bytes32 policySnapshotHash;
    }

    address public owner;
    address public factory;
    uint256 public nextProposalId = 1;

    mapping(uint256 => VaultConfig) public vaults;
    mapping(uint256 => PolicyConfig) internal _policies;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public isOperator;

    event FactorySet(address indexed factory);
    event VaultRegistered(uint256 indexed vaultId, address indexed vault, address indexed vaultOwner, string name);
    event OperatorAdded(uint256 indexed vaultId, address indexed operator);
    event OperatorRemoved(uint256 indexed vaultId, address indexed operator);
    event PolicyUpdated(uint256 indexed vaultId, bytes32 indexed policySnapshotHash);
    event ProposalSubmitted(
        uint256 indexed proposalId,
        uint256 indexed vaultId,
        address indexed proposer,
        ActionType actionType,
        address target,
        uint256 value
    );
    event ProposalApproved(uint256 indexed proposalId, address indexed approver);
    event ProposalRejected(uint256 indexed proposalId, address indexed approver);
    event ProposalCancelled(uint256 indexed proposalId, address indexed sender);
    event ProposalExecuted(uint256 indexed proposalId, address indexed executor, bytes result);

    error Unauthorized();
    error InvalidFactory();
    error FactoryAlreadySet();
    error VaultNotFound();
    error InvalidPolicy();
    error InvalidTarget();
    error InvalidValue();
    error InvalidData();
    error PolicyViolation();
    error InvalidStatus();
    error ProposalExpired();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyFactory() {
        if (msg.sender != factory) revert Unauthorized();
        _;
    }

    modifier onlyVaultOwner(uint256 vaultId) {
        if (msg.sender != vaults[vaultId].owner) revert Unauthorized();
        _;
    }

    modifier onlyMember(uint256 vaultId) {
        VaultConfig storage vault = vaults[vaultId];
        if (msg.sender != vault.owner && !isOperator[vaultId][msg.sender]) revert Unauthorized();
        _;
    }

    constructor(address initialOwner) {
        owner = initialOwner;
    }

    function setFactory(address initialFactory) external onlyOwner {
        if (initialFactory == address(0)) revert InvalidFactory();
        if (factory != address(0)) revert FactoryAlreadySet();
        factory = initialFactory;
        emit FactorySet(initialFactory);
    }

    function registerVault(
        uint256 vaultId,
        address vault,
        address vaultOwner,
        string calldata name,
        address[] calldata operators,
        PolicyConfig calldata policy
    ) external onlyFactory {
        if (vault == address(0) || vaultOwner == address(0)) revert InvalidTarget();
        if (vaults[vaultId].exists) revert InvalidStatus();

        vaults[vaultId] = VaultConfig({
            vault: vault,
            owner: vaultOwner,
            name: name,
            lastExecutedAt: 0,
            exists: true
        });

        for (uint256 i = 0; i < operators.length; ++i) {
            address operator = operators[i];
            if (operator == address(0)) revert InvalidTarget();
            isOperator[vaultId][operator] = true;
            emit OperatorAdded(vaultId, operator);
        }

        _writePolicy(vaultId, policy);
        emit VaultRegistered(vaultId, vault, vaultOwner, name);
    }

    function depositToVault(uint256 vaultId) external payable onlyMember(vaultId) {
        if (!vaults[vaultId].exists) revert VaultNotFound();
        (bool ok,) = payable(vaults[vaultId].vault).call{value: msg.value}("");
        if (!ok) revert InvalidStatus();
    }

    function updatePolicy(uint256 vaultId, PolicyConfig calldata policy) external onlyVaultOwner(vaultId) {
        _writePolicy(vaultId, policy);
    }

    function addOperator(uint256 vaultId, address operator) external onlyVaultOwner(vaultId) {
        if (operator == address(0)) revert InvalidTarget();
        isOperator[vaultId][operator] = true;
        emit OperatorAdded(vaultId, operator);
    }

    function removeOperator(uint256 vaultId, address operator) external onlyVaultOwner(vaultId) {
        isOperator[vaultId][operator] = false;
        emit OperatorRemoved(vaultId, operator);
    }

    function submitProposal(
        uint256 vaultId,
        address target,
        uint256 value,
        bytes calldata data,
        ActionType actionType,
        string calldata reason,
        uint64 expiresAt
    ) external onlyMember(vaultId) returns (uint256 proposalId) {
        if (!vaults[vaultId].exists) revert VaultNotFound();
        if (expiresAt <= block.timestamp) revert ProposalExpired();
        if (!_checkActionAgainstPolicy(vaultId, target, value, data, actionType, false)) revert PolicyViolation();

        proposalId = nextProposalId++;
        PolicyConfig storage policy = _policies[vaultId];
        ProposalStatus status = policy.approvalRequired ? ProposalStatus.Pending : ProposalStatus.Approved;
        uint64 approvedAt = policy.approvalRequired ? 0 : uint64(block.timestamp);

        proposals[proposalId] = Proposal({
            id: proposalId,
            vaultId: vaultId,
            proposer: msg.sender,
            target: target,
            value: value,
            data: data,
            actionType: actionType,
            reason: reason,
            status: status,
            createdAt: uint64(block.timestamp),
            approvedAt: approvedAt,
            executedAt: 0,
            expiresAt: expiresAt,
            policySnapshotHash: _policyHash(vaultId)
        });

        emit ProposalSubmitted(proposalId, vaultId, msg.sender, actionType, target, value);
        if (!policy.approvalRequired) {
            emit ProposalApproved(proposalId, msg.sender);
        }
    }

    function approveProposal(uint256 proposalId) external onlyVaultOwner(proposals[proposalId].vaultId) {
        Proposal storage proposal = proposals[proposalId];
        _expireIfNeeded(proposal);
        if (proposal.status != ProposalStatus.Pending) revert InvalidStatus();
        proposal.status = ProposalStatus.Approved;
        proposal.approvedAt = uint64(block.timestamp);
        emit ProposalApproved(proposalId, msg.sender);
    }

    function rejectProposal(uint256 proposalId) external onlyVaultOwner(proposals[proposalId].vaultId) {
        Proposal storage proposal = proposals[proposalId];
        _expireIfNeeded(proposal);
        if (proposal.status != ProposalStatus.Pending && proposal.status != ProposalStatus.Approved) revert InvalidStatus();
        proposal.status = ProposalStatus.Rejected;
        emit ProposalRejected(proposalId, msg.sender);
    }

    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        uint256 vaultId = proposal.vaultId;
        if (msg.sender != proposal.proposer && msg.sender != vaults[vaultId].owner) revert Unauthorized();
        _expireIfNeeded(proposal);
        if (proposal.status != ProposalStatus.Pending && proposal.status != ProposalStatus.Approved) revert InvalidStatus();
        proposal.status = ProposalStatus.Cancelled;
        emit ProposalCancelled(proposalId, msg.sender);
    }

    function executeProposal(uint256 proposalId) external onlyVaultOwner(proposals[proposalId].vaultId) returns (bytes memory result) {
        Proposal storage proposal = proposals[proposalId];
        VaultConfig storage vault = vaults[proposal.vaultId];
        _expireIfNeeded(proposal);
        if (proposal.status != ProposalStatus.Approved) revert InvalidStatus();
        if (!_checkActionAgainstPolicy(proposal.vaultId, proposal.target, proposal.value, proposal.data, proposal.actionType, true)) {
            revert PolicyViolation();
        }

        proposal.status = ProposalStatus.Executed;
        proposal.executedAt = uint64(block.timestamp);
        vault.lastExecutedAt = uint64(block.timestamp);

        result = AgentSafeVault(payable(vault.vault)).execute(proposal.target, proposal.value, proposal.data);
        emit ProposalExecuted(proposalId, msg.sender, result);
    }

    function getPolicy(uint256 vaultId) external view returns (PolicyConfig memory) {
        if (!vaults[vaultId].exists) revert VaultNotFound();
        return _policies[vaultId];
    }

    function checkActionAgainstPolicy(uint256 vaultId, address target, uint256 value, bytes calldata data, ActionType actionType)
        external
        view
        returns (bool)
    {
        return _checkActionAgainstPolicy(vaultId, target, value, data, actionType, true);
    }

    function canExecute(uint256 proposalId) external view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.status != ProposalStatus.Approved) return false;
        if (proposal.expiresAt <= block.timestamp) return false;
        return _checkActionAgainstPolicy(proposal.vaultId, proposal.target, proposal.value, proposal.data, proposal.actionType, true);
    }

    function _writePolicy(uint256 vaultId, PolicyConfig calldata policy) internal {
        if (policy.maxValuePerTx == 0) revert InvalidPolicy();
        if (!policy.allowNativeTransfers && !policy.allowContractCalls) revert InvalidPolicy();
        if (policy.allowNativeTransfers && policy.allowedRecipients.length == 0) revert InvalidPolicy();
        if (policy.allowContractCalls && policy.allowedTargets.length == 0) revert InvalidPolicy();

        delete _policies[vaultId];
        PolicyConfig storage stored = _policies[vaultId];
        stored.approvalRequired = policy.approvalRequired;
        stored.maxValuePerTx = policy.maxValuePerTx;
        stored.cooldownSeconds = policy.cooldownSeconds;
        stored.allowNativeTransfers = policy.allowNativeTransfers;
        stored.allowContractCalls = policy.allowContractCalls;

        for (uint256 i = 0; i < policy.allowedRecipients.length; ++i) {
            if (policy.allowedRecipients[i] == address(0)) revert InvalidTarget();
            stored.allowedRecipients.push(policy.allowedRecipients[i]);
        }

        for (uint256 i = 0; i < policy.allowedTargets.length; ++i) {
            if (policy.allowedTargets[i] == address(0)) revert InvalidTarget();
            stored.allowedTargets.push(policy.allowedTargets[i]);
        }

        emit PolicyUpdated(vaultId, _policyHash(vaultId));
    }

    function _checkActionAgainstPolicy(
        uint256 vaultId,
        address target,
        uint256 value,
        bytes memory data,
        ActionType actionType,
        bool enforceCooldown
    ) internal view returns (bool) {
        VaultConfig storage vault = vaults[vaultId];
        if (!vault.exists) return false;
        if (target == address(0)) return false;

        PolicyConfig storage policy = _policies[vaultId];
        if (value > policy.maxValuePerTx) return false;

        if (enforceCooldown && policy.cooldownSeconds != 0 && block.timestamp < uint256(vault.lastExecutedAt) + policy.cooldownSeconds) {
            return false;
        }

        if (actionType == ActionType.NativeTransfer) {
            if (!policy.allowNativeTransfers) return false;
            if (data.length != 0) return false;
            return _contains(policy.allowedRecipients, target);
        }

        if (!policy.allowContractCalls) return false;
        return _contains(policy.allowedTargets, target);
    }

    function _expireIfNeeded(Proposal storage proposal) internal {
        if (
            proposal.status == ProposalStatus.Pending || proposal.status == ProposalStatus.Approved
                || proposal.status == ProposalStatus.Cancelled
        ) {
            if (proposal.expiresAt <= block.timestamp && proposal.status != ProposalStatus.Cancelled) {
                proposal.status = ProposalStatus.Expired;
            }
        }
        if (proposal.status == ProposalStatus.Expired) revert ProposalExpired();
    }

    function _contains(address[] storage values, address target) internal view returns (bool) {
        for (uint256 i = 0; i < values.length; ++i) {
            if (values[i] == target) return true;
        }
        return false;
    }

    function _policyHash(uint256 vaultId) internal view returns (bytes32) {
        PolicyConfig storage policy = _policies[vaultId];
        return keccak256(
            abi.encode(
                policy.approvalRequired,
                policy.maxValuePerTx,
                policy.cooldownSeconds,
                policy.allowedRecipients,
                policy.allowedTargets,
                policy.allowNativeTransfers,
                policy.allowContractCalls
            )
        );
    }
}
