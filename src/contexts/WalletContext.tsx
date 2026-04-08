import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { BrowserProvider, JsonRpcSigner, JsonRpcProvider, formatEther } from "ethers";
import { NETWORK } from "@/config/contracts";

interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  readProvider: JsonRpcProvider;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const readProvider = new JsonRpcProvider(NETWORK.rpcUrl, {
  name: NETWORK.name,
  chainId: NETWORK.chainId,
});

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const isConnected = !!address;
  const isCorrectNetwork = chainId === NETWORK.chainId;

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await readProvider.getBalance(address);
      setBalance(formatEther(bal));
    } catch {
      setBalance(null);
    }
  }, [address]);

  const switchNetwork = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: NETWORK.chainIdHex,
            chainName: NETWORK.name,
            nativeCurrency: { name: "XTZ", symbol: NETWORK.currencySymbol, decimals: 18 },
            rpcUrls: [NETWORK.rpcUrl],
            blockExplorerUrls: [NETWORK.explorerUrl],
          }],
        });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setIsConnecting(true);
    try {
      const browserProvider = new BrowserProvider(ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);

      if (currentChainId !== NETWORK.chainId) {
        await switchNetwork();
      }

      const newSigner = await browserProvider.getSigner();
      const addr = await newSigner.getAddress();
      setAddress(addr);
      setSigner(newSigner);
      setProvider(browserProvider);

      const bal = await readProvider.getBalance(addr);
      setBalance(formatEther(bal));
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [switchNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setChainId(null);
    setSigner(null);
    setProvider(null);
  }, []);

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(parseInt(newChainId, 16));
      window.location.reload();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  useEffect(() => {
    if (address) refreshBalance();
  }, [address, refreshBalance]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        chainId,
        isConnected,
        isCorrectNetwork,
        isConnecting,
        signer,
        provider,
        readProvider,
        connect,
        disconnect,
        switchNetwork,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
