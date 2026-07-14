import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Navbar() {
    const { account, connect, disconnect } = useWallet();
    const [showMenu, setShowMenu] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    async function handleConnect() {
        try {
            await connect();
            toast.success("Wallet connected!");
        } catch (err) {
            toast.error(err.message);
        }
    }

    function handleDisconnect() {
        disconnect();
        setShowMenu(false);
        toast.success("Wallet disconnected");
    }

    const links = [
        { path: "/", label: "Verify" },
        { path: "/student", label: "Student" },
        { path: "/issue", label: "Issue" },
        { path: "/admin", label: "Admin" },
    ];

    return (
        <nav style={{
            background: "rgba(22, 163, 74, 0.90)", borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50,
        }} className="px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 18, color: "var(--navbar-text)" }}>
                        FUTO<span style={{ color: "var(--secaccent)" }}>CRED</span>
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map(({ path, label }) => {
                        const active = location.pathname === path;
                        return (
                            <Link key={path} to={path} style={{
                                fontFamily: "Manrope", fontWeight: 600, fontSize: 13,
                                padding: "7px 16px", borderRadius: 8, transition: "all 0.2s",
                                color: active ? "var(--secaccent)" : "var(--navbar-text)",
                                background: active ? "rgba(93,169,255,0.1)" : "transparent",
                                textDecoration: "none",
                            }}>
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop Wallet + Mobile Hamburger */}
                <div className="flex items-center gap-3">

                    {/* Wallet (always visible) */}
                    <div style={{ position: "relative" }}>
                        {account ? (
                            <>
                                <button
                                    onClick={() => setShowMenu((prev) => !prev)}
                                    style={{
                                        fontFamily: "Manrope", fontWeight: 700, fontSize: 13,
                                        padding: "8px 18px", borderRadius: 10,
                                        border: "1px solid rgba(52,211,153,0.3)",
                                        color: "var(--navbar-text)", background: "rgba(52,211,153,0.08)",
                                        cursor: "pointer", transition: "all 0.2s", display: "flex",
                                        alignItems: "center", gap: 8,
                                    }}>
                                    <span style={{
                                        width: 7, height: 7, borderRadius: "50%",
                                        background: "var(--success)", display: "inline-block",
                                    }} />
                                    {account.slice(0, 6)}...{account.slice(-4)}
                                    <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
                                </button>

                                {showMenu && (
                                    <div style={{
                                        position: "absolute", right: 0, top: "calc(100% + 8px)",
                                        background: "var(--card)", border: "1px solid var(--border)",
                                        borderRadius: 12, padding: 8, minWidth: 180, zIndex: 100,
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                                    }}>
                                        <div style={{
                                            padding: "8px 12px 10px", borderBottom: "1px solid var(--border)",
                                            marginBottom: 4,
                                        }}>
                                            <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "Manrope", fontWeight: 600 }}>
                                                CONNECTED
                                            </p>
                                            <p style={{ fontSize: 12, color: "var(--text)", fontFamily: "monospace", marginTop: 2 }}>
                                                {account.slice(0, 10)}...{account.slice(-6)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleDisconnect}
                                            style={{
                                                width: "100%", padding: "9px 12px", borderRadius: 8,
                                                border: "none", background: "transparent", textAlign: "left",
                                                color: "var(--danger)", fontFamily: "Manrope", fontWeight: 600,
                                                fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = "rgba(248,113,113,0.08)"}
                                            onMouseLeave={(e) => e.target.style.background = "transparent"}
                                        >
                                            Disconnect Wallet
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button className="navbarbutton" onClick={handleConnect} style={{
                                fontFamily: "Manrope", fontWeight: 700, fontSize: 13,
                                padding: "8px 18px", borderRadius: 10,
                                cursor: "pointer", transition: "all 0.2s",
                            }}>
                                Connect Wallet
                            </button>
                        )}
                    </div>

                    {/* Hamburger (mobile only) */}
                    <button
                        className="flex md:hidden"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        style={{
                            background: "transparent", border: "1px solid var(--border)",
                            borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                            color: "var(--secaccent)", fontSize: 18, lineHeight: 1,
                        }}
                    >
                        {mobileOpen ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileOpen && (
                <div className="flex md:hidden flex-col mt-3 pb-2" style={{
                    borderTop: "1px solid var(--border)", paddingTop: 12, gap: 4,
                }}>
                    {links.map(({ path, label }) => {
                        const active = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => setMobileOpen(false)}
                                style={{
                                    fontFamily: "Manrope", fontWeight: 600, fontSize: 14,
                                    padding: "10px 16px", borderRadius: 8, transition: "all 0.2s",
                                    color: active ? "var(--secaccent)" : "var(--navbar-text)",
                                    background: active ? "rgba(93,169,255,0.1)" : "transparent",
                                    textDecoration: "none", display: "block",
                                }}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}