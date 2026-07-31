import { Course } from './course.model';
export interface Enrollment {
    _id: string;
    student: string;
    course: Course;
    paymentStatus: 'free' | 'paid' | 'pending';
    paymentId?: string;
    orderId?: string;
    amount: number;
    completedLessons: string[];
    progress: number;
    isCompleted: boolean;
    lastAccessedLesson?: string;
    createdAt: string;
}