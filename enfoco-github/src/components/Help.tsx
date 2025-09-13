import React, { useState } from 'react';

interface HelpProps {
  onClose: () => void;
}

export const Help: React.FC<HelpProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('features');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqData = [
    {
      question: "How do I get started with ENFOCO?",
      answer: "Simply create an account, select your country preference, and start exploring content! Use the search bar to find articles, or browse through the different streams (Explore, Verified, Global Stream)."
    },
    {
      question: "What is the AI Translator and how does it work?",
      answer: "The AI Translator is a powerful feature that lets you search in your local language and discover content from any country. It translates your search queries and helps you find local information from around the world."
    },
    {
      question: "How do I save articles for later reading?",
      answer: "Click the bookmark icon on any article card to save it. You can access all your saved articles in the 'Saved' section of the sidebar. Click the bookmark again to unsave an article."
    },
    {
      question: "What's the difference between Explore, Verified, and Global Stream?",
      answer: "Explore shows content in a Netflix-style horizontal scrolling format. Verified displays only verified articles in a grid. Global Stream shows all articles from the database in a grid format."
    },
    {
      question: "How do I change my country preference?",
      answer: "Your country preference is set during signup and stored in your profile. The dashboard country dropdown is for temporary filtering and doesn't change your profile setting."
    },
    {
      question: "Why can't I see content in some categories?",
      answer: "Currently, only Articles are available. Videos, Books, and Audio sections show 'Coming Soon' as we're focusing on articles first. More content types will be added in future updates."
    },
    {
      question: "How do I use the search function?",
      answer: "Type your search query in the search bar. The search works in Verified and Global Stream tabs, filtering content by your query and selected country. Explore tab doesn't have search - it's for discovery through scrolling."
    },
    {
      question: "What languages are supported for translation?",
      answer: "Our AI translator supports 100+ languages worldwide. You can search in your native language and get translations to any other language for global content discovery."
    },
    {
      question: "How do I report a bug or technical issue?",
      answer: "Use the Contact page to report bugs, or email us directly at enfoco06@gmail.com. Please include details about the issue, your device, and browser information."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes! We use industry-standard security measures, encrypt all data, and follow strict privacy practices. Read our Privacy Policy for detailed information about data protection."
    }
  ];

  const sections = [
    { id: 'features', title: 'Features Guide', icon: '⭐' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' },
    { id: 'support', title: 'Support', icon: '💬' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-white">Help Center</h1>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" style={{ maxHeight: 'calc(90vh - 2rem)' }}>
            <div className="p-6">
              {/* Development Notice */}
              <div className="mb-6 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-yellow-400 font-medium">Development Notice</p>
                </div>
                <p className="text-yellow-300 text-sm mt-1">
                  Help documentation is currently being developed. Some features mentioned may not be fully implemented yet. 
                  We're working to provide comprehensive guides and will update this section as we complete our features.
                </p>
              </div>

              {activeSection === 'features' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">⭐ Features Guide</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-3">🌍 Global Search Bridge</h3>
                      <p className="text-gray-300 text-sm mb-3">
                        Our most powerful feature that breaks down language barriers:
                      </p>
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-white font-medium mb-2">How it works:</p>
                        <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1">
                          <li>Search in YOUR local language</li>
                          <li>Get translation in any country's language</li>
                          <li>Discover local information from that country</li>
                        </ol>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-3">📱 Content Streams</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-700 p-3 rounded">
                          <h4 className="text-white font-medium mb-1">Explore Stream</h4>
                          <p className="text-gray-300 text-sm">Horizontal scrolling categories, auto-scrolling category bar, no search functionality</p>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                          <h4 className="text-white font-medium mb-1">Verified Stream</h4>
                          <p className="text-gray-300 text-sm">Grid layout, only verified articles, search functionality, country filtering</p>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                          <h4 className="text-white font-medium mb-1">Global Stream</h4>
                          <p className="text-gray-300 text-sm">Grid layout, all articles, search functionality, country filtering</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-3">🔍 Search & Filter</h3>
                      <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                        <li>Search by keywords in article titles and content</li>
                        <li>Filter by country using the dropdown</li>
                        <li>Search works in Verified and Global Stream tabs</li>
                        <li>Country filter affects all content streams</li>
                      </ul>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-3">💾 Save & Organize</h3>
                      <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                        <li>Click bookmark icon to save articles</li>
                        <li>Access saved articles in sidebar</li>
                        <li>Click bookmark again to unsave</li>
                        <li>Saved content syncs across devices</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'support' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">💬 Support & Contact</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-3">Get Help</h3>
                      <p className="text-gray-300 text-sm mb-4">
                        Need assistance? We're here to help! Choose the best way to reach us based on your needs.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700 p-4 rounded">
                          <h4 className="text-white font-medium mb-2">📧 Email Support</h4>
                          <p className="text-cyan-400 text-sm mb-1">enfoco06@gmail.com</p>
                          <p className="text-gray-400 text-xs">General questions and assistance</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded">
                          <h4 className="text-white font-medium mb-2">🔧 Technical Issues</h4>
                          <p className="text-cyan-400 text-sm mb-1">enfoco06@gmail.com</p>
                          <p className="text-gray-400 text-xs">Bugs and technical problems</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded">
                          <h4 className="text-white font-medium mb-2">💼 Business Inquiries</h4>
                          <p className="text-cyan-400 text-sm mb-1">enfoco06@gmail.com</p>
                          <p className="text-gray-400 text-xs">Partnerships and collaborations</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded">
                          <h4 className="text-white font-medium mb-2">⚖️ Legal & Privacy</h4>
                          <p className="text-cyan-400 text-sm mb-1">enfoco06@gmail.com</p>
                          <p className="text-gray-400 text-xs">Privacy and legal matters</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-3">Response Times</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">General Support</span>
                          <span className="text-cyan-400 text-sm">24-48 hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">Technical Issues</span>
                          <span className="text-cyan-400 text-sm">12-24 hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">Business Inquiries</span>
                          <span className="text-cyan-400 text-sm">2-3 business days</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-3">Before Contacting Us</h3>
                      <p className="text-gray-300 text-sm mb-3">
                        To help us assist you better, please include:
                      </p>
                      <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                        <li>Your account email or username</li>
                        <li>Description of the issue or question</li>
                        <li>Steps you've already tried</li>
                        <li>Device and browser information</li>
                        <li>Screenshots if applicable</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'troubleshooting' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">🔧 Troubleshooting</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-3">Common Issues</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-medium mb-2">Content not loading</h4>
                          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                            <li>Check your internet connection</li>
                            <li>Try refreshing the page</li>
                            <li>Clear your browser cache</li>
                            <li>Try a different browser</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-2">Translation not working</h4>
                          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                            <li>Ensure you have a stable internet connection</li>
                            <li>Check if the language is supported</li>
                            <li>Try with a shorter text</li>
                            <li>Contact support if the issue persists</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-2">Search not returning results</h4>
                          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                            <li>Try different keywords</li>
                            <li>Check if you're in the right stream (Verified/Global)</li>
                            <li>Verify your country selection</li>
                            <li>Try broader search terms</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-2">Account issues</h4>
                          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                            <li>Check your email for verification</li>
                            <li>Try resetting your password</li>
                            <li>Clear browser cookies and try again</li>
                            <li>Contact support for account recovery</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-3">Still Need Help?</h3>
                      <p className="text-gray-300 text-sm mb-3">
                        If you're still experiencing issues, please contact our support team:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-700 p-3 rounded">
                          <h4 className="text-white font-medium mb-1">📧 Email Support</h4>
                          <p className="text-cyan-400 text-sm">enfoco06@gmail.com</p>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                          <h4 className="text-white font-medium mb-1">🔧 Technical Issues</h4>
                          <p className="text-cyan-400 text-sm">enfoco06@gmail.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
