import React, { useState, useEffect } from 'react';
import { FadeIn, SectionTitle, SectionLabel, Btn } from '../components/Shared';
import { C } from '../data/config';
import { Footer, GlobalStyles, Navbar, compressImage } from '../components/Layout';
import yeti from '../data/errorMessages';

const EVENT_CATEGORIES = ["Live Music", "Food & Social", "Sports & Outdoors", "Community", "Arts & Culture", "Markets & Vendors", "Other"];

const ATTENDANCE_OPTIONS = [
  { value: "", label: "— Select attendance type (optional)" },
  { value: "just_show_up", label: "Just Show Up — open to all, no registration needed" },
  { value: "rsvp_appreciated", label: "RSVP Appreciated — please let us know, but not required" },
  { value: "rsvp_required", label: "RSVP Required — must register to attend" },
  { value: "limited_spots", label: "Limited Spots — finite capacity, act quickly" },
  { value: "registration_required", label: "Registration Required — formal signup needed" },
];

export default function EventEditPage() {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [token, setToken] = useState("");
  const [eventPageId, setEventPageId] = useState("");
  const [form, setForm] = useState({
    name: "", date: "", time: "", timeEnd: "", location: "",
    description: "", cost: "", eventUrl: "", attendance: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) { setNotFound(true); setLoading(false); return; }
    setToken(t);

    fetch(`/api/event-edit?token=${encodeURIComponent(t)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); }
        else {
          if (data.id) setEventPageId(data.id);
          setForm({
            name: data.name || "",
            date: data.date || "",
            time: data.time || "",
            timeEnd: data.timeEnd || "",
            location: data.location || "",
            description: data.description || "",
            cost: data.cost || "",
            eventUrl: data.eventUrl || "",
            attendance: data.attendance || "",
          });
          if (data.imageUrl) setImagePreview(data.imageUrl);
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, []);

  const handleImage = async (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      let imageUrl = undefined;
      if (imageFile) {
        const { base64, filename } = await compressImage(imageFile);
        const up = await fetch("/api/upload-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: base64, filename, contentType: "image/jpeg" }) });
        const upData = await up.json();
        if (up.ok) imageUrl = upData.url;
      }
      const body = { token, ...form };
      if (imageUrl) body.imageUrl = imageUrl;
      const res = await fetch("/api/event-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || yeti.oops());
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", background: "rgba(255,255,255,0.06)", color: C.cream, outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" };

  return (
    <>
      <GlobalStyles />
      <Navbar />
      <main style={{ minHeight: "100vh", background: C.night }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>Loading event...</div>
          </div>
        ) : notFound ? (
          <div style={{ padding: "100px 24px", textAlign: "center" }}>
            <FadeIn>
              <div style={{ maxWidth: 480, margin: "0 auto" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>Hmm, can't find that one</h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, margin: "0 0 32px 0" }}>
                  This link might be old or mistyped. Check your texts for the right one — we sent it when you submitted.
                </p>
                <Btn href="/events" variant="outlineLight">Back to Events</Btn>
              </div>
            </FadeIn>
          </div>
        ) : submitted ? (
          <div style={{ padding: "100px 24px", textAlign: "center" }}>
            <FadeIn>
              <div style={{ maxWidth: 520, margin: "0 auto" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>All saved!</h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 32px 0" }}>
                  Your updates are live on the calendar. Looking good!
                </p>
                <Btn href="/events" variant="sunset">Back to Events</Btn>

                {eventPageId && (
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px 32px", marginTop: 32 }}>
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 10 }}>Want a bigger crowd?</div>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 20px 0" }}>
                      Get your event on the homepage, in the newsletter, or featured with a banner. We've got some fun options.
                    </p>
                    <Btn href={`/promote?event=${encodeURIComponent(eventPageId)}&token=${encodeURIComponent(token)}`} variant="sunset">Promote This Event →</Btn>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        ) : (
          <section style={{ padding: "80px 24px 120px" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <FadeIn>
                <SectionLabel light>Edit Event</SectionLabel>
                <SectionTitle light>{form.name}</SectionTitle>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, margin: "0 0 48px 0" }}>
                  Change whatever you need — it goes live right away.
                </p>
              </FadeIn>

              <FadeIn delay={80}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Date</label>
                      <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
                    </div>
                    <div />
                    <div>
                      <label style={labelStyle}>Start Time</label>
                      <input value={form.time} onChange={e => set("time", e.target.value)} placeholder="e.g. 7:00 PM" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>End Time <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                      <input value={form.timeEnd} onChange={e => set("timeEnd", e.target.value)} placeholder="e.g. 10:00 PM" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Location</label>
                      <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Devils Lake Pavilion" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Cost / Admission</label>
                      <input value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="e.g. Free · $10 at the door" style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Attendance / RSVP</label>
                      <select value={form.attendance} onChange={e => set("attendance", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                        {ATTENDANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Description</label>
                      <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Tell us about your event..." rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Ticket / Event URL</label>
                      <input value={form.eventUrl} onChange={e => set("eventUrl", e.target.value)} placeholder="https://" style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Event Image</label>
                      <div
                        onClick={() => document.getElementById("edit-img-upload").click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("image/")) handleImage(f); }}
                        style={{ border: "1.5px dashed rgba(255,255,255,0.15)", borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="preview" style={{ maxHeight: 120, borderRadius: 6, objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>Click or drag to replace image</span>
                        )}
                        <input id="edit-img-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImage(e.target.files[0])} />
                      </div>
                    </div>
                  </div>

                  {submitError && <div style={{ fontSize: 13, color: "#ff6b6b", fontFamily: "'Libre Franklin', sans-serif" }}>{submitError}</div>}

                  <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    <button type="submit" disabled={submitting} style={{ padding: "13px 32px", background: C.sunset, color: "#fff", border: "none", borderRadius: 6, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, transition: "all 0.2s" }}>
                      {submitting ? "Saving..." : "Save Changes"}
                    </button>
                    <a href="/events" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none" }}>Cancel</a>
                  </div>
                </form>
              </FadeIn>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
