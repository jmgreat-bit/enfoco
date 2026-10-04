import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ContentItem } from '../types';
import { ContentService } from '../services/contentService';
import { ContentCard } from './ContentCard';
import { TranslatorModal } from './TranslatorModal';
import { AutoScrollCategoryBar } from './AutoScrollCategoryBar';
import { CategoryPage } from './CategoryPage';
import { useAuth } from '../contexts/AuthContext';
import { allCountries } from '../data/countries';
import { CategoryAccessLimitService } from '../services/categoryAccessLimitService';

interface ProperDashboardProps {
  searchQuery: string;
  selectedCountry: string;
  activeSection: string;
  onActiveStreamChange?: (stream: 'explore' | 'verified' | 'global') => void;
}

export const ProperDashboard: React.FC<ProperDashboardProps> = ({ 
  searchQuery, 
  selectedCountry,
  activeSection,
  onActiveStreamChange
}) => {
  const { state } = useAuth();
  const { user } = state;
  const [activeStream, setActiveStream] = useState<'explore' | 'verified' | 'global'>('explore');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [savedContent, setSavedContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [exploreContent, setExploreContent] = useState<{ [category: string]: ContentItem[] }>({});
  const [categoryAccessStatus, setCategoryAccessStatus] = useState({
    canAccess: true,
    remainingCount: 10,
    statusMessage: 'Category Browsing Available'
  });
  const currentOffsetRef = useRef(0);
  const [datasetSummary, setDatasetSummary] = useState<{
    totalArticles: number;
    totalCountries: number;
    totalPublishers: number;
    countryCount: Record<string, number>;
    categoriesCount: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    if (activeSection === 'stats') {
      ContentService.getDatasetSummary().then(summary => {
        setDatasetSummary(summary);
      });
    }
  }, [activeSection]);

  // Notify parent component when activeStream changes
  useEffect(() => {
    if (onActiveStreamChange) {
      onActiveStreamChange(activeStream);
    }
  }, [activeStream, onActiveStreamChange]);

  // Initialize category access status
  useEffect(() => {
    const status = CategoryAccessLimitService.getCategoryAccessStatus();
    setCategoryAccessStatus(status);
  }, []);

  // Load categories from database
  const loadCategories = useCallback(async () => {
    try {
      const dbCategories = await ContentService.getCategories();
      setCategories(dbCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Load explore content with country diversity
  const loadExploreContent = useCallback(async () => {
    try {
      const content = await ContentService.getExploreContent(12); // 12 items per category
      setExploreContent(content);
    } catch (error) {
      console.error('Error loading explore content:', error);
    }
  }, []);

  const loadContent = useCallback(async (resetContent = true) => {
    if (resetContent) {
      setLoading(true);
      currentOffsetRef.current = 0;
      setHasMoreContent(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      let contentData: ContentItem[] = [];
      const offset = resetContent ? 0 : currentOffsetRef.current;
      
      if (searchQuery.trim()) {
        // Convert country code to country name for search
        const countryName = allCountries.find(c => c.code === selectedCountry)?.name || selectedCountry;
        
        const searchFilters: any = {
          country: countryName
        };
        
        // For verified tab, filter by verified field
        if (activeStream === 'verified') {
          searchFilters.is_verified = true;
          contentData = await ContentService.searchContent(searchQuery, searchFilters, 20, offset);
        } else if (activeStream === 'global') {
          // Use the new Global Stream search method that includes mentioned filtering
          contentData = await ContentService.searchGlobalStreamContent(searchQuery, countryName, 20, offset);
        } else {
          contentData = await ContentService.searchContent(searchQuery, searchFilters, 20, offset);
        }
      } else {
        // Load content based on stream type and content type
        const filters: any = {};
        
        // Convert country code to country name
        const countryName = allCountries.find(c => c.code === selectedCountry)?.name || selectedCountry;

        if (activeSection === 'global' || activeStream === 'global') {
          contentData = await ContentService.getGlobalStreamContent(countryName, 20, offset);
        } else if (activeStream === 'explore') {
          // Explore content is loaded separately via loadExploreContent
          contentData = [];
        } else {
          if (activeStream === 'verified') {
            filters.is_verified = true;
            filters.country = countryName;
          }
          contentData = await ContentService.getContent(filters, 20, offset);
        }
      }
      
      if (resetContent) {
        setContent(contentData);
      } else {
        setContent(prevContent => [...prevContent, ...contentData]);
      }
      
      // Check if there's more content
      setHasMoreContent(contentData.length === 20);
      currentOffsetRef.current = offset + 20;
      
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedCountry, activeStream, activeSection]);

  const loadSavedContent = useCallback(async () => {
    try {
      const saved = await ContentService.getSavedContent(user?.id || 'guest-explorer');
      setSavedContent(saved);
    } catch (error) {
      console.error('Error loading saved content:', error);
    }
  }, [user]);

  useEffect(() => {
    if (activeSection === 'saved') {
      loadSavedContent();
    } else {
      loadContent();
    }
  }, [activeSection, selectedCountry, activeStream, loadContent, loadSavedContent]);

  // Load categories and explore content on component mount
  useEffect(() => {
    loadCategories();
    loadExploreContent();
  }, [loadCategories, loadExploreContent]);

  // Add visibility change and focus listeners to refresh content when user returns to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to the page, refresh content
        console.log('User returned to page, refreshing content...');
        if (activeSection !== 'saved') {
          loadContent(true); // Force refresh
        }
      }
    };

    const handleFocus = () => {
      // User focused back on the tab, refresh content
      console.log('User focused on tab, refreshing content...');
      if (activeSection !== 'saved') {
        loadContent(true); // Force refresh
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadContent, activeSection]);

  const handleTranslate = (content: ContentItem) => {
    setSelectedContent(content);
    setIsTranslatorOpen(true);
  };

  const handleOpen = (content: ContentItem) => {
    window.open(content.source_url, '_blank');
  };

  const handleContentSaved = async (contentId: string, isSaved: boolean) => {
    setContent(prevContent => 
      prevContent.map(item => 
        item.id === contentId ? { ...item, is_saved: isSaved } : item
      )
    );

    if (activeSection === 'saved') {
      await loadSavedContent();
    }
  };

  const handleCategoryClick = (category: string) => {
    // Check category access limits
    const limitResult = CategoryAccessLimitService.recordCategoryAccess();
    if (!limitResult.success) {
      const errorMessage = limitResult.cooldownTime 
        ? `Category limit reached. Next batch available in ${CategoryAccessLimitService.formatCooldownTime(limitResult.cooldownTime)}`
        : 'Category limit reached. Please try again later.';
      
      alert(errorMessage);
      
      // Update status
      const status = CategoryAccessLimitService.getCategoryAccessStatus();
      setCategoryAccessStatus(status);
      return;
    }
    
    // Update status after successful access
    const status = CategoryAccessLimitService.getCategoryAccessStatus();
    setCategoryAccessStatus(status);
    
    setCurrentCategory(category);
  };

  const handleBackFromCategory = () => {
    setCurrentCategory(null);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMoreContent) {
      loadContent(false);
    }
  };

  // Get content by category from explore content
  const getContentByCategory = useCallback((category: string) => {
    // For explore tab, use the pre-loaded explore content
    if (activeStream === 'explore') {
      return exploreContent[category] || [];
    }
    
    // For other tabs, filter the regular content
    let filtered = content.filter(item => item.category === category);
    
    // Apply stream-specific filtering
    if (activeStream === 'verified') {
      filtered = filtered.filter(item => item.is_verified);
    } else if (activeStream === 'global') {
      filtered = filtered.filter(item => 
        item.country_code === selectedCountry || 
        item.description.toLowerCase().includes(selectedCountry.toLowerCase())
      );
    }

    return filtered.slice(0, 12); // Limit to 12 items per category
  }, [content, activeStream, selectedCountry, exploreContent]);

  // Get featured content (top content from all categories)
  const getFeaturedContent = useCallback(() => {
    if (activeStream === 'explore') {
      // For explore tab, get the highest relevance content from all categories
      const allExploreContent: ContentItem[] = [];
      Object.values(exploreContent).forEach(categoryContent => {
        allExploreContent.push(...categoryContent);
      });
      // Sort by relevance score and return top 8
      return allExploreContent
        .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
        .slice(0, 8);
    }
    
    let featured = content;
    
    if (activeStream === 'verified') {
      featured = featured.filter(item => item.is_verified);
    } else if (activeStream === 'global') {
      featured = featured.filter(item => 
        item.country_code === selectedCountry || 
        item.description.toLowerCase().includes(selectedCountry.toLowerCase())
      );
    }
    
    return featured.slice(0, 8);
  }, [content, activeStream, selectedCountry, exploreContent]);

  const renderHorizontalScroll = (title: string, items: ContentItem[], showAll = false) => {
    if (items.length === 0) return null;

    const handleViewAll = () => {
      // For category sections, navigate to category page
      if (categories.includes(title)) {
        handleCategoryClick(title);
      }
    };

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {showAll && (
            <button 
              onClick={handleViewAll}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              View All →
            </button>
          )}
        </div>
        <div className="relative">
          <div className="horizontal-scroll space-x-4 pb-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex-shrink-0 w-80">
                <ContentCard
                  content={item}
                  onTranslate={handleTranslate}
                  onOpen={handleOpen}
                  onSave={handleContentSaved}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContentGrid = (items: ContentItem[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">No content found.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              onTranslate={handleTranslate}
              onOpen={handleOpen}
              onSave={handleContentSaved}
            />
          ))}
        </div>
        
        {/* Load More Text for Verified and Global Stream */}
        {(activeStream === 'verified' || activeStream === 'global') && hasMoreContent && (
          <div className="text-center mt-8">
            {loadingMore ? (
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading more articles...</span>
              </div>
            ) : (
              <button
                onClick={handleLoadMore}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-200 underline hover:no-underline"
              >
                Load More Articles →
              </button>
            )}
          </div>
        )}
        
        {/* End of content message */}
        {(activeStream === 'verified' || activeStream === 'global') && !hasMoreContent && items.length > 0 && (
          <div className="text-center mt-8 py-4">
            <p className="text-gray-400">You've reached the end! No more articles to load.</p>
          </div>
        )}
      </div>
    );
  };

  // Show category page if a category is selected
  if (currentCategory) {
    return (
      <CategoryPage 
        category={currentCategory} 
        onBack={handleBackFromCategory} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mx-auto animate-pulse mb-4"></div>
          <p className="text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  if (activeSection === 'stats') {
    return (
      <div className="flex-1 bg-black min-h-screen p-6 md:p-10 text-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 border-b border-gray-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-bold">OSINT Pipeline Live</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">System & Data Telemetry</h1>
              <p className="text-gray-400 text-sm mt-1">Real-time status of Enfoco automated multi-country intelligence pipeline.</p>
            </div>
            <a
              href="https://huggingface.co/datasets/jmsgrea/enfoco-news"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-sm transition-all shadow-md shadow-amber-500/10"
            >
              <span>🤗 Explore Hugging Face Dataset</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 hover:border-cyan-500/40 transition-colors">
              <span className="text-xs font-mono uppercase text-gray-500">Indexed Articles</span>
              <div className="text-3xl font-black text-cyan-400 mt-2 font-mono">
                {datasetSummary ? datasetSummary.totalArticles.toLocaleString() : '1,000+'}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Live cumulative OSINT intelligence</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 hover:border-blue-500/40 transition-colors">
              <span className="text-xs font-mono uppercase text-gray-500">Global Coverage</span>
              <div className="text-3xl font-black text-blue-400 mt-2 font-mono">
                {datasetSummary ? datasetSummary.totalCountries : 49} Countries
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                {datasetSummary ? datasetSummary.totalPublishers : 63} verified publishers
              </span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 hover:border-purple-500/40 transition-colors">
              <span className="text-xs font-mono uppercase text-gray-500">Active AI Model</span>
              <div className="text-xl font-bold text-purple-400 mt-2">Gemini 2.5 Flash</div>
              <span className="text-[11px] text-gray-400 mt-1 block">Google Generative AI (Batched)</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 hover:border-emerald-500/40 transition-colors">
              <span className="text-xs font-mono uppercase text-gray-500">Sync Cadence</span>
              <div className="text-2xl font-bold text-emerald-400 mt-2">Every 3 Hours</div>
              <span className="text-[11px] text-gray-400 mt-1 block">24/7 Automated Pipeline</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-950 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>🌍</span>
                <span>Active Coverage by Country</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Australia', count: 73 },
                  { name: 'Argentina', count: 66 },
                  { name: 'Romania', count: 63 },
                  { name: 'Turkey', count: 52 },
                  { name: 'Brazil', count: 48 },
                  { name: 'Greece', count: 42 },
                  { name: 'China', count: 40 },
                  { name: 'Venezuela', count: 39 },
                  { name: 'Bangladesh', count: 37 },
                  { name: 'Switzerland', count: 37 },
                  { name: 'Rwanda', count: 20 },
                  { name: 'South Africa', count: 18 }
                ].map(c => (
                  <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-900/60 border border-gray-800 text-xs">
                    <span className="text-gray-300 font-medium">{c.name}</span>
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-cyan-400 font-mono text-[11px]">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>🏷️</span>
                <span>Intelligence Categories</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Technology', count: 220, color: 'bg-cyan-500' },
                  { label: 'Politics', count: 58, color: 'bg-purple-500' },
                  { label: 'Sports', count: 21, color: 'bg-emerald-500' },
                  { label: 'Health', count: 18, color: 'bg-rose-500' },
                  { label: 'Environment', count: 11, color: 'bg-lime-500' },
                  { label: 'Business', count: 9, color: 'bg-amber-500' },
                  { label: 'General & Diplomacy', count: 651, color: 'bg-gray-500' }
                ].map(t => (
                  <div key={t.label} className="flex items-center justify-between py-1.5 border-b border-gray-800/60">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${t.color}`}></span>
                      <span className="text-gray-300">{t.label}</span>
                    </div>
                    <span className="font-mono text-gray-400">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black">
      {/* Stream Navigation */}
      {activeSection !== 'saved' && (
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center space-x-1">
            <button
                onClick={() => setActiveStream('explore')}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  activeStream === 'explore'
                    ? 'bg-black text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Explore
            </button>
            <button
                onClick={() => setActiveStream('verified')}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  activeStream === 'verified'
                    ? 'bg-black text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
                Verified
            </button>
            <button
                onClick={() => setActiveStream('global')}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  activeStream === 'global'
                    ? 'bg-black text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                Global Stream
            </button>
            </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeSection === 'saved' ? (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Saved Content</h1>
          {savedContent.length > 0 ? (
            renderContentGrid(savedContent)
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="text-gray-400">No saved briefings yet.</p>
              <p className="text-gray-500 text-sm mt-2">Bookmark any intelligence article to access it offline or review later.</p>
            </div>
          )}
          </div>
        ) : (
          <div>
            {activeStream === 'explore' ? (
              /* Explore Tab - No Search, Just Discovery */
              <div>
                {/* Auto-scrolling Category Bar */}
                <AutoScrollCategoryBar 
                  categories={categories}
                  onCategoryClick={handleCategoryClick}
                  categoryAccessStatus={categoryAccessStatus}
                />
                
                {/* Netflix-style Horizontal Scrolling Layout */}
                <div className="space-y-12">
                  {/* Featured Content */}
                  {renderHorizontalScroll('🔥 Featured Content', getFeaturedContent(), true)}
                  
                  {/* Category-based Horizontal Scrolling */}
                  {categories.map((category) => {
                    const categoryContent = getContentByCategory(category);
                    if (categoryContent.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        {renderHorizontalScroll(category, categoryContent, true)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Verified and Global Stream Tabs - With Search Functionality */
              <div>
                {/* Search Results */}
                {searchQuery.trim() ? (
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-6">
                      Search Results for "{searchQuery}"
                    </h1>
                    {content.length > 0 ? (
                      renderContentGrid(content)
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-400">No results found for your search.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Simple Grid Layout for Verified and Global Stream */
                  <div>
                    {content.length > 0 ? (
                      renderContentGrid(content)
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          {activeStream === 'verified' ? (
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-gray-400">
                          {activeStream === 'verified' 
                            ? 'No verified articles found.'
                            : 'No articles found.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Translator Modal */}
      <TranslatorModal
        isOpen={isTranslatorOpen}
        onClose={() => setIsTranslatorOpen(false)}
      />
    </div>
  );
};