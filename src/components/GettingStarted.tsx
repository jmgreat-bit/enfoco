import React from 'react';

interface GettingStartedProps {
  onShowSignup?: () => void;
}

export const GettingStarted: React.FC<GettingStartedProps> = ({ onShowSignup }) => {
  return (
    <section className="py-16 bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            How to Get Started
          </h2>
          <p className="text-gray-400 text-lg">
            Follow these simple steps to begin your global content discovery journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Create Your Account</h3>
            <p className="text-gray-400 text-sm">
              Sign up with your email, choose a username, and select your country. 
              This helps us personalize your content experience and provide relevant articles.
            </p>
            <div className="mt-4 text-xs text-gray-500">
              <p>• Use a valid email address</p>
              <p>• Choose a unique username</p>
              <p>• Select your country</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Explore Content Streams</h3>
            <p className="text-gray-400 text-sm">
              Navigate between different content streams to discover articles from around the world.
            </p>
            <div className="mt-4 space-y-2">
              <div className="bg-gray-700 p-2 rounded text-xs">
                <span className="text-cyan-400 font-medium">🌍 Explore</span>
                <p className="text-gray-300">Netflix-style discovery</p>
              </div>
              <div className="bg-gray-700 p-2 rounded text-xs">
                <span className="text-green-400 font-medium">✅ Verified</span>
                <p className="text-gray-300">High-quality articles</p>
              </div>
              <div className="bg-gray-700 p-2 rounded text-xs">
                <span className="text-purple-400 font-medium">🎯 Global Stream</span>
                <p className="text-gray-300">All content</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Use AI Translator</h3>
            <p className="text-gray-400 text-sm">
              Click the globe icon to access our powerful translation feature that breaks down language barriers.
            </p>
            <div className="mt-4 text-xs text-gray-500">
              <p>• Search in your local language</p>
              <p>• Get translation in any country's language</p>
              <p>• Discover local information worldwide</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">4</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Save & Organize</h3>
            <p className="text-gray-400 text-sm">
              Bookmark articles you want to read later and access all your saved content in one place.
            </p>
            <div className="mt-4 text-xs text-gray-500">
              <p>• Click bookmark icon to save</p>
              <p>• Access in 'Saved' section</p>
              <p>• Organize your reading list</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gray-700 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-3">
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-400 mb-4">
              Join thousands of users discovering global content with ENFOCO
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onShowSignup}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => window.open('https://e-eenfocco.vercel.app/', '_blank')}
                className="border border-gray-600 hover:border-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Visit Website
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
