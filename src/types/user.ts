export type UserRole = 'admin' | 'subadmin' | 'agent';

export type BranchName = 'Igando' | 'Abule-Egba';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  branch_id: string | null;
  branch_name: BranchName | null;
  full_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: BranchName;
  address: string;
  phone: string;
  created_at: string;
}
