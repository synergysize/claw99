const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dqwjvoagccnykdexapal.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxd2p2b2FnY2NueWtkZXhhcGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5ODkwMSwiZXhwIjoyMDg2Mjc0OTAxfQ.EFauigNEsPqotYKu-qPWkxdV9dEQf2PHf6AF72Bm1t0';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function test() {
  console.log('Testing Supabase connection with service role...');
  
  const { data, error } = await supabase.from('users').select('id, wallet_address').limit(3);
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('SUCCESS! Found', data.length, 'users');
    console.log(data);
  }
}

test();
