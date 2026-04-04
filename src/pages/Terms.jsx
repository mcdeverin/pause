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
        <h1 className="text-3xl font-light mb-8 font-nunito">Terms of Use</h1>

        <div className="space-y-6 text-sm text-foreground/80 leading-relaxed font-nunito">
          <p className="text-xs text-foreground/60 mb-6">
            Last Updated: March 2026
          </p>

          <section>
            <h2 className="text-lg font-semibold mb-3">Acceptance of Terms</h2>
            <p>
              By downloading or using Pause, you agree to be bound by these Terms. If you do not agree, do not use the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Use of the App</h2>
            <p>
              Pause is a wellness tool designed to guide breathing exercises for stress relief and relaxation. It is intended for general wellness purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Medical Disclaimer</h2>
            <p>
              Pause is <strong>NOT</strong> a medical device and is <strong>NOT</strong> intended to diagnose, treat, cure, or prevent any medical condition. The breathing techniques provided are for general wellness purposes only. If you have any medical conditions — particularly respiratory or cardiovascular conditions — consult a qualified healthcare provider before using this app. Do not use Pause as a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Intellectual Property</h2>
            <p>
              All content in Pause, including design, text, animations, and the Pause name and brand, are the property of Work OnDeck LLC and are protected by applicable intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">In-App Purchases</h2>
            <p>
              Pause may offer optional in-app purchases. All purchases are final and subject to Apple's App Store terms. We do not offer refunds outside of Apple's standard refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Limitation of Liability</h2>
            <p>
              Work OnDeck LLC shall not be liable for any indirect, incidental, or consequential damages arising from your use of Pause. The app is provided "as is" without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the app after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of New Jersey, United States.
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