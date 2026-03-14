import os
import re

APP_JSX_PATH = "/Users/darylyoung/Documents/Claude Code/Manitou-Beach/src/App.jsx"

# The React components to inject
PROMO_COMPONENTS = """
// ============================================================
// 📱  BLACKBIRD PROMO - USER CLAIM VIEW
// ============================================================
function ClaimPromoView() {
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
    // Show QR Code directly via a lightweight external img service (to skip huge library)
    const redeemUrl = `${window.location.origin}/redeem-promo?code=${code}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(redeemUrl)}`;
    
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
             <img src={qrUrl} alt="QR Code" width={180} height={180} />
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

// ============================================================
// ☕️  BLACKBIRD PROMO - BARISTA REDEEM VIEW
// ============================================================
function RedeemPromoView() {
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

"""

ROUTER_INJECTION = """
        <Route path="/claim-promo" element={<ClaimPromoView />} />
        <Route path="/redeem-promo" element={<RedeemPromoView />} />
"""

def inject_components():
    with open(APP_JSX_PATH, 'r') as f:
        content = f.read()
        
    # Check if already injected
    if "ClaimPromoView" in content:
        print("Components already injected!")
        return

    # 1. Add components right above the main export
    target_pattern = r"(// ============================================================\n// 🌐  APP ROOT\n// ============================================================\nexport default function App\(\) \{)"
    
    if not re.search(target_pattern, content):
        print("Could not find App export")
        return
        
    content = re.sub(target_pattern, PROMO_COMPONENTS + r"\1", content)
    
    # 2. Add router logic inside the main export component
    router_target = r"(<Routes>\n)"
    
    if not re.search(router_target, content):
        print("Could not find <Routes> inside Main Component")
        return
        
    content = re.sub(router_target, r"\1" + ROUTER_INJECTION, content)
    
    with open(APP_JSX_PATH, 'w') as f:
        f.write(content)
        
    print("Successfully injected Promo Components and Router into App.jsx!")

if __name__ == "__main__":
    inject_components()
