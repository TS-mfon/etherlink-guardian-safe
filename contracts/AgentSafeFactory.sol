// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AgentProposalBoard} from "./AgentProposalBoard.sol";
import {AgentSafeVault} from "./AgentSafeVault.sol";

contract AgentSafeFactory {
    AgentProposalBoard public immutable proposalBoard;
    uint256 public nextVaultId = 1;

    event VaultCreated(uint256 indexed vaultId, address indexed vault, address indexed owner, string name);

    constructor(address board) {
        proposalBoard = AgentProposalBoard(board);
    }

    function createVault(string calldata name, address[] calldata operators, AgentProposalBoard.PolicyConfig calldata policy)
        external
        returns (uint256 vaultId, address vault)
    {
        vaultId = nextVaultId++;
        vault = address(new AgentSafeVault(address(proposalBoard), vaultId));
        proposalBoard.registerVault(vaultId, vault, msg.sender, name, operators, policy);
        emit VaultCreated(vaultId, vault, msg.sender, name);
    }
}

