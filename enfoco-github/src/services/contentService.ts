import { supabase, isSupabaseConfigured } from '../config/supabase';
import { ContentItem, SearchFilters } from '../types';

export class ContentService {
  // Transform scraped_content to match ContentItem interface
  private static transformScrapedContent(item: any): ContentItem {
    return {
      id: item.id,
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
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return [];
    }

    try {
      // First, try to get content from user's country
      let query = supabase
        .from('scraped_content')
        .select('id, title, snippet, link, image_url, source, country, category, verified, content_type, publish_date, created_at, relevance_score, mentioned');

      // Apply filters based on actual columns
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

      // Order by relevance_score first, then publish_date, then created_at
      query = query.order('relevance_score', { ascending: false, nullsFirst: false })
                   .order('publish_date', { ascending: false, nullsFirst: false })
                   .order('created_at', { ascending: false })
                   .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching content:', error);
        return [];
      }

      // Return the filtered content (empty array if no results)
      return (data || []).map(item => ContentService.transformScrapedContent(item));
    } catch (error) {
      console.error('Error fetching content:', error);
      return [];
    }
  }

  // Get content for Global Stream (country + mentioned filtering)
  static async getGlobalStreamContent(countryName: string, limit: number = 20, offset: number = 0): Promise<ContentItem[]> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return [];
    }

    try {
      // Get content from the specified country OR content that mentions the country
      const { data, error } = await supabase
        .from('scraped_content')
        .select('id, title, snippet, link, image_url, source, country, category, verified, content_type, publish_date, created_at, relevance_score, mentioned')
        .or(`country.eq.${countryName},mentioned.cs.{${countryName}}`)
        .order('relevance_score', { ascending: false, nullsFirst: false })
        .order('publish_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching global stream content:', error);
        return [];
      }

      return (data || []).map(item => ContentService.transformScrapedContent(item));
    } catch (error) {
      console.error('Error fetching global stream content:', error);
      return [];
    }
  }

  // Get unique categories from database
  static async getCategories(): Promise<string[]> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('scraped_content')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      // Get unique categories and sort them
      const uniqueCategories = Array.from(new Set((data || []).map(item => item.category)));
      return uniqueCategories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get content for Explore section with country diversity
  static async getExploreContent(limit: number = 50): Promise<{ [category: string]: ContentItem[] }> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return {};
    }

    try {
      // Get all content ordered by relevance_score
      const { data, error } = await supabase
        .from('scraped_content')
        .select('id, title, snippet, link, image_url, source, country, category, verified, content_type, publish_date, created_at, relevance_score')
        .order('relevance_score', { ascending: false, nullsFirst: false })
        .order('publish_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit * 10); // Get more to ensure we have enough for diversity

      if (error) {
        console.error('Error fetching explore content:', error);
        return {};
      }

      const transformedContent = (data || []).map(item => ContentService.transformScrapedContent(item));
      
      // Group by category and ensure country diversity
      const categoryContent: { [category: string]: ContentItem[] } = {};
      const usedContentIds = new Set<string>();

      // First pass: get the highest relevance content for each category
      for (const item of transformedContent) {
        if (usedContentIds.has(item.id)) continue;
        
        if (!categoryContent[item.category]) {
          categoryContent[item.category] = [];
        }
        
        if (categoryContent[item.category].length < limit) {
          categoryContent[item.category].push(item);
          usedContentIds.add(item.id);
        }
      }

      // Second pass: fill remaining slots ensuring country diversity
      for (const category in categoryContent) {
        const categoryItems = categoryContent[category];
        const usedCountries = new Set(categoryItems.map(item => item.country));
        
        for (const item of transformedContent) {
          if (usedContentIds.has(item.id)) continue;
          if (item.category !== category) continue;
          if (categoryItems.length >= limit) break;
          
          // Only add if it's from a different country
          if (!usedCountries.has(item.country)) {
            categoryItems.push(item);
            usedContentIds.add(item.id);
            usedCountries.add(item.country);
          }
        }
      }

      return categoryContent;
    } catch (error) {
      console.error('Error fetching explore content:', error);
      return {};
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