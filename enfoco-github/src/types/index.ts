export interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: 'article' | 'video' | 'book' | 'talk';
  category: string;
  country: string;
  country_code: string;
  image_url: string;
  source_url: string;
  author: string;
  published_at: string;
  is_verified: boolean;
  is_saved?: boolean;
  relevance_score?: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  countryPreference: string;
  profileImageUrl?: string;
  isVerified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface SearchFilters {
  content_type?: string;
  country?: string;
  category?: string;
  is_verified?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface AuthAction {
  type: 'SET_LOADING' | 'SET_USER' | 'SET_ERROR' | 'LOGOUT';
  payload?: any;
}

export interface SavedContent {
  id: string;
  user_id: string;
  content_id: string;
  saved_at: string;
  notes?: string;
}