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
      booking_assignments: {
        Row: {
          admin_notes: string | null
          assignment_type: string
          booking_id: string
          created_at: string
          expires_at: string | null
          id: string
          interpreter_id: string
          invited_at: string | null
          message_to_interpreter: string | null
          offered_compensation_ex_vat: number
          offered_travel_compensation_ex_vat: number | null
          responded_at: string | null
          status: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          assignment_type: string
          booking_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          interpreter_id: string
          invited_at?: string | null
          message_to_interpreter?: string | null
          offered_compensation_ex_vat: number
          offered_travel_compensation_ex_vat?: number | null
          responded_at?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          assignment_type?: string
          booking_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          interpreter_id?: string
          invited_at?: string | null
          message_to_interpreter?: string | null
          offered_compensation_ex_vat?: number
          offered_travel_compensation_ex_vat?: number | null
          responded_at?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "booking_assignments_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreters"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_events: {
        Row: {
          booking_id: string
          created_at: string
          created_by: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json
        }
        Insert: {
          booking_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          booking_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      booking_number_counters: {
        Row: {
          last_value: number
          year: number
        }
        Insert: {
          last_value?: number
          year: number
        }
        Update: {
          last_value?: number
          year?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          actual_duration_minutes: number | null
          booking_number: string
          context: string
          created_at: string
          customer_accepted_at: string | null
          customer_accepted_by_user_id: string | null
          customer_id: string
          customer_message: string | null
          customer_offer_snapshot: Json | null
          customer_overtime_rate_ex_vat: number | null
          customer_price_ex_vat: number | null
          customer_travel_fee_ex_vat: number | null
          early_performance_consent_at: string | null
          early_performance_consent_by_user_id: string | null
          early_performance_full_completion_ack_at: string | null
          expected_duration_minutes: number | null
          form_language: string | null
          id: string
          internal_notes: string | null
          interpreter_brief: string | null
          interpreter_cost_ex_vat: number | null
          interpreter_id: string | null
          interpreter_overtime_rate_ex_vat: number | null
          interpreter_travel_cost_ex_vat: number | null
          is_open_assignment: boolean
          language_from: string
          language_notes: string | null
          language_to: string
          location_address: string | null
          location_name: string | null
          modality: string | null
          onsite_contact_name: string | null
          onsite_contact_phone: string | null
          open_assignment_published_at: string | null
          repeated_from_booking_id: string | null
          request_type: string
          request_withdrawal_reason: string | null
          request_withdrawn_at: string | null
          request_withdrawn_by_user_id: string | null
          requested_date: string | null
          requested_start_time: string | null
          required_dialect_tag_id: string | null
          source: string
          status: string
          sworn_required: boolean
          terms_accepted_at: string | null
          terms_accepted_by_user_id: string | null
          terms_version: string | null
          updated_at: string
          vat_rate: number
        }
        Insert: {
          actual_duration_minutes?: number | null
          booking_number: string
          context: string
          created_at?: string
          customer_accepted_at?: string | null
          customer_accepted_by_user_id?: string | null
          customer_id: string
          customer_message?: string | null
          customer_offer_snapshot?: Json | null
          customer_overtime_rate_ex_vat?: number | null
          customer_price_ex_vat?: number | null
          customer_travel_fee_ex_vat?: number | null
          early_performance_consent_at?: string | null
          early_performance_consent_by_user_id?: string | null
          early_performance_full_completion_ack_at?: string | null
          expected_duration_minutes?: number | null
          form_language?: string | null
          id?: string
          internal_notes?: string | null
          interpreter_brief?: string | null
          interpreter_cost_ex_vat?: number | null
          interpreter_id?: string | null
          interpreter_overtime_rate_ex_vat?: number | null
          interpreter_travel_cost_ex_vat?: number | null
          is_open_assignment?: boolean
          language_from: string
          language_notes?: string | null
          language_to: string
          location_address?: string | null
          location_name?: string | null
          modality?: string | null
          onsite_contact_name?: string | null
          onsite_contact_phone?: string | null
          open_assignment_published_at?: string | null
          repeated_from_booking_id?: string | null
          request_type: string
          request_withdrawal_reason?: string | null
          request_withdrawn_at?: string | null
          request_withdrawn_by_user_id?: string | null
          requested_date?: string | null
          requested_start_time?: string | null
          required_dialect_tag_id?: string | null
          source?: string
          status?: string
          sworn_required?: boolean
          terms_accepted_at?: string | null
          terms_accepted_by_user_id?: string | null
          terms_version?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          actual_duration_minutes?: number | null
          booking_number?: string
          context?: string
          created_at?: string
          customer_accepted_at?: string | null
          customer_accepted_by_user_id?: string | null
          customer_id?: string
          customer_message?: string | null
          customer_offer_snapshot?: Json | null
          customer_overtime_rate_ex_vat?: number | null
          customer_price_ex_vat?: number | null
          customer_travel_fee_ex_vat?: number | null
          early_performance_consent_at?: string | null
          early_performance_consent_by_user_id?: string | null
          early_performance_full_completion_ack_at?: string | null
          expected_duration_minutes?: number | null
          form_language?: string | null
          id?: string
          internal_notes?: string | null
          interpreter_brief?: string | null
          interpreter_cost_ex_vat?: number | null
          interpreter_id?: string | null
          interpreter_overtime_rate_ex_vat?: number | null
          interpreter_travel_cost_ex_vat?: number | null
          is_open_assignment?: boolean
          language_from?: string
          language_notes?: string | null
          language_to?: string
          location_address?: string | null
          location_name?: string | null
          modality?: string | null
          onsite_contact_name?: string | null
          onsite_contact_phone?: string | null
          open_assignment_published_at?: string | null
          repeated_from_booking_id?: string | null
          request_type?: string
          request_withdrawal_reason?: string | null
          request_withdrawn_at?: string | null
          request_withdrawn_by_user_id?: string | null
          requested_date?: string | null
          requested_start_time?: string | null
          required_dialect_tag_id?: string | null
          source?: string
          status?: string
          sworn_required?: boolean
          terms_accepted_at?: string | null
          terms_accepted_by_user_id?: string | null
          terms_version?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_repeated_from_booking_id_fkey"
            columns: ["repeated_from_booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_repeated_from_booking_id_fkey"
            columns: ["repeated_from_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_repeated_from_booking_id_fkey"
            columns: ["repeated_from_booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "bookings_repeated_from_booking_id_fkey"
            columns: ["repeated_from_booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "bookings_required_dialect_tag_id_fkey"
            columns: ["required_dialect_tag_id"]
            isOneToOne: false
            referencedRelation: "capability_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          address_line: string
          city: string
          company_name: string
          country: string
          created_at: string
          email: string | null
          footer_text: string | null
          iban: string
          id: string
          invoice_prefix: string
          kvk_number: string
          payment_term_days: number
          postal_code: string
          updated_at: string
          vat_id: string
          website: string
        }
        Insert: {
          address_line: string
          city: string
          company_name: string
          country?: string
          created_at?: string
          email?: string | null
          footer_text?: string | null
          iban: string
          id?: string
          invoice_prefix?: string
          kvk_number: string
          payment_term_days?: number
          postal_code: string
          updated_at?: string
          vat_id: string
          website: string
        }
        Update: {
          address_line?: string
          city?: string
          company_name?: string
          country?: string
          created_at?: string
          email?: string | null
          footer_text?: string | null
          iban?: string
          id?: string
          invoice_prefix?: string
          kvk_number?: string
          payment_term_days?: number
          postal_code?: string
          updated_at?: string
          vat_id?: string
          website?: string
        }
        Relationships: []
      }
      cancellation_requests: {
        Row: {
          admin_decision_note: string | null
          booking_id: string
          charge_amount_ex_vat: number | null
          charge_waived: boolean
          created_at: string
          id: string
          reason: string | null
          request_type: string
          requested_at: string
          requested_by_user_id: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_decision_note?: string | null
          booking_id: string
          charge_amount_ex_vat?: number | null
          charge_waived?: boolean
          created_at?: string
          id?: string
          reason?: string | null
          request_type: string
          requested_at?: string
          requested_by_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_decision_note?: string | null
          booking_id?: string
          charge_amount_ex_vat?: number | null
          charge_waived?: boolean
          created_at?: string
          id?: string
          reason?: string | null
          request_type?: string
          requested_at?: string
          requested_by_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "cancellation_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      capability_tags: {
        Row: {
          active: boolean
          category: string
          code: string
          created_at: string
          id: string
          label: string
        }
        Insert: {
          active?: boolean
          category: string
          code: string
          created_at?: string
          id?: string
          label: string
        }
        Update: {
          active?: boolean
          category?: string
          code?: string
          created_at?: string
          id?: string
          label?: string
        }
        Relationships: []
      }
      customer_portal_memberships: {
        Row: {
          active: boolean
          created_at: string
          customer_id: string
          email: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          customer_id: string
          email?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          customer_id?: string
          email?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_memberships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          auto_confirm_when_interpreter_selected: boolean
          billing_address: string | null
          billing_city: string | null
          billing_email: string | null
          billing_house_number: string | null
          billing_house_number_addition: string | null
          billing_name: string | null
          billing_postal_code: string | null
          billing_street: string | null
          created_at: string
          default_context: string | null
          default_duration_minutes: number | null
          default_language_from: string | null
          default_language_notes: string | null
          default_language_to: string | null
          default_location_address: string | null
          default_location_name: string | null
          default_modality: string | null
          default_sworn_required: boolean
          email: string
          id: string
          internal_notes: string | null
          kvk_number: string | null
          name: string
          organisation: string | null
          phone: string | null
          type: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          auto_confirm_when_interpreter_selected?: boolean
          billing_address?: string | null
          billing_city?: string | null
          billing_email?: string | null
          billing_house_number?: string | null
          billing_house_number_addition?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          billing_street?: string | null
          created_at?: string
          default_context?: string | null
          default_duration_minutes?: number | null
          default_language_from?: string | null
          default_language_notes?: string | null
          default_language_to?: string | null
          default_location_address?: string | null
          default_location_name?: string | null
          default_modality?: string | null
          default_sworn_required?: boolean
          email: string
          id?: string
          internal_notes?: string | null
          kvk_number?: string | null
          name: string
          organisation?: string | null
          phone?: string | null
          type?: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          auto_confirm_when_interpreter_selected?: boolean
          billing_address?: string | null
          billing_city?: string | null
          billing_email?: string | null
          billing_house_number?: string | null
          billing_house_number_addition?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          billing_street?: string | null
          created_at?: string
          default_context?: string | null
          default_duration_minutes?: number | null
          default_language_from?: string | null
          default_language_notes?: string | null
          default_language_to?: string | null
          default_location_address?: string | null
          default_location_name?: string | null
          default_modality?: string | null
          default_sworn_required?: boolean
          email?: string
          id?: string
          internal_notes?: string | null
          kvk_number?: string | null
          name?: string
          organisation?: string | null
          phone?: string | null
          type?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      interpreter_capabilities: {
        Row: {
          capability_tag_id: string
          created_at: string
          id: string
          interpreter_id: string
        }
        Insert: {
          capability_tag_id: string
          created_at?: string
          id?: string
          interpreter_id: string
        }
        Update: {
          capability_tag_id?: string
          created_at?: string
          id?: string
          interpreter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_capabilities_capability_tag_id_fkey"
            columns: ["capability_tag_id"]
            isOneToOne: false
            referencedRelation: "capability_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_capabilities_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreters"
            referencedColumns: ["id"]
          },
        ]
      }
      interpreter_invoice_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_type: string
          id: string
          interpreter_invoice_id: string
          metadata: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type: string
          id?: string
          interpreter_invoice_id: string
          metadata?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type?: string
          id?: string
          interpreter_invoice_id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_invoice_events_interpreter_invoice_id_fkey"
            columns: ["interpreter_invoice_id"]
            isOneToOne: false
            referencedRelation: "interpreter_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_invoice_events_interpreter_invoice_id_fkey"
            columns: ["interpreter_invoice_id"]
            isOneToOne: false
            referencedRelation: "my_interpreter_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      interpreter_invoice_items: {
        Row: {
          amount_ex_vat: number | null
          created_at: string
          description: string
          id: string
          interpreter_invoice_id: string
          quantity: number
          sort_order: number
          unit: string | null
          unit_price_ex_vat: number
          updated_at: string
        }
        Insert: {
          amount_ex_vat?: number | null
          created_at?: string
          description: string
          id?: string
          interpreter_invoice_id: string
          quantity?: number
          sort_order?: number
          unit?: string | null
          unit_price_ex_vat: number
          updated_at?: string
        }
        Update: {
          amount_ex_vat?: number | null
          created_at?: string
          description?: string
          id?: string
          interpreter_invoice_id?: string
          quantity?: number
          sort_order?: number
          unit?: string | null
          unit_price_ex_vat?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_invoice_items_interpreter_invoice_id_fkey"
            columns: ["interpreter_invoice_id"]
            isOneToOne: false
            referencedRelation: "interpreter_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_invoice_items_interpreter_invoice_id_fkey"
            columns: ["interpreter_invoice_id"]
            isOneToOne: false
            referencedRelation: "my_interpreter_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      interpreter_invoice_number_counters: {
        Row: {
          last_value: number
          year: number
        }
        Insert: {
          last_value?: number
          year: number
        }
        Update: {
          last_value?: number
          year?: number
        }
        Relationships: []
      }
      interpreter_invoices: {
        Row: {
          booking_id: string
          booking_snapshot: Json | null
          buyer_address: string | null
          buyer_kvk: string | null
          buyer_name: string | null
          buyer_vat_id: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          fiscal_note: string | null
          id: string
          interpreter_approved_at: string | null
          interpreter_approved_by: string | null
          interpreter_id: string
          invoice_number: string | null
          issued_at: string | null
          last_change_request_message: string | null
          paid_at: string | null
          paid_by: string | null
          pdf_storage_path: string | null
          self_billing_terms_version: string | null
          status: string
          subtotal_ex_vat: number
          supplier_account_holder_name: string | null
          supplier_city: string | null
          supplier_house_number: string | null
          supplier_house_number_addition: string | null
          supplier_iban: string | null
          supplier_kvk_number: string | null
          supplier_legal_name: string | null
          supplier_postal_code: string | null
          supplier_street: string | null
          supplier_trade_name: string | null
          supplier_vat_id: string | null
          total_inc_vat: number
          updated_at: string
          vat_amount: number
          vat_rate: number | null
          vat_treatment_snapshot: string | null
        }
        Insert: {
          booking_id: string
          booking_snapshot?: Json | null
          buyer_address?: string | null
          buyer_kvk?: string | null
          buyer_name?: string | null
          buyer_vat_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          fiscal_note?: string | null
          id?: string
          interpreter_approved_at?: string | null
          interpreter_approved_by?: string | null
          interpreter_id: string
          invoice_number?: string | null
          issued_at?: string | null
          last_change_request_message?: string | null
          paid_at?: string | null
          paid_by?: string | null
          pdf_storage_path?: string | null
          self_billing_terms_version?: string | null
          status?: string
          subtotal_ex_vat?: number
          supplier_account_holder_name?: string | null
          supplier_city?: string | null
          supplier_house_number?: string | null
          supplier_house_number_addition?: string | null
          supplier_iban?: string | null
          supplier_kvk_number?: string | null
          supplier_legal_name?: string | null
          supplier_postal_code?: string | null
          supplier_street?: string | null
          supplier_trade_name?: string | null
          supplier_vat_id?: string | null
          total_inc_vat?: number
          updated_at?: string
          vat_amount?: number
          vat_rate?: number | null
          vat_treatment_snapshot?: string | null
        }
        Update: {
          booking_id?: string
          booking_snapshot?: Json | null
          buyer_address?: string | null
          buyer_kvk?: string | null
          buyer_name?: string | null
          buyer_vat_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          fiscal_note?: string | null
          id?: string
          interpreter_approved_at?: string | null
          interpreter_approved_by?: string | null
          interpreter_id?: string
          invoice_number?: string | null
          issued_at?: string | null
          last_change_request_message?: string | null
          paid_at?: string | null
          paid_by?: string | null
          pdf_storage_path?: string | null
          self_billing_terms_version?: string | null
          status?: string
          subtotal_ex_vat?: number
          supplier_account_holder_name?: string | null
          supplier_city?: string | null
          supplier_house_number?: string | null
          supplier_house_number_addition?: string | null
          supplier_iban?: string | null
          supplier_kvk_number?: string | null
          supplier_legal_name?: string | null
          supplier_postal_code?: string | null
          supplier_street?: string | null
          supplier_trade_name?: string | null
          supplier_vat_id?: string | null
          total_inc_vat?: number
          updated_at?: string
          vat_amount?: number
          vat_rate?: number | null
          vat_treatment_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "interpreter_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "interpreter_invoices_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreters"
            referencedColumns: ["id"]
          },
        ]
      }
      interpreter_languages: {
        Row: {
          created_at: string
          id: string
          interpreter_id: string
          language_from: string
          language_to: string
          notes: string | null
          sworn_for_combination: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          interpreter_id: string
          language_from: string
          language_to: string
          notes?: string | null
          sworn_for_combination?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          interpreter_id?: string
          language_from?: string
          language_to?: string
          notes?: string | null
          sworn_for_combination?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_languages_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreters"
            referencedColumns: ["id"]
          },
        ]
      }
      interpreter_unavailability_reports: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          interpreter_id: string
          reason: string | null
          replacement_interpreter_id: string | null
          reported_at: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          status: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          interpreter_id: string
          reason?: string | null
          replacement_interpreter_id?: string | null
          reported_at?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          status?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          interpreter_id?: string
          reason?: string | null
          replacement_interpreter_id?: string | null
          reported_at?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_unavailability_repo_replacement_interpreter_id_fkey"
            columns: ["replacement_interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_unavailability_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_unavailability_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_unavailability_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "interpreter_unavailability_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "interpreter_unavailability_reports_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreters"
            referencedColumns: ["id"]
          },
        ]
      }
      interpreters: {
        Row: {
          account_holder_name: string | null
          active: boolean
          business_city: string | null
          business_house_number: string | null
          business_house_number_addition: string | null
          business_postal_code: string | null
          business_street: string | null
          city: string | null
          created_at: string
          email: string
          first_name: string
          iban: string | null
          id: string
          internal_notes: string | null
          kvk_number: string | null
          last_name: string
          legal_business_name: string | null
          phone: string | null
          rbtv_expiry_date: string | null
          rbtv_number: string | null
          self_billing_accepted_at: string | null
          self_billing_accepted_by: string | null
          self_billing_terms_version: string | null
          sworn_interpreter: boolean
          trade_name: string | null
          updated_at: string
          user_id: string | null
          vat_id: string | null
          vat_treatment: string | null
        }
        Insert: {
          account_holder_name?: string | null
          active?: boolean
          business_city?: string | null
          business_house_number?: string | null
          business_house_number_addition?: string | null
          business_postal_code?: string | null
          business_street?: string | null
          city?: string | null
          created_at?: string
          email: string
          first_name: string
          iban?: string | null
          id?: string
          internal_notes?: string | null
          kvk_number?: string | null
          last_name: string
          legal_business_name?: string | null
          phone?: string | null
          rbtv_expiry_date?: string | null
          rbtv_number?: string | null
          self_billing_accepted_at?: string | null
          self_billing_accepted_by?: string | null
          self_billing_terms_version?: string | null
          sworn_interpreter?: boolean
          trade_name?: string | null
          updated_at?: string
          user_id?: string | null
          vat_id?: string | null
          vat_treatment?: string | null
        }
        Update: {
          account_holder_name?: string | null
          active?: boolean
          business_city?: string | null
          business_house_number?: string | null
          business_house_number_addition?: string | null
          business_postal_code?: string | null
          business_street?: string | null
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string
          iban?: string | null
          id?: string
          internal_notes?: string | null
          kvk_number?: string | null
          last_name?: string
          legal_business_name?: string | null
          phone?: string | null
          rbtv_expiry_date?: string | null
          rbtv_number?: string | null
          self_billing_accepted_at?: string | null
          self_billing_accepted_by?: string | null
          self_billing_terms_version?: string | null
          sworn_interpreter?: boolean
          trade_name?: string | null
          updated_at?: string
          user_id?: string | null
          vat_id?: string | null
          vat_treatment?: string | null
        }
        Relationships: []
      }
      invoice_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_type: string
          id: string
          invoice_id: string
          metadata: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type: string
          id?: string
          invoice_id: string
          metadata?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type?: string
          id?: string
          invoice_id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "invoice_events_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_events_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "my_customer_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_subtotal_ex_vat: number
          line_total_inc_vat: number
          line_vat_amount: number
          position: number
          quantity: number
          unit_price_ex_vat: number
          updated_at: string
          vat_rate: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_subtotal_ex_vat?: number
          line_total_inc_vat?: number
          line_vat_amount?: number
          position?: number
          quantity?: number
          unit_price_ex_vat: number
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_subtotal_ex_vat?: number
          line_total_inc_vat?: number
          line_vat_amount?: number
          position?: number
          quantity?: number
          unit_price_ex_vat?: number
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "my_customer_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_number_counters: {
        Row: {
          last_value: number
          year: number
        }
        Insert: {
          last_value?: number
          year: number
        }
        Update: {
          last_value?: number
          year?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          booking_id: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          customer_note: string | null
          customer_snapshot: Json | null
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          mollie_payment_link_amount_cents: number | null
          mollie_payment_link_created_at: string | null
          mollie_payment_link_id: string | null
          mollie_payment_link_mode: string | null
          mollie_payment_url: string | null
          paid_at: string | null
          payment_term_days: number
          pdf_storage_path: string | null
          seller_snapshot: Json | null
          sent_at: string | null
          sent_to_email: string | null
          status: string
          subtotal_ex_vat: number
          total_inc_vat: number
          total_vat: number
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          customer_note?: string | null
          customer_snapshot?: Json | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          mollie_payment_link_amount_cents?: number | null
          mollie_payment_link_created_at?: string | null
          mollie_payment_link_id?: string | null
          mollie_payment_link_mode?: string | null
          mollie_payment_url?: string | null
          paid_at?: string | null
          payment_term_days?: number
          pdf_storage_path?: string | null
          seller_snapshot?: Json | null
          sent_at?: string | null
          sent_to_email?: string | null
          status?: string
          subtotal_ex_vat?: number
          total_inc_vat?: number
          total_vat?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          customer_note?: string | null
          customer_snapshot?: Json | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          mollie_payment_link_amount_cents?: number | null
          mollie_payment_link_created_at?: string | null
          mollie_payment_link_id?: string | null
          mollie_payment_link_mode?: string | null
          mollie_payment_url?: string | null
          paid_at?: string | null
          payment_term_days?: number
          pdf_storage_path?: string | null
          seller_snapshot?: Json | null
          sent_at?: string | null
          sent_to_email?: string | null
          status?: string
          subtotal_ex_vat?: number
          total_inc_vat?: number
          total_vat?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      booking_admin_rows: {
        Row: {
          booking_number: string | null
          context: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_organisation: string | null
          customer_price_ex_vat: number | null
          customer_travel_fee_ex_vat: number | null
          id: string | null
          interpreter_cost_ex_vat: number | null
          interpreter_first_name: string | null
          interpreter_id: string | null
          interpreter_last_name: string | null
          interpreter_travel_cost_ex_vat: number | null
          language_from: string | null
          language_to: string | null
          modality: string | null
          request_type: string | null
          requested_date: string | null
          requested_start_time: string | null
          source: string | null
          status: string | null
          sworn_required: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreters"
            referencedColumns: ["id"]
          },
        ]
      }
      my_assigned_bookings: {
        Row: {
          actual_duration_minutes: number | null
          booking_id: string | null
          booking_number: string | null
          context: string | null
          created_at: string | null
          expected_duration_minutes: number | null
          interpreter_brief: string | null
          language_from: string | null
          language_notes: string | null
          language_to: string | null
          location_address: string | null
          location_name: string | null
          modality: string | null
          my_compensation_ex_vat: number | null
          my_travel_compensation_ex_vat: number | null
          onsite_contact_name: string | null
          onsite_contact_phone: string | null
          requested_date: string | null
          requested_start_time: string | null
          status: string | null
          sworn_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          booking_id?: string | null
          booking_number?: string | null
          context?: string | null
          created_at?: string | null
          expected_duration_minutes?: number | null
          interpreter_brief?: string | null
          language_from?: string | null
          language_notes?: string | null
          language_to?: string | null
          location_address?: string | null
          location_name?: string | null
          modality?: string | null
          my_compensation_ex_vat?: number | null
          my_travel_compensation_ex_vat?: number | null
          onsite_contact_name?: string | null
          onsite_contact_phone?: string | null
          requested_date?: string | null
          requested_start_time?: string | null
          status?: string | null
          sworn_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          booking_id?: string | null
          booking_number?: string | null
          context?: string | null
          created_at?: string | null
          expected_duration_minutes?: number | null
          interpreter_brief?: string | null
          language_from?: string | null
          language_notes?: string | null
          language_to?: string | null
          location_address?: string | null
          location_name?: string | null
          modality?: string | null
          my_compensation_ex_vat?: number | null
          my_travel_compensation_ex_vat?: number | null
          onsite_contact_name?: string | null
          onsite_contact_phone?: string | null
          requested_date?: string | null
          requested_start_time?: string | null
          status?: string | null
          sworn_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      my_assignment_offers: {
        Row: {
          assignment_type: string | null
          booking_id: string | null
          booking_number: string | null
          context: string | null
          created_at: string | null
          expected_duration_minutes: number | null
          expires_at: string | null
          id: string | null
          interpreter_brief: string | null
          invited_at: string | null
          language_from: string | null
          language_notes: string | null
          language_to: string | null
          location_name: string | null
          message_to_interpreter: string | null
          modality: string | null
          offered_compensation_ex_vat: number | null
          offered_travel_compensation_ex_vat: number | null
          requested_date: string | null
          requested_start_time: string | null
          required_dialect_label: string | null
          responded_at: string | null
          status: string | null
          sworn_required: boolean | null
          viewed_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      my_customer_bookings: {
        Row: {
          actual_duration_minutes: number | null
          booking_id: string | null
          booking_number: string | null
          context: string | null
          created_at: string | null
          customer_accepted_at: string | null
          customer_id: string | null
          customer_message: string | null
          customer_overtime_rate_ex_vat: number | null
          customer_price_ex_vat: number | null
          customer_travel_fee_ex_vat: number | null
          early_performance_consent_at: string | null
          early_performance_full_completion_ack_at: string | null
          expected_duration_minutes: number | null
          interpreter_first_name: string | null
          interpreter_id: string | null
          interpreter_last_name: string | null
          interpreter_phone: string | null
          interpreter_rbtv_number: string | null
          interpreter_sworn: boolean | null
          language_from: string | null
          language_notes: string | null
          language_to: string | null
          location_address: string | null
          location_name: string | null
          modality: string | null
          repeated_from_booking_id: string | null
          request_withdrawn_at: string | null
          requested_date: string | null
          requested_start_time: string | null
          status: string | null
          sworn_required: boolean | null
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string | null
          vat_rate: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_repeated_from_booking_id_fkey"
            columns: ["repeated_from_booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_repeated_from_booking_id_fkey"
            columns: ["repeated_from_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_repeated_from_booking_id_fkey"
            columns: ["repeated_from_booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "bookings_repeated_from_booking_id_fkey"
            columns: ["repeated_from_booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      my_customer_invoices: {
        Row: {
          booking_id: string | null
          booking_number: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          due_date: string | null
          id: string | null
          invoice_date: string | null
          invoice_number: string | null
          status: string | null
          subtotal_ex_vat: number | null
          total_inc_vat: number | null
          total_vat: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      my_interpreter_invoices: {
        Row: {
          actual_duration_minutes: number | null
          booking_id: string | null
          booking_number: string | null
          booking_snapshot: Json | null
          created_at: string | null
          currency: string | null
          expected_duration_minutes: number | null
          fiscal_note: string | null
          id: string | null
          interpreter_approved_at: string | null
          invoice_number: string | null
          issued_at: string | null
          language_from: string | null
          language_to: string | null
          last_change_request_message: string | null
          modality: string | null
          paid_at: string | null
          pdf_storage_path: string | null
          requested_date: string | null
          status: string | null
          subtotal_ex_vat: number | null
          total_inc_vat: number | null
          vat_amount: number | null
          vat_rate: number | null
          vat_treatment_snapshot: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_admin_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_assigned_bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "interpreter_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "my_customer_bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
    }
    Functions: {
      admin_link_customer_account: {
        Args: { p_customer_id: string; p_email: string }
        Returns: string
      }
      admin_link_interpreter_account: {
        Args: { p_email: string; p_interpreter_id: string }
        Returns: string
      }
      admin_review_cancellation_request: {
        Args: {
          p_admin_decision_note?: string
          p_charge_amount_ex_vat?: number
          p_charge_waived?: boolean
          p_decision: string
          p_request_id: string
        }
        Returns: undefined
      }
      admin_unlink_customer_account: {
        Args: { p_membership_id: string }
        Returns: undefined
      }
      admin_unlink_interpreter_account: {
        Args: { p_interpreter_id: string }
        Returns: undefined
      }
      current_customer_ids: { Args: never; Returns: string[] }
      current_interpreter_id: { Args: never; Returns: string }
      customer_accept_booking_offer: {
        Args: {
          p_booking_id: string
          p_cancellation_terms_reference?: string
          p_early_performance_consent?: boolean
          p_early_performance_full_completion_ack?: boolean
          p_terms_version: string
        }
        Returns: undefined
      }
      customer_request_booking_change: {
        Args: { p_booking_id: string; p_message: string }
        Returns: undefined
      }
      customer_request_cancellation: {
        Args: {
          p_booking_id: string
          p_reason?: string
          p_request_type: string
        }
        Returns: string
      }
      customer_submit_booking_request: {
        Args: {
          p_context: string
          p_customer_id: string
          p_customer_message?: string
          p_expected_duration_minutes?: number
          p_language_from: string
          p_language_notes?: string
          p_language_to: string
          p_location_address?: string
          p_location_name?: string
          p_modality?: string
          p_repeated_from_booking_id?: string
          p_requested_date?: string
          p_requested_start_time?: string
          p_sworn_required?: boolean
        }
        Returns: {
          booking_id: string
          booking_number: string
        }[]
      }
      customer_withdraw_pending_request: {
        Args: { p_booking_id: string; p_reason?: string }
        Returns: undefined
      }
      get_my_issued_invoice_pdf_path: {
        Args: { p_invoice_id: string }
        Returns: {
          invoice_number: string
          pdf_storage_path: string
        }[]
      }
      interpreter_accept_self_billing_agreement: {
        Args: { p_terms_version: string }
        Returns: undefined
      }
      interpreter_approve_settlement: {
        Args: { p_invoice_id: string }
        Returns: undefined
      }
      interpreter_mark_assignment_viewed: {
        Args: { p_assignment_id: string }
        Returns: undefined
      }
      interpreter_report_unavailable: {
        Args: { p_booking_id: string; p_reason?: string }
        Returns: string
      }
      interpreter_request_settlement_change: {
        Args: { p_invoice_id: string; p_message: string }
        Returns: undefined
      }
      interpreter_respond_to_assignment: {
        Args: { p_assignment_id: string; p_response: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_my_customer_booking: {
        Args: { p_booking_id: string }
        Returns: boolean
      }
      is_my_customer_invoice_pdf: {
        Args: { p_object_name: string }
        Returns: boolean
      }
      is_my_interpreter_invoice_pdf: {
        Args: { p_object_name: string }
        Returns: boolean
      }
      issue_interpreter_invoice: {
        Args: { p_invoice_id: string }
        Returns: {
          booking_id: string
          booking_snapshot: Json | null
          buyer_address: string | null
          buyer_kvk: string | null
          buyer_name: string | null
          buyer_vat_id: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          fiscal_note: string | null
          id: string
          interpreter_approved_at: string | null
          interpreter_approved_by: string | null
          interpreter_id: string
          invoice_number: string | null
          issued_at: string | null
          last_change_request_message: string | null
          paid_at: string | null
          paid_by: string | null
          pdf_storage_path: string | null
          self_billing_terms_version: string | null
          status: string
          subtotal_ex_vat: number
          supplier_account_holder_name: string | null
          supplier_city: string | null
          supplier_house_number: string | null
          supplier_house_number_addition: string | null
          supplier_iban: string | null
          supplier_kvk_number: string | null
          supplier_legal_name: string | null
          supplier_postal_code: string | null
          supplier_street: string | null
          supplier_trade_name: string | null
          supplier_vat_id: string | null
          total_inc_vat: number
          updated_at: string
          vat_amount: number
          vat_rate: number | null
          vat_treatment_snapshot: string | null
        }
        SetofOptions: {
          from: "*"
          to: "interpreter_invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      issue_invoice: {
        Args: { p_invoice_id: string }
        Returns: {
          booking_id: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          customer_note: string | null
          customer_snapshot: Json | null
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          mollie_payment_link_amount_cents: number | null
          mollie_payment_link_created_at: string | null
          mollie_payment_link_id: string | null
          mollie_payment_link_mode: string | null
          mollie_payment_url: string | null
          paid_at: string | null
          payment_term_days: number
          pdf_storage_path: string | null
          seller_snapshot: Json | null
          sent_at: string | null
          sent_to_email: string | null
          status: string
          subtotal_ex_vat: number
          total_inc_vat: number
          total_vat: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      select_interpreter_for_booking: {
        Args: { p_assignment_id: string; p_booking_id: string }
        Returns: undefined
      }
      submit_interpreter_settlement_for_review: {
        Args: { p_invoice_id: string }
        Returns: {
          booking_id: string
          booking_snapshot: Json | null
          buyer_address: string | null
          buyer_kvk: string | null
          buyer_name: string | null
          buyer_vat_id: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          fiscal_note: string | null
          id: string
          interpreter_approved_at: string | null
          interpreter_approved_by: string | null
          interpreter_id: string
          invoice_number: string | null
          issued_at: string | null
          last_change_request_message: string | null
          paid_at: string | null
          paid_by: string | null
          pdf_storage_path: string | null
          self_billing_terms_version: string | null
          status: string
          subtotal_ex_vat: number
          supplier_account_holder_name: string | null
          supplier_city: string | null
          supplier_house_number: string | null
          supplier_house_number_addition: string | null
          supplier_iban: string | null
          supplier_kvk_number: string | null
          supplier_legal_name: string | null
          supplier_postal_code: string | null
          supplier_street: string | null
          supplier_trade_name: string | null
          supplier_vat_id: string | null
          total_inc_vat: number
          updated_at: string
          vat_amount: number
          vat_rate: number | null
          vat_treatment_snapshot: string | null
        }
        SetofOptions: {
          from: "*"
          to: "interpreter_invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_website_booking_request: {
        Args: {
          p_context: string
          p_desired_date_time_text?: string
          p_email: string
          p_form_language: string
          p_language_from: string
          p_language_notes?: string
          p_language_to: string
          p_message: string
          p_modality?: string
          p_name: string
          p_organisation?: string
          p_phone?: string
          p_request_type: string
        }
        Returns: {
          booking_id: string
          booking_number: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
