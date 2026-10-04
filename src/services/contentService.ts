import { supabase, isSupabaseConfigured } from '../config/supabase';
import { ContentItem, SearchFilters } from '../types';
import { mockContent } from '../data/mockData';

export class ContentService {
  // Utility function to get mock items
  static getMockItems(): ContentItem[] {
    return mockContent.map((item: any) => ({
      id: String(item.id),
      title: item.title || 'Untitled',
      description: item.snippet || item.description || '',
      content_type: 'article',
      category: item.contentCategory || item.category || 'General',
      country: item.country || 'United States',
      country_code: this.getCountryCode(item.country || 'United States'),
      image_url: item.imageUrl || item.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400',
      source_url: item.link || item.source_url || '#',
      author: item.source || item.author || 'Enfoco Verified',
      published_at: item.publishDate || item.published_at || new Date().toISOString(),
      is_verified: item.verified || false,
      relevance_score: item.relevance_score || 95,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  private static hfCache: ContentItem[] | null = null;
  private static pendingPromise: Promise<ContentItem[]> | null = null;

  // Fetch live articles from Hugging Face dataset with instant cache & fast timeout
  static async getHfItems(): Promise<ContentItem[]> {
    if (this.hfCache && this.hfCache.length > 0) return this.hfCache;

    // Check sessionStorage for instant reload
    try {
      const stored = sessionStorage.getItem('enfoco_live_articles');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.hfCache = parsed;
          return this.hfCache;
        }
      }
    } catch (e) {
      // ignore
    }

    if (this.pendingPromise) return this.pendingPromise;

    this.pendingPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000); // 4-second max timeout

        const res = await fetch('https://huggingface.co/datasets/jmsgrea/enfoco-news/raw/main/latest_news.json', {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            this.hfCache = json.map(item => this.transformScrapedContent(item));
            try {
              sessionStorage.setItem('enfoco_live_articles', JSON.stringify(this.hfCache.slice(0, 200)));
            } catch (e) {}
            return this.hfCache;
          }
        }
      } catch (e) {
        console.warn('Live fetch timed out or offline, displaying instant local data');
      }
      return this.getMockItems();
    })();

    const result = await this.pendingPromise;
    this.pendingPromise = null;
    return result;
  }

  // Transform scraped_content to match ContentItem interface
  private static transformScrapedContent(item: any): ContentItem {
    return {
      id: String(item.id || item.link || Math.random()),
      title: item.title || 'Untitled',
      description: item.snippet || 'No description available',
      content_type: item.content_type || 'article',
      category: item.category || 'General',
      country: item.country || 'Unknown',
      country_code: this.getCountryCode(item.country), // Convert country name to code
      image_url: item.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400',
      source_url: item.link || '#',
      author: item.source || 'Unknown Author',
      published_at: item.publish_date || item.created_at || new Date().toISOString(),
      is_verified: item.verified || false,
      relevance_score: item.relevance_score || 0,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Helper function to convert country name to country code
  private static getCountryCode(countryName: string): string {
    const countryMap: { [key: string]: string } = {
      'Nigeria': 'NG',
      'Rwanda': 'RW',
      'Kenya': 'KE',
      'Uganda': 'UG',
      'Tanzania': 'TZ',
      'Ghana': 'GH',
      'South Africa': 'ZA',
      'Ethiopia': 'ET',
      'Vietnam': 'VN',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'France': 'FR',
      'Canada': 'CA',
      'Australia': 'AU',
      'Japan': 'JP',
      'China': 'CN',
      'India': 'IN',
      'Brazil': 'BR',
      'Mexico': 'MX',
      'Argentina': 'AR',
    };
    return countryMap[countryName] || 'XX';
  }
  static async getContent(filters: SearchFilters = {}, limit: number = 20, offset: number = 0): Promise<ContentItem[]> {
    try {
      if (isSupabaseConfigured()) {
        let query = supabase
          .from('scraped_content')
          .select('id, title, snippet, link, image_url, source, country, category, verified, content_type, publish_date, created_at, relevance_score, mentioned');

        if (filters.country) {
          query = query.eq('country', filters.country);
        }

        if (filters.category) {
          query = query.eq('category', filters.category);
        }

        if (filters.is_verified !== undefined) {
          query = query.eq('verified', filters.is_verified);
        }

        if (filters.content_type) {
          query = query.eq('content_type', filters.content_type);
        }

        query = query.order('relevance_score', { ascending: false, nullsFirst: false })
                     .order('publish_date', { ascending: false, nullsFirst: false })
                     .order('created_at', { ascending: false })
                     .range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          return data.map(item => ContentService.transformScrapedContent(item));
        }
      }

      // Fallback to live Hugging Face dataset (or mock)
      let items = await this.getHfItems();
      if (filters.country) items = items.filter(i => i.country.toLowerCase() === filters.country!.toLowerCase());
      if (filters.category) items = items.filter(i => i.category.toLowerCase() === filters.category!.toLowerCase());
      if (filters.is_verified !== undefined) items = items.filter(i => i.is_verified === filters.is_verified);
      return items.slice(offset, offset + limit);
    } catch (error) {
      console.warn('Error fetching content, using fallback:', error);
      return (await this.getHfItems()).slice(offset, offset + limit);
    }
  }

  // Get content for Global Stream (country + mentioned filtering)
  static async getGlobalStreamContent(countryName: string, limit: number = 20, offset: number = 0): Promise<ContentItem[]> {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('scraped_content')
          .select('id, title, snippet, link, image_url, source, country, category, verified, content_type, publish_date, created_at, relevance_score, mentioned')
          .or(`country.eq.${countryName},mentioned.cs.{${countryName}}`)
          .order('relevance_score', { ascending: false, nullsFirst: false })
          .order('publish_date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (!error && data && data.length > 0) {
          return data.map(item => ContentService.transformScrapedContent(item));
        }
      }

      const items = await this.getHfItems();
      const filtered = items.filter(i => i.country.toLowerCase() === countryName.toLowerCase());
      return (filtered.length > 0 ? filtered : items).slice(offset, offset + limit);
    } catch (error) {
      console.warn('Error fetching global stream content, using fallback:', error);
      return (await this.getHfItems()).slice(offset, offset + limit);
    }
  }

  // Get unique categories from database
  static async getCategories(): Promise<string[]> {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('scraped_content')
          .select('category')
          .not('category', 'is', null);

        if (!error && data && data.length > 0) {
          const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
          return uniqueCategories.sort();
        }
      }

      const mock = this.getMockItems();
      const unique = Array.from(new Set(mock.map(i => i.category)));
      return unique.length > 0 ? unique.sort() : ['Business', 'Technology', 'Politics', 'Health', 'Sports', 'Entertainment'];
    } catch (error) {
      return ['Business', 'Technology', 'Politics', 'Health', 'Sports', 'Entertainment'];
    }
  }

  // Get content for Explore section with country diversity
  static async getExploreContent(limit: number = 50): Promise<{ [category: string]: ContentItem[] }> {
    try {
      let transformedContent: ContentItem[] = [];

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('scraped_content')
          .select('id, title, snippet, link, image_url, source, country, category, verified, content_type, publish_date, created_at, relevance_score')
          .order('relevance_score', { ascending: false, nullsFirst: false })
          .order('publish_date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(limit * 10);

        if (!error && data && data.length > 0) {
          transformedContent = data.map(item => ContentService.transformScrapedContent(item));
        }
      }

      if (transformedContent.length === 0) {
        transformedContent = this.getMockItems();
      }
      
      // Group by category and ensure country diversity
      const categoryContent: { [category: string]: ContentItem[] } = {};
      const usedContentIds = new Set<string>();

      // First pass: get the highest relevance content for each category
      for (const item of transformedContent) {
        if (usedContentIds.has(item.id)) continue;
        
        const cat = item.category || 'General';
        if (!categoryContent[cat]) {
          categoryContent[cat] = [];
        }
        
        if (categoryContent[cat].length < limit) {
          categoryContent[cat].push(item);
          usedContentIds.add(item.id);
        }
      }

      return categoryContent;
    } catch (error) {
      console.warn('Error fetching explore content, using mock:', error);
      const mock = this.getMockItems();
      const categoryContent: { [category: string]: ContentItem[] } = {};
      mock.forEach(item => {
        const cat = item.category || 'General';
        if (!categoryContent[cat]) categoryContent[cat] = [];
        categoryContent[cat].push(item);
      });
      return categoryContent;
    }
  }

  static async getSavedContent(userId: string): Promise<ContentItem[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('saved_content')
  private static SAVED_KEY = 'enfoco_saved_briefings';

  static getSavedContentSync(): ContentItem[] {
    try {
      const data = localStorage.getItem(this.SAVED_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  }

  static async getSavedContent(userId?: string): Promise<ContentItem[]> {
    const localSaved = this.getSavedContentSync();
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('saved_content')
          .select('*, content:content_id (*)')
          .eq('user_id', userId)
          .order('saved_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const remote = data
            .map(item => item.content ? { ...ContentService.transformScrapedContent(item.content), is_saved: true } : null)
            .filter(Boolean) as ContentItem[];

          const map = new Map<string, ContentItem>();
          remote.forEach(r => map.set(r.id, r));
          localSaved.forEach(l => map.set(l.id, l));
          return Array.from(map.values());
        }
      } catch (error) {
        console.error('Error fetching saved content from Supabase:', error);
      }
    }
    return localSaved;
  }

  static async isContentSaved(userId: string, contentId: string): Promise<boolean> {
    const local = this.getSavedContentSync();
    return local.some(item => item.id === contentId || item.source_url === contentId);
  }

  static async saveContent(userId: string, contentId: string, notes?: string, fullItem?: ContentItem): Promise<{ error: any }> {
    try {
      const saved = this.getSavedContentSync();
      if (!saved.some(item => item.id === contentId)) {
        let itemToSave = fullItem;
        if (!itemToSave && this.hfCache) {
          itemToSave = this.hfCache.find(c => c.id === contentId);
        }
        if (itemToSave) {
          saved.unshift({ ...itemToSave, is_saved: true });
          try {
            localStorage.setItem(this.SAVED_KEY, JSON.stringify(saved));
          } catch (e) {
            console.warn('LocalStorage save limit reached:', e);
          }
        }
      }

      if (isSupabaseConfigured()) {
        await supabase
          .from('saved_content')
          .insert([{ user_id: userId, content_id: contentId, notes, saved_at: new Date().toISOString() }]);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  static async unsaveContent(userId: string, contentId: string): Promise<{ error: any }> {
    try {
      let saved = this.getSavedContentSync();
      saved = saved.filter(item => item.id !== contentId && item.source_url !== contentId);
      try {
        localStorage.setItem(this.SAVED_KEY, JSON.stringify(saved));
      } catch (e) {}

      if (isSupabaseConfigured()) {
        await supabase
          .from('saved_content')
          .delete()
          .eq('user_id', userId)
          .eq('content_id', contentId);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Search content across live dataset
  static async searchContent(query: string, filters: SearchFilters = {}, limit: number = 20, offset: number = 0): Promise<ContentItem[]> {
    const q = query.toLowerCase().trim();
    const items = await this.getHfItems();
    const filtered = items.filter(item => {
      const matchQuery = !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.country.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchCountry = !filters.country || item.country.toLowerCase() === filters.country.toLowerCase();
      const matchCategory = !filters.category || item.category.toLowerCase() === filters.category.toLowerCase();
      const matchVerified = filters.is_verified === undefined || item.is_verified === filters.is_verified;

      return matchQuery && matchCountry && matchCategory && matchVerified;
    });

    return filtered.slice(offset, offset + limit);
  }

  // Search content for Global Stream (country + mentioned filtering)
  static async searchGlobalStreamContent(query: string, countryName: string, limit: number = 20, offset: number = 0): Promise<ContentItem[]> {
    const q = query.toLowerCase().trim();
    const items = await this.getHfItems();
    const cName = countryName.toLowerCase();

    const filtered = items.filter(item => {
      const matchQuery = !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      const matchCountry = item.country.toLowerCase() === cName ||
        item.description.toLowerCase().includes(cName);

      return matchQuery && matchCountry;
    });

    return filtered.slice(offset, offset + limit);
  }

      if (filters.is_verified !== undefined) {
        searchQuery = searchQuery.eq('verified', filters.is_verified);
      }

      if (filters.content_type) {
        searchQuery = searchQuery.eq('content_type', filters.content_type);
      }

      const { data, error } = await searchQuery;

      if (error) {
        console.error('Error searching content:', error);
        return [];
      }

      console.log('Search results:', data?.length || 0, 'items found');
      return (data || []).map(item => ContentService.transformScrapedContent(item));
    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  }

}