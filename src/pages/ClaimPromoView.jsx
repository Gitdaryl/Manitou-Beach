import React, { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { Btn, C } from "../components/Shared";
import yeti from '../data/errorMessages';

// ============================================================
// 📱  SUBSCRIBER CLAIM VIEW - get code, show QR, auto-detect redemption
// ============================================================
export default function ClaimPromoView() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redeemed, setRedeemed] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("email")) setEmail(decodeURIComponent(params.get("email")));
    if (params.get("name"))  setName(decodeURIComponent(params.get("name")));
  }, []);

  // Poll every 3s once we have a code - auto-trigger thank you when barista approves
  useEffect(() => {
    if (!code) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/promo-redeem?code=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (data.status === "Redeemed") {
          setRedeemed(true);
          if (data.reviewUrl) setReviewUrl(data.reviewUrl);
          clearInterval(pollRef.current);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [code]);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/promo-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name.trim(), offer: "Blackbird Cookie" }),
      });
      if (!res.ok) throw new Error("Failed to claim promo");
      const data = await res.json();
      if (data.status === "Redeemed") {
        setRedeemed(true);
        if (data.reviewUrl) setReviewUrl(data.reviewUrl);
      } else {
        setCode(data.code);
        if (!name && data.name) setName(data.name);
      }
    } catch {
      setError(yeti.oops());
    } finally {
      setLoading(false);
    }
  };

  // ── Already redeemed ──────────────────────────────────────────
  if (redeemed) {
    const firstName = name.split(" ")[0] || "friend";
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream, padding: 24, textAlign: "center" }}>
        <div style={{ maxWidth: 440, width: "100%" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🍪</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.text, margin: "0 0 10px" }}>
            Enjoy it, {firstName}!
          </h2>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, marginBottom: 32 }}>
            Code approved. Small businesses run on reputation - if you loved the cookie, a quick Google review means the world to Shay and Gordo at Blackbird.
          </p>
          <a
            href={reviewUrl || "https://maps.google.com/?q=Blackbird+Cafe+Manitou+Beach"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", padding: "16px 24px", borderRadius: 28,
              background: C.sunset, color: "#fff", fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 15, fontWeight: 700, textDecoration: "none",
              letterSpacing: 0.5, marginBottom: 16,
            }}
          >
            Leave a Google Review ★
          </a>
          <a href="/" style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Return Home</a>
        </div>
      </div>
    );
  }

  // ── Code in hand - show QR ────────────────────────────────────
  if (code) {
    const redeemUrl = `${window.location.origin}/redeem-promo?code=${code}`;
    const firstName = name.split(" ")[0] || "";
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.night, padding: 24 }}>
        <div style={{ maxWidth: 400, width: "100%", background: "#fff", borderRadius: 20, padding: "40px 32px", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginBottom: 8 }}>
            Blackbird Cafe · Free Cookie
          </div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.text, margin: "0 0 6px" }}>
            {firstName ? `Here you go, ${firstName}!` : "Your welcome gift"}
          </h2>
          <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6, margin: "0 0 24px" }}>
            Show this screen to your barista. They'll scan the QR to approve it.
          </p>

          <div style={{ background: "#fdf9f3", padding: 20, border: `1px solid ${C.sand}`, borderRadius: 14, display: "inline-block", marginBottom: 20 }}>
            <QRCode value={redeemUrl} size={180} />
          </div>

          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 26, fontWeight: 700, letterSpacing: 4, color: C.dusk, marginBottom: 8 }}>
            {code}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 6 }}>
            One use only · tied to your email
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 28 }}>
            First 20 people only. Expires May 31.
          </div>

          <div style={{ padding: "12px 16px", background: `${C.sage}15`, border: `1px solid ${C.sage}30`, borderRadius: 10, fontSize: 13, color: C.textLight, lineHeight: 1.5 }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.sage, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              Waiting for barista approval…
            </span>
            This screen will update automatically once your code is approved.
          </div>
        </div>
      </div>
    );
  }

  // ── Entry form ────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream, padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", background: "#fff", borderRadius: 16, padding: "48px 36px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🍪</div>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunset, marginBottom: 10 }}>
          Welcome Gift
        </div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.text, margin: "0 0 10px" }}>
          Claim Your Free Cookie
        </h2>
        <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6, margin: "0 0 28px" }}>
          Enter the email you subscribed with to get your personal QR code for Blackbird Cafe.
        </p>

        <form onSubmit={handleClaim} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            placeholder="First name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ padding: "13px 16px", borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif", outline: "none", boxSizing: "border-box" }}
          />
          <input
            type="email"
            placeholder="your@email.com *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: "13px 16px", borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif", outline: "none", boxSizing: "border-box" }}
          />
          <Btn variant="sage" disabled={loading}>
            {loading ? "Generating…" : "Get My QR Code →"}
          </Btn>
        </form>

        {error && <p style={{ color: C.sunset, fontSize: 13, marginTop: 12, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</p>}

        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 20, lineHeight: 1.5, fontFamily: "'Libre Franklin', sans-serif" }}>
          One code per email address · Valid at Blackbird Cafe & Baking Company, Manitou Beach
        </p>
        <p style={{ fontSize: 11, color: C.textMuted, marginTop: 8, lineHeight: 1.4, fontFamily: "'Libre Franklin', sans-serif" }}>
          First 20 people only. Expires May 31.
        </p>
      </div>
    </div>
  );
}
