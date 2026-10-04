import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ContentItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ContentService } from '../services/contentService';
import { allCountries } from '../data/countries';
import { TranslationService } from '../services/translationService';
import { ContentCardTranslationLimitService } from '../services/contentCardTranslationLimitService';

interface ContentCardProps {
  content: ContentItem;
  onTranslate?: (content: ContentItem) => void;
  onOpen?: (content: ContentItem) => void;
  onSave?: (contentId: string, isSaved: boolean) => void;
  onTranslationUpdate?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  onTranslate, 
  onOpen,
  onSave,
  onTranslationUpdate
}) => {
  const { state } = useAuth();
  const { user } = state;
  const [isSaved, setIsSaved] = useState(content.is_saved || false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [translationStatus, setTranslationStatus] = useState({
    canTranslate: true,
    remainingCount: 15,
    statusMessage: 'Content Translation Available'
  });
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  
  const supportedLanguages = TranslationService.getSupportedLanguages();

  // Update translation status when component mounts
  useEffect(() => {
    const status = ContentCardTranslationLimitService.getTranslationStatus();
    setTranslationStatus({
      canTranslate: status.canTranslate,
      remainingCount: status.remainingCount,
      statusMessage: status.statusMessage
    });
  }, []);

  const handleSave = async () => {
    const userId = user?.id || 'guest-explorer';

    setIsSaving(true);
    setSaveError(null);
    
    try {
      if (isSaved) {
        const { error } = await ContentService.unsaveContent(user.id, content.id);
        if (error) {
          throw new Error('Failed to unsave content');
        }
        setIsSaved(false);
        console.log('Content unsaved successfully');
        onSave?.(content.id, false);
      } else {
        const { error } = await ContentService.saveContent(user.id, content.id, undefined, content);
        if (error) {
          throw new Error('Failed to save content');
        }
        setIsSaved(true);
        console.log('Content saved successfully');
        onSave?.(content.id, true);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen(content);
    } else {
      window.open(content.source_url, '_blank');
    }
  };

  const handleTranslate = () => {
    if (onTranslate) {
      onTranslate(content);
    }
  };

  const handleLanguageSelect = async (languageCode: string) => {
    // Check translation limits first
    const limitResult = ContentCardTranslationLimitService.recordTranslation();
    if (!limitResult.success) {
      // Show user-friendly error message
      const errorMessage = limitResult.cooldownTime 
        ? `Translation limit reached. Next batch available in ${ContentCardTranslationLimitService.formatCooldownTime(limitResult.cooldownTime)}`
        : 'Translation limit reached. Please try again later.';
      
      // You could show a toast notification here instead of console.error
      alert(errorMessage);
      setIsLanguageOpen(false);
      
      // Update translation status
      const status = ContentCardTranslationLimitService.getTranslationStatus();
      setTranslationStatus({
        canTranslate: status.canTranslate,
        remainingCount: status.remainingCount,
        statusMessage: status.statusMessage
      });
      return;
    }

    setIsTranslating(true);
    setSelectedLanguage(languageCode);
    setIsLanguageOpen(false);
    
    try {
      const result = await TranslationService.translateArticle(
        {
          title: content.title,
          description: content.description,
        },
        languageCode
      );

      if (result.error) {
        console.error('Translation error:', result.error);
      } else {
        setTranslatedContent({
          title: result.translatedTitle,
          description: result.translatedDescription,
        });
        // Update translation status after successful translation
        const status = ContentCardTranslationLimitService.getTranslationStatus();
        setTranslationStatus({
          canTranslate: status.canTranslate,
          remainingCount: status.remainingCount,
          statusMessage: status.statusMessage
        });
        
        // Notify parent component of translation update
        onTranslationUpdate?.();
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const getCategoryBadgeStyle = () => {
    const cat = (content.category || '').toLowerCase();
    if (cat.includes('tech') || cat.includes('ai') || cat.includes('digital')) return 'bg-cyan-400 text-black border-cyan-300';
    if (cat.includes('politic') || cat.includes('diploma') || cat.includes('gov')) return 'bg-purple-500 text-white border-purple-400';
    if (cat.includes('busin') || cat.includes('econ') || cat.includes('financ')) return 'bg-emerald-400 text-black border-emerald-300';
    if (cat.includes('health') || cat.includes('med')) return 'bg-rose-500 text-white border-rose-400';
    if (cat.includes('sport')) return 'bg-amber-400 text-black border-amber-300';
    if (cat.includes('environ') || cat.includes('climat')) return 'bg-teal-400 text-black border-teal-300';
    return 'bg-blue-500 text-white border-blue-400';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="group relative bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={content.image_url}
          alt={content.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400';
          }}
        />
        
        {/* Category Pill Badge */}
        <div className="absolute top-3 left-3">
          <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md border backdrop-blur-md ${getCategoryBadgeStyle()}`}>
            {content.category || 'General'}
          </div>
        </div>

        {/* Verified Badge */}
        {content.is_verified && (
          <div className="absolute top-3 right-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* Action Buttons - Perfect Positioning */}
        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                if (!translationStatus.canTranslate) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setButtonPosition({
                  x: rect.left,
                  y: rect.bottom + 8
                });
                setIsLanguageOpen(!isLanguageOpen);
              }}
              disabled={!translationStatus.canTranslate}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
                translationStatus.canTranslate 
                  ? 'bg-black/70 hover:bg-cyan-500' 
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
              title={translationStatus.canTranslate 
                ? 'Translate content' 
                : 'Translation limit reached'
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
              isSaved 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/30' 
                : 'bg-black/70 hover:bg-amber-500'
            }`}
            title={isSaved ? 'Unsave' : 'Save'}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>

          {/* Open Button */}
          <button
            onClick={handleOpen}
            className="w-8 h-8 bg-black/70 hover:bg-green-500 rounded-full flex items-center justify-center text-white transition-colors"
            title="Open"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {isTranslating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Translating...</span>
            </div>
          ) : translatedContent ? (
            <span className="text-cyan-400">{translatedContent.title}</span>
          ) : (
            content.title
          )}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-3 line-clamp-3">
          {translatedContent ? (
            <span className="text-cyan-300">{translatedContent.description}</span>
          ) : (
            content.description
          )}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 font-medium text-gray-300">
              <span>{allCountries.find(c => c.code === content.country_code)?.flag || '🌐'}</span>
              <span>{content.country}</span>
            </span>
          </div>
          <span>{formatDate(content.published_at)}</span>
        </div>

        {/* Source / Publisher & Action Link */}
        <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-black">
                {content.author?.charAt(0)?.toUpperCase() || 'E'}
              </span>
            </div>
            <span className="text-xs text-gray-400 font-medium truncate max-w-[130px]" title={content.author}>{content.author || 'Enfoco Wire'}</span>
          </div>
          <button 
            onClick={handleOpen}
            className="text-[11px] font-mono font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
          >
            <span>Read source</span>
            <span>↗</span>
          </button>
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="mt-2 p-2 bg-red-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-xs">{saveError}</p>
          </div>
        )}
      </div>

      {/* Portal for Language Dropdown */}
      {isLanguageOpen && createPortal(
        <div 
          className="fixed w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto"
          style={{
            top: buttonPosition.y,
            left: buttonPosition.x,
          }}
          onMouseEnter={() => setIsLanguageOpen(true)}
          onMouseLeave={() => setIsLanguageOpen(false)}
        >
          <div className="p-2">

            {/* Original Language Option */}
            <button
              onClick={() => {
                setTranslatedContent(null);
                setIsLanguageOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-2 py-1 text-left text-cyan-400 hover:bg-gray-700 rounded transition-colors text-sm border-b border-gray-700 mb-1"
            >
              <span className="text-sm">🌐</span>
              <span className="text-xs font-medium">Original Language</span>
            </button>
            
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                disabled={!translationStatus.canTranslate}
                className={`w-full flex items-center space-x-2 px-2 py-1 text-left rounded transition-colors text-sm ${
                  translationStatus.canTranslate 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="text-sm">{language.flag}</span>
                <span className="text-xs">{language.name}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};