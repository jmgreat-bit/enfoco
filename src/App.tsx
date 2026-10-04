import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { ProperDashboard } from './components/ProperDashboard';
import { ProfileSettings } from './components/ProfileSettings';
import { DashboardFooter } from './components/DashboardFooter';
import { BackToTopButton } from './components/BackToTopButton';
import { ReviewModal } from './components/ReviewModal';
import { ReviewService } from './services/reviewService';

function AppContent() {
  const { state, logout } = useAuth();
  const { user } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(user?.countryPreference || 'US');
  const [activeSection, setActiveSection] = useState('articles');
  const [activeStream, setActiveStream] = useState<'explore' | 'verified' | 'global'>('explore');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Update selectedCountry when user data changes
  useEffect(() => {
    if (user?.countryPreference) {
      setSelectedCountry(user.countryPreference);
    }
  }, [user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleCloseModals = () => {
    setShowProfile(false);
  };

  const handleLogout = async () => {
    // Show review modal on logout if not already dismissed/completed
    if (ReviewService.shouldShowReviewOnLogout()) {
      setShowReviewModal(true);
    } else {
      await logout();
    }
  };

  const handleReviewClick = () => {
    ReviewService.completeReview();
    ReviewService.openReviewLink();
    setShowReviewModal(false);
    logout(); // Logout after review
  };

  const handleDismissReview = () => {
    ReviewService.dismissReview();
    setShowReviewModal(false);
    logout(); // Logout after dismissing
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    logout(); // Logout when closing modal
  };

  // Update selected country when user changes
  useEffect(() => {
    if (user?.countryPreference) {
      console.log('Setting country from user database:', user.countryPreference);
      setSelectedCountry(user.countryPreference);
    } else if (user) {
      console.log('User exists but no country preference, using default US');
      setSelectedCountry('US');
    }
  }, [user]);

  // Dashboard is open to all visitors - no login gate required

  // Show dashboard if user is logged in
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          onShowProfile={handleShowProfile}
          activeStream={activeStream}
          onLogout={handleLogout}
        />
        
        {/* Dashboard */}
        <ProperDashboard
          searchQuery={searchQuery}
          selectedCountry={selectedCountry}
          activeSection={activeSection}
          onActiveStreamChange={setActiveStream}
        />
        
        {/* Footer */}
        <DashboardFooter />
      </div>

      {/* Modals */}
      {showProfile && (
        <ProfileSettings onClose={handleCloseModals} />
      )}
      
      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={handleCloseReview}
        onReview={handleReviewClick}
        onDismiss={handleDismissReview}
      />
      
      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;