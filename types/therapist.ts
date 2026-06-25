export interface AvailabilitySlot {
  time: string;
  is_available: boolean;
}

export interface AvailabilityDay {
  date: string;
  day_of_week: string;
  time_slots: AvailabilitySlot[];
}

export interface Schedule {
  day_of_week: string;
  time_slots: string[];
}

export interface Therapist {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  profile_photo: string | null;
  license_number: string | null;
  specialization: string[];
  experience_years: number;
  bio: string;
  clinic_address: string | null;
  is_approved: boolean;
  average_rating: number;
  total_reviews: number;
  session_cost?: number | null;
  schedules: Schedule[];
  availability?: AvailabilityDay[];
}

export interface ReviewFromApi {
  id: number;
  therapist_id: number;
  patient_email: string;
  patient_name: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  patient_email: string;
  patient_name: string;
  patient_phone: string;
  therapist_id: number;
  appointment_date: string;
  time_slot: string;
  appointment_status: string;
  notes: string | null;
  status: boolean;
  created_at: string;
  therapist_name: string;
  therapist_photo: string | null;
  therapist_specialization: string[];
}
