import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ApiClient = SupabaseClient;

// 환경변수 읽기는 앱 몫
export function createApiClient(url: string, key: string): ApiClient {
  return createClient(url, key);
}
