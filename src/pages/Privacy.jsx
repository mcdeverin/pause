import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background p-8 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 2rem)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}>
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
            Last Updated: November 2026
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
              Always Pause is designed to be a minimal, privacy-respecting app. Your breathing history, preferences and photos stay on your device. The only information that leaves it is optional analytics, described below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Analytics (app and website)</h2>
            <p>
              We use analytics to understand how people find and use Always Pause, so we can improve it. The same rules apply in the iPhone app and on alwayspause.com.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li><strong>Anonymous usage counts and session recordings (PostHog):</strong> which screens you open (the page address only, without any extra details it may carry) and the website you arrived from, which breathing visual you use, which background category and preset background you save, whether you use your own colour or photo (a yes or no only), which technique you start, whether a session was completed and its rounded length, when the Always Pause+ offer is viewed or a purchase is started, and whether each sensory scene loaded. PostHog keeps one random ID on your device (in local storage, not a cookie) so a return visit counts as the same visitor. If you agreed to analytics yourself (see below), PostHog may also make a session recording: a reconstruction of the screens you see and where you tap and scroll, which we use to find confusing or broken parts of the app.</li>
              <li><strong>Google Analytics:</strong> on the website through Google Tag Manager, and in the app through Google Analytics for Firebase. It records pages or screens viewed, app opens and sessions, the same events listed above, device and operating system or browser, approximate location (country or city, derived from a masked network address — never GPS), how you arrived, and App Store purchase events (product and price, never payment details). It uses a random app-instance identifier in the app and cookies on the website to recognise repeat visits.</li>
              <li><strong>Never collected:</strong> your name, email, account, precise location, photographs or their web addresses, the exact colours you choose, Health data or heart rate. Session recordings blank out your own photos and anything you type. Analytics is never linked to your identity, never uses your device’s advertising identifier, and Google’s advertising features and ad personalisation are switched off.</li>
            </ul>
            <p className="mt-4"><strong>When analytics is on</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li><strong>In Europe</strong> (the EU, EEA, UK and Switzerland, judged from your device’s time zone): we ask first, in the app and on the website. Nothing is collected, and nothing is recorded, unless you tap “Allow”.</li>
              <li><strong>Elsewhere, in the app:</strong> the first screen explains that by continuing you agree to our Terms and this Privacy Policy, including analytics and session recordings. Analytics starts when you tap “Begin your journey”. If you installed the app before this notice was added, analytics stays off unless you turn it on.</li>
              <li><strong>Elsewhere, on the website:</strong> analytics is on by default. If your browser sends a Global Privacy Control or Do Not Track signal, it stays off unless you turn it on yourself. Session recordings start only once you tap “Begin your journey” on the first screen, which carries the same notice as the app, or switch “Share anonymous usage” on yourself.</li>
              <li><strong>Everywhere:</strong> you can switch “Share anonymous usage” off or on at any time in About &amp; Legal. Turning it off stops all analytics straight away.</li>
            </ul>
            <p className="mt-4">
              We do <strong>NOT</strong> sell your data, share it for advertising, or use it to build a profile of you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">How We Use Your Information</h2>
            <p>
              Analytics is used solely to understand which features help people and where the app can improve. Purchase events help us understand which plans people choose.
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
              While analytics is on, Google LLC (United States) processes the information described above for us through Google Analytics, Google Tag Manager and Google Analytics for Firebase, under Google’s privacy policy (policies.google.com/privacy). PostHog, Inc. (United States) stores the anonymous usage counts for us as our data processor. PostHog makes session recordings only as described above, and is configured without heatmaps, automatic interaction capture, surveys, advertising features or user profiles. Both receive the network address each request comes from, which is used only to derive a rough location.
            </p>
            <p className="mt-4">
              Purchases are handled by Apple through the App Store on iPhone, or by Google through Google Play on Android, and managed with RevenueCat, which receives an anonymous app user identifier and your purchase receipts so your subscription works. Apple’s built-in App Analytics may also collect anonymous usage data under Apple’s own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Your Choices</h2>
            <p>
              Analytics is optional. Switch “Share anonymous usage” off in About &amp; Legal at any time, in the app or on the website. Turning it off stops all further analytics immediately, deletes the identifiers PostHog created on your device and, on the website, deletes Google Analytics cookies. Because analytics never identifies you, we cannot look up or retrieve “your” analytics data on request, but switching the setting off means nothing further is collected. Using Always Pause, including Always Pause+, never depends on turning analytics on.
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