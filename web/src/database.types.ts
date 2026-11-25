
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "car_statuses": {
                  Row: {
                    "created_at": string,"id": number,"label": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: number,"label": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: number,"label"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"cars": {
                  Row: {
                    "achat_societe_id": number | null,"car_statut_id": number | null,"couleur": string | null,"created_at": string,"date_mce": string | null,"deleted_at": string | null,"id": number,"immat": string,"km_dernier": number | null,"num_chassis": string | null,"societe_marque_id": number | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "achat_societe_id"?: number | null,"car_statut_id"?: number | null,"couleur"?: string | null,"created_at"?: string,"date_mce"?: string | null,"deleted_at"?: string | null,"id"?: number,"immat": string,"km_dernier"?: number | null,"num_chassis"?: string | null,"societe_marque_id"?: number | null,"updated_at"?: string
                  }
                  Update: {
                    "achat_societe_id"?: number | null,"car_statut_id"?: number | null,"couleur"?: string | null,"created_at"?: string,"date_mce"?: string | null,"deleted_at"?: string | null,"id"?: number,"immat"?: string,"km_dernier"?: number | null,"num_chassis"?: string | null,"societe_marque_id"?: number | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cars_achat_societe_id_fkey"
      columns: ["achat_societe_id"]
isOneToOne: false
      referencedRelation: "companies"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cars_car_statut_id_fkey"
      columns: ["car_statut_id"]
isOneToOne: false
      referencedRelation: "car_statuses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cars_societe_marque_id_fkey"
      columns: ["societe_marque_id"]
isOneToOne: false
      referencedRelation: "societe_marques"
      referencedColumns: ["id"]
    }
                  ]
                },"companies": {
                  Row: {
                    "abv": string | null,"city": string | null,"created_at": string,"deleted_at": string | null,"ice": string | null,"id": number,"is_active": boolean,"label": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "abv"?: string | null,"city"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"ice"?: string | null,"id"?: number,"is_active"?: boolean,"label": string,"updated_at"?: string
                  }
                  Update: {
                    "abv"?: string | null,"city"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"ice"?: string | null,"id"?: number,"is_active"?: boolean,"label"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string,"id": string,"is_active": boolean,"role": Database["public"]['Enums']["app_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"full_name": string,"id": string,"is_active"?: boolean,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string,"id"?: string,"is_active"?: boolean,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"societe_marques": {
                  Row: {
                    "company_id": number,"created_at": string,"deleted_at": string | null,"id": number,"is_active": boolean,"libelle": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "company_id": number,"created_at"?: string,"deleted_at"?: string | null,"id"?: number,"is_active"?: boolean,"libelle": string,"updated_at"?: string
                  }
                  Update: {
                    "company_id"?: number,"created_at"?: string,"deleted_at"?: string | null,"id"?: number,"is_active"?: boolean,"libelle"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "societe_marques_company_id_fkey"
      columns: ["company_id"]
isOneToOne: false
      referencedRelation: "companies"
      referencedColumns: ["id"]
    }
                  ]
                },"user_companies": {
                  Row: {
                    "company_id": number,"created_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "company_id": number,"created_at"?: string,"user_id": string
                  }
                  Update: {
                    "company_id"?: number,"created_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_companies_company_id_fkey"
      columns: ["company_id"]
isOneToOne: false
      referencedRelation: "companies"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_companies_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            "app_role": "admin"|"manager"|"viewer"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["admin", "manager", "viewer"]
          }
        }
} as const
