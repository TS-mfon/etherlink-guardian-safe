export const NETWORK = {
  name: "Etherlink Shadownet",
  rpcUrl: "https://node.shadownet.etherlink.com",
  chainId: 127823,
  chainIdHex: "0x1F34F",
  currencySymbol: "XTZ",
  explorerUrl: "https://shadownet.explorer.etherlink.com",
} as const;

export const CONTRACTS = {
  AgentSafeFactory: "0xB0DBC829dF852Ea96C14A7D06cE8D773B1F8892b",
  AgentProposalBoard: "0x45119A32ca6C4d67424401dA92Abe4EC6c83f8Ce",
} as const;

export const BACKEND = {
  agentServiceBaseUrl: "http://localhost:8788",
} as const;

export const FACTORY_ABI = [
  {
    type: "function",
    name: "createVault",
    inputs: [
      { name: "name", type: "string" },
      { name: "operators", type: "address[]" },
      {
        name: "policy",
        type: "tuple",
        components: [
          { name: "approvalRequired", type: "bool" },
          { name: "maxValuePerTx", type: "uint256" },
          { name: "cooldownSeconds", type: "uint64" },
          { name: "allowedRecipients", type: "address[]" },
          { name: "allowedTargets", type: "address[]" },
          { name: "allowNativeTransfers", type: "bool" },
          { name: "allowContractCalls", type: "bool" },
        ],
      },
    ],
    outputs: [
      { name: "vaultId", type: "uint256" },
      { name: "vault", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nextVaultId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proposalBoard",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "VaultCreated",
    inputs: [
      { name: "vaultId", type: "uint256", indexed: true },
      { name: "vault", type: "address", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
    anonymous: false,
  },
] as const;

export const BOARD_ABI = [
  {
    type: "function",
    name: "addOperator",
    inputs: [
      { name: "vaultId", type: "uint256" },
      { name: "operator", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approveProposal",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "canExecute",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "cancelProposal",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositToVault",
    inputs: [{ name: "vaultId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "executeProposal",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [{ name: "result", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "factory",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPolicy",
    inputs: [{ name: "vaultId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "approvalRequired", type: "bool" },
          { name: "maxValuePerTx", type: "uint256" },
          { name: "cooldownSeconds", type: "uint64" },
          { name: "allowedRecipients", type: "address[]" },
          { name: "allowedTargets", type: "address[]" },
          { name: "allowNativeTransfers", type: "bool" },
          { name: "allowContractCalls", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isOperator",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextProposalId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proposals",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "vaultId", type: "uint256" },
      { name: "proposer", type: "address" },
      { name: "target", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "actionType", type: "uint8" },
      { name: "reason", type: "string" },
      { name: "status", type: "uint8" },
      { name: "createdAt", type: "uint64" },
      { name: "approvedAt", type: "uint64" },
      { name: "executedAt", type: "uint64" },
      { name: "expiresAt", type: "uint64" },
      { name: "policySnapshotHash", type: "bytes32" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rejectProposal",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeOperator",
    inputs: [
      { name: "vaultId", type: "uint256" },
      { name: "operator", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitProposal",
    inputs: [
      { name: "vaultId", type: "uint256" },
      { name: "target", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "actionType", type: "uint8" },
      { name: "reason", type: "string" },
      { name: "expiresAt", type: "uint64" },
    ],
    outputs: [{ name: "proposalId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updatePolicy",
    inputs: [
      { name: "vaultId", type: "uint256" },
      {
        name: "policy",
        type: "tuple",
        components: [
          { name: "approvalRequired", type: "bool" },
          { name: "maxValuePerTx", type: "uint256" },
          { name: "cooldownSeconds", type: "uint64" },
          { name: "allowedRecipients", type: "address[]" },
          { name: "allowedTargets", type: "address[]" },
          { name: "allowNativeTransfers", type: "bool" },
          { name: "allowContractCalls", type: "bool" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "vaults",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "vault", type: "address" },
      { name: "owner", type: "address" },
      { name: "name", type: "string" },
      { name: "lastExecutedAt", type: "uint64" },
      { name: "exists", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkActionAgainstPolicy",
    inputs: [
      { name: "vaultId", type: "uint256" },
      { name: "target", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "actionType", type: "uint8" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ProposalSubmitted",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "vaultId", type: "uint256", indexed: true },
      { name: "proposer", type: "address", indexed: true },
      { name: "actionType", type: "uint8", indexed: false },
      { name: "target", type: "address", indexed: false },
      { name: "value", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalApproved",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "approver", type: "address", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalRejected",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "approver", type: "address", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalExecuted",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "executor", type: "address", indexed: true },
      { name: "result", type: "bytes", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalCancelled",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "sender", type: "address", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VaultRegistered",
    inputs: [
      { name: "vaultId", type: "uint256", indexed: true },
      { name: "vault", type: "address", indexed: true },
      { name: "vaultOwner", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OperatorAdded",
    inputs: [
      { name: "vaultId", type: "uint256", indexed: true },
      { name: "operator", type: "address", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OperatorRemoved",
    inputs: [
      { name: "vaultId", type: "uint256", indexed: true },
      { name: "operator", type: "address", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PolicyUpdated",
    inputs: [
      { name: "vaultId", type: "uint256", indexed: true },
      { name: "policySnapshotHash", type: "bytes32", indexed: true },
    ],
    anonymous: false,
  },
] as const;

export function explorerTxUrl(txHash: string) {
  return `${NETWORK.explorerUrl}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string) {
  return `${NETWORK.explorerUrl}/address/${address}`;
}

export enum ProposalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Executed = 3,
  Cancelled = 4,
}

export enum ActionType {
  NativeTransfer = 0,
  ContractCall = 1,
}

export const PROPOSAL_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Executed",
  4: "Cancelled",
};

export const ACTION_TYPE_LABELS: Record<number, string> = {
  0: "Native Transfer",
  1: "Contract Call",
};
