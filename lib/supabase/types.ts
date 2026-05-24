export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      permissions: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          created_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          granted: boolean
          granted_by: string | null
          granted_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          granted?: boolean
          granted_by?: string | null
          granted_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          granted?: boolean
          granted_by?: string | null
          granted_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          assigned_by: string | null
          assigned_at: string
          expires_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          assigned_by?: string | null
          assigned_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          assigned_by?: string | null
          assigned_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          phone: string | null
          blood_group: string | null
          date_of_birth: string | null
          address: string | null
          city: string | null
          district: string | null
          profile_image_url: string | null
          is_verified: boolean
          is_suspended: boolean
          suspension_reason: string | null
          suspended_at: string | null
          suspended_by: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          phone?: string | null
          blood_group?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          district?: string | null
          profile_image_url?: string | null
          is_verified?: boolean
          is_suspended?: boolean
          suspension_reason?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          phone?: string | null
          blood_group?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          district?: string | null
          profile_image_url?: string | null
          is_verified?: boolean
          is_suspended?: boolean
          suspension_reason?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          thumbnail_url: string | null
          author_id: string
          category: string | null
          tags: string[] | null
          is_published: boolean
          is_featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
          published_by: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          thumbnail_url?: string | null
          author_id: string
          category?: string | null
          tags?: string[] | null
          is_published?: boolean
          is_featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
          published_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          thumbnail_url?: string | null
          author_id?: string
          category?: string | null
          tags?: string[] | null
          is_published?: boolean
          is_featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
          published_by?: string | null
        }
      }
      illustrations: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string
          thumbnail_url: string | null
          category: string | null
          tags: string[] | null
          deck_order: number
          is_published: boolean
          author_id: string
          created_at: string
          updated_at: string
          published_at: string | null
          published_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url: string
          thumbnail_url?: string | null
          category?: string | null
          tags?: string[] | null
          deck_order?: number
          is_published?: boolean
          author_id: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          published_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string
          thumbnail_url?: string | null
          category?: string | null
          tags?: string[] | null
          deck_order?: number
          is_published?: boolean
          author_id?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          published_by?: string | null
        }
      }
      testimonials: {
        Row: {
          id: string
          user_id: string
          content: string
          rating: number | null
          is_approved: boolean
          is_featured: boolean
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          rating?: number | null
          is_approved?: boolean
          is_featured?: boolean
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          rating?: number | null
          is_approved?: boolean
          is_featured?: boolean
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          website_url: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          city: string | null
          district: string | null
          is_verified: boolean
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          district?: string | null
          is_verified?: boolean
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          district?: string | null
          is_verified?: boolean
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hospitals: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          city: string | null
          district: string | null
          latitude: number | null
          longitude: number | null
          is_verified: boolean
          is_active: boolean
          emergency_blood_needed: boolean
          emergency_blood_type: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          district?: string | null
          latitude?: number | null
          longitude?: number | null
          is_verified?: boolean
          is_active?: boolean
          emergency_blood_needed?: boolean
          emergency_blood_type?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          district?: string | null
          latitude?: number | null
          longitude?: number | null
          is_verified?: boolean
          is_active?: boolean
          emergency_blood_needed?: boolean
          emergency_blood_type?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          title: string
          description: string | null
          banner_url: string | null
          organization_id: string | null
          start_date: string
          end_date: string | null
          target_donations: number | null
          current_donations: number
          is_active: boolean
          is_featured: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          banner_url?: string | null
          organization_id?: string | null
          start_date: string
          end_date?: string | null
          target_donations?: number | null
          current_donations?: number
          is_active?: boolean
          is_featured?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          banner_url?: string | null
          organization_id?: string | null
          start_date?: string
          end_date?: string | null
          target_donations?: number | null
          current_donations?: number
          is_active?: boolean
          is_featured?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_has_permission: {
        Args: {
          p_user_id: string
          p_permission_name: string
        }
        Returns: boolean
      }
      user_has_role: {
        Args: {
          p_user_id: string
          p_role_name: string
        }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type?: string
          p_resource_id?: string
          p_details?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
