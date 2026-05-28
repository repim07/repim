// =============================================================================
// REPIM — Types TypeScript pour la base de données Supabase
// =============================================================================

export type UserRole =
  | 'chercheur'
  | 'agent'
  | 'proprietaire'
  | 'admin'
  | 'promoteur'
  | 'agence'
  | 'communaute'

export type VerificationStatus =
  | 'draft'
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'suspended'

export type ProCategorie = 'agence' | 'promoteur' | 'proprietaire' | 'communaute' | 'agent'
export type PropertyType = 'location' | 'vente' | 'colocation' | 'residence_meublee' | 'lotissement'
export type PropertyStatus =
  | 'actif'
  | 'loue'
  | 'vendu'
  | 'inactif'
  | 'en_attente_validation'
export type AppointmentStatus = 'en_attente' | 'confirme' | 'annule' | 'effectue'
export type PropertyStanding = 'social' | 'normal' | 'haut_standing'

// ── Sous-types JSON ───────────────────────────────────────────────────────────

export interface Localisation {
  ville: string
  commune: string
  quartier: string
  adresse?: string
  lat?: number | null
  lng?: number | null
}

// ── Tables ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  nom: string
  email: string
  telephone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  titre: string
  description: string | null
  prix: number
  devise: string
  localisation: Localisation
  type: PropertyType
  statut: PropertyStatus
  surface_m2: number | null
  nb_pieces: number | null
  standing: PropertyStanding | null
  photos: string[]
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  property_id: string
  user_id: string
  date_visite: string
  statut: AppointmentStatus
  message: string | null
  created_at: string
  updated_at: string
}

// ── Résultat générique des Server Actions ─────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ── Typage complet du client Supabase (Database générique) ────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nom: string
          email: string
          telephone: string | null
          role: string
          avatar_url: string | null
          subscription_status: string | null
          debloque_par_admin: boolean
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nom: string
          email: string
          telephone?: string | null
          role?: string
          avatar_url?: string | null
          subscription_status?: string | null
          debloque_par_admin?: boolean
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          email?: string
          telephone?: string | null
          role?: string
          avatar_url?: string | null
          subscription_status?: string | null
          debloque_par_admin?: boolean
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          titre: string
          description: string | null
          prix: number
          devise: string
          localisation: Json
          type: string
          statut: string
          surface_m2: number | null
          nb_pieces: number | null
          standing: string | null
          photos: string[]
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titre: string
          description?: string | null
          prix: number
          devise?: string
          localisation?: Json
          type: string
          statut?: string
          surface_m2?: number | null
          nb_pieces?: number | null
          standing?: string | null
          photos?: string[]
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titre?: string
          description?: string | null
          prix?: number
          devise?: string
          localisation?: Json
          type?: string
          statut?: string
          surface_m2?: number | null
          nb_pieces?: number | null
          standing?: string | null
          photos?: string[]
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          property_id: string
          user_id: string
          date_visite: string
          statut: string
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          date_visite: string
          statut?: string
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          date_visite?: string
          statut?: string
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pro_profiles: {
        Row: {
          id:                  string
          categorie:           string
          prenom:              string
          email_pro:           string
          telephone_pro:       string
          raison_sociale:      string | null
          adresse:             Json
          verification_status: string
          submitted_at:        string | null
          reviewed_at:         string | null
          reviewed_by:         string | null
          rejection_reason:    string | null
          created_at:          string
          updated_at:          string
        }
        Insert: {
          id:                  string
          categorie:           string
          prenom:              string
          email_pro:           string
          telephone_pro:       string
          raison_sociale?:     string | null
          adresse?:            Json
          verification_status?: string
          submitted_at?:       string | null
          reviewed_at?:        string | null
          reviewed_by?:        string | null
          rejection_reason?:   string | null
          created_at?:         string
          updated_at?:         string
        }
        Update: {
          id?:                 string
          categorie?:          string
          prenom?:             string
          email_pro?:          string
          telephone_pro?:      string
          raison_sociale?:     string | null
          adresse?:            Json
          verification_status?: string
          submitted_at?:       string | null
          reviewed_at?:        string | null
          reviewed_by?:        string | null
          rejection_reason?:   string | null
          created_at?:         string
          updated_at?:         string
        }
        Relationships: []
      }
      pro_documents: {
        Row: {
          id:             string
          pro_profile_id: string
          doc_type:       string
          storage_path:   string
          numero:         string | null
          date_emission:  string | null
          date_expiration: string | null
          status:         string
          reviewer_notes: string | null
          uploaded_at:    string
          reviewed_at:    string | null
        }
        Insert: {
          id?:            string
          pro_profile_id: string
          doc_type:       string
          storage_path:   string
          numero?:        string | null
          date_emission?: string | null
          date_expiration?: string | null
          status?:        string
          reviewer_notes?: string | null
          uploaded_at?:   string
          reviewed_at?:   string | null
        }
        Update: {
          id?:            string
          pro_profile_id?: string
          doc_type?:      string
          storage_path?:  string
          numero?:        string | null
          date_emission?: string | null
          date_expiration?: string | null
          status?:        string
          reviewer_notes?: string | null
          uploaded_at?:   string
          reviewed_at?:   string | null
        }
        Relationships: []
      }
      partenaires: {
        Row: {
          id: string
          user_id: string
          nom_structure: string
          categorie: string
          statut_abonnement: string
          plan_actif: string | null
          date_debut_abo: string | null
          date_fin_abo: string | null
          payment_provider: string | null
          payment_ref: string | null
          payment_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nom_structure: string
          categorie: string
          statut_abonnement?: string
          plan_actif?: string | null
          date_debut_abo?: string | null
          date_fin_abo?: string | null
          payment_provider?: string | null
          payment_ref?: string | null
          payment_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nom_structure?: string
          categorie?: string
          statut_abonnement?: string
          plan_actif?: string | null
          date_debut_abo?: string | null
          date_fin_abo?: string | null
          payment_provider?: string | null
          payment_ref?: string | null
          payment_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
