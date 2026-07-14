import { createContext, useContext } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();

    async function connect() {
        openConnectModal?.();
    }

    return (
        <WalletContext.Provider value={{
            account: isConnected ? address : null,
            connect,
            disconnect,
            loading: false,
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}