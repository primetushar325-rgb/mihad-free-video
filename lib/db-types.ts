// Shape of the Cloudflare D1 REST API JSON response.

export interface QueryResultMeta {
  changed_db?: boolean;
  changes?: number;
  duration?: number;
  last_row_id?: number;
  last_row_id_string?: string | null;
  rows_read?: number;
  rows_written?: number;
  size_after?: number;
  served_by?: string;
  timed_out?: boolean;
}

export interface QuerySingleResult<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
  meta: QueryResultMeta;
}

export interface QueryResultError {
  code?: number;
  message?: string;
}

export interface QueryResult {
  result?: QuerySingleResult[];
  success: boolean;
  errors?: QueryResultError[];
  messages?: unknown[];
}
