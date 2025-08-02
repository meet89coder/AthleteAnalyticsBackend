export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface RequestQuery {
  page?: string;
  limit?: string;
  sort_by?: string;
  sort_order?: string;
  search?: string;
  [key: string]: string | undefined;
}