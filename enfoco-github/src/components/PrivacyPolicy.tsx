import React from 'react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Development Notice */}
          <div className="mb-6 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-yellow-400 font-medium">Development Notice</p>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              This privacy policy is currently under development. Some features mentioned may not be fully implemented yet. 
              We're working to ensure full compliance and will update this document as we complete our features.
            </p>
          </div>

          {/* Content */}
          <div className="text-gray-300 space-y-6">
            <div>
              <p className="text-sm text-gray-400 mb-4">
                Last updated: January 2025
              </p>
              <p>
                At ENFOCO, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our global content discovery platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-cyan-400 mb-2">Account Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Email address and username</li>
                    <li>Country preference for content filtering</li>
                    <li>Account creation date and last login</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-cyan-400 mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Content you save and interact with</li>
                    <li>Search queries and translation requests</li>
                    <li>Country and language preferences</li>
                    <li>App usage patterns and features accessed</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-cyan-400 mb-2">Technical Data</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Device information and browser type</li>
                    <li>IP address and general location</li>
                    <li>App performance and error logs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Provide personalized content recommendations based on your country and interests</li>
                <li>Enable AI-powered translation services for global content discovery</li>
                <li>Save your content preferences and reading history</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure platform security and prevent abuse</li>
                <li>Communicate important updates and service changes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">3. Data Storage and Security</h2>
              <div className="space-y-3">
                <p>We use industry-standard security measures to protect your data:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All data is encrypted in transit and at rest</li>
                  <li>Secure authentication through Supabase</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal data by authorized personnel only</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
              <div className="space-y-3">
                <p>We use trusted third-party services to provide our features:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Supabase:</strong> Database and authentication services</li>
                  <li><strong>OpenAI:</strong> AI-powered translation services</li>
                  <li><strong>Content Sources:</strong> News and article providers from various countries</li>
                </ul>
                <p className="text-sm">These services have their own privacy policies and security measures in place.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights and Choices</h2>
              <div className="space-y-3">
                <p>You have the following rights regarding your personal data:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Access and download your personal data</li>
                  <li>Update or correct your account information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of non-essential communications</li>
                  <li>Request data portability</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
              <p className="text-sm">
                We retain your personal data only as long as necessary to provide our services and comply with legal obligations. 
                Account data is deleted when you delete your account, though some anonymized usage data may be retained for 
                service improvement purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">7. International Data Transfers</h2>
              <p className="text-sm">
                As a global platform, your data may be processed in different countries. We ensure appropriate safeguards 
                are in place to protect your data during international transfers, including standard contractual clauses 
                and adequacy decisions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">8. Children's Privacy</h2>
              <p className="text-sm">
                Our service is not intended for children under 13. We do not knowingly collect personal information 
                from children under 13. If we become aware that we have collected such information, we will take 
                steps to delete it promptly.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
              <p className="text-sm">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                through the app or via email. Your continued use of our service after changes become effective 
                constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">10. Contact Us</h2>
              <p className="text-sm">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                <p className="text-cyan-400 font-medium">Email:</p>
                <p className="text-sm">enfoco06@gmail.com</p>
                <p className="text-cyan-400 font-medium mt-2">Support:</p>
                <p className="text-sm">enfoco06@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                © 2025 ENFOCO. All rights reserved.
              </p>
              <button
                onClick={onClose}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
