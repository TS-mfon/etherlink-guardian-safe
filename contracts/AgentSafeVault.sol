// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

contract AgentSafeVault {
    address public immutable proposalBoard;
    uint256 public immutable vaultId;

    event Deposited(address indexed sender, uint256 amount);
    event Executed(address indexed target, uint256 value, bytes data, bytes result);

    error OnlyProposalBoard();
    error InvalidTarget();
    error ExecutionFailed(bytes revertData);

    constructor(address initialProposalBoard, uint256 initialVaultId) {
        proposalBoard = initialProposalBoard;
        vaultId = initialVaultId;
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function execute(address target, uint256 value, bytes calldata data) external returns (bytes memory result) {
        if (msg.sender != proposalBoard) revert OnlyProposalBoard();
        if (target == address(0)) revert InvalidTarget();

        (bool ok, bytes memory response) = target.call{value: value}(data);
        if (!ok) revert ExecutionFailed(response);

        emit Executed(target, value, data, response);
        return response;
    }
}

