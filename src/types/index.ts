export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  createdAt: Date;
  password?: string; // Optional for security reasons
}

export interface student extends User {
  enrolledCourses: string[];
  department: string;
  year: number;
}

export interface Tutor extends User {
  subject: string[];
  department: string;
  availableHours: string[];
  students: string[]; // List of student IDs
}

export interface Admin extends User {
  permissions: string[]; // List of admin permissions
}


export interface session {
  id: string;
  subject: string;
  scheduledAt: Date;
  duration: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  studentId: string;
  tutorId: string;
}



