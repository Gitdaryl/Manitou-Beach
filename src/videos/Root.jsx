import { Composition } from "remotion";
import { EventPromo } from "./templates/EventPromo.jsx";
import { StaysPromo } from "./templates/StaysPromo.jsx";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="EventPromo"
        component={EventPromo}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          eventName: "Devils Lake Festival of the Arts",
          eventDate: "August 15, 2026",
          eventTime: "10 AM – 6 PM",
          venue: "Manitou Beach Village",
          tagline: "100+ artist booths, live music, food trucks",
          imageUrl: null,
        }}
      />
      <Composition
        id="StaysPromo"
        component={StaysPromo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          screenshotSrc: null,
        }}
      />
    </>
  );
};
