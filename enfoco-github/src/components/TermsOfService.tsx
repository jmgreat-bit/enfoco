import React from 'react';

interface TermsOfServiceProps {
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
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
              These terms of service are currently under development. Some features and policies mentioned may not be fully implemented yet. 
              We're working to ensure complete coverage and will update this document as we finalize our features.
            </p>
          </div>

          {/* Content */}
          <div className="text-gray-300 space-y-6">
            <div>
              <p className="text-sm text-gray-400 mb-4">
                Last updated: January 2025
              </p>
              <p>
                Welcome to ENFOCO! These Terms of Service ("Terms") govern your use of our global content discovery platform. 
                By accessing or using our service, you agree to be bound by these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm">
                By creating an account or using ENFOCO, you acknowledge that you have read, understood, and agree to be bound 
                by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
              <div className="space-y-3">
                <p>ENFOCO is a global content discovery platform that provides:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Curated news and articles from multiple countries</li>
                  <li>AI-powered translation services for global content access</li>
                  <li>Personalized content recommendations based on your preferences</li>
                  <li>Content saving and organization features</li>
                  <li>Multi-language search capabilities</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-cyan-400 mb-2">Account Creation</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must be at least 13 years old to create an account</li>
                  <li>One account per person - multiple accounts are not permitted</li>
                </ul>
                <h3 className="text-lg font-medium text-cyan-400 mb-2">Account Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>Maintain accurate and up-to-date account information</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-cyan-400 mb-2">Permitted Uses</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Access and read content for personal, non-commercial purposes</li>
                  <li>Save and organize content for your personal use</li>
                  <li>Use translation services for legitimate content discovery</li>
                  <li>Share content through our platform's sharing features</li>
                </ul>
                <h3 className="text-lg font-medium text-cyan-400 mb-2">Prohibited Uses</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Use automated systems to access the service without permission</li>
                  <li>Reproduce, distribute, or create derivative works without permission</li>
                  <li>Use the service to transmit spam, malware, or harmful content</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">5. Content and Intellectual Property</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-cyan-400 mb-2">Our Content</h3>
                <p className="text-sm">
                  The ENFOCO platform, including its design, features, and functionality, is owned by us and protected 
                  by intellectual property laws. You may not copy, modify, or distribute our platform without permission.
                </p>
                <h3 className="text-lg font-medium text-cyan-400 mb-2">Third-Party Content</h3>
                <p className="text-sm">
                  Content from news sources and other providers remains the property of their respective owners. 
                  We provide access to this content under appropriate licensing agreements and fair use principles.
                </p>
                <h3 className="text-lg font-medium text-cyan-400 mb-2">User-Generated Content</h3>
                <p className="text-sm">
                  Any content you save, organize, or share through our platform remains yours. By using our service, 
                  you grant us a limited license to display and process this content to provide our services.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">6. AI Translation Services</h2>
              <div className="space-y-3">
                <p className="text-sm">
                  Our AI-powered translation services are provided through third-party providers. While we strive for 
                  accuracy, translations may not be perfect and should not be relied upon for critical decisions.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Translations are provided "as is" without warranty of accuracy</li>
                  <li>We are not responsible for translation errors or misunderstandings</li>
                  <li>Users should verify important translations independently</li>
                  <li>Translation usage may be subject to rate limits</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">7. Privacy and Data Protection</h2>
              <p className="text-sm">
                Your privacy is important to us. Our collection and use of your personal information is governed by 
                our Privacy Policy, which is incorporated into these Terms by reference. By using our service, you 
                consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">8. Service Availability</h2>
              <div className="space-y-3">
                <p className="text-sm">
                  We strive to provide reliable service, but we cannot guarantee uninterrupted access. The service 
                  may be temporarily unavailable due to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Scheduled maintenance and updates</li>
                  <li>Technical difficulties or system failures</li>
                  <li>Third-party service disruptions</li>
                  <li>Force majeure events beyond our control</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
              <p className="text-sm">
                To the maximum extent permitted by law, ENFOCO shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                or use, arising from your use of the service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">10. Termination</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-cyan-400 mb-2">By You</h3>
                <p className="text-sm">
                  You may terminate your account at any time by contacting us or using the account deletion feature 
                  in your profile settings.
                </p>
                <h3 className="text-lg font-medium text-cyan-400 mb-2">By Us</h3>
                <p className="text-sm">
                  We may suspend or terminate your account if you violate these Terms, engage in prohibited activities, 
                  or for other reasons at our discretion with appropriate notice.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">11. Changes to Terms</h2>
              <p className="text-sm">
                We may modify these Terms from time to time. We will notify you of material changes through the app 
                or via email. Your continued use of the service after changes become effective constitutes acceptance 
                of the updated Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">12. Governing Law</h2>
              <p className="text-sm">
                These Terms are governed by and construed in accordance with applicable laws. Any disputes arising 
                from these Terms or your use of the service will be resolved through appropriate legal channels.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">13. Contact Information</h2>
              <p className="text-sm">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                <p className="text-cyan-400 font-medium">Legal:</p>
                <p className="text-sm">enfoco06@gmail.com</p>
                <p className="text-cyan-400 font-medium mt-2">General Support:</p>
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
