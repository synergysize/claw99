const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dqwjvoagccnykdexapal.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxd2p2b2FnY2NueWtkZXhhcGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5ODkwMSwiZXhwIjoyMDg2Mjc0OTAxfQ.EFauigNEsPqotYKu-qPWkxdV9dEQf2PHf6AF72Bm1t0';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function fixRLS() {
  // Test connection first
  const { data, error } = await supabase.from('users').select('count').limit(1);
  if (error) {
    console.log('Connection test failed:', error.message);
    return;
  }
  console.log('Connected to Supabase!');
  
  // For RLS changes we need to use the SQL editor or Management API
  // The JS client cant run DDL. Lets just test if we can insert with service role
  console.log('Service role bypasses RLS - testing insert capability...');
  
  // Test: try to insert a user
  const testWallet = '0xTEST' + Date.now();
  const { data: newUser, error: insertErr } = await supabase
    .from('users')
    .insert({ wallet_address: testWallet })
    .select()
    .single();
    
  if (insertErr) {
    console.log('Insert test failed:', insertErr.message);
  } else {
    console.log('Insert works with service role! User created:', newUser.id);
    // Clean up test
    await supabase.from('users').delete().eq('id', newUser.id);
    console.log('Test user cleaned up.');
  }
  
  console.log('\nTo fix RLS, run this SQL in Supabase Dashboard > SQL Editor:');
  console.log('https://supabase.com/dashboard/project/dqwjvoagccnykdexapal/sql');
}

fixRLS();
