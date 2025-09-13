import React, { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../types';
import { ContentService } from '../services/contentService';
import { ContentCard } from './ContentCard';
import { useAuth } from '../contexts/AuthContext';
import { allCountries } from '../data/countries';

interface CategoryPageProps {
  category: string;
  onBack: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ category, onBack }) => {
  const { state } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const loadCategoryContent = useCallback(async () => {
    setLoading(true);
    try {
      // Build filters for category and country
      const filters: any = {
        category: category.toLowerCase()
      };
      
      // Add country filter if not 'all'
      if (selectedCountry !== 'all') {
        const countryName = allCountries.find(c => c.code === selectedCountry)?.name;
        if (countryName) {
          filters.country = countryName;
        }
      }
      
      console.log('CategoryPage filters:', filters);
      const contentData = await ContentService.getContent(filters);
      console.log('CategoryPage results:', contentData.length, 'articles');
      setContent(contentData);
    } catch (error) {
      console.error('Error loading category content:', error);
    } finally {
      setLoading(false);
    }
  }, [category, selectedCountry]);

  useEffect(() => {
    loadCategoryContent();
  }, [loadCategoryContent]);

  // Add visibility change and focus listeners to refresh content when user returns to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to the page, refresh content
        console.log('User returned to category page, refreshing content...');
        loadCategoryContent();
      }
    };

    const handleFocus = () => {
      // User focused back on the tab, refresh content
      console.log('User focused on category tab, refreshing content...');
      loadCategoryContent();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadCategoryContent]);


  const handleContentSaved = async () => {
    // Refresh content to update save status
    await loadCategoryContent();
  };


  const renderContentGrid = (contentItems: ContentItem[]) => {
    if (contentItems.length === 0) {
      const countryName = selectedCountry === 'all' 
        ? 'all countries' 
        : allCountries.find(c => c.code === selectedCountry)?.name || 'selected country';
        
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            No {category.toLowerCase()} articles from {countryName}
          </h3>
          <p className="text-gray-400 mb-4">
            We don't have any {category.toLowerCase()} content from {countryName} at the moment.
          </p>
          <div className="text-gray-500 text-sm space-y-1">
            <p>💡 <strong>Try these options:</strong></p>
            <p>• Select a different country to see {category.toLowerCase()} articles from other regions</p>
            <p>• Go back to explore other categories that might have content from {countryName}</p>
            <p>• Check back later as we're constantly adding new content</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {contentItems.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
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
          <p className="text-gray-400">Loading {category} content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Top Row - Title and Back Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white capitalize">{category}</h1>
                <p className="text-gray-400">
                  {content.length} articles 
                  {selectedCountry === 'all' 
                    ? ' from all countries' 
                    : ` from ${allCountries.find(c => c.code === selectedCountry)?.name}`
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Bottom Row - Country Filter and Translation Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
              <span className="text-sm text-gray-300 font-medium">Filter by country:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent min-w-[150px]"
              >
                <option value="all">🌍 All Countries</option>
                {allCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>
            
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderContentGrid(content)}
      </div>
    </div>
  );
};
