import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nbisaueiidskrmebywmg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaXNhdWVpaWRza3JtZWJ5d21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDY3NTQsImV4cCI6MjA4OTIyMjc1NH0.WWQHa2usxUceUDpYEDu2X5Ce8pEctyziKNj8FlYEv2k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
