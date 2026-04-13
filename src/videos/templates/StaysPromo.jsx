import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
  Sequence,
} from "remotion";

const LAKE_BLUE = "#0e4d6e";
const DEEP_NAVY = "#0a1628";
const SUNSET_WARM = "#e8875b";
const GOLDEN = "#f5c842";
const CREAM = "#fdf6e3";
const PINE_GREEN = "#2d5a3d";

// Listing type icons as emoji (Remotion renders these fine)
const LISTING_TYPES = [
  { icon: "🏡", label: "Cottages" },
  { icon: "🏠", label: "Airbnb" },
  { icon: "🏨", label: "Inns & B&Bs" },
  { icon: "⛺", label: "Campgrounds" },
  { icon: "🏕️", label: "Tiny Homes" },
];

export const StaysPromo = ({ screenshotSrc }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ============================================
  // PHASE 1: THE HOOK (frames 0-90, 0-3 seconds)
  // ============================================

  // Dramatic zoom-in text
  const hookScale = interpolate(frame, [0, 8], [3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hookOpacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Second hook line slides up
  const hook2Y = spring({
    frame: frame - 15,
    fps,
    config: { damping: 10, mass: 0.8 },
  });
  const hook2Translate = interpolate(hook2Y, [0, 1], [80, 0]);

  // Glowing underline animation
  const underlineWidth = interpolate(frame, [25, 50], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "FREE" burst at frame 55
  const freeScale = spring({
    frame: frame - 55,
    fps,
    config: { damping: 8, mass: 0.6, stiffness: 200 },
  });
  const freeRotate = interpolate(frame, [55, 70], [-15, -5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hook phase fades out
  const hookFadeOut = interpolate(frame, [85, 95], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ============================================
  // PHASE 2: THE PITCH (frames 90-210, 3-7 sec)
  // ============================================

  // Site screenshot slides in from bottom
  const screenshotY = spring({
    frame: frame - 95,
    fps,
    config: { damping: 14 },
  });
  const screenshotTranslate = interpolate(screenshotY, [0, 1], [600, 0]);
  const screenshotOpacity = interpolate(frame, [95, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tilt the screenshot for depth
  const screenshotTilt = interpolate(frame, [95, 130], [8, 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Listing type badges stagger in
  const badgeStagger = (index) => {
    const startFrame = 120 + index * 12;
    const s = spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 10 },
    });
    return {
      scale: s,
      opacity: interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    };
  };

  // "List for FREE" text
  const pitchTextOpacity = interpolate(frame, [100, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2 fade out
  const pitchFadeOut = interpolate(frame, [200, 215], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ============================================
  // PHASE 3: THE OFFER (frames 210-270, 7-9 sec)
  // ============================================

  const offerOpacity = interpolate(frame, [210, 225], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const offerScale = spring({
    frame: frame - 215,
    fps,
    config: { damping: 12 },
  });

  // Countdown-style "May 10" emphasis
  const mayPulse =
    frame > 230
      ? 1 + 0.04 * Math.sin((frame - 230) * 0.2)
      : 1;

  // Bullet points stagger
  const bulletOpacity = (index) =>
    interpolate(frame, [225 + index * 15, 240 + index * 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // ============================================
  // PHASE 4: CTA (frames 270-300, 9-10 sec)
  // ============================================

  const ctaOpacity = interpolate(frame, [270, 285], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaScale = spring({
    frame: frame - 275,
    fps,
    config: { damping: 10, stiffness: 180 },
  });
  const ctaGlow =
    frame > 285
      ? 10 + 8 * Math.sin((frame - 285) * 0.15)
      : 0;

  // ============================================
  // BACKGROUND ANIMATIONS (continuous)
  // ============================================

  // Slow gradient rotation
  const bgAngle = interpolate(frame, [0, durationInFrames], [140, 200]);

  // Floating particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    x: (i * 137 + frame * (0.3 + i * 0.1)) % 1080,
    y: (i * 191 + frame * (0.2 + i * 0.08)) % 1080,
    size: 3 + (i % 3) * 2,
    opacity: 0.1 + (i % 4) * 0.05,
  }));

  // Water shimmer at bottom
  const shimmerPhase = frame * 0.08;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${bgAngle}deg, ${DEEP_NAVY} 0%, ${LAKE_BLUE} 45%, ${PINE_GREEN} 100%)`,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: GOLDEN,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Water shimmer at bottom */}
      <svg
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "20%",
          opacity: 0.12,
        }}
        viewBox="0 0 1080 200"
        preserveAspectRatio="none"
      >
        <path
          d={`M0,100 Q${270 + Math.sin(shimmerPhase) * 60},${60 + Math.cos(shimmerPhase * 1.3) * 40} 540,100 Q${810 + Math.cos(shimmerPhase * 0.8) * 50},${140 + Math.sin(shimmerPhase * 1.1) * 30} 1080,100 L1080,200 L0,200 Z`}
          fill={CREAM}
        />
        <path
          d={`M0,130 Q${300 + Math.cos(shimmerPhase * 1.2) * 40},${100 + Math.sin(shimmerPhase * 0.9) * 25} 540,130 Q${780 + Math.sin(shimmerPhase * 1.4) * 45},${160 + Math.cos(shimmerPhase) * 20} 1080,130 L1080,200 L0,200 Z`}
          fill={CREAM}
          opacity={0.5}
        />
      </svg>

      {/* ===== PHASE 1: THE HOOK ===== */}
      {frame < 95 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: hookFadeOut,
            padding: 80,
          }}
        >
          {/* Main hook line */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: CREAM,
              textAlign: "center",
              transform: `scale(${hookScale})`,
              opacity: hookOpacity,
              textShadow: "0 4px 30px rgba(0,0,0,0.6)",
              lineHeight: 1.1,
            }}
          >
            Got a Lake House?
          </div>

          {/* Second line */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: SUNSET_WARM,
              textAlign: "center",
              marginTop: 24,
              transform: `translateY(${hook2Translate}px)`,
              opacity: frame > 15 ? 1 : 0,
              textShadow: "0 3px 20px rgba(0,0,0,0.4)",
            }}
          >
            Turn empty nights into income.
          </div>

          {/* Glowing underline */}
          <div
            style={{
              width: `${underlineWidth}%`,
              maxWidth: 500,
              height: 4,
              background: `linear-gradient(90deg, transparent, ${GOLDEN}, transparent)`,
              marginTop: 20,
              borderRadius: 2,
              boxShadow: `0 0 20px ${GOLDEN}40`,
            }}
          />

          {/* FREE burst */}
          {frame >= 55 && (
            <div
              style={{
                position: "absolute",
                top: 160,
                right: 120,
                fontSize: 56,
                fontWeight: 900,
                color: DEEP_NAVY,
                backgroundColor: GOLDEN,
                padding: "12px 36px",
                borderRadius: 16,
                transform: `scale(${freeScale}) rotate(${freeRotate}deg)`,
                boxShadow: `0 8px 40px ${GOLDEN}60`,
              }}
            >
              FREE
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* ===== PHASE 2: THE PITCH ===== */}
      {frame >= 90 && frame < 215 && (
        <AbsoluteFill
          style={{
            opacity: pitchFadeOut,
            padding: 60,
          }}
        >
          {/* Header text */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: CREAM,
              textAlign: "center",
              opacity: pitchTextOpacity,
              marginTop: 40,
              textShadow: "0 2px 15px rgba(0,0,0,0.4)",
            }}
          >
            List your property on
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: GOLDEN,
              textAlign: "center",
              opacity: pitchTextOpacity,
              marginTop: 8,
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            manitoubeachmichigan.com/stays
          </div>

          {/* Screenshot of the actual site */}
          {screenshotSrc && (
            <div
              style={{
                position: "absolute",
                top: 180,
                left: "50%",
                transform: `translateX(-50%) translateY(${screenshotTranslate}px) perspective(1000px) rotateX(${screenshotTilt}deg)`,
                width: 750,
                height: 420,
                borderRadius: 16,
                overflow: "hidden",
                opacity: screenshotOpacity,
                boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                border: `2px solid ${CREAM}20`,
              }}
            >
              <Img
                src={screenshotSrc}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            </div>
          )}

          {/* Listing type badges */}
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 24,
            }}
          >
            {LISTING_TYPES.map((type, i) => {
              const { scale, opacity } = badgeStagger(i);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transform: `scale(${scale})`,
                    opacity,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      marginBottom: 8,
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                    }}
                  >
                    {type.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: CREAM,
                      textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                    }}
                  >
                    {type.label}
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* ===== PHASE 3: THE OFFER ===== */}
      {frame >= 210 && frame < 275 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: offerOpacity,
            padding: 80,
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: CREAM,
              textAlign: "center",
              transform: `scale(${offerScale})`,
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              marginBottom: 40,
            }}
          >
            List now through{" "}
            <span
              style={{
                color: GOLDEN,
                transform: `scale(${mayPulse})`,
                display: "inline-block",
              }}
            >
              May 10
            </span>
          </div>

          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: GOLDEN,
              textShadow: `0 0 30px ${GOLDEN}50`,
              marginBottom: 50,
            }}
          >
            Completely Free
          </div>

          {/* Bullet points */}
          {[
            "No credit card required",
            "Reach lake visitors already here",
            "Cancel anytime - zero risk",
          ].map((text, i) => (
            <div
              key={i}
              style={{
                fontSize: 30,
                fontWeight: 500,
                color: CREAM,
                opacity: bulletOpacity(i),
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <span style={{ color: GOLDEN, fontSize: 24 }}>✓</span>
              {text}
            </div>
          ))}
        </AbsoluteFill>
      )}

      {/* ===== PHASE 4: CTA ===== */}
      {frame >= 270 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: ctaOpacity,
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: CREAM,
              marginBottom: 40,
              textShadow: "0 3px 15px rgba(0,0,0,0.4)",
            }}
          >
            Get your listing up today
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: DEEP_NAVY,
              backgroundColor: GOLDEN,
              padding: "24px 64px",
              borderRadius: 60,
              transform: `scale(${ctaScale})`,
              boxShadow: `0 0 ${ctaGlow}px ${GOLDEN}, 0 12px 40px rgba(0,0,0,0.3)`,
            }}
          >
            manitoubeachmichigan.com/stays
          </div>

          <div
            style={{
              fontSize: 22,
              color: CREAM,
              opacity: 0.7,
              marginTop: 24,
              fontWeight: 500,
            }}
          >
            Manitou Beach · Devils Lake · Irish Hills
          </div>
        </AbsoluteFill>
      )}

      {/* Persistent branding watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 30,
          fontSize: 14,
          color: CREAM,
          opacity: 0.3,
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        MANITOU BEACH
      </div>
    </AbsoluteFill>
  );
};
