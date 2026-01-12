
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * Configured for project: hshbeyxeuwebtnjuibms
 */

const supabaseUrl = 'https://hshbeyxeuwebtnjuibms.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGJleXhldXdlYnRuanVpYm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMDEyOTEsImV4cCI6MjA4Mzc3NzI5MX0.UQ2pNjByrb2PEe2Rj8cD3Dm0_7pUMjwDxPoBeXeMAZQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
