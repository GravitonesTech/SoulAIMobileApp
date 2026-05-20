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
