import React from "react";
import { C } from "../components/Shared";
import yeti from '../data/errorMessages';

// ============================================================
// ☕️  BARISTA REDEEM VIEW — single-use, shows subscriber name
// ============================================================
export default function RedeemPromoView() {
  const { useState, useEffect } = React;
  const [codeData, setCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) { setLoading(false); return; }

    fetch(`/api/promo-redeem?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(data => { setCodeData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleApprove = async () => {
    setRedeeming(true);
    try {
      const res = await fetch("/api/promo-redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: codeData.id, code: codeData.code })
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
    } catch {
      alert(yeti.network());
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.night }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", fontSize: 16 }}>Loading…</div>
    </div>
  );

  if (!codeData || codeData.error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a0000", padding: 24, textAlign: "center" }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
        <h1 style={{ color: "#fca5a5", fontFamily: "sans-serif", fontSize: 22, margin: "0 0 8px" }}>Hmm, That Code Didn't Work</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", fontSize: 14 }}>This code doesn't exist in the system.</p>
      </div>
    </div>
  );

  // Already redeemed
  if (!success && codeData.status === "Redeemed") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a0000", padding: 24, textAlign: "center" }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
        <h1 style={{ color: "#fca5a5", fontFamily: "sans-serif", fontSize: 24, margin: "0 0 8px" }}>ALREADY REDEEMED</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", fontSize: 14 }}>Code {codeData.code} has already been used.</p>
      </div>
    </div>
  );

  // Success after barista taps Approve
  if (success) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#052e16", padding: 24, textAlign: "center" }}>
      <div>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h1 style={{ color: "#4ade80", fontFamily: "sans-serif", fontSize: 28, margin: "0 0 8px", letterSpacing: 2 }}>APPROVED</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", fontSize: 15 }}>
          Code <strong style={{ color: "#a3e635", fontFamily: "monospace" }}>{codeData.code}</strong> marked as used.
        </p>
        {codeData.subscriberName && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", fontSize: 13, marginTop: 8 }}>
            Enjoy your visit, {codeData.subscriberName.split(' ')[0]}!
          </p>
        )}
      </div>
    </div>
  );

  // Valid — show to barista
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.night, padding: 24 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 12 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif" }}>
          Subscriber Promo · One Use
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color: "#4ade80", fontFamily: "monospace", letterSpacing: 4 }}>
          {codeData.code}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "sans-serif", letterSpacing: 1 }}>
          VALID ✓
        </div>
        {codeData.subscriberName && (
          <div style={{
            marginTop: 8, padding: "10px 20px",
            background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.3)",
            borderRadius: 10, fontFamily: "sans-serif",
          }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Subscriber</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#a3e635", marginTop: 2 }}>
              {codeData.subscriberName.split(' ')[0]}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleApprove}
        disabled={redeeming}
        style={{
          background: redeeming ? "#166534" : "#4ade80",
          color: "#052e16", border: "none", borderRadius: 14,
          padding: "26px", fontSize: 22, fontWeight: 800,
          letterSpacing: 2, textTransform: "uppercase",
          width: "100%", cursor: redeeming ? "default" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {redeeming ? "Approving…" : "Approve & Redeem"}
      </button>
      <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 12, fontFamily: "sans-serif" }}>
        This code will be permanently marked as used.
      </p>
    </div>
  );
}
