export interface Option {
  id: number;
  question_id: number;
  option_text: string;
  score_weight: number;
  order: number;
}

export interface Question {
  id: number;
  form_id: number;
  form_code: string;
  question_text: string;
  order: number;
  section: string;
  subtitle: string;
  options: Option[];
}
