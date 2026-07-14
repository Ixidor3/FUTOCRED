export function parseError(err) {
    // ethers v6 — reason field (custom revert strings)
    if (err?.reason) return err.reason;

    // ethers v6 — nested inside error.error
    if (err?.error?.reason) return err.error.reason;

    // Revert string buried in message
    if (err?.message) {
        const revertMatch = err.message.match(/reverted with reason string '(.+?)'/);
        if (revertMatch) return revertMatch[1];

        const customMatch = err.message.match(/execution reverted: (.+?)(?:\.|$)/);
        if (customMatch) return customMatch[1];

        // User rejected the transaction in MetaMask
        if (err.message.includes("user rejected") || err.message.includes("User rejected")) {
            return "Transaction rejected in MetaMask";
        }

        // Cut off everything after the first newline or parenthesis (where bytecode starts)
        const clean = err.message.split("\n")[0].split(" (")[0].trim();
        if (clean) return clean;
    }

    return "An unexpected error occurred";
}