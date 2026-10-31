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
        <h1 className="text-3xl font-bold mb-8 font-sans">Privacy Policy</h1>

        <div className="space-y-6 text-sm text-foreground/85 leading-relaxed font-sans">
          <p className="text-xs text-foreground/60 mb-6">
            Last Updated: October 2026
          </p>

          <section>
            <h2 className="text-lg font-bold mb-3">Overview</h2>
            <p>
              Work OnDeck LLC ("we," "us," or "our") operates the Always Pause mobile application. This Privacy Policy explains how we handle information when you use our app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Information We Collect</h2>
            <p>
              Always Pause is designed to be a minimal, privacy-respecting app. We collect only the following:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li><strong>Optional Usage Analytics (off by default):</strong> If you switch on "Share anonymous usage" in About &amp; Legal, we send a small number of anonymous events to PostHog about the choices you save and the sessions you run: which breathing visual you use, which background category and preset background you save, whether you use your own colour or your own photo (a yes or no answer only), which technique you start, and whether a session was completed along with its rounded length. These events are not linked to you, are not used to build a profile, and are never used for advertising.</li>
              <li><strong>Never collected:</strong> your photographs or their web addresses, the exact colours you choose, your name, email, account, location, heart rate, Health data, or the content of your sessions.</li>
            </ul>
            <p className="mt-4">
              Usage analytics stays switched off — and nothing at all is loaded or sent — until you turn it on yourself.
            </p>
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
            <h2 className="text-lg font-bold mb-3">How We Use Your Information</h2>
            <p>
              Anonymous usage data is used solely to improve the app experience — understanding which features are used most helps us make Always Pause better.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Health &amp; Fitness Data</h2>
            <p>
              Always Pause uses Apple HealthKit to log your breathing sessions as Mindful Minutes and to read your heart rate during sessions. This data is stored exclusively in your personal Apple Health app on your device. We never collect, transmit, or share your health data with any third party. You can revoke access at any time in iPhone Settings → Privacy &amp; Security → Health → Always Pause.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Third Party Services</h2>
            <p>
              When optional usage analytics is switched on, Always Pause sends the events described above to PostHog (PostHog, Inc., United States), which stores them for us as our data processor. PostHog receives the network address each request comes from, which it may use to derive a rough country; we do not use it to identify you. PostHog is configured without session recording, screen recording, heatmaps, automatic interaction capture, surveys, advertising features or user profiles, and it is never given anything that could identify you.
            </p>
            <p className="mt-4">
              Always Pause may also use Apple's built-in App Analytics which collects anonymous usage data subject to Apple's own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Your Choices</h2>
            <p>
              Usage analytics is optional and off unless you turn it on. You can switch "Share anonymous usage" on or off at any time in About &amp; Legal inside the app. Turning it off stops all analytics immediately and deletes the identifiers the analytics service created on your device. Because the events never identify you, we cannot look up or retrieve "your" analytics data on request, but switching the setting off means nothing further is collected.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Children's Privacy</h2>
            <p>
              Always Pause is not directed at children under 13. We do not knowingly collect data from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Contact Us</h2>
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