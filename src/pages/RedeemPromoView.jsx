import React from "react";
import { Btn, C } from "../components/Shared";

// ============================================================
// ☕️  BLACKBIRD PROMO - BARISTA REDEEM VIEW
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
    
    if (!code) {
      setLoading(false);
      return;
    }

    fetch(`/api/promo-redeem?code=${code}`)
      .then(r => r.json())
      .then(data => {
        setCodeData(data);
        setLoading(false);
      })
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
    } catch (err) {
      alert("Error redeeming code. Check internet connection.");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>Loading...</div>;
  if (!codeData || codeData.error) return <div style={{ padding: 40, textAlign: "center", color: "red", fontFamily: "sans-serif" }}>❌ Invalid Code Not Found</div>;

  if (success || codeData.status === "Redeemed") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4", padding: 24 }}>
         <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontFamily: "sans-serif", color: "#166534", fontSize: 24, margin: "0 0 8px 0" }}>REDEEMED</h1>
            <p style={{ color: "#15803d", fontFamily: "sans-serif" }}>Code {codeData.code} is marked as used.</p>
         </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.night, padding: 24 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.5)", marginBottom: 16, fontFamily: "sans-serif" }}>
          Blackbird Barista Portal
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: "#4ade80", fontFamily: "monospace", letterSpacing: 4, marginBottom: 16 }}>
          {codeData.code}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#fff", fontFamily: "sans-serif" }}>
          VALID COOKIE CODE
        </div>
      </div>
      
      <button 
        onClick={handleApprove} 
        disabled={redeeming}
        style={{
          background: "#4ade80", color: "#14532d", border: "none", borderRadius: 12,
          padding: "24px", fontSize: 24, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
          width: "100%", cursor: "pointer"
        }}
      >
        {redeeming ? "Approving..." : "Approve & Redeem"}
      </button>
    </div>
  );
}
