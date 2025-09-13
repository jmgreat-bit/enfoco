import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FAQ } from './FAQ';
import { GettingStarted } from './GettingStarted';

interface LandingPageProps {
  onShowLogin: () => void;
  onShowSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin, onShowSignup }) => {
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return '🌙';
      case 'light': return '☀️';
      case 'cinematic': return '🎬';
      default: return '🎬';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                ENFOCO
              </h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
                title={`Current theme: ${theme}`}
              >
                <span className="text-lg">{getThemeIcon()}</span>
                <span className="text-sm hidden sm:inline capitalize">{theme}</span>
              </button>

              {/* Auth Buttons */}
              <button
                onClick={onShowLogin}
                className="px-4 py-2 text-white hover:text-cyan-400 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onShowSignup}
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-lg hover:from-cyan-500 hover:to-purple-600 transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              ENFOCO
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your gateway to global content. Discover articles, videos, books, and talks from around the world, 
            translated and curated for your learning journey.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onShowSignup}
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-lg font-semibold rounded-lg hover:from-cyan-500 hover:to-purple-600 transition-all transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={onShowLogin}
              className="px-8 py-4 border border-gray-600 text-white text-lg font-semibold rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-all"
            >
              Sign In
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-cyan-400/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Translation</h3>
              <p className="text-gray-400">Translate content to your preferred language with advanced AI technology.</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-cyan-400/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Save & Organize</h3>
              <p className="text-gray-400">Bookmark your favorite content and organize it for easy access.</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-cyan-400/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Discovery</h3>
              <p className="text-gray-400">Explore content from every country with our comprehensive search.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <GettingStarted onShowSignup={onShowSignup} />

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 ENFOCO. All rights reserved. Made with ❤️ for global learners.
          </p>
        </div>
      </footer>
    </div>
  );
};



