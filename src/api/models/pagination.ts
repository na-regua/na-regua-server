export interface PaginatedResponse<T> {
  content: T[];
  total: number;
  limit?: number;
  offset?: number;
  page?: number;
  totalPages?: number;
}

export interface PaginatedFilter {
  limit?: number;
  offset?: number;
  search?: string;
  total?: number;
  next?: boolean;
}
