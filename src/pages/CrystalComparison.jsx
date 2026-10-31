import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PrismaticGlass from "@/components/crystalStudio/PrismaticGlass";
import BaselineCrystal from "@/components/crystalStudio/BaselineCrystal";
import StudioControls from "@/components/crystalStudio/StudioControls";
import StudioPanel from "@/components/crystalStudio/StudioPanel";
import StudioToolbar from "@/components/crystalStudio/StudioToolbar";
import { CRYSTAL_DEFAULTS } from "@/components/crystalStudio/CrystalPrototypeBaseline";
import useStudioBreath from "@/hooks/useStudioBreath";
import {
  BACKDROP_PHOTOS,
  BACKGROUND_CSS,
  BACKGROUND_MODES,
  BASELINE_CONTROLS,
  DEFAULT_BACKDROP_PHOTO,
  PRISMATIC_CONTROLS,
  PRISMATIC_DEFAULTS,
  STUDIO_UI,
} from "@/lib/crystalStudio";

// Development-only studio. Nothing here is referenced by the breathing
// experience, the paywall, or the living visuals.
export default function CrystalComparison() {
  const [allowed, setAllowed] = useState(null);
  const [mode, setMode] = useState("light");
  const [photoId, setPhotoId] = useState(DEFAULT_BACKDROP_PHOTO);
  const [quality, setQuality] = useState("high");
  const [auto, setAuto] = useState(true);
  const [sync, setSync] = useState(true);
  const [manual, setManual] = useState(0.35);
  const [expanded, setExpanded] = useState(null);
  const [reduced, setReduced] = useState(false);
  const [prismatic, setPrismatic] = useState(PRISMATIC_DEFAULTS);
  const [baseline, setBaseline] = useState(CRYSTAL_DEFAULTS);
  const [playingA, setPlayingA] = useState(true);
  const [playingB, setPlayingB] = useState(true);
  const sharedBreath = useRef(0.35);

  useStudioBreath({ running: auto, manual, target: sharedBreath });

  // The owner's account is the only one that sees the studio; everyone else gets
  // nothing but a quiet notice.
  useEffect(() => {
    base44.auth
      .me()
      .then((me) => setAllowed(me?.role === "admin"))
      .catch(() => setAllowed(true));
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(query.matches);
      if (query.matches) setAuto(false);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const bothPlaying = playingA && playingB;
  const toggleBoth = () => {
    const next = !bothPlaying;
    setPlayingA(next);
    setPlayingB(next);
  };

  // The photograph is painted inside each WebGL scene; this is only the panel
  // behind the canvas, so the edges match while a canvas resizes.
  const photo =
    BACKDROP_PHOTOS.find((entry) => entry.id === photoId) || BACKDROP_PHOTOS[0];
  const photoBackground = `url("${photo.url}") center / cover no-repeat`;

  const matchSizes = () => {
    setPrismatic((current) => ({ ...current, size: 1, breathStrength: 0.19 }));
    setBaseline((current) => ({ ...current, size: 1, breathStrength: 0.19 }));
  };

  const panelA = (
    <StudioPanel
      label="Prismatic Glass"
      tag="Experimental"
      background={mode === "photo" ? photoBackground : BACKGROUND_CSS[mode]}
      playing={playingA}
      onTogglePlay={() => setPlayingA((value) => !value)}
      onExpand={() => setExpanded(expanded === "a" ? null : "a")}
      expanded={expanded === "a"}
      controls={
        <StudioControls
          schema={PRISMATIC_CONTROLS}
          values={prismatic}
          onChange={(key, value) => setPrismatic((current) => ({ ...current, [key]: value }))}
          onReset={() => setPrismatic({ ...PRISMATIC_DEFAULTS })}
        />
      }
    >
      <PrismaticGlass
        settings={prismatic}
        breathRef={sync ? sharedBreath : { current: prismatic.breath }}
        mode={mode}
        photo={photo.url}
        playing={playingA}
        quality={quality}
        reducedMotion={reduced}
      />
    </StudioPanel>
  );

  const panelB = (
    <StudioPanel
      label="Crystal Lab"
      tag="Existing"
      background={
        mode === "photo" ? photoBackground : BACKGROUND_CSS[mode === "test" ? "test" : mode]
      }
      playing={playingB}
      onTogglePlay={() => setPlayingB((value) => !value)}
      onExpand={() => setExpanded(expanded === "b" ? null : "b")}
      expanded={expanded === "b"}
      controls={
        <StudioControls
          schema={BASELINE_CONTROLS}
          values={baseline}
          onChange={(key, value) => setBaseline((current) => ({ ...current, [key]: value }))}
          onReset={() => setBaseline({ ...CRYSTAL_DEFAULTS })}
        />
      }
    >
      <BaselineCrystal
        settings={baseline}
        breathRef={sharedBreath}
        manualBreath={baseline.breath}
        synced={sync}
        playing={playingB && !reduced}
        dark={mode === "dark"}
        testPattern={mode === "test"}
        reducedMotion={reduced}
      />
    </StudioPanel>
  );

  if (allowed === false) {
    return (
      <div
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          background: STUDIO_UI.page,
          color: STUDIO_UI.text,
          padding: 24,
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>This studio is private.</p>
        <p style={{ margin: 0, fontSize: 13.5, color: STUDIO_UI.muted, maxWidth: 320 }}>
          The Crystal Comparison Studio is a development space for the app owner only.
        </p>
        <Link to="/" style={{ fontSize: 13, fontWeight: 700, color: STUDIO_UI.accent }}>
          Back to Always Pause
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100dvh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
        background: STUDIO_UI.page,
        color: STUDIO_UI.text,
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 20px 48px" }}>
        <header style={{ marginBottom: 18 }}>
          <p
            style={{
              margin: 0,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: STUDIO_UI.accent,
            }}
          >
            Always Pause · Design Studio
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.015em" }}>
            Crystal Comparison
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 14.5, color: STUDIO_UI.muted }}>
            Two approaches to light, glass, and breathing.
          </p>
        </header>

        <StudioToolbar
          modes={BACKGROUND_MODES}
          mode={mode}
          onModeChange={setMode}
          photos={BACKDROP_PHOTOS}
          photoId={photoId}
          onPhotoChange={setPhotoId}
          auto={auto}
          onToggleAuto={() => setAuto((value) => !value)}
          sync={sync}
          onToggleSync={() => setSync((value) => !value)}
          bothPlaying={bothPlaying}
          onToggleBoth={toggleBoth}
          onMatchSizes={matchSizes}
          quality={quality}
          onQualityChange={setQuality}
          manual={manual}
          onManualChange={setManual}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: expanded ? "minmax(0, 1fr)" : "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: 24,
            marginTop: 22,
            maxWidth: expanded ? 720 : "none",
            marginInline: expanded ? "auto" : 0,
          }}
        >
          {expanded !== "b" && panelA}
          {expanded !== "a" && panelB}
        </div>

        <p style={{ margin: "26px 0 0", fontSize: 11.5, color: STUDIO_UI.muted, lineHeight: 1.6 }}>
          Development-only experiment. Refraction is rendered for real inside each WebGL scene — the artwork sits in
          the 3D scene behind the glass, not behind the canvas. The Crystal visual in Personalize Pause is unchanged
          until a design is approved.
        </p>
      </div>
    </div>
  );
}