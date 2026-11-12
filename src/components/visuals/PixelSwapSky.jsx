import PixelSwap from "./PixelSwap";

const skyOne="https://images.unsplash.com/photo-1564115484-a4aaa88d5449?auto=format&fit=crop&w=1600&q=85";
const skyTwo="https://images.unsplash.com/photo-1779462303506-c46eb40de2c9?auto=format&fit=crop&w=1600&q=85";

export default function PixelSwapSky() {
  return <PixelSwap firstContent={<img src={skyOne} alt="Pink and blue sunset clouds" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
    secondContent={<img src={skyTwo} alt="Violet twilight clouds and moon" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
    pattern="pointer" pixelSize={48} pixelRadius={0} duration={400} pixelDuration={350} randomness={0.2} bounce={0.3}
    trigger="hover" style={{width:"100%",height:"100%",borderRadius:0}} gap={0} pixelScale={0} pixelSpin={0} intro/>;
}