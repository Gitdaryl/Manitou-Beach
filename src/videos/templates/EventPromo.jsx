import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from "remotion";

const LAKE_BLUE = "#1a6fa0";
const SUNSET_GOLD = "#f5a623";
const CREAM = "#fdf6e3";
const DARK = "#1a1a2e";

export const EventPromo = ({
  eventName,
  eventDate,
  eventTime,
  venue,
  tagline,
  imageUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // --- Animations ---

  // Background gradient shift
  const gradientAngle = interpolate(frame, [0, durationInFrames], [135, 160]);

  // Title entrance (spring bounce)
  const titleScale = spring({ frame, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Date/time slide in from left
  const dateX = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14 },
  });
  const dateTranslate = interpolate(dateX, [0, 1], [-200, 0]);
  const dateOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Venue slide in from right
  const venueX = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14 },
  });
  const venueTranslate = interpolate(venueX, [0, 1], [200, 0]);
  const venueOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline fade in
  const taglineOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA pulse at the end
  const ctaOpacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaPulse =
    frame > 95
      ? 1 + 0.03 * Math.sin((frame - 95) * 0.15)
      : interpolate(frame, [80, 95], [0.8, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // Decorative wave
  const waveOffset = frame * 1.5;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, ${DARK} 0%, ${LAKE_BLUE} 50%, ${SUNSET_GOLD} 100%)`,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* Decorative wave SVG */}
      <svg
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "30%",
          opacity: 0.15,
        }}
        viewBox="0 0 1080 300"
        preserveAspectRatio="none"
      >
        <path
          d={`M0,150 C${180 + waveOffset},${80 + Math.sin(waveOffset * 0.02) * 40} ${360 - waveOffset * 0.5},${220 + Math.cos(waveOffset * 0.03) * 30} 540,150 C${720 + waveOffset * 0.3},${80 + Math.sin(waveOffset * 0.025) * 50} ${900 - waveOffset * 0.2},${230} 1080,150 L1080,300 L0,300 Z`}
          fill={CREAM}
        />
      </svg>

      {/* Event image (if provided) */}
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 350,
            borderRadius: 24,
            overflow: "hidden",
            opacity: interpolate(frame, [5, 20], [0, 0.85], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* Content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: imageUrl ? "flex-end" : "center",
          height: "100%",
          padding: "60px 80px",
          paddingBottom: imageUrl ? 100 : 60,
          textAlign: "center",
        }}
      >
        {/* Event Name */}
        <div
          style={{
            fontSize: eventName.length > 30 ? 56 : 68,
            fontWeight: 800,
            color: CREAM,
            lineHeight: 1.15,
            marginBottom: 32,
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            maxWidth: 900,
          }}
        >
          {eventName}
        </div>

        {/* Date & Time */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: SUNSET_GOLD,
            marginBottom: 12,
            transform: `translateX(${dateTranslate}px)`,
            opacity: dateOpacity,
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          {eventDate} {eventTime ? `\u00B7 ${eventTime}` : ""}
        </div>

        {/* Venue */}
        <div
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: CREAM,
            marginBottom: 40,
            transform: `translateX(${venueTranslate}px)`,
            opacity: venueOpacity,
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          {venue}
        </div>

        {/* Tagline */}
        {tagline && (
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: CREAM,
              opacity: taglineOpacity,
              fontStyle: "italic",
              marginBottom: 48,
              maxWidth: 800,
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {tagline}
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: DARK,
            backgroundColor: SUNSET_GOLD,
            padding: "16px 48px",
            borderRadius: 50,
            opacity: ctaOpacity,
            transform: `scale(${ctaPulse})`,
            boxShadow: "0 8px 30px rgba(245,166,35,0.4)",
          }}
        >
          manitoubeachmichigan.com/events
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 18,
            color: CREAM,
            opacity: 0.5,
            fontWeight: 500,
          }}
        >
          Manitou Beach, Michigan
        </div>
      </div>
    </AbsoluteFill>
  );
};
