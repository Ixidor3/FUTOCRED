import { useState, useEffect } from "react";
import { getSignedContract, getReadOnlyContract, connectWallet, ensureSepolia } from "../utils/contract";
import { parseError } from "../utils/parseError";
import { useWallet } from "../context/WalletContext";
import { FcCancel, FcLock } from "react-icons/fc";
import toast from "react-hot-toast";

const OWNER_ADDRESS = "0x6940Aed62fAF85B1b0ab4e1284234fBFD461e2b6";

function AdminCard({ title, description, accentColor, children }) {
    return (
        <div className="card fade-up" style={{ borderColor: `${accentColor}22` }}>
            <div className="flex items-start gap-4 mb-5">
                <div style={{ width: 3, height: 40, background: accentColor, borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
                <div>
                    <h2 style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 4 }}>{title}</h2>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
            <div className="card" style={{ maxWidth: 400, width: "100%", padding: 28 }}>
                <div style={{ fontSize: 36, textAlign: "center", marginBottom: 16 }}></div>
                <h3 style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 16, color: "var(--text)", textAlign: "center", marginBottom: 10 }}>
                    Are you sure?
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6, marginBottom: 24 }}>
                    {message}
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: "11px", borderRadius: 10, border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.03)", color: "var(--text-muted)",
                        fontFamily: "Manrope", fontWeight: 600, fontSize: 14, cursor: "pointer"
                    }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={{
                        flex: 1, padding: "11px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #f87171, #ef4444)",
                        color: "white", fontFamily: "Manrope", fontWeight: 700, fontSize: 14, cursor: "pointer"
                    }}>
                        Yes, Revoke
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Admin() {
    const { account, connect } = useWallet();
    const [deptAddress, setDeptAddress] = useState("");
    const [studentAddress, setStudentAddress] = useState("");
    const [removeDeptAddress, setRemoveDeptAddress] = useState("");
    const [revokeId, setRevokeId] = useState("");
    const [loading, setLoading] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isAuthorised, setIsAuthorised] = useState(null);

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

    // Access is granted if wallet is owner OR an authorised issuer
    const hasAccess = isOwner || isAuthorised === true;

    async function handleAction(action) {
        try {
            setLoading(action);
            await ensureSepolia();
            await connectWallet();
            const contract = await getSignedContract();
            let tx;

            if (action === "registerDept") {
                tx = await contract.registerDepartment(deptAddress);
                await tx.wait();
                toast.success("Department registered!");
                setDeptAddress("");
            } else if (action === "removeDept") {
                tx = await contract.removeDepartment(removeDeptAddress);
                await tx.wait();
                toast.success("Department removed!");
                setRemoveDeptAddress("");
            } else if (action === "registerStudent") {
                tx = await contract.registerStudent(studentAddress);
                await tx.wait();
                toast.success("Student registered!");
                setStudentAddress("");
            } else if (action === "revoke") {
                tx = await contract.revokeCredential(revokeId);
                await tx.wait();
                toast.success("Credential revoked!");
                setRevokeId("");
            }
        } catch (err) {
            toast.error(parseError(err));
        } finally {
            setLoading(null);
        }
    }

    // Not connected
    if (!account) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <p className="section-label mb-2">System Management</p>
                    <h1 style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
                        ADMIN PANEL
                    </h1>
                </div>
                <div className="card" style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ fontSize: 44, display: "flex", justifyContent: "center", marginBottom: 10 }}><FcLock /></div>
                    <p style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
                        Wallet Not Connected
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
                        Connect your wallet to access this panel
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

    // Still checking authorisation for non-owner wallets
    if (!isOwner && isAuthorised === null) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="card" style={{ textAlign: "center", padding: 48 }}>
                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Checking access...</p>
                </div>
            </div>
        );
    }

    // Connected but not owner and not authorised issuer
    if (!hasAccess) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <p className="section-label mb-2">System Management</p>
                    <h1 style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
                        ADMIN PANEL
                    </h1>
                </div>
                <div className="card" style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ fontSize: 44, display: "flex", justifyContent: "center", marginBottom: 10 }}><FcCancel /></div>
                    <p style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
                        Access Denied
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
                        Only the Admin or authorised department wallets can access this panel.
                    </p>
                    <p style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", wordBreak: "break-all" }}>
                        {account}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {showConfirm && (
                <ConfirmModal
                    message={`This will permanently revoke credential ${revokeId.slice(0, 10)}...${revokeId.slice(-6)}. This action cannot be undone.`}
                    onConfirm={() => { setShowConfirm(false); handleAction("revoke"); }}
                    onCancel={() => { setShowConfirm(false); setLoading(null); }}
                />
            )}

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="mb-8">
                    <p className="section-label mb-2">System Management</p>
                    <h1 style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
                        ADMIM PANEL
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
                        Manage departments, students, and credentials on-chain
                    </p>
                </div>

                <AdminCard
                    title="Register Department"
                    description="Grant a wallet address issuer privileges to issue credentials on behalf of the institution."
                    accentColor="var(--accent)">
                    <input className="input-field mb-3" placeholder="Department wallet address (0x...)"
                        value={deptAddress} onChange={(e) => setDeptAddress(e.target.value)} />
                    <button className="btn-primary" onClick={() => handleAction("registerDept")}
                        disabled={loading === "registerDept" || !deptAddress}>
                        {loading === "registerDept" ? "Processing..." : "Register Department"}
                    </button>
                </AdminCard>

                <AdminCard
                    title="Remove Department"
                    description="Revoke the issuer role from a department wallet address."
                    accentColor="var(--danger)">
                    <input className="input-field mb-3" placeholder="Department wallet address (0x...)"
                        value={removeDeptAddress} onChange={(e) => setRemoveDeptAddress(e.target.value)} />
                    <button className="btn-danger" onClick={() => handleAction("removeDept")}
                        disabled={loading === "removeDept" || !removeDeptAddress}>
                        {loading === "removeDept" ? "Processing..." : "Remove Department"}
                    </button>
                </AdminCard>

                <AdminCard
                    title="Register Student"
                    description="Register a student wallet address so they can receive credentials."
                    accentColor="var(--success)">
                    <input className="input-field mb-3" placeholder="Student wallet address (0x...)"
                        value={studentAddress} onChange={(e) => setStudentAddress(e.target.value)} />
                    <button className="btn-success" onClick={() => handleAction("registerStudent")}
                        disabled={loading === "registerStudent" || !studentAddress}>
                        {loading === "registerStudent" ? "Processing..." : "Register Student"}
                    </button>
                </AdminCard>

                <AdminCard
                    title="Revoke Credential"
                    description="Permanently revoke a credential by its ID. This action cannot be undone."
                    accentColor="var(--highlight)">
                    <input className="input-field mb-3" placeholder="Credential ID (0x...)"
                        value={revokeId} onChange={(e) => setRevokeId(e.target.value)} />
                    <button className="btn-danger" onClick={() => { if (revokeId) setShowConfirm(true); }}
                        disabled={loading === "revoke" || !revokeId}>
                        {loading === "revoke" ? "Revoking..." : "Revoke Credential"}
                    </button>
                </AdminCard>
            </div>
        </>
    );
}