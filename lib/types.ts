export type ReportType = "lost" | "found"
export type ReportStatus = "OPEN" | "MATCHED" | "REUNITED" | "CLOSED" // Updated to match backend
export type MatchStatus = "suggested" | "confirmed" | "rejected"

// New interfaces to match backend schemas
export interface LocationData {
  latitude: number;
  longitude: number;
  description?: string | null;
}

export interface Person {
  id?: string;
  name?: string | null;
  age?: number | null;
  language: string;
  photo_ids: string[];
  qr_id?: string | null;
  guardian_contact?: string | null;
  is_child?: boolean | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  identifying_features?: string | null;
  clothing_description?: string | null;
}

export interface ReportInput {
  type: ReportType
  title: string
  description_text?: string // Changed from description to description_text
  category?: string
  language?: string
  lat?: number
  lng?: number
  location_text?: string
  contact?: string
  photo?: File | null
}

export interface Report extends Omit<ReportInput, "photo"> {
  id: string
  photo_urls: string[] // Changed from photo_url to photo_urls
  photo_base64?: string | null
  status: ReportStatus
  created_by?: string | null
  created_at: string
  subject_type: 'PERSON' | 'ITEM'; // Added subject_type
  posted_by_contact?: string | null; // Added posted_by_contact
  location: LocationData; // Added location
  person_details?: Person | null; // Added person_details
}

export interface Match {
  id: string
  lost_report_id: string
  found_report_id: string
  scores: { face?: number; image?: number; text?: number; distance?: number }
  fused_score: number
  status: MatchStatus
  created_at: string
}
