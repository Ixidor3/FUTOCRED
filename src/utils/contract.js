import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract.js";

export async function getReadOnlyContract() {
    const provider = new BrowserProvider(window.ethereum);
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function getSignedContract() {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// Keep these for pages that still call them directly
export async function connectWallet() {
    if (!window.ethereum) throw new Error("MetaMask not found. Please install it.");
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
}

export async function ensureSepolia() {
    const provider = new BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
        });
    }
}