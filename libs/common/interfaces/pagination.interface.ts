export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface OffsetPaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
