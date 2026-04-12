import { useNavigate } from "react-router-dom";

export default function Privacy() {
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
        <h1 className="text-3xl font-light mb-8 font-nunito">Privacy Policy</h1>

        <div className="space-y-6 text-sm text-foreground/80 leading-relaxed font-nunito">
          <p className="text-xs text-foreground/60 mb-6">
            Last Updated: March 2026
          </p>

          <section>
            <h2 className="text-lg font-semibold mb-3">Overview</h2>
            <p>
              Work OnDeck LLC ("we," "us," or "our") operates the Pause mobile application. This Privacy Policy explains how we handle information when you use our app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Information We Collect</h2>
            <p>
              Pause is designed to be a minimal, privacy-respecting app. We collect only the following:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li><strong>Usage Analytics:</strong> We collect anonymous, aggregated data about how the app is used — such as which breathing techniques are selected and how often the app is opened. This data cannot be used to identify you personally.</li>
            </ul>
            <p className="mt-4">
              We do <strong>NOT</strong> collect your name, email address, location, health data, or any personally identifiable information.
            </p>
            <p>
              We do <strong>NOT</strong> sell your data to third parties.
            </p>
            <p>
              We do <strong>NOT</strong> use your data for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">How We Use Your Information</h2>
            <p>
              Anonymous usage data is used solely to improve the app experience — understanding which features are used most helps us make Pause better.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Health &amp; Fitness Data</h2>
            <p>
              Always Pause uses Apple HealthKit to log your breathing sessions as Mindful Minutes and to read your heart rate during sessions. This data is stored exclusively in your personal Apple Health app on your device. We never collect, transmit, or share your health data with any third party. You can revoke access at any time in iPhone Settings → Privacy &amp; Security → Health → Always Pause.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Third Party Services</h2>
            <p>
              Pause may use Apple's built-in App Analytics which collects anonymous usage data subject to Apple's own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Children's Privacy</h2>
            <p>
              Pause is not directed at children under 13. We do not knowingly collect data from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
            <p>
              Questions? Email us at: <a href="mailto:hello@alwayspause.com" className="underline hover:opacity-70">hello@alwayspause.com</a>
            </p>
          </section>

          <p className="text-xs text-foreground/60 mt-8 pt-4 border-t border-foreground/10">
            © 2026 Work OnDeck LLC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}