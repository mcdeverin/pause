import SensoryBackButton from "../components/visuals/SensoryBackButton";
export default function Underwater() {
 return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden",background:"#031426"}}>
  <iframe title="Interactive underwater jellyfish" src="https://holtsetio.com/lab/aurelia/" allow="fullscreen" style={{display:"block",width:"100%",height:"calc(100dvh + 600px)",marginTop:-72,border:0,background:"#031426"}}/>
  <SensoryBackButton/>
 </main>;
}