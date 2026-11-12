import LiquidSurfaceScene from "@/components/visuals/LiquidSurfaceScene";
import SensoryBackButton from "@/components/visuals/SensoryBackButton";
import { BACKDROP_PHOTOS } from "@/lib/crystalStudio";
export default function LiquidSurface() {
 const image=BACKDROP_PHOTOS[0];
 return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden"}}>
  <LiquidSurfaceScene photoUrl={image?.url} strength={.83} viscosity={.76}/>
  <SensoryBackButton/>
 </main>;
}