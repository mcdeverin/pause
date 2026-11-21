import SensoryBackButton from "../components/visuals/SensoryBackButton";
export default function Underwater() {
 return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden",background:"#031426"}}>
  <iframe title="Interactive underwater jellyfish" src="https://holtsetio.com/lab/aurelia/" allow="fullscreen" style={{display:"block",width:"100%",height:"calc(100dvh + 600px)",marginTop:-72,border:0,background:"#031426"}}/>
  <SensoryBackButton/>
  {/* Aurelia is MIT-licensed open-source work by Holtsetio; see /credits. */}
  <p style={{position:"absolute",left:16,bottom:"calc(env(safe-area-inset-bottom, 0px) + 12px)",margin:0,fontSize:11,color:"rgba(255,255,255,.6)",pointerEvents:"none"}}>Aurelia by Holtsetio · MIT</p>
 </main>;
}