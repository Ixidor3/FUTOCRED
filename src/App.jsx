import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Verify from "./pages/Verify";
import Issuer from "./pages/Issuer";
import Admin from "./pages/Admin";
import Student from "./pages/Student";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen dot-grid" style={{ background: "var(--bg)" }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              fontFamily: "Inter",
              fontSize: "14px",
            },
          }}
        />
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<Verify />} />
            <Route path="/student" element={<Student />} />
            <Route path="/issue" element={<Issuer />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}