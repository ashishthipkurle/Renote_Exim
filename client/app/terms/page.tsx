import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-blue max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Renote Exim, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Marketplace Usage</h2>
            <p>
              Renote Exim provides a platform for exporters and importers to interact. We are not a party to the actual transactions between users unless explicitly stated. Users are responsible for verifying the quality and shipment of goods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
            <p>
              You agree not to use the platform for any illegal purpose. You are solely responsible for all content you upload or transmit through the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Payments</h2>
            <p>
              Payments on our platform are processed by Stripe. You agree to provide accurate and complete information for all purchases. Fees are non-refundable unless otherwise specified.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Renote Exim shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues.
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
