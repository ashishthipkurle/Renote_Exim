import React from 'react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">Cookie Policy</h1>
        <div className="prose prose-invert prose-blue max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. What are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your browser or device when you visit a website. They allow the website to recognize you and remember your preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Them</h2>
            <p>
              Renote Exim uses cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Essential:</strong> Necessary for you to log in and use secure areas of our platform.</li>
              <li><strong>Analytics:</strong> To understand how visitors use our site and improve performance (Vercel Analytics).</li>
              <li><strong>Preferences:</strong> To remember your theme settings and language choices.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Managing Preferences</h2>
            <p>
              You can choose to accept or decline non-essential cookies through our consent banner. Additionally, most web browsers allow you to control cookies through their settings.
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
