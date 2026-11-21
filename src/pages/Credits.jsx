import { useNavigate } from "react-router-dom";
import reactBitsLicense from "../../THIRD_PARTY_LICENSES/react-bits-LICENSE.md?raw";
import fluidLicense from "../../THIRD_PARTY_LICENSES/webgl-fluid-simulation-LICENSE.txt?raw";
import aureliaLicense from "../../THIRD_PARTY_LICENSES/aurelia-LICENSE.txt?raw";
import elevenLabsLicense from "../../THIRD_PARTY_LICENSES/elevenlabs-ui-LICENSE.md?raw";
import animatedBlobLicense from "../../THIRD_PARTY_LICENSES/animated-blob-LICENSE.txt?raw";
import threeLicense from "../../THIRD_PARTY_LICENSES/three.js-LICENSE.txt?raw";

// Credits and open-source notices for work Always Pause builds on.
// The full licence texts live in THIRD_PARTY_LICENSES/ and are shown on this page,
// which is how their "include this notice" condition is met inside the app.
// When a sensory visual or asset is added from somewhere else, add it here too.

const CODE = [
  {
    name: "React Bits",
    text: reactBitsLicense,
    author: "David Haz",
    license: "MIT + Commons Clause",
    use: "Several sensory visuals are adapted from React Bits components.",
    url: "https://github.com/DavidHDev/react-bits",
  },
  {
    name: "WebGL Fluid Simulation",
    text: fluidLicense,
    author: "Pavel Dobryakov",
    license: "MIT",
    use: "The fluid simulation behind the chromatic fluid experiment.",
    url: "https://github.com/PavelDoGreat/WebGL-Fluid-Simulation",
  },
  {
    name: "Aurelia",
    text: aureliaLicense,
    author: "Holtsetio",
    license: "MIT",
    use: "The interactive jellyfish shown in Underwater.",
    url: "https://github.com/holtsetio/aurelia",
  },
  {
    name: "ElevenLabs UI — Orb",
    text: elevenLabsLicense,
    author: "ElevenLabs",
    license: "MIT",
    use: "The shader the liquid breathing orbs are adapted from.",
    url: "https://github.com/elevenlabs/ui",
  },
  {
    name: "animated-blob",
    text: animatedBlobLicense,
    author: "knowercoder",
    license: "MIT",
    use: "Deformation and shading in the opal breathing visual.",
    url: "https://github.com/knowercoder/animated-blob",
  },
  {
    name: "three.js",
    text: threeLicense,
    author: "three.js authors",
    license: "MIT",
    use: "3D rendering, including an adapted stereo-effects example.",
    url: "https://github.com/mrdoob/three.js",
  },
];

const PHOTOGRAPHERS = [
  "Laura Adai", "Aysegul Aytoren", "Mariano Baraldi", "Martin Bennie",
  "Grace Anne Bobadilla", "Wolfgang Hasselmann", "Wavie Hu", "Leo Visions",
  "Agnese Rudzite", "Daniel Sessler", "Jack Stapleton", "Tom Swinnen",
  "Uran Wang", "Vincent Yap",
];

export default function Credits() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background p-8 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 2rem)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}>
      <button
        onClick={() => navigate("/")}
        className="text-sm text-foreground/60 hover:text-foreground mb-8 self-start"
      >
        ← Back
      </button>

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 font-sans">Credits</h1>

        <div className="space-y-8 text-sm text-foreground/85 leading-relaxed font-sans">
          <p>
            Always Pause is made by Work OnDeck LLC. It builds on generous open-source
            work and photography from the people below. Thank you.
          </p>

          <section>
            <h2 className="text-lg font-bold mb-3">Open-source code</h2>
            <ul className="space-y-4">
              {CODE.map((item) => (
                <li key={item.name}>
                  <p className="font-semibold text-foreground">
                    {item.name} <span className="font-normal text-foreground/60">by {item.author} · {item.license}</span>
                  </p>
                  <p>{item.use}</p>
                  <p className="text-foreground/60 break-all">{item.url}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-foreground/70">Licence text</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-foreground/70 font-mono">{item.text}</pre>
                  </details>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              The app is also built with React, Framer Motion, React Three Fiber, Radix UI,
              Tailwind CSS and other open-source libraries, used under their MIT, ISC and
              Apache 2.0 licences.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Photography</h2>
            <p>
              Background and scene photographs by {PHOTOGRAPHERS.join(", ")} and other
              photographers on Unsplash, used under the Unsplash License.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Type</h2>
            <p>Newsreader and Nunito Sans, from Google Fonts, under the SIL Open Font License.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Licence texts</h2>
            <p>
              Each licence above permits this use on the condition that its copyright and
              permission notice is kept with the app. Open “Licence text” under any entry
              to read it in full.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
