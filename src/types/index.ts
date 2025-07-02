export interface User {
  id: string;
  email: string;
  userType: 'ops' | 'client';
  isVerified?: boolean;
  createdAt?: string;
}

export interface FileItem {
  id: string;
  filename: string;
  fileType: 'pptx' | 'docx' | 'xlsx';
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface DownloadResponse {
  downloadLink: string;
  message: string;
}