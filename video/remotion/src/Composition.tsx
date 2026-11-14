import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Lato";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import timings from "./timings.json";

// Adapted from the Tailored Travel video POC. The cover, code and end cards are part of
// the recording, so this only adds narration, captions, cursor, ripples and zooms. No music.

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

const FPS = 30;
const BRAND = { navy: "#1b264f", pink: "#f5c1bc" };

const ZOOM = 1.5;
const ZOOM_IN_MS = 600;
const ZOOM_HOLD_MS = 400;
const ZOOM_OUT_MS = 600;
const CURSOR_GLIDE_MS = 500;
const RIPPLE_MS = 600;

type TimingEvent = {
  t: number;
  type: string;
  x: number;
  y: number;
  holdMs?: number;
  instant?: boolean;
};
const events = timings.events as TimingEvent[];

const msToFrames = (ms: number) => Math.round((ms / 1000) * FPS);
const videoFrames = msToFrames(timings.totalMs);
const ease = Easing.inOut(Easing.cubic);

export const MyComposition = () => {
  return (
    <Composition
      id="ResponsiveAreasDemo"
      component={Demo}
      durationInFrames={videoFrames}
      fps={FPS}
      width={timings.viewport.width}
      height={timings.viewport.height}
    />
  );
};

const Demo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black", fontFamily }}>
      <Screen />
      <Captions />
      {timings.steps.map((step) => (
        <Sequence
          key={step.id}
          from={msToFrames(step.startMs)}
          durationInFrames={msToFrames(step.audioMs) + 1}
        >
          <Audio src={staticFile(`audio/${step.id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const useRecordingMs = () => {
  const frame = useCurrentFrame();
  return (frame / FPS) * 1000;
};

const Screen: React.FC = () => {
  const ms = useRecordingMs();
  const { scale, x, y } = zoomAt(ms);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `${x}px ${y}px` }}>
      <Video src={staticFile("recording.mp4")} style={{ width: "100%", height: "100%" }} />
      <Cursor ms={ms} />
    </AbsoluteFill>
  );
};

// Clicks and spotlights zoom in. A drag or spotlight holds the zoom for its holdMs.
function zoomAt(ms: number) {
  for (const e of events.filter((ev) => ev.type === "click" || ev.type === "zoom")) {
    const hold = e.holdMs ?? ZOOM_HOLD_MS;
    const start = e.t - ZOOM_IN_MS;
    const end = e.t + hold + ZOOM_OUT_MS;
    if (ms >= start && ms <= end) {
      const scale = interpolate(ms, [start, e.t, e.t + hold, end], [1, ZOOM, ZOOM, 1], { easing: ease });
      return { scale, x: e.x, y: e.y };
    }
  }
  return { scale: 1, x: timings.viewport.width / 2, y: timings.viewport.height / 2 };
}

function cursorAt(ms: number) {
  let pos = { x: timings.viewport.width / 2, y: timings.viewport.height * 0.6 };
  for (const e of events) {
    if (e.type !== "move" || e.t > ms) continue;
    if (e.instant) {
      pos = { x: e.x, y: e.y };
      continue;
    }
    const p = interpolate(ms, [e.t, e.t + CURSOR_GLIDE_MS], [0, 1], {
      extrapolateRight: "clamp",
      easing: ease,
    });
    pos = { x: pos.x + (e.x - pos.x) * p, y: pos.y + (e.y - pos.y) * p };
  }
  return pos;
}

const Cursor: React.FC<{ ms: number }> = ({ ms }) => {
  const { x, y } = cursorAt(ms);
  const ripples = events.filter((e) => e.type === "click" && ms >= e.t && ms <= e.t + RIPPLE_MS);

  return (
    <>
      {ripples.map((e) => {
        const p = (ms - e.t) / RIPPLE_MS;
        const size = 20 + p * 80;
        return (
          <div
            key={e.t}
            style={{
              position: "absolute",
              left: e.x - size / 2,
              top: e.y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `4px solid ${BRAND.pink}`,
              background: "rgba(245, 193, 188, 0.3)",
              opacity: 1 - p,
            }}
          />
        );
      })}
      <svg
        width={32}
        height={32}
        viewBox="0 0 24 24"
        style={{ position: "absolute", left: x - 4, top: y - 2, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}
      >
        <path d="M4 2 L4 19 L8.5 14.8 L11.5 21.5 L14.3 20.3 L11.4 13.7 L17.5 13.7 Z" fill="white" stroke="black" strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </>
  );
};

const Captions: React.FC = () => {
  const ms = useRecordingMs();
  const step = timings.steps.find((s) => ms >= s.startMs && ms <= s.startMs + s.audioMs + 200);
  if (!step) return null;
  const opacity = interpolate(ms, [step.startMs, step.startMs + 150], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 50 }}>
      <div
        style={{
          opacity,
          maxWidth: 1500,
          padding: "16px 34px",
          borderRadius: 16,
          background: "rgba(27, 38, 79, 0.9)",
          color: "white",
          fontSize: 40,
          lineHeight: 1.3,
          textAlign: "center",
        }}
      >
        {step.narration}
      </div>
    </AbsoluteFill>
  );
};
