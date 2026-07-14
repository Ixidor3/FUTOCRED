import { useState, useEffect } from "react";
import { getSignedContract, getReadOnlyContract, connectWallet, ensureSepolia } from "../utils/contract";
import { uploadPDFToPinata } from "../utils/pinata";
import { parseError } from "../utils/parseError";
import { useWallet } from "../context/WalletContext";
import { FcLock, FcCancel, FcFile, FcOk } from "react-icons/fc";
import { LiaClipboard, LiaFileAltSolid } from "react-icons/lia";
import toast from "react-hot-toast";

const OWNER_ADDRESS = "0x6940Aed62fAF85B1b0ab4e1284234fBFD461e2b6";
const HISTORY_KEY = "futochain_issue_history";

export default function Issuer() {
    const { account, connect } = useWallet();
    const [studentAddress, setStudentAddress] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [isAuthorised, setIsAuthorised] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const isOwner = account?.toLowerCase() === OWNER_ADDRESS.toLowerCase();

    useEffect(() => {
        if (!account) {
            setIsAuthorised(null);
            return;
        }
        if (isOwner) {
            setIsAuthorised(null);
            return;
        }
        checkAuthorisation(account);
    }, [account, isOwner]);

    useEffect(() => {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) setHistory(JSON.parse(stored));
    }, []);

    async function checkAuthorisation(wallet) {
        try {
            const contract = await getReadOnlyContract();
            const auth = await contract.isIssuer(wallet);
            setIsAuthorised(auth);
        } catch (err) {
            console.error("checkAuthorisation error:", err);
            setIsAuthorised(false);
        }
    }

    const hasAccess = isOwner || isAuthorised === true;

    function copyToClipboard(text, label) {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied!`);
        }).catch(() => {
            toast.error("Copy failed");
        });
    }

    function truncate(str) {
        if (!str) return "";
        return `${str.slice(0, 10)}...${str.slice(-6)}`;
    }

    function saveToHistory(entry) {
        const stored = localStorage.getItem(HISTORY_KEY);
        const existing = stored ? JSON.parse(stored) : [];
        const updated = [entry, ...existing].slice(0, 10);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        setHistory(updated);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file?.type === "application/pdf") setPdfFile(file);
        else toast.error("Only PDF files are accepted");
    }

    async function handleIssue() {
        if (!pdfFile || !studentAddress) {
            toast.error("Please fill in all fields");
            return;
        }
        try {
            setLoading(true);
            setResult(null);
            await ensureSepolia();
            await connectWallet();

            toast.loading("Uploading PDF to IPFS...", { id: "upload" });
            const ipfsHash = await uploadPDFToPinata(pdfFile);
            toast.success("PDF uploaded to IPFS!", { id: "upload" });

            toast.loading("Issuing credential on-chain...", { id: "issue" });
            const contract = await getSignedContract();
            const tx = await contract.issueCredential(ipfsHash, studentAddress);
            const receipt = await tx.wait();
            toast.success("Credential issued!", { id: "issue" });

            const event = receipt.logs.find((log) => {
                try { return contract.interface.parseLog(log).name === "CredentialIssued"; }
                catch { return false; }
            });

            let credentialId = null;
            if (event) credentialId = contract.interface.parseLog(event).args[0];

            const entry = {
                credentialId,
                ipfsHash,
                txHash: receipt.hash,
                studentAddress,
                issuedAt: new Date().toLocaleString(),
            };

            setResult(entry);
            saveToHistory(entry);
            setPdfFile(null);
            setStudentAddress("");
        } catch (err) {
            toast.dismiss("upload");
            toast.dismiss("issue");
            toast.error(parseError(err));
        } finally {
            setLoading(false);
        }
    }

    // Not connected
    if (!account) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <p className="section-label mb-2">Credential Issuance</p>
                    <h1 style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
                        ISSUE CREDENTIALS
                    </h1>
                </div>
                <div className="card" style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ fontSize: 44, display: "flex", justifyContent: "center", marginBottom: 10 }}><FcLock /></div>
                    <p style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
                        Wallet Not Connected
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
                        Connect your authorised issuer wallet to issue credentials
                    </p>
                    <button onClick={connect} style={{
                        padding: "12px 28px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, var(--accent), #059669)",
                        color: "white", fontFamily: "Manrope", fontWeight: 700,
                        fontSize: 14, cursor: "pointer",
                    }}>
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }

    // Still checking for non-owner wallets
    if (!isOwner && isAuthorised === null) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="card" style={{ textAlign: "center", padding: 48 }}>
                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Checking authorisation...</p>
                </div>
            </div>
        );
    }

    // Connected but no access
    if (!hasAccess) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <p className="section-label mb-2">Credential Issuance</p>
                    <h1 style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
                        ISSUE CREDENTIAL
                    </h1>
                </div>
                <div className="card" style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ fontSize: 44, display: "flex", justifyContent: "center", marginBottom: 10 }}><FcCancel /></div>
                    <p style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
                        Not Authorised
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
                        Only the Admin or registered department wallets can issue credentials.
                    </p>
                    <p style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", wordBreak: "break-all" }}>
                        {account}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-8" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <p className="section-label mb-2">Credential Issuance</p>
                    <h1 style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
                        ISSUE CREDENTIAL
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
                        Upload a signed PDF certificate and register it permanently on-chain
                    </p>
                </div>
                {history.length > 0 && (
                    <button onClick={() => setShowHistory(!showHistory)} style={{
                        padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.03)", color: "var(--text-muted)",
                        fontFamily: "Manrope", fontWeight: 600, fontSize: 12, cursor: "pointer",
                        flexShrink: 0, marginTop: 4,
                    }}>
                        {showHistory ? "Hide" : "History"} ({history.length})
                    </button>
                )}
            </div>

            {/* Transaction History */}
            {showHistory && history.length > 0 && (
                <div className="card fade-up">
                    <h3 style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 16 }}>
                        Recent Issuances
                    </h3>
                    <div className="space-y-3">
                        {history.map((h, i) => (
                            <div key={i} style={{
                                background: "rgba(255,255,255,0.02)", borderRadius: 10,
                                padding: "12px 14px", border: "1px solid var(--border)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                    <p style={{ fontFamily: "Manrope", fontWeight: 600, fontSize: 12, color: "var(--text)" }}>
                                        Issued {h.issuedAt}
                                    </p>
                                    <a href={`https://sepolia.etherscan.io/tx/${h.txHash}`} target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}>
                                        View Tx ↗
                                    </a>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <p style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", flex: 1 }}>
                                        ID: {truncate(h.credentialId)}
                                    </p>
                                    <button onClick={() => copyToClipboard(h.credentialId, "Credential ID")}
                                        style={{
                                            padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)",
                                            background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 11
                                        }}><LiaClipboard /></button>
                                </div>
                                <p style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>
                                    To: {truncate(h.studentAddress)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="card">
                {/* Step indicators */}
                <div className="flex items-center gap-3 mb-7">
                    {["Upload PDF", "Enter Address", "Issue On-Chain"].map((step, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div style={{
                                width: 22, height: 22, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                                fontFamily: "Manrope", display: "flex", alignItems: "center", justifyContent: "center",
                                background: "rgba(93,169,255,0.15)", color: "var(--accent)", border: "1px solid rgba(93,169,255,0.3)"
                            }}>{i + 1}</div>
                            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{step}</span>
                            {i < 2 && <div style={{ width: 20, height: 1, background: "var(--border)" }} />}
                        </div>
                    ))}
                </div>

                {/* PDF Upload */}
                <div className="mb-5">
                    <label className="section-label mb-3 block">Certificate PDF</label>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("pdfInput").click()}
                        style={{
                            border: `2px dashed ${dragOver ? "var(--accent)" : pdfFile ? "var(--success)" : "var(--border)"}`,
                            borderRadius: 12, padding: "32px 24px", textAlign: "center",
                            cursor: "pointer", transition: "all 0.2s",
                            background: dragOver ? "rgba(93,169,255,0.05)" : pdfFile ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)",
                        }}>
                        {pdfFile ? (
                            <div>
                                <div style={{ fontSize: 32, marginBottom: 8, marginLeft: 180 }}><FcOk /></div>
                                <p style={{ fontFamily: "Manrope", fontWeight: 700, color: "var(--success)", fontSize: 15 }}>
                                    {pdfFile.name}
                                </p>
                                <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
                                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB · Click to change
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: 36, display: "flex", justifyContent: "center", marginBottom: 10 }}><FcFile /></div>
                                <p style={{ fontFamily: "Manrope", fontWeight: 700, color: "var(--text)", fontSize: 15 }}>
                                    Drop PDF here or click to browse
                                </p>
                                <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>
                                    Only PDF files accepted · Max 10MB recommended
                                </p>
                            </div>
                        )}
                        <input id="pdfInput" type="file" accept=".pdf" className="hidden"
                            onChange={(e) => setPdfFile(e.target.files[0])} />
                    </div>
                </div>

                {/* Student Address */}
                <div className="mb-6">
                    <label className="section-label mb-3 block">Student Wallet Address</label>
                    <input className="input-field" placeholder="0x..."
                        value={studentAddress} onChange={(e) => setStudentAddress(e.target.value)} />
                </div>

                <button className="btn-primary" onClick={handleIssue}
                    disabled={loading || !pdfFile || !studentAddress}>
                    {loading ? "Processing..." : "Issue Credential →"}
                </button>
            </div>

            {/* Result */}
            {result && (
                <div className="fade-up" style={{
                    background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)",
                    borderRadius: 16, padding: 24
                }}>
                    <div className="flex items-center gap-2 mb-5">
                        <h2 style={{ fontFamily: "Manrope", fontWeight: 700, color: "var(--success)", fontSize: 16 }}>
                            Credential Issued Successfully
                        </h2>
                    </div>

                    {[
                        { label: "Credential ID", value: result.credentialId },
                        { label: "IPFS Hash", value: result.ipfsHash },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ marginBottom: 16 }}>
                            <p className="section-label mb-1">{label}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <p style={{
                                    fontFamily: "monospace", fontSize: 12, color: "var(--text)",
                                    wordBreak: "break-all", background: "rgba(255,255,255,0.03)",
                                    padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
                                    flex: 1, margin: 0
                                }}>
                                    {value}
                                </p>
                                <button onClick={() => copyToClipboard(value, label)} title={`Copy ${label}`}
                                    style={{
                                        flexShrink: 0, padding: "8px 12px", borderRadius: 8,
                                        border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)",
                                        color: "var(--text-muted)", cursor: "pointer", fontSize: 14, transition: "all 0.2s",
                                    }}>
                                    📋
                                </button>
                            </div>
                        </div>
                    ))}

                    <div>
                        <p className="section-label mb-1">Transaction</p>
                        <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{
                                fontFamily: "monospace", fontSize: 12, color: "var(--accent)", wordBreak: "break-all",
                                background: "rgba(93,169,255,0.05)", padding: "8px 12px", borderRadius: 8,
                                border: "1px solid rgba(93,169,255,0.2)", display: "block", textDecoration: "none"
                            }}>
                            {result.txHash} ↗
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}