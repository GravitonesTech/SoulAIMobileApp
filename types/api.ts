export interface UserProfile {
  id: number;
  email: string;
  full_name: string | null;
  age: number | null;
  country: string | null;
  gender: string | null;
  completed_step: number;
  experience: string | null;
  support_types: string[];
  response_styles: string;
  profile_photo: string | null;
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
