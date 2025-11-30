import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zmsqvakgdxgfngxgkagv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3F2YWtnZHhnZm5neGdrYWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NTMwMjYsImV4cCI6MjA4MDAyOTAyNn0.qG6a6LD5mCePH9o-JVb-gsIZjI2J92nwRZKphbSgU8k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
