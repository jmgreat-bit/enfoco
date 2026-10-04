import React, { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../types';
import { ContentService } from '../services/contentService';
import { ContentCard } from './ContentCard';
import { TranslatorModal } from './TranslatorModal';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  searchQuery: string;
  selectedCountry: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ searchQuery, selectedCountry }) => {
  const { state } = useAuth();
  const { user } = state;
  const [content, setContent] = useState<ContentItem[]>([]);
  const [savedContent, setSavedContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'explore' | 'saved'>('explore');

  const categories = [
    'Technology',
    'Environment',
    'Finance',
    'Health',
    'Transportation',
    'Science',
    'Education',
    'Culture',
    'Politics',
    'Sports'
  ];

  const contentTypes = [
    { type: 'article', label: 'Articles', icon: '📄' },
    { type: 'video', label: 'Videos', icon: '🎥' },
    { type: 'book', label: 'Books', icon: '📚' },
    { type: 'talk', label: 'Talks', icon: '🎤' }
  ];

  const loadContent = useCallback(async () => {
      setLoading(true);
      try {
      let contentData: ContentItem[];
      
      if (searchQuery.trim()) {
        contentData = await ContentService.searchContent(searchQuery, {
          country: selectedCountry
        });
    } else {
        contentData = await ContentService.getContent({
          country: selectedCountry
        });
      }
      
      setContent(contentData);
      } catch (error) {
      console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
  }, [searchQuery, selectedCountry]);

  const loadSavedContent = useCallback(async () => {
    if (!user) return;
    
    try {
      const saved = await ContentService.getSavedContent(user.id);
      setSavedContent(saved);
    } catch (error) {
      console.error('Error loading saved content:', error);
    }
  }, [user]);

  useEffect(() => {
    loadContent();
    if (user) {
      loadSavedContent();
    }
  }, [searchQuery, selectedCountry, user, loadContent, loadSavedContent]);

  const handleTranslate = (content: ContentItem) => {
    setSelectedContent(content);
    setIsTranslatorOpen(true);
  };

  const handleOpen = (content: ContentItem) => {
    window.open(content.source_url, '_blank');
  };

  const handleContentSaved = async (contentId: string, isSaved: boolean) => {
    // Update the content list to reflect the saved state
    setContent(prevContent => 
      prevContent.map(item => 
        item.id === contentId ? { ...item, is_saved: isSaved } : item
      )
    );

    // If we're on the saved section, reload saved content
    if (activeSection === 'saved') {
      await loadSavedContent();
    }
  };

  const getContentByCategory = (category: string) => {
    return content.filter(item => item.category === category);
  };

  const getContentByType = (type: string) => {
    return content.filter(item => item.content_type === type);
  };

  const renderHorizontalScroll = (title: string, items: ContentItem[], showAll = false) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {showAll && (
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              View All
            </button>
          )}
        </div>
        <div className="relative">
          <div className="horizontal-scroll space-x-4 pb-4">
            {items.map((item) => (
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

  const renderGrid = (items: ContentItem[]) => {
    return (
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
    );
  };

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

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Tabs */}
      <div className="sticky top-16 z-40 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-8">
                  <button
              onClick={() => setActiveSection('explore')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'explore'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Explore
                  </button>
            {user && (
                  <button
                onClick={() => setActiveSection('saved')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'saved'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Saved ({savedContent.length})
                  </button>
              )}
          </div>
            </div>
          </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'explore' ? (
          <div>
            {/* Search Results */}
            {searchQuery.trim() ? (
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-6">
                  Search Results for "{searchQuery}"
                </h1>
                {content.length > 0 ? (
                  renderGrid(content)
                ) : (
              <div className="text-center py-12">
                    <p className="text-gray-400">No results found for your search.</p>
                </div>
                )}
              </div>
            ) : (
              <div>
                {/* Netflix-style Horizontal Scrolling - ONLY in Explore */}
                <div className="space-y-12">
                  {/* Featured Content */}
                  {renderHorizontalScroll('Featured Content', content.slice(0, 8), true)}
                  
                  {/* Content by Type */}
                  {contentTypes.map(({ type, label, icon }) => {
                    const typeContent = getContentByType(type);
                    if (typeContent.length === 0) return null;
                      
                      return (
                      <div key={type}>
                        {renderHorizontalScroll(`${icon} ${label}`, typeContent, true)}
                      </div>
                    );
                  })}
                  
                  {/* Content by Category */}
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
                )}
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Saved Content</h1>
            {savedContent.length > 0 ? (
              renderGrid(savedContent)
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <p className="text-gray-400">No saved content yet.</p>
                <p className="text-gray-500 text-sm mt-2">Save articles, videos, and books to access them here.</p>
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