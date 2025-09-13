export class TranslationService {
  private static readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private static readonly OPENAI_API_KEY = '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';

  static async translateText(text: string, targetLanguage: string, sourceLanguage: string = 'auto'): Promise<{ translatedText: string; error: string | null }> {
    try {
      if (!this.OPENAI_API_KEY) {
        return {
          translatedText: '',
          error: 'OpenAI API key not configured.'
        };
      }

      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${targetLanguage}. Only return the translated text, nothing else. Be accurate and natural in your translation.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          translatedText: '',
          error: `Translation failed: ${response.status} ${response.statusText}${errorData.error ? ` - ${errorData.error.message}` : ''}`
        };
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return {
          translatedText: '',
          error: 'Invalid response from OpenAI'
        };
      }

      const translatedText = data.choices[0].message.content.trim();

      if (!translatedText) {
        return {
          translatedText: '',
          error: 'No translation received from OpenAI'
        };
      }

      return {
        translatedText,
        error: null
      };
    } catch (error) {
      console.error('Translation error:', error);
      return {
        translatedText: '',
        error: `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  static async translateArticle(article: { title: string; description: string; content?: string }, targetLanguage: string): Promise<{ 
    translatedTitle: string; 
    translatedDescription: string; 
    translatedContent?: string; 
    error: string | null 
  }> {
    try {
      // Translate title
      const titleResult = await this.translateText(article.title, targetLanguage);
      if (titleResult.error) {
        return {
          translatedTitle: '',
          translatedDescription: '',
          error: titleResult.error
        };
      }

      // Translate description
      const descriptionResult = await this.translateText(article.description, targetLanguage);
      if (descriptionResult.error) {
        return {
          translatedTitle: titleResult.translatedText,
          translatedDescription: '',
          error: descriptionResult.error
        };
      }

      // Translate content if provided
      let translatedContent = '';
      if (article.content) {
        const contentResult = await this.translateText(article.content, targetLanguage);
        if (contentResult.error) {
          return {
            translatedTitle: titleResult.translatedText,
            translatedDescription: descriptionResult.translatedText,
            error: contentResult.error
          };
        }
        translatedContent = contentResult.translatedText;
      }

      return {
        translatedTitle: titleResult.translatedText,
        translatedDescription: descriptionResult.translatedText,
        translatedContent,
        error: null
      };
    } catch (error) {
      console.error('Article translation error:', error);
      return {
        translatedTitle: '',
        translatedDescription: '',
        error: `Article translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  static getSupportedLanguages(): { code: string; name: string; flag: string }[] {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
      { code: 'am', name: 'Amharic', flag: '🇪🇹' },
      { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
      { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
      { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
      { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
      { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
      { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    ];
  }
}