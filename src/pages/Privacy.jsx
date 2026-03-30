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
        <h1 className="text-3xl font-light mb-8 font-cormorant">Privacy Policy</h1>

        <div className="space-y-6 text-sm text-foreground/80 leading-relaxed font-serif">
          <section>
            <h2 className="text-lg font-semibold mb-3">Introduction</h2>
            <p>
              Always Pause is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
            <p>
              We collect information that you voluntarily provide to us when using Always Pause. This may include your name, email address, and any other information you choose to provide. We also collect information about your use of the application, including breathing sessions and preferences.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide and improve the Always Pause service</li>
              <li>Personalize your experience</li>
              <li>Communicate with you about updates and features</li>
              <li>Analyze usage patterns to enhance functionality</li>
              <li>Ensure the security and integrity of the application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption and security practices. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Third-Party Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share information only when required by law or with your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Cookies and Local Storage</h2>
            <p>
              Always Pause uses local storage to remember your preferences, such as your chosen theme. This information is stored locally on your device and is not transmitted to our servers without your consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. You can do this by contacting us or through the application settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by updating the date at the top of this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us through the support section of the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}