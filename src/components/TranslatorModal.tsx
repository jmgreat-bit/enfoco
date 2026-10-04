import React, { useState, useEffect } from 'react';
import { TranslationService } from '../services/translationService';
import { TranslationLimitService } from '../services/translationLimitService';

interface TranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TranslatorModal: React.FC<TranslatorModalProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [targetLanguage, setTargetLanguage] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [translationStatus, setTranslationStatus] = useState({
    canTranslate: true,
    remainingCount: 15,
    statusMessage: 'AI Translation Available',
    cooldownTime: undefined as string | undefined
  });

  // Update translation status when modal opens
  useEffect(() => {
    if (isOpen) {
      const status = TranslationLimitService.getTranslationStatus();
      setTranslationStatus({
        canTranslate: status.canTranslate,
        remainingCount: status.remainingCount,
        statusMessage: status.statusMessage,
        cooldownTime: status.cooldownTime
      });
    }
  }, [isOpen]);

  // Real-time countdown timer when limit is reached
  useEffect(() => {
    if (!translationStatus.canTranslate && translationStatus.cooldownTime) {
      const interval = setInterval(() => {
        const status = TranslationLimitService.getTranslationStatus();
        setTranslationStatus({
          canTranslate: status.canTranslate,
          remainingCount: status.remainingCount,
          statusMessage: status.statusMessage,
          cooldownTime: status.cooldownTime
        });
      }, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [translationStatus.canTranslate, translationStatus.cooldownTime]);

  const handleTranslate = async () => {
    if (!inputText.trim() || !targetLanguage.trim()) {
      setError('Please enter text to translate and target language.');
      return;
    }

    // Check translation limits
    const limitResult = TranslationLimitService.recordTranslation();
    if (!limitResult.success) {
      setError(limitResult.cooldownTime 
        ? `Translation limit reached. Next batch available in ${TranslationLimitService.formatCooldownTime(limitResult.cooldownTime)}`
        : 'Translation limit reached. Please try again later.'
      );
      const status = TranslationLimitService.getTranslationStatus();
      setTranslationStatus({
        canTranslate: status.canTranslate,
        remainingCount: status.remainingCount,
        statusMessage: status.statusMessage,
        cooldownTime: status.cooldownTime
      });
      return;
    }

    setIsTranslating(true);
    setError(null);
    setTranslatedText(null);

    try {
      const result = await TranslationService.translateText(
        inputText,
        targetLanguage,
        'auto'
      );

      if (result.error) {
        setError(result.error);
      } else {
        setTranslatedText(result.translatedText);
        // Update status after successful translation
        const status = TranslationLimitService.getTranslationStatus();
        setTranslationStatus({
          canTranslate: status.canTranslate,
          remainingCount: status.remainingCount,
          statusMessage: status.statusMessage,
          cooldownTime: status.cooldownTime
        });
      }
    } catch (error) {
      setError('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClose = () => {
    setTranslatedText(null);
    setInputText('');
    setTargetLanguage('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Translator</h2>
              <p className="text-sm text-gray-400">Translate content to your preferred language</p>
              {!translationStatus.canTranslate && (
                <div className="mt-2">
                  <div className={`text-xs px-3 py-1 rounded-full inline-block ${
                    translationStatus.cooldownTime 
                      ? 'bg-orange-900/50 text-orange-400' 
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {translationStatus.statusMessage}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Language Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Translate to:
            </label>
            <input
              type="text"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              placeholder="e.g., Chinese, Mandarin, Rwandan, Vietnamese, Singaporean..."
              maxLength={50}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
            <div className="text-xs text-gray-400 mt-1">
              {targetLanguage.length}/50 characters
            </div>
          </div>

          {/* Text Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Text to translate:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter the text you want to translate..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
            />
            <div className="text-xs text-gray-400 mt-1">
              {inputText.length}/500 characters
            </div>
          </div>

          {/* Translate Button */}
          <div className="mb-6">
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !translationStatus.canTranslate}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-lg font-medium hover:from-cyan-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isTranslating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Translating...</span>
                </div>
              ) : !translationStatus.canTranslate ? (
                'Translation Limit Reached'
              ) : (
                'Translate Content'
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          {/* Translated Content */}
          {translatedText && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Translation Result</h3>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <p className="text-cyan-400 text-lg">{translatedText}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
          {translatedText && (
            <button
              onClick={() => {
                // Copy translated text to clipboard
                navigator.clipboard.writeText(translatedText);
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Copy Translation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};