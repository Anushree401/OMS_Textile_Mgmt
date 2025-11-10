export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      delivery_returns: {
        Row: {
          barcode: string;
          created_at: string | null;
          handled_by: string | null;
          id: number;
          order_id: string | null;
          platform: string | null;
          product_color: string | null;
          product_description: string | null;
          product_name: string | null;
          product_size: string | null;
          return_classification: string | null;
          return_date: string | null;
          return_reason: string | null;
          sale_date: string | null;
          updated_at: string | null;
        };
        Insert: {
          barcode: string;
          created_at?: string | null;
          handled_by?: string | null;
          id?: number;
          order_id?: string | null;
          platform?: string | null;
          product_color?: string | null;
          product_description?: string | null;
          product_name?: string | null;
          product_size?: string | null;
          return_classification?: string | null;
          return_date?: string | null;
          return_reason?: string | null;
          sale_date?: string | null;
          updated_at?: string | null;
        };
        Update: {
          barcode?: string;
          created_at?: string | null;
          handled_by?: string | null;
          id?: number;
          order_id?: string | null;
          platform?: string | null;
          product_color?: string | null;
          product_description?: string | null;
          product_name?: string | null;
          product_size?: string | null;
          return_classification?: string | null;
          return_date?: string | null;
          return_reason?: string | null;
          sale_date?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      expense_logs: {
        Row: {
          changed_at: string | null;
          changed_by: string | null;
          changes: Json | null;
          expense_id: number | null;
          id: number;
        };
        Insert: {
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          expense_id?: number | null;
          id?: number;
        };
        Update: {
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          expense_id?: number | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "expense_logs_expense_id_fkey";
            columns: ["expense_id"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          amount_before_gst: number;
          cgst: string | null;
          challan_no: string | null;
          cost: number;
          created_at: string | null;
          created_by: string | null;
          expense_date: string;
          expense_for: string[];
          id: number;
          igst: string | null;
          ledger_id: string | null;
          manual_ledger_id: string | null;
          other_expense_description: string | null;
          sgst: string | null;
          updated_at: string | null;
        };
        Insert: {
          amount_before_gst: number;
          cgst?: string | null;
          challan_no?: string | null;
          cost: number;
          created_at?: string | null;
          created_by?: string | null;
          expense_date: string;
          expense_for: string[];
          id?: number;
          igst?: string | null;
          ledger_id?: string | null;
          manual_ledger_id?: string | null;
          other_expense_description?: string | null;
          sgst?: string | null;
          updated_at?: string | null;
        };
        Update: {
          amount_before_gst?: number;
          cgst?: string | null;
          challan_no?: string | null;
          cost?: number;
          created_at?: string | null;
          created_by?: string | null;
          expense_date?: string;
          expense_for?: string[];
          id?: number;
          igst?: string | null;
          ledger_id?: string | null;
          manual_ledger_id?: string | null;
          other_expense_description?: string | null;
          sgst?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_challan_no_fkey";
            columns: ["challan_no"];
            isOneToOne: false;
            referencedRelation: "isteaching_challans";
            referencedColumns: ["challan_no"];
          },
          {
            foreignKeyName: "expenses_ledger_id_fkey";
            columns: ["ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
          {
            foreignKeyName: "expenses_manual_ledger_id_fkey";
            columns: ["manual_ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
        ];
      };
      isteaching_challan_logs: {
        Row: {
          challan_id: number | null;
          changed_at: string | null;
          changed_by: string | null;
          changes: Json | null;
          id: number;
        };
        Insert: {
          challan_id?: number | null;
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          id?: number;
        };
        Update: {
          challan_id?: number | null;
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "isteaching_challan_logs_challan_id_fkey";
            columns: ["challan_id"];
            isOneToOne: false;
            referencedRelation: "isteaching_challans";
            referencedColumns: ["id"];
          },
        ];
      };
      isteaching_challans: {
        Row: {
          batch_number: string[];
          both_bottom_qty: number | null;
          both_selected: boolean | null;
          both_top_qty: number | null;
          bottom_pcs_qty: number | null;
          bottom_qty: number | null;
          brand: string | null;
          category: string | null;
          challan_no: string;
          cloth_type: string[] | null;
          created_at: string | null;
          created_by: string | null;
          date: string;
          id: number;
          inventory_classification: string | null;
          ledger_id: string | null;
          lr_number: string | null;
          made_in: string | null;
          product_color: string | null;
          product_description: string | null;
          product_image: string | null;
          product_name: string | null;
          product_qty: number | null;
          product_size: Json | null;
          product_sku: string | null;
          quality: string;
          quantity: number;
          selected_product_id: number | null;
          status: string | null;
          sub_category: string | null;
          top_pcs_qty: number | null;
          top_qty: number | null;
          transport_charge: number | null;
          transport_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          batch_number: string[];
          both_bottom_qty?: number | null;
          both_selected?: boolean | null;
          both_top_qty?: number | null;
          bottom_pcs_qty?: number | null;
          bottom_qty?: number | null;
          brand?: string | null;
          category?: string | null;
          challan_no: string;
          cloth_type?: string[] | null;
          created_at?: string | null;
          created_by?: string | null;
          date: string;
          id?: number;
          inventory_classification?: string | null;
          ledger_id?: string | null;
          lr_number?: string | null;
          made_in?: string | null;
          product_color?: string | null;
          product_description?: string | null;
          product_image?: string | null;
          product_name?: string | null;
          product_qty?: number | null;
          product_size?: Json | null;
          product_sku?: string | null;
          quality: string;
          quantity: number;
          selected_product_id?: number | null;
          status?: string | null;
          sub_category?: string | null;
          top_pcs_qty?: number | null;
          top_qty?: number | null;
          transport_charge?: number | null;
          transport_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          batch_number?: string[];
          both_bottom_qty?: number | null;
          both_selected?: boolean | null;
          both_top_qty?: number | null;
          bottom_pcs_qty?: number | null;
          bottom_qty?: number | null;
          brand?: string | null;
          category?: string | null;
          challan_no?: string;
          cloth_type?: string[] | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string;
          id?: number;
          inventory_classification?: string | null;
          ledger_id?: string | null;
          lr_number?: string | null;
          made_in?: string | null;
          product_color?: string | null;
          product_description?: string | null;
          product_image?: string | null;
          product_name?: string | null;
          product_qty?: number | null;
          product_size?: Json | null;
          product_sku?: string | null;
          quality?: string;
          quantity?: number;
          selected_product_id?: number | null;
          status?: string | null;
          sub_category?: string | null;
          top_pcs_qty?: number | null;
          top_qty?: number | null;
          transport_charge?: number | null;
          transport_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "isteaching_challans_ledger_id_fkey";
            columns: ["ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
          {
            foreignKeyName: "isteaching_challans_selected_product_id_fkey";
            columns: ["selected_product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      ledger_logs: {
        Row: {
          changed_at: string | null;
          changed_by: string | null;
          changes: Json | null;
          id: number;
          ledger_id: string | null;
        };
        Insert: {
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          id?: number;
          ledger_id?: string | null;
        };
        Update: {
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          id?: number;
          ledger_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_logs_ledger_id_fkey";
            columns: ["ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
        ];
      };
      ledgers: {
        Row: {
          address: string | null;
          business_logo: string | null;
          business_name: string;
          city: string | null;
          contact_person_name: string | null;
          country: string | null;
          created_at: string | null;
          created_by: string | null;
          district: string | null;
          edit_logs: string | null;
          email: string | null;
          gst_number: string | null;
          ledger_id: string;
          mobile_number: string | null;
          pan_number: string | null;
          state: string | null;
          updated_at: string | null;
          zip_code: string | null;
        };
        Insert: {
          address?: string | null;
          business_logo?: string | null;
          business_name: string;
          city?: string | null;
          contact_person_name?: string | null;
          country?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          district?: string | null;
          edit_logs?: string | null;
          email?: string | null;
          gst_number?: string | null;
          ledger_id: string;
          mobile_number?: string | null;
          pan_number?: string | null;
          state?: string | null;
          updated_at?: string | null;
          zip_code?: string | null;
        };
        Update: {
          address?: string | null;
          business_logo?: string | null;
          business_name?: string;
          city?: string | null;
          contact_person_name?: string | null;
          country?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          district?: string | null;
          edit_logs?: string | null;
          email?: string | null;
          gst_number?: string | null;
          ledger_id?: string;
          mobile_number?: string | null;
          pan_number?: string | null;
          state?: string | null;
          updated_at?: string | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      payment_voucher_logs: {
        Row: {
          changed_at: string | null;
          changed_by: string | null;
          changes: Json | null;
          id: number;
          payment_voucher_id: number | null;
        };
        Insert: {
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          id?: number;
          payment_voucher_id?: number | null;
        };
        Update: {
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          id?: number;
          payment_voucher_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_voucher_logs_payment_voucher_id_fkey";
            columns: ["payment_voucher_id"];
            isOneToOne: false;
            referencedRelation: "payment_vouchers";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_vouchers: {
        Row: {
          amount: number;
          created_at: string | null;
          created_by: string | null;
          date: string;
          id: number;
          ledger_id: string | null;
          payment_for: string;
          payment_type: string;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          created_by?: string | null;
          date: string;
          id?: number;
          ledger_id?: string | null;
          payment_for: string;
          payment_type: string;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          created_by?: string | null;
          date?: string;
          id?: number;
          ledger_id?: string | null;
          payment_for?: string;
          payment_type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_vouchers_ledger_id_fkey";
            columns: ["ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
        ];
      };
      product_mapping: {
        Row: {
          ajio_product_code: string | null;
          created_at: string | null;
          created_by: string | null;
          flipkart_product_code: string | null;
          id: number;
          inventory_barcode: string;
          meesho_product_code: string | null;
          mrp: number | null;
          myntra_product_code: string | null;
          selling_price: number | null;
          updated_at: string | null;
        };
        Insert: {
          ajio_product_code?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          flipkart_product_code?: string | null;
          id?: number;
          inventory_barcode: string;
          meesho_product_code?: string | null;
          mrp?: number | null;
          myntra_product_code?: string | null;
          selling_price?: number | null;
          updated_at?: string | null;
        };
        Update: {
          ajio_product_code?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          flipkart_product_code?: string | null;
          id?: number;
          inventory_barcode?: string;
          meesho_product_code?: string | null;
          mrp?: number | null;
          myntra_product_code?: string | null;
          selling_price?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          id: number;
          is_refurbished: boolean | null;
          manufacturing_cost: number | null;
          original_manufacturing_cost: number | null;
          product_brand: string | null;
          product_category: string;
          product_color: string | null;
          product_country: string | null;
          product_description: string | null;
          product_image: string | null;
          product_material: string | null;
          product_name: string;
          product_qty: number | null;
          product_size: string | null;
          product_sku: string;
          product_status: string | null;
          product_sub_category: string | null;
          refurbished_cost: number | null;
          updated_at: string | null;
          wash_care: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
          is_refurbished?: boolean | null;
          manufacturing_cost?: number | null;
          original_manufacturing_cost?: number | null;
          product_brand?: string | null;
          product_category: string;
          product_color?: string | null;
          product_country?: string | null;
          product_description?: string | null;
          product_image?: string | null;
          product_material?: string | null;
          product_name: string;
          product_qty?: number | null;
          product_size?: string | null;
          product_sku: string;
          product_status?: string | null;
          product_sub_category?: string | null;
          refurbished_cost?: number | null;
          updated_at?: string | null;
          wash_care?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
          is_refurbished?: boolean | null;
          manufacturing_cost?: number | null;
          original_manufacturing_cost?: number | null;
          product_brand?: string | null;
          product_category?: string;
          product_color?: string | null;
          product_country?: string | null;
          product_description?: string | null;
          product_image?: string | null;
          product_material?: string | null;
          product_name?: string;
          product_qty?: number | null;
          product_size?: string | null;
          product_sku?: string;
          product_status?: string | null;
          product_sub_category?: string | null;
          refurbished_cost?: number | null;
          updated_at?: string | null;
          wash_care?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          city: string | null;
          company_name: string | null;
          country: string | null;
          created_at: string | null;
          dob: string | null;
          document_number: string | null;
          document_type: string | null;
          email: string;
          first_name: string | null;
          full_name: string | null;
          gst_number: string | null;
          id: string;
          last_name: string | null;
          mobile: string | null;
          onboarding_completed: boolean | null;
          phone: string | null;
          pincode: string | null;
          profile_photo: string | null;
          state: string | null;
          updated_at: string | null;
          user_role: string | null;
          user_status: string | null;
          username: string | null;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          company_name?: string | null;
          country?: string | null;
          created_at?: string | null;
          dob?: string | null;
          document_number?: string | null;
          document_type?: string | null;
          email: string;
          first_name?: string | null;
          full_name?: string | null;
          gst_number?: string | null;
          id: string;
          last_name?: string | null;
          mobile?: string | null;
          onboarding_completed?: boolean | null;
          phone?: string | null;
          pincode?: string | null;
          profile_photo?: string | null;
          state?: string | null;
          updated_at?: string | null;
          user_role?: string | null;
          user_status?: string | null;
          username?: string | null;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          company_name?: string | null;
          country?: string | null;
          created_at?: string | null;
          dob?: string | null;
          document_number?: string | null;
          document_type?: string | null;
          email?: string;
          first_name?: string | null;
          full_name?: string | null;
          gst_number?: string | null;
          id?: string;
          last_name?: string | null;
          mobile?: string | null;
          onboarding_completed?: boolean | null;
          phone?: string | null;
          pincode?: string | null;
          profile_photo?: string | null;
          state?: string | null;
          updated_at?: string | null;
          user_role?: string | null;
          user_status?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          delivery_date: string | null;
          description: string | null;
          id: number;
          items: Json | null;
          ledger_id: string | null;
          po_date: string;
          po_number: string;
          status: string | null;
          supplier_name: string;
          terms_conditions: string | null;
          total_amount: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          delivery_date?: string | null;
          description?: string | null;
          id?: number;
          items?: Json | null;
          ledger_id?: string | null;
          po_date: string;
          po_number: string;
          status?: string | null;
          supplier_name: string;
          terms_conditions?: string | null;
          total_amount?: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          delivery_date?: string | null;
          description?: string | null;
          id?: number;
          items?: Json | null;
          ledger_id?: string | null;
          po_date?: string;
          po_number?: string;
          status?: string | null;
          supplier_name?: string;
          terms_conditions?: string | null;
          total_amount?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_orders_ledger_id_fkey";
            columns: ["ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
        ];
      };
      refurbishment_challans: {
        Row: {
          challan_no: string;
          created_at: string | null;
          created_by: string | null;
          date: string;
          id: number;
          isteaching_challan_id: number | null;
          ledger_id: string | null;
          notes: string | null;
          other_expenses: number | null;
          product_mapping_id: number | null;
          quantity: number;
          status: string | null;
          total_cost: number | null;
          transportation_cost: number | null;
          updated_at: string | null;
        };
        Insert: {
          challan_no: string;
          created_at?: string | null;
          created_by?: string | null;
          date?: string;
          id?: number;
          isteaching_challan_id?: number | null;
          ledger_id?: string | null;
          notes?: string | null;
          other_expenses?: number | null;
          product_mapping_id?: number | null;
          quantity: number;
          status?: string | null;
          total_cost?: number | null;
          transportation_cost?: number | null;
          updated_at?: string | null;
        };
        Update: {
          challan_no?: string;
          created_at?: string | null;
          created_by?: string | null;
          date?: string;
          id?: number;
          isteaching_challan_id?: number | null;
          ledger_id?: string | null;
          notes?: string | null;
          other_expenses?: number | null;
          product_mapping_id?: number | null;
          quantity?: number;
          status?: string | null;
          total_cost?: number | null;
          transportation_cost?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "refurbishment_challans_isteaching_challan_id_fkey";
            columns: ["isteaching_challan_id"];
            isOneToOne: false;
            referencedRelation: "isteaching_challans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "refurbishment_challans_ledger_id_fkey";
            columns: ["ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
          {
            foreignKeyName: "refurbishment_challans_product_mapping_id_fkey";
            columns: ["product_mapping_id"];
            isOneToOne: false;
            referencedRelation: "product_mapping";
            referencedColumns: ["id"];
          },
        ];
      };
      reserved_inventory: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          id: number;
          is_active: boolean | null;
          order_id: number;
          product_mapping_id: number;
          released_date: string | null;
          reservation_date: string | null;
          reserved_quantity: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
          is_active?: boolean | null;
          order_id: number;
          product_mapping_id: number;
          released_date?: string | null;
          reservation_date?: string | null;
          reserved_quantity: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
          is_active?: boolean | null;
          order_id?: number;
          product_mapping_id?: number;
          released_date?: string | null;
          reservation_date?: string | null;
          reserved_quantity?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reserved_inventory_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reserved_inventory_product_mapping_id_fkey";
            columns: ["product_mapping_id"];
            isOneToOne: false;
            referencedRelation: "product_mapping";
            referencedColumns: ["id"];
          },
        ];
      };
      sales_orders: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          customer_details: Json | null;
          dispatch_date: string | null;
          id: number;
          order_date: string | null;
          order_id: string;
          order_status: string | null;
          platform: string;
          product_mapping_id: number | null;
          quantity: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          customer_details?: Json | null;
          dispatch_date?: string | null;
          id?: number;
          order_date?: string | null;
          order_id: string;
          order_status?: string | null;
          platform: string;
          product_mapping_id?: number | null;
          quantity: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          customer_details?: Json | null;
          dispatch_date?: string | null;
          id?: number;
          order_date?: string | null;
          order_id?: string;
          order_status?: string | null;
          platform?: string;
          product_mapping_id?: number | null;
          quantity?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sales_orders_product_mapping_id_fkey";
            columns: ["product_mapping_id"];
            isOneToOne: false;
            referencedRelation: "product_mapping";
            referencedColumns: ["id"];
          },
        ];
      };
      sales_returns: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          id: number;
          order_id: number;
          processed_date: string | null;
          return_quantity: number;
          return_reason: string | null;
          return_status: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
          order_id: number;
          processed_date?: string | null;
          return_quantity: number;
          return_reason?: string | null;
          return_status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          id?: number;
          order_id?: number;
          processed_date?: string | null;
          return_quantity?: number;
          return_reason?: string | null;
          return_status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sales_returns_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      shorting_entries: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          entry_date: string;
          id: number;
          ledger_id: string | null;
          quality_name: string | null;
          shorting_qty: number;
          updated_at: string | null;
          weaver_challan_id: number | null;
          weaver_challan_qty: number | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          entry_date?: string;
          id?: number;
          ledger_id?: string | null;
          quality_name?: string | null;
          shorting_qty: number;
          updated_at?: string | null;
          weaver_challan_id?: number | null;
          weaver_challan_qty?: number | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          entry_date?: string;
          id?: number;
          ledger_id?: string | null;
          quality_name?: string | null;
          shorting_qty?: number;
          updated_at?: string | null;
          weaver_challan_id?: number | null;
          weaver_challan_qty?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shorting_entries_ledger_id_fkey";
            columns: ["ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
          {
            foreignKeyName: "shorting_entries_weaver_challan_id_fkey";
            columns: ["weaver_challan_id"];
            isOneToOne: false;
            referencedRelation: "weaver_challans";
            referencedColumns: ["id"];
          },
        ];
      };
      test_table: {
        Row: {
          data: string | null;
          id: number;
        };
        Insert: {
          data?: string | null;
          id?: never;
        };
        Update: {
          data?: string | null;
          id?: never;
        };
        Relationships: [];
      };
      weaver_challan_logs: {
        Row: {
          challan_id: number | null;
          changed_at: string | null;
          changed_by: string | null;
          changes: Json | null;
          id: number;
        };
        Insert: {
          challan_id?: number | null;
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          id?: number;
        };
        Update: {
          challan_id?: number | null;
          changed_at?: string | null;
          changed_by?: string | null;
          changes?: Json | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "weaver_challan_logs_challan_id_fkey";
            columns: ["challan_id"];
            isOneToOne: false;
            referencedRelation: "weaver_challans";
            referencedColumns: ["id"];
          },
        ];
      };
      weaver_challans: {
        Row: {
          batch_number: string;
          bill_no: string | null;
          cgst: string | null;
          challan_date: string;
          challan_no: string;
          created_at: string | null;
          created_by: string | null;
          delivery_at: string | null;
          edit_logs: string | null;
          fold_cm: number | null;
          id: number;
          igst: string | null;
          ledger_id: string | null;
          lr_number: string | null;
          ms_party_name: string;
          quality_details: Json | null;
          sgst: string | null;
          taka: number;
          taka_details: Json | null;
          total_grey_mtr: number;
          transport_charge: number | null;
          transport_name: string | null;
          updated_at: string | null;
          vendor_amount: number | null;
          vendor_invoice_number: string | null;
          vendor_ledger_id: string | null;
          width_inch: number | null;
        };
        Insert: {
          batch_number: string;
          bill_no?: string | null;
          cgst?: string | null;
          challan_date: string;
          challan_no: string;
          created_at?: string | null;
          created_by?: string | null;
          delivery_at?: string | null;
          edit_logs?: string | null;
          fold_cm?: number | null;
          id?: number;
          igst?: string | null;
          ledger_id?: string | null;
          lr_number?: string | null;
          ms_party_name: string;
          quality_details?: Json | null;
          sgst?: string | null;
          taka: number;
          taka_details?: Json | null;
          total_grey_mtr: number;
          transport_charge?: number | null;
          transport_name?: string | null;
          updated_at?: string | null;
          vendor_amount?: number | null;
          vendor_invoice_number?: string | null;
          vendor_ledger_id?: string | null;
          width_inch?: number | null;
        };
        Update: {
          batch_number?: string;
          bill_no?: string | null;
          cgst?: string | null;
          challan_date?: string;
          challan_no?: string;
          created_at?: string | null;
          created_by?: string | null;
          delivery_at?: string | null;
          edit_logs?: string | null;
          fold_cm?: number | null;
          id?: number;
          igst?: string | null;
          ledger_id?: string | null;
          lr_number?: string | null;
          ms_party_name?: string;
          quality_details?: Json | null;
          sgst?: string | null;
          taka?: number;
          taka_details?: Json | null;
          total_grey_mtr?: number;
          transport_charge?: number | null;
          transport_name?: string | null;
          updated_at?: string | null;
          vendor_amount?: number | null;
          vendor_invoice_number?: string | null;
          vendor_ledger_id?: string | null;
          width_inch?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "weaver_challans_ledger_id_fkey";
            columns: ["ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
          {
            foreignKeyName: "weaver_challans_vendor_ledger_id_fkey";
            columns: ["vendor_ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["ledger_id"];
          },
        ];
      };
    };
    Views: {
      complete_profiles: {
        Row: {
          address: string | null;
          auth_email: string | null;
          city: string | null;
          company_name: string | null;
          country: string | null;
          created_at: string | null;
          dob: string | null;
          document_number: string | null;
          document_type: string | null;
          email: string | null;
          email_confirmed_at: string | null;
          first_name: string | null;
          gst_number: string | null;
          id: string | null;
          last_name: string | null;
          last_sign_in_at: string | null;
          mobile: string | null;
          onboarding_completed: boolean | null;
          phone: string | null;
          pincode: string | null;
          profile_photo: string | null;
          state: string | null;
          updated_at: string | null;
          user_role: string | null;
          user_status: string | null;
          username: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_available_inventory: {
        Args: { product_mapping_id_param: number };
        Returns: number;
      };
      get_batch_history: { Args: { batch_no: string }; Returns: Json };
      get_user_profile: {
        Args: { user_id: string };
        Returns: {
          avatar_url: string;
          company_name: string;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          onboarding_completed: boolean;
          phone: string;
          role: string;
          updated_at: string;
          username: string;
        }[];
      };
      increase_inventory: {
        Args: { product_mapping_id_param: number; quantity_param: number };
        Returns: undefined;
      };
      is_username_available: {
        Args: { check_username: string; user_id: string };
        Returns: boolean;
      };
      process_refurbishment_return: {
        Args: {
          actual_refurbishment_cost?: number;
          refurbishment_challan_id_param: number;
        };
        Returns: undefined;
      };
      reduce_inventory:
        | {
            Args: { product_mapping_id_param: number; quantity_param: number };
            Returns: undefined;
          }
        | {
            Args: { product_mapping_id_param: string; quantity_param: number };
            Returns: undefined;
          };
      update_product_cost_after_refurbishment: {
        Args: { product_id_param: number; refurbishment_cost_param: number };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
