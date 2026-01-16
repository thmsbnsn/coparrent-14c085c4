export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_audit_logs: {
        Row: {
          action: string
          activity_id: string | null
          created_at: string
          details: Json | null
          event_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          activity_id?: string | null
          created_at?: string
          details?: Json | null
          event_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          activity_id?: string | null
          created_at?: string
          details?: Json | null
          event_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_audit_logs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "child_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_audit_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "activity_events"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_events: {
        Row: {
          activity_id: string
          created_at: string
          created_by: string
          dropoff_parent_id: string | null
          end_time: string | null
          equipment_needed: Json | null
          event_date: string
          event_type: string
          id: string
          is_cancelled: boolean
          location_address: string | null
          location_name: string | null
          notes: string | null
          pickup_parent_id: string | null
          start_time: string
          title: string
          updated_at: string
          venue_notes: string | null
        }
        Insert: {
          activity_id: string
          created_at?: string
          created_by: string
          dropoff_parent_id?: string | null
          end_time?: string | null
          equipment_needed?: Json | null
          event_date: string
          event_type: string
          id?: string
          is_cancelled?: boolean
          location_address?: string | null
          location_name?: string | null
          notes?: string | null
          pickup_parent_id?: string | null
          start_time: string
          title: string
          updated_at?: string
          venue_notes?: string | null
        }
        Update: {
          activity_id?: string
          created_at?: string
          created_by?: string
          dropoff_parent_id?: string | null
          end_time?: string | null
          equipment_needed?: Json | null
          event_date?: string
          event_type?: string
          id?: string
          is_cancelled?: boolean
          location_address?: string | null
          location_name?: string | null
          notes?: string | null
          pickup_parent_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          venue_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "child_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_dropoff_parent_id_fkey"
            columns: ["dropoff_parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_pickup_parent_id_fkey"
            columns: ["pickup_parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_daily: {
        Row: {
          created_at: string
          id: string
          request_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_count?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_profile_id: string | null
          actor_user_id: string
          after: Json | null
          before: Json | null
          child_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          family_context: Json | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          actor_user_id: string
          after?: Json | null
          before?: Json | null
          child_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          family_context?: Json | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          actor_user_id?: string
          after?: Json | null
          before?: Json | null
          child_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          family_context?: Json | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          category?: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      child_activities: {
        Row: {
          child_id: string
          coach_email: string | null
          coach_name: string | null
          coach_phone: string | null
          created_at: string
          equipment_checklist: Json | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          primary_parent_id: string
          season_end: string | null
          season_start: string | null
          sport_type: string
          team_name: string | null
          updated_at: string
        }
        Insert: {
          child_id: string
          coach_email?: string | null
          coach_name?: string | null
          coach_phone?: string | null
          created_at?: string
          equipment_checklist?: Json | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          primary_parent_id: string
          season_end?: string | null
          season_start?: string | null
          sport_type: string
          team_name?: string | null
          updated_at?: string
        }
        Update: {
          child_id?: string
          coach_email?: string | null
          coach_name?: string | null
          coach_phone?: string | null
          created_at?: string
          equipment_checklist?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          primary_parent_id?: string
          season_end?: string | null
          season_start?: string | null
          sport_type?: string
          team_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_activities_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_activities_primary_parent_id_fkey"
            columns: ["primary_parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_permissions: {
        Row: {
          allow_calendar_reminders: boolean
          allow_family_chat: boolean
          allow_mood_checkins: boolean
          allow_notes_to_parents: boolean
          allow_parent_messaging: boolean
          allow_push_notifications: boolean
          allow_sibling_messaging: boolean
          child_profile_id: string
          created_at: string
          id: string
          parent_profile_id: string
          show_full_event_details: boolean
          updated_at: string
        }
        Insert: {
          allow_calendar_reminders?: boolean
          allow_family_chat?: boolean
          allow_mood_checkins?: boolean
          allow_notes_to_parents?: boolean
          allow_parent_messaging?: boolean
          allow_push_notifications?: boolean
          allow_sibling_messaging?: boolean
          child_profile_id: string
          created_at?: string
          id?: string
          parent_profile_id: string
          show_full_event_details?: boolean
          updated_at?: string
        }
        Update: {
          allow_calendar_reminders?: boolean
          allow_family_chat?: boolean
          allow_mood_checkins?: boolean
          allow_notes_to_parents?: boolean
          allow_parent_messaging?: boolean
          allow_push_notifications?: boolean
          allow_sibling_messaging?: boolean
          child_profile_id?: string
          created_at?: string
          id?: string
          parent_profile_id?: string
          show_full_event_details?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_permissions_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_permissions_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_photos: {
        Row: {
          caption: string | null
          child_id: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          tags: string[] | null
          taken_at: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          child_id: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          tags?: string[] | null
          taken_at?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          child_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          tags?: string[] | null
          taken_at?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_photos_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          blood_type: string | null
          created_at: string
          date_of_birth: string | null
          doctor_name: string | null
          doctor_phone: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          grade: string | null
          id: string
          medical_notes: string | null
          medications: string[] | null
          name: string
          school_name: string | null
          school_phone: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          grade?: string | null
          id?: string
          medical_notes?: string | null
          medications?: string[] | null
          name: string
          school_name?: string | null
          school_phone?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          grade?: string | null
          id?: string
          medical_notes?: string | null
          medications?: string[] | null
          name?: string
          school_name?: string | null
          school_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      custody_schedules: {
        Row: {
          child_ids: string[] | null
          created_at: string
          exchange_location: string | null
          exchange_time: string | null
          holidays: Json | null
          id: string
          parent_a_id: string
          parent_b_id: string
          pattern: string
          start_date: string
          updated_at: string
        }
        Insert: {
          child_ids?: string[] | null
          created_at?: string
          exchange_location?: string | null
          exchange_time?: string | null
          holidays?: Json | null
          id?: string
          parent_a_id: string
          parent_b_id: string
          pattern: string
          start_date: string
          updated_at?: string
        }
        Update: {
          child_ids?: string[] | null
          created_at?: string
          exchange_location?: string | null
          exchange_time?: string | null
          holidays?: Json | null
          id?: string
          parent_a_id?: string
          parent_b_id?: string
          pattern?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custody_schedules_parent_a_id_fkey"
            columns: ["parent_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custody_schedules_parent_b_id_fkey"
            columns: ["parent_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_logs: {
        Row: {
          accessed_by: string
          action: string
          created_at: string
          document_id: string
          id: string
          user_agent: string | null
        }
        Insert: {
          accessed_by: string
          action: string
          created_at?: string
          document_id: string
          id?: string
          user_agent?: string | null
        }
        Update: {
          accessed_by?: string
          action?: string
          created_at?: string
          document_id?: string
          id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          child_id: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category?: string
          child_id?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          category?: string
          child_id?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_checkins: {
        Row: {
          checked_in_at: string
          created_at: string
          exchange_date: string
          id: string
          note: string | null
          schedule_id: string | null
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          created_at?: string
          exchange_date: string
          id?: string
          note?: string | null
          schedule_id?: string | null
          user_id: string
        }
        Update: {
          checked_in_at?: string
          created_at?: string
          exchange_date?: string
          id?: string
          note?: string | null
          schedule_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_checkins_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "custody_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          child_id: string | null
          created_at: string
          created_by: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          receipt_path: string | null
          split_percentage: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string
          child_id?: string | null
          created_at?: string
          created_by: string
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          receipt_path?: string | null
          split_percentage?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          child_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          receipt_path?: string | null
          split_percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          primary_parent_id: string
          profile_id: string
          role: Database["public"]["Enums"]["member_role"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          primary_parent_id: string
          profile_id: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          primary_parent_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_primary_parent_id_fkey"
            columns: ["primary_parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      function_usage_daily: {
        Row: {
          created_at: string
          function_name: string
          id: string
          minute_count: number
          minute_window: string
          request_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          minute_count?: number
          minute_window?: string
          request_count?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          minute_count?: number
          minute_window?: string
          request_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      gift_items: {
        Row: {
          category: string | null
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          created_by: string
          gift_list_id: string
          id: string
          link: string | null
          notes: string | null
          parent_only_notes: string | null
          purchased: boolean | null
          status: string | null
          suggested_age_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          created_by: string
          gift_list_id: string
          id?: string
          link?: string | null
          notes?: string | null
          parent_only_notes?: string | null
          purchased?: boolean | null
          status?: string | null
          suggested_age_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          created_by?: string
          gift_list_id?: string
          id?: string
          link?: string | null
          notes?: string | null
          parent_only_notes?: string | null
          purchased?: boolean | null
          status?: string | null
          suggested_age_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_items_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_items_gift_list_id_fkey"
            columns: ["gift_list_id"]
            isOneToOne: false
            referencedRelation: "gift_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_lists: {
        Row: {
          allow_multiple_claims: boolean | null
          child_id: string
          created_at: string
          custom_occasion_name: string | null
          event_date: string | null
          id: string
          occasion_type: string
          primary_parent_id: string
          updated_at: string
        }
        Insert: {
          allow_multiple_claims?: boolean | null
          child_id: string
          created_at?: string
          custom_occasion_name?: string | null
          event_date?: string | null
          id?: string
          occasion_type?: string
          primary_parent_id: string
          updated_at?: string
        }
        Update: {
          allow_multiple_claims?: boolean | null
          child_id?: string
          created_at?: string
          custom_occasion_name?: string | null
          event_date?: string | null
          id?: string
          occasion_type?: string
          primary_parent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_lists_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_lists_primary_parent_id_fkey"
            columns: ["primary_parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chat_participants: {
        Row: {
          id: string
          joined_at: string
          profile_id: string
          thread_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          profile_id: string
          thread_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          profile_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_chat_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitation_type: string
          invitee_email: string
          inviter_id: string
          role: Database["public"]["Enums"]["member_role"] | null
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitation_type?: string
          invitee_email: string
          inviter_id: string
          role?: Database["public"]["Enums"]["member_role"] | null
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitation_type?: string
          invitee_email?: string
          inviter_id?: string
          role?: Database["public"]["Enums"]["member_role"] | null
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          child_id: string | null
          content: string
          created_at: string
          exchange_checkin_id: string | null
          id: string
          mood: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          child_id?: string | null
          content: string
          created_at?: string
          exchange_checkin_id?: string | null
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          child_id?: string | null
          content?: string
          created_at?: string
          exchange_checkin_id?: string | null
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_exchange_checkin_id_fkey"
            columns: ["exchange_checkin_id"]
            isOneToOne: false
            referencedRelation: "exchange_checkins"
            referencedColumns: ["id"]
          },
        ]
      }
      law_articles: {
        Row: {
          access_level: string
          article_number: string
          created_at: string
          id: string
          is_repealed: boolean
          related_slugs: string[] | null
          slug: string
          storage_path: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          article_number: string
          created_at?: string
          id?: string
          is_repealed?: boolean
          related_slugs?: string[] | null
          slug: string
          storage_path: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          article_number?: string
          created_at?: string
          id?: string
          is_repealed?: boolean
          related_slugs?: string[] | null
          slug?: string
          storage_path?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      law_library_resources: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          last_verified_at: string
          source_url: string | null
          state: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number
          file_type?: string
          id?: string
          last_verified_at?: string
          source_url?: string | null
          state: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          last_verified_at?: string
          source_url?: string | null
          state?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string
          reader_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          reader_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          reader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "thread_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_receipts_reader_id_fkey"
            columns: ["reader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          name: string | null
          participant_a_id: string | null
          participant_b_id: string | null
          primary_parent_id: string
          thread_type: Database["public"]["Enums"]["thread_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          participant_a_id?: string | null
          participant_b_id?: string | null
          primary_parent_id: string
          thread_type: Database["public"]["Enums"]["thread_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          participant_a_id?: string | null
          participant_b_id?: string | null
          primary_parent_id?: string
          thread_type?: Database["public"]["Enums"]["thread_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_participant_a_id_fkey"
            columns: ["participant_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_participant_b_id_fkey"
            columns: ["participant_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_primary_parent_id_fkey"
            columns: ["primary_parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_children: {
        Row: {
          child_id: string
          id: string
          parent_id: string
        }
        Insert: {
          child_id: string
          id?: string
          parent_id: string
        }
        Update: {
          child_id?: string
          id?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_children_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_reason: string | null
          account_role: string | null
          avatar_url: string | null
          co_parent_id: string | null
          created_at: string
          email: string | null
          free_premium_access: boolean
          full_name: string | null
          id: string
          linked_child_id: string | null
          login_enabled: boolean | null
          notification_preferences: Json | null
          preferences: Json | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_reason?: string | null
          account_role?: string | null
          avatar_url?: string | null
          co_parent_id?: string | null
          created_at?: string
          email?: string | null
          free_premium_access?: boolean
          full_name?: string | null
          id?: string
          linked_child_id?: string | null
          login_enabled?: boolean | null
          notification_preferences?: Json | null
          preferences?: Json | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_reason?: string | null
          account_role?: string | null
          avatar_url?: string | null
          co_parent_id?: string | null
          created_at?: string
          email?: string | null
          free_premium_access?: boolean
          full_name?: string | null
          id?: string
          linked_child_id?: string | null
          login_enabled?: boolean | null
          notification_preferences?: Json | null
          preferences?: Json | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_co_parent_id_fkey"
            columns: ["co_parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_linked_child_id_fkey"
            columns: ["linked_child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      reimbursement_requests: {
        Row: {
          amount: number
          created_at: string
          expense_id: string
          id: string
          message: string | null
          recipient_id: string
          requester_id: string
          responded_at: string | null
          response_message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          expense_id: string
          id?: string
          message?: string | null
          recipient_id: string
          requester_id: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_id?: string
          id?: string
          message?: string | null
          recipient_id?: string
          requester_id?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recipient"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_requester"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reimbursement_requests_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_requests: {
        Row: {
          created_at: string
          id: string
          message_id: string | null
          original_date: string
          proposed_date: string | null
          reason: string | null
          recipient_id: string
          request_type: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id?: string | null
          original_date: string
          proposed_date?: string | null
          reason?: string | null
          recipient_id: string
          request_type: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string | null
          original_date?: string
          proposed_date?: string | null
          reason?: string | null
          recipient_id?: string
          request_type?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_requests_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      step_parents: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          invitation_token: string | null
          invitee_email: string | null
          other_parent_approved: boolean | null
          other_parent_id: string | null
          primary_parent_approved: boolean | null
          primary_parent_id: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invitee_email?: string | null
          other_parent_approved?: boolean | null
          other_parent_id?: string | null
          primary_parent_approved?: boolean | null
          primary_parent_id: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invitee_email?: string | null
          other_parent_approved?: boolean | null
          other_parent_id?: string | null
          primary_parent_approved?: boolean | null
          primary_parent_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "step_parents_other_parent_id_fkey"
            columns: ["other_parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_parents_primary_parent_id_fkey"
            columns: ["primary_parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          search_vector: unknown
          sender_id: string
          sender_role: Database["public"]["Enums"]["member_role"]
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          search_vector?: unknown
          sender_id: string
          sender_role: Database["public"]["Enums"]["member_role"]
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          search_vector?: unknown
          sender_id?: string
          sender_role?: Database["public"]["Enums"]["member_role"]
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          id: string
          profile_id: string
          started_at: string
          thread_id: string
        }
        Insert: {
          id?: string
          profile_id: string
          started_at?: string
          thread_id: string
        }
        Update: {
          id?: string
          profile_id?: string
          started_at?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typing_indicators_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devices: {
        Row: {
          browser: string | null
          created_at: string
          device_fingerprint: string
          device_name: string | null
          first_seen_at: string
          id: string
          ip_address: string | null
          is_trusted: boolean
          last_seen_at: string
          location: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          first_seen_at?: string
          id?: string
          ip_address?: string | null
          is_trusted?: boolean
          last_seen_at?: string
          location?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          first_seen_at?: string
          id?: string
          ip_address?: string | null
          is_trusted?: boolean
          last_seen_at?: string
          location?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_map_preferences: {
        Row: {
          created_at: string
          id: string
          preferred_map_provider: string
          remember_choice: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferred_map_provider?: string
          remember_choice?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferred_map_provider?: string
          remember_choice?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_coparent_invitation: {
        Args: { _acceptor_user_id: string; _token: string }
        Returns: Json
      }
      can_access_document: {
        Args: { _document_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_thread: {
        Args: { _thread_id: string; _user_id: string }
        Returns: boolean
      }
      count_third_party_members: {
        Args: { _primary_parent_id: string }
        Returns: number
      }
      create_child_account: {
        Args: { _child_id: string; _password: string; _username: string }
        Returns: Json
      }
      create_child_with_link: {
        Args: { _date_of_birth?: string; _name: string }
        Returns: Json
      }
      get_child_details: { Args: { p_child_id: string }; Returns: Json }
      get_child_permissions: { Args: { _user_id: string }; Returns: Json }
      get_invitation_by_token: {
        Args: { _token: string }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          inviter_email: string
          inviter_id: string
          inviter_name: string
          status: string
        }[]
      }
      get_user_co_parent_id: { Args: { user_uuid: string }; Returns: string }
      get_user_family_primary_parent: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_family_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["member_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_child_account: { Args: { _user_id: string }; Returns: boolean }
      is_family_member: {
        Args: { _primary_parent_id: string; _user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          _action: string
          _after?: Json
          _before?: Json
          _child_id?: string
          _entity_id?: string
          _entity_type: string
          _family_context?: Json
          _metadata?: Json
        }
        Returns: string
      }
      search_messages: {
        Args: { p_limit?: number; p_query: string; p_thread_id?: string }
        Returns: {
          content: string
          created_at: string
          id: string
          sender_id: string
          sender_name: string
          sender_role: string
          snippet: string
          thread_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      member_role: "parent" | "guardian" | "third_party"
      thread_type: "family_channel" | "direct_message" | "group_chat"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      member_role: ["parent", "guardian", "third_party"],
      thread_type: ["family_channel", "direct_message", "group_chat"],
    },
  },
} as const
