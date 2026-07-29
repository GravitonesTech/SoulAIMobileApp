export interface UserData {
  email: string;
  full_name: string;
  profile_photo: string;
}

export interface GroupData {
  group_id: string;
  title: string;
  status: string;
  my_status: string;
  members: string[];
  members_names?: Record<string, string>;
  created_at: string;
}
