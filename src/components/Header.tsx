import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { allCountries } from '../data/countries';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCountryChange: (country: string) => void;
  selectedCountry: string;
  searchQuery: string;
  onShowLogin?: () => void;
  onShowSignup?: () => void;
  onShowProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onCountryChange, 
  selectedCountry, 
  searchQuery,
  onShowLogin,
  onShowSignup,
  onShowProfile
}) => {
  const { theme, toggleTheme } = useTheme();
  const { state, logout } = useAuth();
  const { user } = state;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const selectedCountryData = allCountries.find(c => c.code === selectedCountry) || allCountries[0];

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return '🌙';
      case 'light': return '☀️';
      case 'cinematic': return '🎬';
      default: return '🎬';
    }
  };

  const getThemeName = () => {
    switch (theme) {
      case 'dark': return 'Dark';
      case 'light': return 'Light';
      case 'cinematic': return 'Cinematic';
      default: return 'Cinematic';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              ENFOCO
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search global intelligence, topics, countries..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Country Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
              >
                <span className="text-lg">{selectedCountryData.flag}</span>
                <span className="text-sm">{selectedCountryData.code}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCountryOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    {allCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          onCountryChange(country.code);
                          setIsCountryOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-sm">{country.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{country.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
              title={`Current theme: ${getThemeName()}`}
            >
              <span className="text-lg">{getThemeIcon()}</span>
              <span className="text-sm hidden sm:inline">{getThemeName()}</span>
            </button>

            {/* User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm hidden sm:inline">{user.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-700">
                        {user.email}
                      </div>
                      <button
                        onClick={() => {
                          onShowProfile?.();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
};