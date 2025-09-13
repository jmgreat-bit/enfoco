import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { allCountries } from '../data/countries';
import { TranslationService } from '../services/translationService';
import { TranslatorModal } from './TranslatorModal';
import { CountryDataService } from '../services/countryDataService';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  onShowProfile: () => void;
  activeStream?: 'explore' | 'verified' | 'global';
  onLogout?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  onShowProfile,
  activeStream,
  onLogout
}) => {
  const { state, logout } = useAuth();
  const { user } = state;
  const { theme, toggleTheme } = useTheme();
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslatorModalOpen, setIsTranslatorModalOpen] = useState(false);
  const [showTranslatorHelp, setShowTranslatorHelp] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownPortalRef = useRef<HTMLDivElement>(null);

  const selectedCountryData = allCountries.find(c => c.code === selectedCountry) || allCountries[0];
  const supportedLanguages = TranslationService.getSupportedLanguages();
  const selectedLanguageData = supportedLanguages.find(lang => lang.code === selectedLanguage) || supportedLanguages[0];

  // Check if user has disabled translator help
  useEffect(() => {
    const savedPreference = localStorage.getItem('translatorHelpDisabled');
    if (savedPreference === 'true') {
      setDontShowAgain(true);
    }
  }, []);

  // Calculate dropdown position and handle click outside
  useEffect(() => {
    const updatePosition = () => {
      if (countryDropdownRef.current) {
        const rect = countryDropdownRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right
        });
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isButtonClick = countryDropdownRef.current?.contains(target);
      const isDropdownClick = dropdownPortalRef.current?.contains(target);
      
      if (!isButtonClick && !isDropdownClick) {
        setIsCountryOpen(false);
      }
    };

    if (isCountryOpen) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryOpen]);

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Enfoco Logo" 
            className="h-12 w-auto"
          />
        </div>
        
        {/* Center - Search and Country Dropdown (Hidden on Explore tab) */}
        {activeStream !== 'explore' && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="Search for news, topics..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Country Dropdown */}
            <div className="relative" ref={countryDropdownRef}>
              <button
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm">{selectedCountryData.flag}</span>
                <span className="text-sm">{selectedCountryData.code}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCountryOpen && createPortal(
                <div 
                  ref={dropdownPortalRef}
                  className="fixed w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-[99999] max-h-80 overflow-y-auto"
                  style={{
                    top: dropdownPosition.top,
                    right: dropdownPosition.right
                  }}
                >
                  <div className="p-2">
                    {/* Legend */}
                    <div className="px-3 py-2 mb-2 border-b border-gray-700">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Content available</span>
                      </div>
                    </div>
                    
                    {allCountries.map((country) => {
                      const hasData = CountryDataService.hasData(country.name);
                      return (
                        <button
                          key={country.code}
                          onClick={() => {
                            onCountryChange(country.code);
                            setIsCountryOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm">{country.name}</span>
                          <div className="flex items-center space-x-2 ml-auto">
                            {hasData && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" title="Content available"></div>
                            )}
                            <span className="text-xs text-gray-400">{country.code}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>
        )}

        {/* Right Side - User Profile */}
        <div className="flex items-center space-x-3">
          {/* Translation Icon */}
          <div className="relative">
            <button 
              onClick={() => {
                if (dontShowAgain) {
                  setIsTranslatorModalOpen(true);
                } else {
                  setShowTranslatorHelp(true);
                }
              }}
              className="w-8 h-8 bg-gray-800 hover:bg-cyan-500 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              title="AI Translator - Click to learn how to use"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </button>

            {/* Translator Help Popup */}
            {showTranslatorHelp && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">🌍 AI Translator</h3>
                  <button
                    onClick={() => setShowTranslatorHelp(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="text-gray-300 text-xs space-y-2">
                  <p><strong>🌍 Global Search Bridge!</strong></p>
                  <p>1. Search in YOUR local language</p>
                  <p>2. Get translation in any country's language</p>
                  <p>3. Discover local information from that country</p>
                  <p className="text-cyan-400 font-medium">✨ Unlock global content in your own language!</p>
                </div>
                <div className="mt-3 mb-3">
                  <label className="flex items-center space-x-2 text-gray-400 text-xs">
                    <input
                      type="checkbox"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      className="w-3 h-3 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                    />
                    <span>Don't show this again</span>
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (dontShowAgain) {
                        localStorage.setItem('translatorHelpDisabled', 'true');
                      }
                      setShowTranslatorHelp(false);
                      setIsTranslatorModalOpen(true);
                    }}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    🌍 Start Global Search
                  </button>
                  <button
                    onClick={() => {
                      if (dontShowAgain) {
                        localStorage.setItem('translatorHelpDisabled', 'true');
                      }
                      setShowTranslatorHelp(false);
                    }}
                    className="px-3 py-2 text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* User Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 px-2 py-1 hover:bg-gray-800 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{user.username}</p>
                  <p className="text-xs text-gray-400">Verified User</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-700">
                      {user.email}
                    </div>
                    <button
                      onClick={() => {
                        onShowProfile();
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span className="text-lg">
                        {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🎬'}
                      </span>
                      <span>Theme: {theme}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onLogout) {
                          onLogout();
                        } else {
                          logout();
                        }
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 text-white hover:text-cyan-400 transition-colors">
                Sign In
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-lg hover:from-cyan-500 hover:to-purple-600 transition-all">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Translator Modal */}
      <TranslatorModal
        isOpen={isTranslatorModalOpen}
        onClose={() => setIsTranslatorModalOpen(false)}
      />
    </header>
  );
};
