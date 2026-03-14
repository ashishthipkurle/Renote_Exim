import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-blue max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Renote Exim ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at support@renoteexim.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when registering at the platform, expressing an interest in obtaining information about us or our products and services, when participating in activities on the platform or otherwise contacting us.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Personal identifiers (name, email address, company name)</li>
              <li>Authentication data (passwords, 2FA settings)</li>
              <li>Transaction data (billing address, order history)</li>
              <li>Device data (IP address, browser type)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p>
              We use personal information collected via our platform for a variety of business purposes described below:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>To facilitate account creation and logon process.</li>
              <li>To send administrative information to you.</li>
              <li>To fulfill and manage your orders.</li>
              <li>To protect our platform and prevent fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Sharing Your Information</h2>
            <p>
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. This includes third-party processors like Stripe (payments) and Supabase (authentication/database).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Deletion</h2>
            <p>
              You have the right to request the deletion of your account and associated personal data at any time through your dashboard settings. We will process these requests in accordance with applicable laws (GDPR/CCPA).
            </p>
          </section>

          <p className="text-slate-500 text-sm italic mt-12 pb-10 border-t border-slate-900 pt-8">
            Last modified: March 13, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
