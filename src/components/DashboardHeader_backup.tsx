import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { allCountries } from '../data/countries';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  onShowProfile: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  onShowProfile
}) => {
  const { state, logout } = useAuth();
  const { user } = state;
  const { theme, toggleTheme } = useTheme();
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const selectedCountryData = allCountries.find(c => c.code === selectedCountry) || allCountries[0];

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Spacer for left side */}
        <div className="flex-1"></div>
        
        {/* Center - Search */}
        <div className="flex items-center space-x-4 flex-1 max-w-2xl justify-center">
          <div className="relative flex-1">
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
          <div className="relative">
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

            {isCountryOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  {allCountries.map((country) => (
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
                      <span className="text-xs text-gray-400 ml-auto">{country.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
            Search
          </button>
        </div>

        {/* Spacer for right side */}
        <div className="flex-1"></div>

        {/* Right Side - User Profile */}
        <div className="flex items-center space-x-4">
          {/* User Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-gray-400">Verified User</p>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      onClick={async () => {
                        await logout();
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
    </header>
  );
};
