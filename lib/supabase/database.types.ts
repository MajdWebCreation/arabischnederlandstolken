// Hand-written to match supabase/migrations/*.sql exactly, in the same
// shape `supabase gen types typescript` produces. Once the project is
// linked (see the final report for the exact command), regenerate this
// file from the live database so it can never drift from the real schema:
//
//   npx supabase gen types typescript --linked > lib/supabase/database.types.ts
//
// Do not hand-edit table shapes after that point - change the migrations
// and regenerate instead.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin" | "interpreter" | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "admin" | "interpreter" | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "interpreter" | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          type: string;
          name: string;
          organisation: string | null;
          email: string;
          phone: string | null;
          billing_name: string | null;
          billing_email: string | null;
          billing_address: string | null;
          kvk_number: string | null;
          vat_number: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type?: string;
          name: string;
          organisation?: string | null;
          email: string;
          phone?: string | null;
          billing_name?: string | null;
          billing_email?: string | null;
          billing_address?: string | null;
          kvk_number?: string | null;
          vat_number?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          name?: string;
          organisation?: string | null;
          email?: string;
          phone?: string | null;
          billing_name?: string | null;
          billing_email?: string | null;
          billing_address?: string | null;
          kvk_number?: string | null;
          vat_number?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interpreters: {
        Row: {
          id: string;
          user_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          city: string | null;
          active: boolean;
          sworn_interpreter: boolean;
          rbtv_number: string | null;
          rbtv_expiry_date: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          city?: string | null;
          active?: boolean;
          sworn_interpreter?: boolean;
          rbtv_number?: string | null;
          rbtv_expiry_date?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          city?: string | null;
          active?: boolean;
          sworn_interpreter?: boolean;
          rbtv_number?: string | null;
          rbtv_expiry_date?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interpreter_languages: {
        Row: {
          id: string;
          interpreter_id: string;
          language_from: string;
          language_to: string;
          sworn_for_combination: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interpreter_id: string;
          language_from: string;
          language_to: string;
          sworn_for_combination?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interpreter_id?: string;
          language_from?: string;
          language_to?: string;
          sworn_for_combination?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interpreter_languages_interpreter_id_fkey";
            columns: ["interpreter_id"];
            isOneToOne: false;
            referencedRelation: "interpreters";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          booking_number: string;
          customer_id: string;
          interpreter_id: string | null;
          source: string;
          request_type: string;
          context: string;
          language_from: string;
          language_to: string;
          language_notes: string | null;
          modality: string | null;
          requested_date: string | null;
          requested_start_time: string | null;
          expected_duration_minutes: number | null;
          actual_duration_minutes: number | null;
          location_name: string | null;
          location_address: string | null;
          customer_message: string | null;
          internal_notes: string | null;
          sworn_required: boolean;
          status: string;
          customer_price_ex_vat: number | null;
          interpreter_cost_ex_vat: number | null;
          customer_travel_fee_ex_vat: number | null;
          interpreter_travel_cost_ex_vat: number | null;
          customer_overtime_rate_ex_vat: number | null;
          interpreter_overtime_rate_ex_vat: number | null;
          vat_rate: number;
          form_language: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_number?: string;
          customer_id: string;
          interpreter_id?: string | null;
          source?: string;
          request_type: string;
          context: string;
          language_from: string;
          language_to: string;
          language_notes?: string | null;
          modality?: string | null;
          requested_date?: string | null;
          requested_start_time?: string | null;
          expected_duration_minutes?: number | null;
          actual_duration_minutes?: number | null;
          location_name?: string | null;
          location_address?: string | null;
          customer_message?: string | null;
          internal_notes?: string | null;
          sworn_required?: boolean;
          status?: string;
          customer_price_ex_vat?: number | null;
          interpreter_cost_ex_vat?: number | null;
          customer_travel_fee_ex_vat?: number | null;
          interpreter_travel_cost_ex_vat?: number | null;
          customer_overtime_rate_ex_vat?: number | null;
          interpreter_overtime_rate_ex_vat?: number | null;
          vat_rate?: number;
          form_language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_number?: string;
          customer_id?: string;
          interpreter_id?: string | null;
          source?: string;
          request_type?: string;
          context?: string;
          language_from?: string;
          language_to?: string;
          language_notes?: string | null;
          modality?: string | null;
          requested_date?: string | null;
          requested_start_time?: string | null;
          expected_duration_minutes?: number | null;
          actual_duration_minutes?: number | null;
          location_name?: string | null;
          location_address?: string | null;
          customer_message?: string | null;
          internal_notes?: string | null;
          sworn_required?: boolean;
          status?: string;
          customer_price_ex_vat?: number | null;
          interpreter_cost_ex_vat?: number | null;
          customer_travel_fee_ex_vat?: number | null;
          interpreter_travel_cost_ex_vat?: number | null;
          customer_overtime_rate_ex_vat?: number | null;
          interpreter_overtime_rate_ex_vat?: number | null;
          vat_rate?: number;
          form_language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_interpreter_id_fkey";
            columns: ["interpreter_id"];
            isOneToOne: false;
            referencedRelation: "interpreters";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_events: {
        Row: {
          id: string;
          booking_id: string;
          event_type: string;
          description: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          event_type: string;
          description?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          event_type?: string;
          description?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_number_counters: {
        Row: {
          year: number;
          last_value: number;
        };
        Insert: {
          year: number;
          last_value?: number;
        };
        Update: {
          year?: number;
          last_value?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      booking_admin_rows: {
        Row: {
          id: string;
          booking_number: string;
          status: string;
          source: string;
          request_type: string;
          context: string;
          language_from: string;
          language_to: string;
          modality: string | null;
          sworn_required: boolean;
          requested_date: string | null;
          requested_start_time: string | null;
          customer_price_ex_vat: number | null;
          interpreter_cost_ex_vat: number | null;
          customer_travel_fee_ex_vat: number | null;
          interpreter_travel_cost_ex_vat: number | null;
          created_at: string;
          customer_id: string;
          customer_name: string;
          customer_organisation: string | null;
          customer_email: string;
          interpreter_id: string | null;
          interpreter_first_name: string | null;
          interpreter_last_name: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      submit_website_booking_request: {
        Args: {
          p_name: string;
          p_email: string;
          p_phone: string | null;
          p_organisation: string | null;
          p_request_type: string;
          p_context: string;
          p_language_from: string;
          p_language_to: string;
          p_language_notes: string | null;
          p_modality: string | null;
          p_desired_date_time_text: string | null;
          p_message: string | null;
          p_form_language: string | null;
        };
        Returns: {
          booking_id: string;
          booking_number: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

export type Functions<T extends keyof PublicSchema["Functions"]> =
  PublicSchema["Functions"][T];
