export interface Activity {
  id: number;
  title: string;
  display: boolean;
  description: string;
  date: string;           // วันกิจกรรม (string หรือ Date)
  start_time: string;     // เวลาเริ่ม
  end_time: string;       // เวลาจบ
  location: string;
  max_participants: number;
  current_register_participants: number;
  point: number;
  stars: number;
  form_link?: string;
  image_url?: string;
  round: number;
  activity_type: string;
  created_at: string;     // วันที่สร้างกิจกรรม
  ownerId?: number;
  owner?: {
    id: number;
    username: string;
    name: string;
  } | null;
  department: {
    id: number;
    name_th: string;
    name_en: string;
  };
  faculty: {
    id: number;
    name_th: string;
    name_en: string;
  };
  staffs?: {
    id: number;
    name: string;
    email: string;
    username: string;
  }[];
  registrations?: {
    id: number;
    registered_at: string;
    student: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
  }[];
}
