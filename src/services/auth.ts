import { supabase } from '../lib/supabase';

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'tutor';
  department?: string;
  year?: number;
  subject?: string[];
  availablehours?: string[];
}) {
  if (formData.role === 'student') {
    const { error } = await supabase.from('student').insert({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'student',
      department: formData.department ?? null,
      year: formData.year ?? null,
      enrolledcourses: [],
    });
    if (error) throw error;
  } else if (formData.role === 'tutor') {
    const { error } = await supabase.from('tutor').insert({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'tutor',
      department: formData.department ?? null,
      subject: formData.subject ?? [],
      availablehours: formData.availablehours ?? [],
    });
    if (error) throw error;
  }
}