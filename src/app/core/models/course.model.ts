export interface Lesson {
    _id: string;
    title: string;
    type: 'video' | 'text';
    content: string;
    duration: number;
    isPreview: boolean;
    order: number;
}

export interface Section {
    _id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string;
    instructor: {
        _id: string;
        name: string;
        email: string;
        avatar: string;
    };
    category: {
        _id: string;
        name: string;
    };
    status: 'draft' | 'pending' | 'published' | 'rejected';
    sections: Section[];
    totalStudents: number;
    rating: number;
    totalRatings: number;
    createdAt: string;
}

export interface CourseResponse {
    success: boolean;
    data: Course[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}