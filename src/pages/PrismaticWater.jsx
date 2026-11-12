import PrismaticWaterScene from "@/components/visuals/PrismaticWaterScene";
import SensoryBackButton from "@/components/visuals/SensoryBackButton";
export default function PrismaticWater() {
 return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden"}}>
  <PrismaticWaterScene strength={.7} softness={.65} motion={1} palette="lagoon"/>
  <SensoryBackButton/>
 </main>;
}