import React from "react";
import QRCode from "react-qr-code";
import { Btn, C } from "../components/Shared";

// ============================================================
// 📱  BLACKBIRD PROMO - USER CLAIM VIEW
// ============================================================
export default function ClaimPromoView() {
  const { useState, useEffect } = React;
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redeemedView, setRedeemedView] = useState(false);

  useEffect(() => {
    // If they came from the email button, grab their email from the URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("email")) {
      setEmail(params.get("email"));
    }
  }, []);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/promo-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error("Failed to claim promo");
      const data = await res.json();
      setCode(data.code);
      setStatus(data.status);
      
      if (data.status === "Redeemed") {
        setRedeemedView(true);
      }
    } catch (err) {
      setError("There was a problem grabbing your code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // User clicked "Mark as Redeemed" themselves, or saw the barista do it.
  const handleRevealReview = () => {
    setRedeemedView(true);
  };

  if (redeemedView) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream, padding: 24, textAlign: "center" }}>
        <div style={{ maxWidth: 440, width: "100%", padding: "48px 32px", background: "#fff", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🍪</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.text, margin: "0 0 12px 0" }}>Hope it was delicious!</h2>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.6, marginBottom: 32 }}>
            Small businesses run on reputation. If you enjoyed the cookie and your time at Blackbird, taking 60 seconds to drop a Yelp review means the absolute world to Shay and Gordo.
          </p>
          <Btn href="https://www.yelp.com/biz/blackbird-cafe-and-baking-company-manitou-beach" variant="sage">Leave a Yelp Review</Btn>
          <div style={{ marginTop: 24 }}>
             <a href="/" style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Return Home</a>
          </div>
        </div>
      </div>
    );
  }

  if (code) {
    const redeemUrl = `${window.location.origin}/redeem-promo?code=${code}`;
    
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.night, padding: 24 }}>
        <div style={{ maxWidth: 400, width: "100%", background: "#fff", borderRadius: 16, padding: "40px 32px", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginBottom: 8 }}>
            Blackbird Cafe
          </div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.text, margin: "0 0 16px 0" }}>
            Your Free Cookie
          </h2>
          <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6, margin: "0 0 32px 0" }}>
            Show this screen to your barista. They will scan the QR code to approve it.
          </p>
          
          <div style={{ 
            background: "#fff", padding: 20, border: `2px solid ${C.sand}`, borderRadius: 12, 
            display: "inline-block", marginBottom: 24, pointerEvents: "none"
          }}>
             <QRCode value={redeemUrl} size={180} />
          </div>

          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 24, fontWeight: 700, letterSpacing: 4, color: C.text, marginBottom: 32 }}>
            {code}
          </div>

          <button onClick={handleRevealReview} style={{
            background: "transparent", color: C.lakeBlue, border: "none", fontSize: 14, 
            fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", cursor: "pointer",
            textDecoration: "underline"
          }}>
            I got my cookie! (Reveal next step)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream, padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", background: "#fff", borderRadius: 16, padding: "48px 36px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🍪</div>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunset, marginBottom: 10 }}>
          Secret Lake Code
        </div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.text, margin: "0 0 16px 0" }}>
          Claim Your Welcome Cookie
        </h2>
        <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6, margin: "0 0 32px 0" }}>
          Confirm your email address below to generate your unique Blackbird Cafe QR code. Show it to your barista to redeem!
        </p>
        
        <form onSubmit={handleClaim} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input 
            type="email" 
            placeholder="your@email.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: "14px 16px", borderRadius: 6, border: `1px solid ${C.sand}`, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif" }}
          />
          <Btn variant="sage" disabled={loading}>{loading ? "Generating..." : "Get My QR Code"}</Btn>
        </form>
        {error && <p style={{ color: C.sunset, fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
