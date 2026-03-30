import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background p-8 flex flex-col">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-foreground/60 hover:text-foreground mb-8"
      >
        ← Back
      </button>

      <div className="max-w-2xl">
        <h1 className="text-3xl font-light mb-8 font-cormorant">Terms of Service</h1>

        <div className="space-y-6 text-sm text-foreground/80 leading-relaxed font-serif">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By using the Always Pause application, you agree to these terms and conditions. If you do not agree with any part of these terms, you may not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Always Pause for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on Always Pause</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Disclaimer</h2>
            <p>
              The materials on Always Pause are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Limitations</h2>
            <p>
              In no event shall Always Pause or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Always Pause.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Always Pause could include technical, typographical, or photographic errors. Always Pause does not warrant that any of the materials on its site are accurate, complete, or current. Always Pause may make changes to the materials contained on its site at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Links</h2>
            <p>
              Always Pause has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Always Pause of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Modifications</h2>
            <p>
              Always Pause may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Always Pause operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}