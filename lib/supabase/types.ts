export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          category_id: string | null;
          short_description: string;
          description: string;
          material: string;
          color: string;
          size: string;
          price: number;
          promo_price: number | null;
          stock: number;
          weight: number | null;
          active: boolean;
          featured: boolean;
          is_new: boolean;
          display_order: number;
          main_image: string | null;
          low_stock_threshold: number;
          sales_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          name: string;
          category_id?: string | null;
          short_description?: string;
          description?: string;
          material?: string;
          color?: string;
          size?: string;
          price: number;
          promo_price?: number | null;
          stock?: number;
          weight?: number | null;
          active?: boolean;
          featured?: boolean;
          is_new?: boolean;
          display_order?: number;
          main_image?: string | null;
          low_stock_threshold?: number;
          sales_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          name?: string;
          category_id?: string | null;
          short_description?: string;
          description?: string;
          material?: string;
          color?: string;
          size?: string;
          price?: number;
          promo_price?: number | null;
          stock?: number;
          weight?: number | null;
          active?: boolean;
          featured?: boolean;
          is_new?: boolean;
          display_order?: number;
          main_image?: string | null;
          low_stock_threshold?: number;
          sales_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      store_settings: {
        Row: {
          id: number;
          store_name: string;
          whatsapp: string;
          instagram: string;
          facebook: string;
          address: string;
          whatsapp_message_template: string;
          logo_url: string | null;
          banner_url: string | null;
          seo_title: string;
          seo_description: string;
          hide_out_of_stock: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          whatsapp?: string;
          instagram?: string;
          facebook?: string;
          address?: string;
          whatsapp_message_template?: string;
          logo_url?: string | null;
          banner_url?: string | null;
          seo_title?: string;
          seo_description?: string;
          hide_out_of_stock?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: number;
          store_name?: string;
          whatsapp?: string;
          instagram?: string;
          facebook?: string;
          address?: string;
          whatsapp_message_template?: string;
          logo_url?: string | null;
          banner_url?: string | null;
          seo_title?: string;
          seo_description?: string;
          hide_out_of_stock?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          product_id: string;
          type: "in" | "out" | "adjustment";
          quantity: number;
          previous_stock: number;
          new_stock: number;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          type: "in" | "out" | "adjustment";
          quantity: number;
          previous_stock: number;
          new_stock: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          type?: "in" | "out" | "adjustment";
          quantity?: number;
          previous_stock?: number;
          new_stock?: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
