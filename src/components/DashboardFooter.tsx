import React, { useState } from 'react';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';
import { Contact } from './Contact';
import { Help } from './Help';

export const DashboardFooter: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | 'help' | null>(null);
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              ENFOCO
            </h3>
            <span className="text-gray-400 text-sm">© 2025</span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveModal('privacy')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setActiveModal('terms')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => setActiveModal('contact')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Contact
            </button>
            <button 
              onClick={() => setActiveModal('help')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Help
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'privacy' && (
        <PrivacyPolicy onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'terms' && (
        <TermsOfService onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'contact' && (
        <Contact onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'help' && (
        <Help onClose={() => setActiveModal(null)} />
      )}
    </footer>
  );
};



