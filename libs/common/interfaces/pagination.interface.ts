export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
