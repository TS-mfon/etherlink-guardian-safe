# Etherlink Guardian Safe

Etherlink Guardian Safe is a frontend for `Etherlink Agent Safe`, an AI-assisted onchain operations system for small teams on Etherlink Shadownet.

The app lets teams create a vault, define strict execution policies, submit transaction proposals, and require owner approval before anything executes onchain.

## What The Product Does
- creates team vaults for native `XTZ`
- supports owner and operator roles
- stores policy rules onchain
- allows proposal-based native transfers
- allows proposal-based allowlisted contract calls
- requires owner approval before execution
- keeps execution logic constrained to deployed smart contracts

## Live Deployment

### Network
- Network: `Etherlink Shadownet`
- RPC: `https://node.shadownet.etherlink.com`
- Chain ID: `127823`
- Currency: `XTZ`
- Explorer: `https://shadownet.explorer.etherlink.com`

### Contracts
- `AgentProposalBoard`: `0x45119A32ca6C4d67424401dA92Abe4EC6c83f8Ce`
- `AgentSafeFactory`: `0xB0DBC829dF852Ea96C14A7D06cE8D773B1F8892b`

### Deployment Wallet
- `0xEd9EDd8586b20524CafA4F568413C504C9B03172`

### Deployment Transactions
- `AgentProposalBoard`: `0xe2c8751e6c9219dadea28abab7b4651d716c6ec0af1a50acf728e77fc12b1b00`
- `AgentSafeFactory`: `0x0ffb115e111dfb93a6fc2f5f860b5db76585024d2e1226bb6d47d15b4ae3e3e0`
- `setFactory(address)`: `0xad911b3b54ec3845d42cbe17eda8e2581659a56a876708ad753b7eb97930f0d3`

## Contract Files Added To This Repo
The exact Solidity contract sources used for the deployed version of the site are included in:
- [contracts/AgentProposalBoard.sol](/home/sudodave/etherlink-guardian-safe/contracts/AgentProposalBoard.sol)
- [contracts/AgentSafeFactory.sol](/home/sudodave/etherlink-guardian-safe/contracts/AgentSafeFactory.sol)
- [contracts/AgentSafeVault.sol](/home/sudodave/etherlink-guardian-safe/contracts/AgentSafeVault.sol)

## Core Contract Roles

### `AgentProposalBoard`
- stores vault metadata
- stores owner/operator permissions
- stores policy configuration
- stores proposals and statuses
- approves, rejects, cancels, and executes proposals

### `AgentSafeFactory`
- creates new team vaults
- registers them with the proposal board

### `AgentSafeVault`
- holds native `XTZ`
- only executes actions sent through the proposal board

## Supported MVP Actions
- native `XTZ` transfer
- allowlisted contract call

## Trust Model
- AI can help prepare proposals
- AI does not directly control funds
- policies are enforced onchain
- owner approval is required before execution

## Repo Note
Per the requested change scope, only this `README.md` file was updated and the deployed contract source files were added.
