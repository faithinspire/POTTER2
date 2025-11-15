export type IdType = 'NIN' | 'BVN' | 'Drivers License' | 'Voters Card';

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string;
  id_type: IdType;
  id_number: string;
  state_of_origin?: string;
  occupation?: string;
  next_of_kin_name?: string;
  next_of_kin_address?: string;
  business_address?: string;
  marital_status?: string;
  union_name?: string;
  photo_url?: string;
  passport_photo_url?: string;
  id_photo_url?: string;
  branch_id: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

export interface Guarantor {
  id: string;
  customer_id: string;
  full_name: string;
  phone: string;
  address: string;
  relationship: string;
  id_type: IdType;
  id_number: string;
  state_of_origin?: string;
  passport_photo_url?: string;
  id_photo_url?: string;
  created_at: string;
}

export interface CustomerWithGuarantors extends Customer {
  guarantors: Guarantor[];
}
