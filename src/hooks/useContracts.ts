import { Contract, parseEther, formatEther } from "ethers";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, FACTORY_ABI, BOARD_ABI, type ProposalStatus } from "@/config/contracts";
import { useCallback } from "react";

export interface VaultData {
  id: number;
  vault: string;
  owner: string;
  name: string;
  lastExecutedAt: number;
  exists: boolean;
  balance?: string;
}

export interface PolicyData {
  approvalRequired: boolean;
  maxValuePerTx: bigint;
  cooldownSeconds: number;
  allowedRecipients: string[];
  allowedTargets: string[];
  allowNativeTransfers: boolean;
  allowContractCalls: boolean;
}

export interface ProposalData {
  id: number;
  vaultId: number;
  proposer: string;
  target: string;
  value: bigint;
  data: string;
  actionType: number;
  reason: string;
  status: number;
  createdAt: number;
  approvedAt: number;
  executedAt: number;
  expiresAt: number;
  policySnapshotHash: string;
}

export function useContracts() {
  const { signer, readProvider } = useWallet();

  const getFactoryRead = useCallback(() => {
    return new Contract(CONTRACTS.AgentSafeFactory, FACTORY_ABI, readProvider);
  }, [readProvider]);

  const getBoardRead = useCallback(() => {
    return new Contract(CONTRACTS.AgentProposalBoard, BOARD_ABI, readProvider);
  }, [readProvider]);

  const getFactoryWrite = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected");
    return new Contract(CONTRACTS.AgentSafeFactory, FACTORY_ABI, signer);
  }, [signer]);

  const getBoardWrite = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected");
    return new Contract(CONTRACTS.AgentProposalBoard, BOARD_ABI, signer);
  }, [signer]);

  // Read functions
  const getNextVaultId = useCallback(async (): Promise<number> => {
    const factory = getFactoryRead();
    const id = await factory.nextVaultId();
    return Number(id);
  }, [getFactoryRead]);

  const getVault = useCallback(async (vaultId: number): Promise<VaultData> => {
    const board = getBoardRead();
    const v = await board.vaults(vaultId);
    let balance = "0";
    try {
      const bal = await readProvider.getBalance(v[0]);
      balance = formatEther(bal);
    } catch {}
    return {
      id: vaultId,
      vault: v[0],
      owner: v[1],
      name: v[2],
      lastExecutedAt: Number(v[3]),
      exists: v[4],
      balance,
    };
  }, [getBoardRead, readProvider]);

  const getPolicy = useCallback(async (vaultId: number): Promise<PolicyData> => {
    const board = getBoardRead();
    const p = await board.getPolicy(vaultId);
    return {
      approvalRequired: p[0],
      maxValuePerTx: p[1],
      cooldownSeconds: Number(p[2]),
      allowedRecipients: [...p[3]],
      allowedTargets: [...p[4]],
      allowNativeTransfers: p[5],
      allowContractCalls: p[6],
    };
  }, [getBoardRead]);

  const isOperator = useCallback(async (vaultId: number, address: string): Promise<boolean> => {
    const board = getBoardRead();
    return await board.isOperator(vaultId, address);
  }, [getBoardRead]);

  const getProposal = useCallback(async (proposalId: number): Promise<ProposalData> => {
    const board = getBoardRead();
    const p = await board.proposals(proposalId);
    return {
      id: Number(p[0]),
      vaultId: Number(p[1]),
      proposer: p[2],
      target: p[3],
      value: p[4],
      data: p[5],
      actionType: Number(p[6]),
      reason: p[7],
      status: Number(p[8]),
      createdAt: Number(p[9]),
      approvedAt: Number(p[10]),
      executedAt: Number(p[11]),
      expiresAt: Number(p[12]),
      policySnapshotHash: p[13],
    };
  }, [getBoardRead]);

  const getNextProposalId = useCallback(async (): Promise<number> => {
    const board = getBoardRead();
    const id = await board.nextProposalId();
    return Number(id);
  }, [getBoardRead]);

  const canExecute = useCallback(async (proposalId: number): Promise<boolean> => {
    const board = getBoardRead();
    return await board.canExecute(proposalId);
  }, [getBoardRead]);

  // Write functions
  const createVault = useCallback(async (
    name: string,
    operators: string[],
    policy: {
      approvalRequired: boolean;
      maxValuePerTx: string;
      cooldownSeconds: number;
      allowedRecipients: string[];
      allowedTargets: string[];
      allowNativeTransfers: boolean;
      allowContractCalls: boolean;
    }
  ) => {
    const factory = getFactoryWrite();
    const tx = await factory.createVault(name, operators, {
      approvalRequired: policy.approvalRequired,
      maxValuePerTx: parseEther(policy.maxValuePerTx),
      cooldownSeconds: policy.cooldownSeconds,
      allowedRecipients: policy.allowedRecipients,
      allowedTargets: policy.allowedTargets,
      allowNativeTransfers: policy.allowNativeTransfers,
      allowContractCalls: policy.allowContractCalls,
    });
    return tx;
  }, [getFactoryWrite]);

  const depositToVault = useCallback(async (vaultId: number, amountEther: string) => {
    const board = getBoardWrite();
    const tx = await board.depositToVault(vaultId, { value: parseEther(amountEther) });
    return tx;
  }, [getBoardWrite]);

  const submitProposal = useCallback(async (
    vaultId: number,
    target: string,
    value: string,
    data: string,
    actionType: number,
    reason: string,
    expiresAt: number
  ) => {
    const board = getBoardWrite();
    const tx = await board.submitProposal(
      vaultId, target, parseEther(value), data, actionType, reason, expiresAt
    );
    return tx;
  }, [getBoardWrite]);

  const approveProposal = useCallback(async (proposalId: number) => {
    const board = getBoardWrite();
    return await board.approveProposal(proposalId);
  }, [getBoardWrite]);

  const rejectProposal = useCallback(async (proposalId: number) => {
    const board = getBoardWrite();
    return await board.rejectProposal(proposalId);
  }, [getBoardWrite]);

  const executeProposal = useCallback(async (proposalId: number) => {
    const board = getBoardWrite();
    return await board.executeProposal(proposalId);
  }, [getBoardWrite]);

  const cancelProposal = useCallback(async (proposalId: number) => {
    const board = getBoardWrite();
    return await board.cancelProposal(proposalId);
  }, [getBoardWrite]);

  const addOperator = useCallback(async (vaultId: number, operator: string) => {
    const board = getBoardWrite();
    return await board.addOperator(vaultId, operator);
  }, [getBoardWrite]);

  const removeOperator = useCallback(async (vaultId: number, operator: string) => {
    const board = getBoardWrite();
    return await board.removeOperator(vaultId, operator);
  }, [getBoardWrite]);

  const updatePolicy = useCallback(async (
    vaultId: number,
    policy: {
      approvalRequired: boolean;
      maxValuePerTx: string;
      cooldownSeconds: number;
      allowedRecipients: string[];
      allowedTargets: string[];
      allowNativeTransfers: boolean;
      allowContractCalls: boolean;
    }
  ) => {
    const board = getBoardWrite();
    return await board.updatePolicy(vaultId, {
      approvalRequired: policy.approvalRequired,
      maxValuePerTx: parseEther(policy.maxValuePerTx),
      cooldownSeconds: policy.cooldownSeconds,
      allowedRecipients: policy.allowedRecipients,
      allowedTargets: policy.allowedTargets,
      allowNativeTransfers: policy.allowNativeTransfers,
      allowContractCalls: policy.allowContractCalls,
    });
  }, [getBoardWrite]);

  return {
    getNextVaultId,
    getVault,
    getPolicy,
    isOperator,
    getProposal,
    getNextProposalId,
    canExecute,
    createVault,
    depositToVault,
    submitProposal,
    approveProposal,
    rejectProposal,
    executeProposal,
    cancelProposal,
    addOperator,
    removeOperator,
    updatePolicy,
  };
}
