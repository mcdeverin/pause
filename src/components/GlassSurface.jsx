import { useId } from "react";

/**
 * Refractive glass surface. Uses an SVG turbulence/displacement filter on the
 * backdrop where supported, with a native blurred-glass fallback.
 */
export default function GlassSurface({
  children,
  width = 320,
  height = 76,
  borderRadius = 38,
  distortionScale = -180,
  displace = 0.5,
  backgroundOpacity = 0.1,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  saturation = 1,
  redOffset = 0,
  greenOffset = 0,
  blueOffset = 0,
  refraction = true,
  renderer = "auto",
  style = {},
  className = "",
  ...rest
}) {
  const id = useId().replace(/:/g, "");
  const filterId = `glass-distortion-${id}`;
  const strength = Math.min(30, Math.abs(distortionScale) * Math.max(0, displace) / 12);
  const useRefraction = refraction && renderer !== "css";
  return (
    <div className={className} {...rest} style={{
      position: "relative", isolation: "isolate", overflow: "hidden",
      width, height, borderRadius, boxSizing: "border-box",
      ...style
    }}>
      <svg width="0" height="0" aria-hidden="true" style={{position:"absolute"}}>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={strength} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div aria-hidden="true" style={{
        position:"absolute", inset:0, borderRadius:"inherit",
        background:`rgba(255,255,255,${backgroundOpacity})`,
        backdropFilter:`blur(${blur}px) saturate(${saturation * 100}%) brightness(${1 + brightness / 1000})`,
        WebkitBackdropFilter:`blur(${blur}px) saturate(${saturation * 100}%) brightness(${1 + brightness / 1000})`,
        opacity
      }} />
      {useRefraction && <div aria-hidden="true" style={{
        position:"absolute",inset:0,borderRadius:"inherit",pointerEvents:"none",
        backdropFilter:`url(#${filterId})`,
        WebkitBackdropFilter:`url(#${filterId})`,
        opacity:0.25
      }} />}
      <div aria-hidden="true" style={{
        position:"absolute",inset:0,borderRadius:"inherit",pointerEvents:"none",
        border:`${Math.max(.5,borderWidth * 12)}px solid rgba(255,255,255,.56)`,
        boxShadow:"inset 0 1px 0 rgba(255,255,255,.56), inset 0 -1px 0 rgba(255,255,255,.1)",
        background:"linear-gradient(155deg,rgba(255,255,255,.19),transparent 48%,rgba(255,255,255,.05))"
      }} />
      <div style={{position:"relative",zIndex:1,width:"100%",height:"100%",display:"flex",alignItems:"center"}}>
        {children}
      </div>
    </div>
  );
}
