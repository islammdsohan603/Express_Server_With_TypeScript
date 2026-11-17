export interface IStudents {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  age: number;
  department: string;
  marks: number;
}

// Update-এর সময় সব field দেওয়া বাধ্যতামূলক নয়
export interface IUpdateStudent {
  full_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  age?: number;
  department?: string;
  marks?: number;
}
