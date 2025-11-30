import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <h1>Privacy Policy</h1>
            <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, post content, or contact us.</p>
              <ul>
                <li><strong>Account Information:</strong> Username, email address, password</li>
                <li><strong>Profile Information:</strong> Bio, profile picture, social links</li>
                <li><strong>Content:</strong> Articles, comments, and other content you post</li>
                <li><strong>Usage Data:</strong> How you interact with our service</li>
              </ul>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section>
              <h2>3. Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
              <ul>
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist our operations</li>
              </ul>
            </section>

            <section>
              <h2>4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
              <h2>5. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Remember your preferences and settings</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section>
              <h2>6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section>
              <h2>7. Data Retention</h2>
              <p>We retain your information for as long as your account is active or as needed to provide services. We may retain certain information after account deletion for legal or business purposes.</p>
            </section>

            <section>
              <h2>8. Children's Privacy</h2>
              <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
            </section>

            <section>
              <h2>9. Changes to This Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
            </section>

            <section>
              <h2>10. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at privacy@conduit.com</p>
            </section>

            <div className="back-link">
              <Link to="/register">← Back to Registration</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .legal-page {
          background: var(--bg-body);
          min-height: 100vh;
          padding: 2rem 0;
        }

        .legal-page h1 {
          color: var(--text-main);
          margin-bottom: 0.5rem;
          font-size: 2.5rem;
        }

        .last-updated {
          color: var(--text-secondary);
          font-style: italic;
          margin-bottom: 2rem;
        }

        .legal-page section {
          margin-bottom: 2rem;
        }

        .legal-page h2 {
          color: var(--text-main);
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .legal-page p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .legal-page ul {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-left: 1.5rem;
        }

        .legal-page li {
          margin-bottom: 0.5rem;
        }

        .legal-page strong {
          color: var(--text-main);
        }

        .legal-page a {
          color: var(--primary);
          text-decoration: none;
        }

        .legal-page a:hover {
          text-decoration: underline;
        }

        .back-link {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        @media (max-width: 768px) {
          .legal-page {
            padding: 1rem;
          }

          .legal-page h1 {
            font-size: 2rem;
          }

          .col-md-8 {
            width: 100% !important;
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;