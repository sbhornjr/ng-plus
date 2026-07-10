import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — use this in Client Components ('use client' files)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
    // Intercept and wrap the default fetch handler
    fetch: async (url, options) => {
      const startTime = Date.now();
      const method = options?.method || 'GET';

      // 1. Log incoming request data
      console.log(`[Supabase Request] ${method} ${url}`);
      if (options?.body) {
        console.log('[Supabase Request Body]', options.body);
      }

      // 2. Execute the actual HTTP request
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;

      // 3. Log response information
      console.log(`[Supabase Response] ${method} ${url} - Status: ${response.status} (${duration}ms)`);

      return response;
    },
  },
})