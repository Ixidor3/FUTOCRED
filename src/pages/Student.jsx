import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { getReadOnlyContract } from "../utils/contract";
import { getIPFSUrl } from "../utils/pinata";
import { parseError } from "../utils/parseError";
import { FcLock } from "react-icons/fc";
import { LiaClipboard, LiaFileAltSolid } from "react-icons/lia";
import toast from "react-hot-toast";

function SkeletonCard() {
    return (
        <div className="card" style={{ opacity: 0.6 }}>
            <div style={{ height: 12, width: "40%", background: "rgba(255,255,255,0.06)", borderRadius: 6, marginBottom: 12 }} />
            <div style={{ height: 10, width: "100%", background: "rgba(255,255,255,0.04)", borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 10, width: "80%", background: "rgba(255,255,255,0.04)", borderRadius: 6 }} />
        </div>
    );
}

export default function Student() {
    const { account, connect } = useWallet();
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState(null);
    const [credDetails, setCredDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState({});

    useEffect(() => {
        if (account) fetchCredentials(account);
        else setCredentials(null);
    }, [account]);

    function copyToClipboard(text, label) {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied!`);
        }).catch(() => {
            toast.error("Copy failed");
        });
    }

    async function fetchCredentials(wallet) {
        try {
            setLoading(true);
            setCredentials(null);
            setCredDetails({});
            const contract = await getReadOnlyContract();
            const ids = await contract.getStudentCredentials(wallet);
            setCredentials(ids);
            if (ids.length === 0) toast("No credentials found for this wallet");
        } catch (err) {
            toast.error(parseError(err));
        } finally {
            setLoading(false);
        }
    }

    async function loadCredentialDetail(id) {
        if (credDetails[id]) return;
        try {
            setLoadingDetails((prev) => ({ ...prev, [id]: true }));
            const contract = await getReadOnlyContract();
            const cred = await contract.verifyCredentialById(id);
            setCredDetails((prev) => ({ ...prev, [id]: cred }));
        } catch (err) {
            toast.error(parseError(err));
        } finally {
            setLoadingDetails((prev) => ({ ...prev, [id]: false }));
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-8">
                <p className="section-label mb-2">Student Portal</p>
                <h1 style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
                    MY CREDENTIALS
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
                    Connect your wallet to view all credentials issued to you
                </p>
            </div>

            {/* Not connected */}
            {!account ? (
                <div className="card" style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ fontSize: 44, display: "flex", justifyContent: "center", marginBottom: 10 }}><FcLock /></div>
                    <p style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
                        Wallet Not Connected
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
                        Connect your MetaMask wallet to view your credentials
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
            ) : (
                <>
                    {/* Connected wallet info */}
                    <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <p className="section-label mb-1">Connected Wallet</p>
                            <p style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text)", wordBreak: "break-all" }}>
                                {account}
                            </p>
                        </div>
                        {loading && (
                            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Fetching...</span>
                        )}
                    </div>

                    {/* Skeleton while loading */}
                    {loading && (
                        <div className="space-y-4">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    )}

                    {/* Results */}
                    {!loading && credentials !== null && (
                        <div className="fade-up space-y-4">
                            <h2 style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                                {credentials.length} Credential{credentials.length !== 1 ? "s" : ""} Found
                            </h2>

                            {credentials.length === 0 ? (
                                <div className="card" style={{ textAlign: "center", padding: 40 }}>
                                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                                        No credentials issued to this wallet yet
                                    </p>
                                </div>
                            ) : (
                                credentials.map((id, index) => {
                                    const detail = credDetails[id];
                                    const isActive = detail ? detail.status === 0n : null;
                                    return (
                                        <div key={id} className="card fade-up" style={{ animationDelay: `${index * 0.08}s` }}>

                                            {/* Credential ID row */}
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div style={{ flex: 1 }}>
                                                    <p className="section-label mb-1">Credential #{index + 1}</p>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <p style={{
                                                            fontFamily: "monospace", fontSize: 11, color: "var(--text)",
                                                            wordBreak: "break-all", lineHeight: 1.6, margin: 0, flex: 1
                                                        }}>{id}</p>
                                                        <button onClick={() => copyToClipboard(id, "Credential ID")}
                                                            title="Copy Credential ID"
                                                            style={{
                                                                flexShrink: 0, padding: "6px 10px", borderRadius: 8,
                                                                border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)",
                                                                color: "var(--text-muted)", cursor: "pointer", fontSize: 13, transition: "all 0.2s",
                                                            }}><LiaClipboard /></button>
                                                    </div>
                                                </div>
                                                {detail && (
                                                    <span className={isActive ? "badge-active" : "badge-revoked"}>
                                                        {isActive ? "Active" : "Revoked"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Expanded details */}
                                            {detail && (
                                                <div className="space-y-3 mb-4" style={{
                                                    background: "rgba(255,255,255,0.02)", borderRadius: 10,
                                                    padding: "14px", border: "1px solid var(--border)"
                                                }}>
                                                    {[
                                                        { label: "Issued By", value: detail.issuer },
                                                        { label: "Issued At", value: new Date(Number(detail.issuedAt) * 1000).toLocaleString() },
                                                        { label: "IPFS Hash", value: detail.ipfsHash },
                                                    ].map(({ label, value }) => (
                                                        <div key={label}>
                                                            <p className="section-label mb-1">{label}</p>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                <p style={{
                                                                    fontSize: 12, color: "var(--text)", wordBreak: "break-all",
                                                                    fontFamily: label === "Issued At" ? "Inter" : "monospace",
                                                                    margin: 0, flex: 1
                                                                }}>{value}</p>
                                                                {label === "IPFS Hash" && (
                                                                    <button onClick={() => copyToClipboard(value, label)}
                                                                        title="Copy IPFS Hash"
                                                                        style={{
                                                                            flexShrink: 0, padding: "6px 10px", borderRadius: 8,
                                                                            border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)",
                                                                            color: "var(--text-muted)", cursor: "pointer", fontSize: 13, transition: "all 0.2s",
                                                                        }}><LiaClipboard /></button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {!isActive && detail.revokedAt > 0n && (
                                                        <div>
                                                            <p className="section-label mb-1" style={{ color: "var(--danger)" }}>Revoked At</p>
                                                            <p style={{ fontSize: 12, color: "var(--danger)" }}>
                                                                {new Date(Number(detail.revokedAt) * 1000).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-3">
                                                {!detail && (
                                                    <button onClick={() => loadCredentialDetail(id)}
                                                        disabled={loadingDetails[id]}
                                                        style={{
                                                            flex: 1, padding: "9px 16px", borderRadius: 8,
                                                            border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)",
                                                            color: "var(--text-muted)", fontFamily: "Manrope", fontWeight: 600,
                                                            fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                                                        }}>
                                                        {loadingDetails[id] ? "Loading..." : "View Details"}
                                                    </button>
                                                )}
                                                {detail && (
                                                    <a href={getIPFSUrl(detail.ipfsHash)} target="_blank" rel="noopener noreferrer"
                                                        style={{
                                                            flex: 1, padding: "9px 16px", borderRadius: 8, textAlign: "center",
                                                            background: "linear-gradient(135deg, var(--accent), #4A90E2)",
                                                            color: "white", fontFamily: "Manrope", fontWeight: 700,
                                                            fontSize: 13, textDecoration: "none", display: "flex",
                                                            alignItems: "center", justifyContent: "center", gap: 6,
                                                        }}>
                                                        <LiaFileAltSolid size={18} strokeWidth={2.5} />Download Certificate
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </>
            )}
        </div >
    );
}