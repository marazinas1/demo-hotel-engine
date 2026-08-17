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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_number: string
          car_id: string
          created_at: string
          customer_address: string
          customer_email: string
          customer_id_code: string
          customer_name: string
          customer_phone: string
          date_from: string
          date_to: string
          id: string
          mileage_in: number | null
          mileage_out: number | null
          note: string | null
          pickup_location: string
          pickup_time: string
          return_location: string
          return_time: string
          source: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_number: string
          car_id: string
          created_at?: string
          customer_address?: string
          customer_email?: string
          customer_id_code?: string
          customer_name?: string
          customer_phone?: string
          date_from: string
          date_to: string
          id?: string
          mileage_in?: number | null
          mileage_out?: number | null
          note?: string | null
          pickup_location?: string
          pickup_time?: string
          return_location?: string
          return_time?: string
          source?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          booking_number?: string
          car_id?: string
          created_at?: string
          customer_address?: string
          customer_email?: string
          customer_id_code?: string
          customer_name?: string
          customer_phone?: string
          date_from?: string
          date_to?: string
          id?: string
          mileage_in?: number | null
          mileage_out?: number | null
          note?: string | null
          pickup_location?: string
          pickup_time?: string
          return_location?: string
          return_time?: string
          source?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_investments: {
        Row: {
          amount: number
          car_id: string
          category: string
          created_at: string
          id: string
          mileage_km: number | null
          note: string
          purchase_date: string
          updated_at: string
        }
        Insert: {
          amount?: number
          car_id: string
          category?: string
          created_at?: string
          id?: string
          mileage_km?: number | null
          note?: string
          purchase_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          car_id?: string
          category?: string
          created_at?: string
          id?: string
          mileage_km?: number | null
          note?: string
          purchase_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_investments_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_maintenance: {
        Row: {
          car_id: string
          created_at: string
          due_date: string | null
          due_mileage_km: number | null
          id: string
          last_done_at: string | null
          note: string
          type: string
          updated_at: string
        }
        Insert: {
          car_id: string
          created_at?: string
          due_date?: string | null
          due_mileage_km?: number | null
          id?: string
          last_done_at?: string | null
          note?: string
          type: string
          updated_at?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          due_date?: string | null
          due_mileage_km?: number | null
          id?: string
          last_done_at?: string | null
          note?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_maintenance_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          category: string
          consumption: string
          cover_image_url: string
          created_at: string
          features: Json
          fuel: string
          id: string
          image_urls: Json
          is_active: boolean
          mileage_policy: string
          name: string
          price_per_day: number
          price_tiers: Json
          seats: number
          sort_order: number
          transmission: string
          updated_at: string
          year: number
        }
        Insert: {
          category: string
          consumption?: string
          cover_image_url?: string
          created_at?: string
          features?: Json
          fuel: string
          id?: string
          image_urls?: Json
          is_active?: boolean
          mileage_policy?: string
          name: string
          price_per_day: number
          price_tiers?: Json
          seats?: number
          sort_order?: number
          transmission: string
          updated_at?: string
          year: number
        }
        Update: {
          category?: string
          consumption?: string
          cover_image_url?: string
          created_at?: string
          features?: Json
          fuel?: string
          id?: string
          image_urls?: Json
          is_active?: boolean
          mileage_policy?: string
          name?: string
          price_per_day?: number
          price_tiers?: Json
          seats?: number
          sort_order?: number
          transmission?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          car_id: string | null
          category: string
          created_at: string
          expense_date: string
          id: string
          mileage_km: number | null
          note: string
          updated_at: string
        }
        Insert: {
          amount?: number
          car_id?: string | null
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          mileage_km?: number | null
          note?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          car_id?: string | null
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          mileage_km?: number | null
          note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          country: string
          created_at: string
          id: string
          path: string
          referrer: string
          session_id: string
          user_agent: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          path?: string
          referrer?: string
          session_id?: string
          user_agent?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          path?: string
          referrer?: string
          session_id?: string
          user_agent?: string
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
      get_car_booked_dates: {
        Args: { _car_id: string }
        Returns: {
          date_from: string
          date_to: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
