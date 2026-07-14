import { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

const WalletContext = createContext(null);

const DISCONNECT_KEY = "acadchain_disconnected";

export function WalletProvider({ children }) {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function tryReconnect() {
            try {
                // If user manually disconnected, respect that and don't auto-reconnect
                if (localStorage.getItem(DISCONNECT_KEY) === "true") return;
                if (!window.ethereum) return;
                const provider = new BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_accounts", []);
                if (accounts.length > 0) setAccount(accounts[0]);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }
        tryReconnect();

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    // User switched accounts in MetaMask — treat as a new connection
                    localStorage.removeItem(DISCONNECT_KEY);
                    setAccount(accounts[0]);
                } else {
                    // User disconnected from within MetaMask itself
                    localStorage.setItem(DISCONNECT_KEY, "true");
                    setAccount(null);
                }
            });
            window.ethereum.on("chainChanged", () => window.location.reload());
        }

        return () => {
            window.ethereum?.removeAllListeners("accountsChanged");
            window.ethereum?.removeAllListeners("chainChanged");
        };
    }, []);

    async function connect() {
        if (!window.ethereum) throw new Error("MetaMask not found. Please install it.");
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111n) {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0xaa36a7" }],
            });
        }
        await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
        const accounts = await provider.send("eth_accounts", []);
        // User is explicitly connecting — clear the disconnect flag
        localStorage.removeItem(DISCONNECT_KEY);
        setAccount(accounts[0]);
        return accounts[0];
    }

    function disconnect() {
        // Set the flag so auto-reconnect is blocked on refresh
        localStorage.setItem(DISCONNECT_KEY, "true");
        setAccount(null);
    }

    return (
        <WalletContext.Provider value={{ account, connect, disconnect, loading }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}