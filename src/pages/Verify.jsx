import { useState } from "react";
import { getReadOnlyContract } from "../utils/contract";
import { getIPFSUrl } from "../utils/pinata";
import { parseError } from "../utils/parseError";
import { LiaClipboard } from "react-icons/lia";
import toast from "react-hot-toast";

export default function Verify() {
    const [searchType, setSearchType] = useState("id");
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [credential, setCredential] = useState(null);

    function copyToClipboard(text, label) {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied!`);
        }).catch(() => {
            toast.error("Copy failed");
        });
    }

    function truncate(str) {
        if (!str || str.length < 20) return str;
        return `${str.slice(0, 10)}...${str.slice(-6)}`;
    }

    async function handleVerify() {
        if (!searchValue) { toast.error("Please enter a value to search"); return; }
        try {
            setLoading(true);
            setCredential(null);
            const contract = await getReadOnlyContract();
            const cred = searchType === "id"
                ? await contract.verifyCredentialById(searchValue)
                : await contract.verifyCredentialByHash(searchValue);
            setCredential(cred);
        } catch (err) {
            toast.error(parseError(err));
        } finally {
            setLoading(false);
        }
    }

    const isActive = credential?.status === 0n;

    // Fields that need copy buttons
    const copyableFields = ["Credential ID", "Student Address", "Issued By", "IPFS Hash"];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Hero */}
            <div className="text-center mb-10">
                <h1 style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 32, color: "var(--text)", marginBottom: 10 }}>
                    VERIFY A CREDENTIAL
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 420, margin: "0 auto" }}>
                    Instantly verify the authenticity of any academic credential issued on FUTOCRED
                </p>
            </div>

            {/* How it works — shown only before any search */}
            {!credential && !loading && (
                <div className="card fade-up" style={{ background: "rgba(22,163,74,0.05)", borderColor: "rgba(22,163,74,0.15)" }}>
                    <p style={{
                        fontFamily: "Manrope", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 16, display: "flex",
                        textAlign: "center", justifyContent: "center"
                    }}>
                        How it works
                    </p>
                    <div style={{ display: "flex", gap: 12 }}>
                        {[
                            { step: "1", title: "Get Credential ID", desc: "Obtain the credential ID or IPFS hash from the certificate holder" },
                            { step: "2", title: "Paste & Search", desc: "Paste the ID into the field below and click Verify" },
                            { step: "3", title: "View Result", desc: "Instantly see if the credential is valid and active on-chain" },
                        ].map(({ step, title, desc }) => (
                            <div key={step} style={{ flex: 1, textAlign: "center" }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: "50%", margin: "0 auto 10px",
                                    background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "Manrope", fontWeight: 700, fontSize: 13, color: "var(--accent)"
                                }}>{step}</div>
                                <p style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 12, color: "var(--text)", marginBottom: 4 }}>
                                    {title}
                                </p>
                                <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Card */}
            <div className="card">
                <div className="flex mb-5" style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4,
                    border: "1px solid var(--border)"
                }}>
                    {[
                        { value: "id", label: "By Credential ID" },
                        { value: "hash", label: "By IPFS Hash" },
                    ].map(({ value, label }) => (
                        <button key={value} onClick={() => setSearchType(value)}
                            style={{
                                flex: 1, padding: "9px", borderRadius: 8, border: "none",
                                fontFamily: "Manrope", fontWeight: 600, fontSize: 13, cursor: "pointer",
                                transition: "all 0.2s",
                                background: searchType === value ? "var(--accent)" : "transparent",
                                color: searchType === value ? "white" : "var(--text-muted)",
                            }}>
                            {label}
                        </button>
                    ))}
                </div>

                <input className="input-field mb-4"
                    placeholder={searchType === "id" ? "Enter credential ID (0x...)" : "Enter IPFS hash (Qm...)"}
                    value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()} />

                <button className="btn-primary" onClick={handleVerify}
                    disabled={loading || !searchValue}>
                    {loading ? "Verifying..." : "Verify Credential →"}
                </button>
            </div>

            {/* Result */}
            {credential && (
                <div className="card fade-up" style={{
                    borderColor: isActive ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)",
                    background: isActive ? "rgba(52,211,153,0.04)" : "rgba(248,113,113,0.04)",
                }}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 17, color: "var(--text)" }}>
                            Credential Details
                        </h2>
                        <span className={isActive ? "badge-active" : "badge-revoked"}>
                            {isActive ? "✓ Active" : "✕ Revoked"}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "Credential ID", value: credential.credentialId, mono: true },
                            { label: "Student Address", value: credential.studentAddress, mono: true },
                            { label: "Issued By", value: credential.issuer, mono: true },
                            { label: "Issued At", value: new Date(Number(credential.issuedAt) * 1000).toLocaleString(), mono: false },
                            { label: "IPFS Hash", value: credential.ipfsHash, mono: true },
                        ].map(({ label, value, mono }) => (
                            <div key={label} style={{
                                background: "rgba(255,255,255,0.03)", borderRadius: 10,
                                padding: "12px 14px", border: "1px solid var(--border)"
                            }}>
                                <p className="section-label mb-1">{label}</p>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <p style={{
                                        fontSize: mono ? 11 : 13,
                                        fontFamily: mono ? "monospace" : "Inter",
                                        color: "var(--text)", wordBreak: "break-all",
                                        lineHeight: 1.6, margin: 0, flex: 1
                                    }}>
                                        {/* Truncate long addresses but show full for IPFS hash and credential ID */}
                                        {label === "Student Address" || label === "Issued By"
                                            ? truncate(value)
                                            : value}
                                    </p>
                                    {copyableFields.includes(label) && (
                                        <button onClick={() => copyToClipboard(value, label)}
                                            title={`Copy ${label}`}
                                            style={{
                                                flexShrink: 0, padding: "6px 10px", borderRadius: 8,
                                                border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)",
                                                color: "var(--text-muted)", cursor: "pointer", fontSize: 13, transition: "all 0.2s",
                                            }}><LiaClipboard /></button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {!isActive && credential.revokedAt > 0n && (
                            <div style={{
                                background: "rgba(248,113,113,0.08)", borderRadius: 10,
                                padding: "12px 14px", border: "1px solid rgba(248,113,113,0.2)"
                            }}>
                                <p className="section-label mb-1" style={{ color: "var(--danger)" }}>Revoked At</p>
                                <p style={{ fontSize: 13, color: "var(--danger)" }}>
                                    {new Date(Number(credential.revokedAt) * 1000).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    <a href={getIPFSUrl(credential.ipfsHash)} target="_blank" rel="noopener noreferrer"
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            marginTop: 20, padding: "13px", borderRadius: 10, textDecoration: "none",
                            background: "linear-gradient(135deg, var(--accent), #059669)",
                            color: "white", fontFamily: "Manrope", fontWeight: 700, fontSize: 14, transition: "all 0.2s",
                        }}>
                        View & Download Certificate PDF
                    </a>
                </div>
            )}
        </div>
    );
}