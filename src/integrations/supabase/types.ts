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
      invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          inviter_id: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email: string
          inviter_id: string
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string
          inviter_id?: string
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
          avatar_url: string | null
          co_parent_id: string | null
          created_at: string
          email: string | null
          free_premium_access: boolean
          full_name: string | null
          id: string
          notification_preferences: Json | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_reason?: string | null
          avatar_url?: string | null
          co_parent_id?: string | null
          created_at?: string
          email?: string | null
          free_premium_access?: boolean
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_reason?: string | null
          avatar_url?: string | null
          co_parent_id?: string | null
          created_at?: string
          email?: string | null
          free_premium_access?: boolean
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
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
      create_child_with_link: {
        Args: { _date_of_birth?: string; _name: string }
        Returns: Json
      }
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
