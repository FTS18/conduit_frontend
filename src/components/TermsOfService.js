import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <h1>Terms of Service</h1>
            <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using Conduit, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h2>2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of Conduit for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul>
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2>3. User Accounts</h2>
              <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
            </section>

            <section>
              <h2>4. Content Guidelines</h2>
              <p>Users are prohibited from posting content that:</p>
              <ul>
                <li>Is unlawful, harmful, threatening, abusive, or defamatory</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains spam, advertising, or promotional material</li>
                <li>Impersonates any person or entity</li>
              </ul>
            </section>

            <section>
              <h2>5. Privacy</h2>
              <p>Your privacy is important to us. Please review our <Link to="/privacy">Privacy Policy</Link>, which also governs your use of the Service.</p>
            </section>

            <section>
              <h2>6. Termination</h2>
              <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.</p>
            </section>

            <section>
              <h2>7. Disclaimer</h2>
              <p>The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.</p>
            </section>

            <section>
              <h2>8. Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us at legal@conduit.com</p>
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

export default TermsOfService;