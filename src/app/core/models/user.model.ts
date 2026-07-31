export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    phone?: string;
    avatar?: string;
    isBlocked: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    accessToken: string;
    data: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
}