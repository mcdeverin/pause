import { useNavigate } from "react-router-dom";

export default function SensoryBackButton() {
  const navigate = useNavigate();
  return <button type="button" onClick={() => navigate("/sensory")} aria-label="Back to Sensory gallery" style={{position:"absolute",top:"calc(env(safe-area-inset-top, 12px) + 12px)",left:18,zIndex:20,width:44,height:44,border:0,borderRadius:"50%",background:"rgba(255,255,255,.78)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",color:"#263a34",display:"grid",placeItems:"center",cursor:"pointer",boxShadow:"0 2px 14px rgba(0,0,0,.08)"}}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
  </button>;
}
