import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
} from "remotion";

const LAKE_BLUE = "#1a6fa0";
const SUNSET_GOLD = "#f5a623";
const CREAM = "#fdf6e3";
const DARK = "#1a1a2e";

export const GetListedPromo = ({ voiceoverSrc }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // --- Background ---
  const gradientAngle = interpolate(frame, [0, durationInFrames], [160, 190]);
  const bgShimmer = interpolate(
    frame,
    [0, durationInFrames],
    [0, Math.PI * 4]
  );
  const shimmerOpacity = 0.06 + 0.03 * Math.sin(bgShimmer);

  // --- Wave animation ---
  const waveOffset = frame * 1.2;

  // ============================
  // Beat 1: "The site launches" (frames 0-45, ~0-1.5s)
  // ============================
  const logoScale = spring({ frame, fps, config: { damping: 10, mass: 0.8 } });
  const logoOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ============================
  // Beat 2: "May the first" (frames 30-90, ~1-3s)
  // ============================
  const dateSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const dateScale = interpolate(dateSpring, [0, 1], [0.3, 1]);
  const dateOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dateGlow =
    frame > 50
      ? 40 + 16 * Math.sin((frame - 50) * 0.12)
      : interpolate(frame, [40, 50], [0, 40], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // ============================
  // Beat 3: "DM me" (frames 75-120, ~2.5-4s)
  // ============================
  const dmSlide = spring({
    frame: frame - 70,
    fps,
    config: { damping: 14 },
  });
  const dmX = interpolate(dmSlide, [0, 1], [600, 0]);
  const dmOpacity = interpolate(frame, [70, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ============================
  // Beat 4: "get listed before the season starts" (frames 105-end)
  // ============================
  const ctaSpring = spring({
    frame: frame - 100,
    fps,
    config: { damping: 12 },
  });
  const ctaOpacity = interpolate(frame, [100, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaPulse =
    frame > 130
      ? 1 + 0.025 * Math.sin((frame - 130) * 0.14)
      : ctaSpring;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, ${DARK} 0%, #0f2b3d 35%, ${LAKE_BLUE} 70%, #2a8bc7 100%)`,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* Voiceover */}
      {voiceoverSrc && <Audio src={voiceoverSrc} />}

      {/* Animated shimmer overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 30%, rgba(245,166,35,${shimmerOpacity}) 0%, transparent 60%)`,
        }}
      />

      {/* Decorative wave at bottom */}
      <svg
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "20%",
          opacity: 0.12,
        }}
        viewBox="0 0 2160 800"
        preserveAspectRatio="none"
      >
        <path
          d={`M0,400 C${400 + waveOffset},${240 + Math.sin(waveOffset * 0.02) * 100} ${800 - waveOffset * 0.4},${560 + Math.cos(waveOffset * 0.03) * 80} 1080,400 C${1400 + waveOffset * 0.3},${240 + Math.sin(waveOffset * 0.02) * 120} ${1800 - waveOffset * 0.2},${600} 2160,400 L2160,800 L0,800 Z`}
          fill={CREAM}
        />
      </svg>

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "160px 120px",
          textAlign: "center",
        }}
      >
        {/* Beat 1: "The site launches..." */}
        <div
          style={{
            fontSize: 128,
            fontWeight: 600,
            color: CREAM,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: 64,
            textShadow: "0 8px 40px rgba(0,0,0,0.5)",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          The site launches
        </div>

        {/* Beat 2: MAY 1ST - big hero moment */}
        <div
          style={{
            fontSize: 360,
            fontWeight: 900,
            color: SUNSET_GOLD,
            opacity: dateOpacity,
            transform: `scale(${dateScale})`,
            textShadow: `0 0 ${dateGlow}px rgba(245,166,35,0.6), 0 16px 80px rgba(0,0,0,0.5)`,
            lineHeight: 1,
            marginBottom: 32,
            letterSpacing: -6,
          }}
        >
          MAY 1
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 600,
            color: CREAM,
            opacity: dateOpacity,
            marginBottom: 180,
            textShadow: "0 6px 28px rgba(0,0,0,0.4)",
            letterSpacing: 20,
            textTransform: "uppercase",
          }}
        >
          2026
        </div>

        {/* Beat 3: DM me */}
        <div
          style={{
            fontSize: 156,
            fontWeight: 700,
            color: CREAM,
            opacity: dmOpacity,
            transform: `translateX(${dmX}px)`,
            marginBottom: 48,
            textShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          DM me
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 400,
            color: CREAM,
            opacity: dmOpacity,
            marginBottom: 180,
            textShadow: "0 6px 28px rgba(0,0,0,0.3)",
          }}
        >
          and I'll send you the link
        </div>

        {/* Beat 4: Get listed CTA */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaPulse})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div
            style={{
              fontSize: 112,
              fontWeight: 800,
              color: DARK,
              backgroundColor: SUNSET_GOLD,
              padding: "56px 144px",
              borderRadius: 140,
              boxShadow: "0 24px 100px rgba(245,166,35,0.4)",
              textTransform: "uppercase",
              letterSpacing: 6,
            }}
          >
            Get Listed
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 500,
              color: CREAM,
              opacity: 0.85,
              textShadow: "0 6px 24px rgba(0,0,0,0.3)",
            }}
          >
            before the season starts
          </div>
        </div>
      </div>

      {/* Branding */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          width: "100%",
          textAlign: "center",
          fontSize: 56,
          color: CREAM,
          opacity: interpolate(frame, [0, 30], [0, 0.45], {
            extrapolateRight: "clamp",
          }),
          fontWeight: 500,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        Manitou Beach, Michigan
      </div>
    </AbsoluteFill>
  );
};
