export interface School {
  id: string;
  name: string;
}

export interface FieldTrip {
  id: string;
  schools: School[];
  location: string;
  cost: number;
  date: string;
}

export interface PaymentRequest {
  student_first_name: string;
  student_last_name: string;
  parent_first_name: string;
  parent_last_name: string;
  email: string;
  field_trip_id: string;
  school_id: string;
  card_number: string;
  expiry_date: string;
  cvv: string;
}

export interface PaymentResponse {
  id: string;
  date: string;
  amount: string;
  student: number;
  activity: string;
}

export type ApiError = Record<string, string[]>;

export type FormErrors = Partial<
  Record<keyof Omit<PaymentRequest, "field_trip_id">, string>
>;
