export interface Country {
  id: number;
  name: string;
  code: string;
  flag_emoji: string;
  is_active: boolean;
}

export interface Experience {
  id: number;
  name: string;
}

export interface SupportType {
  id: number;
  name: string;
}

export interface ResponseStyle {
  id: number;
  name: string;
}

export interface Answer {
  id: number;
  question_id: number;
  selected_option_id: number;
  question_text: string;
  option_text: string;
  score_weight: number;
  created_at: string;
  updated_at: string;
  status: boolean;
}

export interface AssessmentSubmission {
  id: number;
  user_id: number;
  form_id: number;
  form_code: string;
  total_score: number;
  created_at: string;
  updated_at: string;
  status: boolean;
  answers: Answer[];
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string | null;
  date_of_birth: string | null;
  age?: number | null;
  country: Country | null;
  gender: string | null;
  completed_step: number;
  experience: Experience | null;
  support_types: SupportType[];
  response_styles: ResponseStyle[];
  profile_photo: string | null;
  assessment_submissions?: AssessmentSubmission[];
  personality_results?: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FaqAnswer {
  id: number;
  faq_id: number;
  answer_text: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqItem {
  id: number;
  question: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  answers: FaqAnswer[];
}

export interface FaqResponseData {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  faqs: FaqItem[];
}

export interface SosContact {
  id: number;
  name: string;
  phone_number: string;
  is_emergency: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SosResponseData {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  contacts: SosContact[];
}
