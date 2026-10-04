import { supabase, isSupabaseConfigured } from '../config/supabase';

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status?: 'new' | 'read' | 'replied' | 'closed';
  created_at?: string;
  updated_at?: string;
  replied_at?: string;
  admin_notes?: string;
}

export class ContactService {
  /**
   * Submit a contact form
   */
  static async submitContactForm(data: {
    name: string;
    email: string;
    category: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; error?: string; data?: ContactSubmission }> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return { success: false, error: 'Database not configured' };
    }

    try {
      const { data: result, error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: data.name,
            email: data.email,
            category: data.category,
            subject: data.subject,
            message: data.message,
            status: 'new'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error submitting contact form:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Unexpected error submitting contact form:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Get all contact submissions (for admin use)
   */
  static async getAllSubmissions(): Promise<{ success: boolean; data?: ContactSubmission[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return { success: false, error: 'Database not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contact submissions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching contact submissions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Get submissions by status
   */
  static async getSubmissionsByStatus(status: 'new' | 'read' | 'replied' | 'closed'): Promise<{ success: boolean; data?: ContactSubmission[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return { success: false, error: 'Database not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contact submissions by status:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching contact submissions by status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Update submission status
   */
  static async updateSubmissionStatus(
    id: string, 
    status: 'new' | 'read' | 'replied' | 'closed',
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return { success: false, error: 'Database not configured' };
    }

    try {
      const updateData: any = { status };
      
      if (status === 'replied') {
        updateData.replied_at = new Date().toISOString();
      }
      
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating submission status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating submission status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Get submission statistics
   */
  static async getSubmissionStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return { success: false, error: 'Database not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('status, created_at');

      if (error) {
        console.error('Error fetching submission stats:', error);
        return { success: false, error: error.message };
      }

      const stats = {
        total: data?.length || 0,
        new: data?.filter((item: { status: string }) => item.status === 'new').length || 0,
        read: data?.filter((item: { status: string }) => item.status === 'read').length || 0,
        replied: data?.filter((item: { status: string }) => item.status === 'replied').length || 0,
        closed: data?.filter((item: { status: string }) => item.status === 'closed').length || 0,
        today: data?.filter((item: { created_at: string }) => {
          const today = new Date().toDateString();
          const itemDate = new Date(item.created_at).toDateString();
          return today === itemDate;
        }).length || 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Unexpected error fetching submission stats:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }
}
