"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    // Store a simple auth token (localStorage) — replace with Supabase in production
    localStorage.setItem("nutriwise_user", JSON.stringify({ email }));
    router.push("/survey");
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center page-enter"
      style={{ padding: "40px 24px" }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 60, height: 60, borderRadius: 16,
            background: "linear-gradient(135deg, #4ade80, #22c55e)",
            marginBottom: 16, boxShadow: "0 8px 24px rgba(74,222,128,0.3)"
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#052e16"/>
              <circle cx="12" cy="9" r="2.5" fill="#052e16"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>
            NutriWise
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Your culturally intelligent nutrition guide
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>

          {/* Tab Toggle */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.04)",
            borderRadius: 12, padding: 4, marginBottom: 28
          }}>
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: "none", cursor: "pointer", fontFamily: "Outfit, sans-serif",
                fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.02em",
                transition: "all 0.25s ease",
                background: mode === m ? "rgba(74,222,128,0.12)" : "transparent",
                color: mode === m ? "var(--accent)" : "var(--text-muted)",
              }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>
            {mode === "signup" && (
              <div>
                <label className="form-label">Confirm Password</label>
                <input
                  id="confirm-password" type="password" value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>
            )}
            {error && (
              <p style={{ color: "#f87171", fontSize: "0.88rem", textAlign: "center" }}>{error}</p>
            )}
            <button type="submit" className="btn-accent" style={{ marginTop: 4 }}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 24 }}>
          Your health data stays on your device. We respect your privacy.
        </p>
      </div>
    </main>
  );
}
