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
        .select(`
          *,
          content:content_id (*)
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved content:', error);
        return [];
      }

      return data?.map(item => {
        if (item.content) {
          return { ...item.content, is_saved: true };
        }
        return null;
      }).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching saved content:', error);
      return [];
    }
  }

  static async isContentSaved(userId: string, contentId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('saved_content')
        .select('id')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking saved content:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking saved content:', error);
      return false;
    }
  }

  // Search content for Global Stream (country + mentioned filtering)
  static async searchGlobalStreamContent(query: string, countryName: string, limit: number = 20, offset: number = 0): Promise<ContentItem[]> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return [];
    }

    console.log('Searching Global Stream for:', query, 'in country:', countryName);

    try {
      const { data, error } = await supabase
        .from('scraped_content')
        .select('id, title, snippet, link, image_url, source, country, category, verified, content_type, publish_date, created_at, relevance_score, mentioned')
        .or(`title.ilike.%${query}%,snippet.ilike.%${query}%`)
        .or(`country.eq.${countryName},mentioned.cs.{${countryName}}`)
        .order('relevance_score', { ascending: false, nullsFirst: false })
        .order('publish_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error searching global stream content:', error);
        return [];
      }

      return (data || []).map(item => ContentService.transformScrapedContent(item));
    } catch (error) {
      console.error('Error searching global stream content:', error);
      return [];
    }
  }

  static async saveContent(userId: string, contentId: string, notes?: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    try {
      // First check if content is already saved
      const { data: existing, error: checkError } = await supabase
        .from('saved_content')
        .select('id')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { error: checkError };
      }

      if (existing) {
        // Content is already saved, return success
        return { error: null };
      }

      // Insert new saved content
      const { error } = await supabase
        .from('saved_content')
        .insert([
          {
            user_id: userId,
            content_id: contentId,
            notes,
            saved_at: new Date().toISOString(),
          },
        ]);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async unsaveContent(userId: string, contentId: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('saved_content')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async searchContent(query: string, filters: SearchFilters = {}, limit: number = 20, offset: number = 0): Promise<ContentItem[]> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return [];
    }

    console.log('Searching for:', query, 'with filters:', filters);

    try {
      let searchQuery = supabase
        .from('scraped_content')
        .select('id, title, snippet, link, image_url, source, country, category, verified, content_type, publish_date, created_at, relevance_score, mentioned')
        .or(`title.ilike.%${query}%,snippet.ilike.%${query}%`)
        .order('relevance_score', { ascending: false, nullsFirst: false })
        .order('publish_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.country) {
        searchQuery = searchQuery.eq('country', filters.country);
      }

      if (filters.category) {
        searchQuery = searchQuery.eq('category', filters.category);
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