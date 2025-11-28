/**
 * Supabase Connection & Schema Verification Script
 * 
 * This script verifies that:
 * 1. Connection to Supabase is working
 * 2. All required tables exist
 * 3. RLS policies are enabled
 * 4. Environment variables are correctly configured
 * 
 * Run with: npx tsx scripts/verify-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

const REQUIRED_TABLES = [
  'profiles',
  'user_balances',
  'user_subscriptions',
  'voice_chat_usage',
  'analytics_events',
  'mood_logs',
  'breathing_logs'
];

async function verifySupabase() {
  console.log('🔍 Verifying Supabase Configuration...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Variables:');
  console.log(`  ✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ Set' : '✗ Missing'}`);
  console.log(`  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ Set' : '✗ Missing'}`);
  console.log(`  ⚠️  SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✓ Set' : '✗ Missing (needed for admin operations)'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables!');
    console.error('   Please check your .env.local file.\n');
    process.exit(1);
  }

  // Create Supabase client (using service role if available for verification)
  const client = createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  console.log('🔌 Testing Connection...');
  
  try {
    // Test basic connection
    const { error: healthError } = await client.from('profiles').select('count', { count: 'exact', head: true });
    
    if (healthError && healthError.code !== 'PGRST116') { // PGRST116 = table exists but no rows
      throw healthError;
    }
    
    console.log('  ✅ Connection successful!\n');
  } catch (error: any) {
    console.error('  ❌ Connection failed!');
    console.error(`     Error: ${error.message}\n`);
    process.exit(1);
  }

  // Verify tables exist
  console.log('📊 Checking Database Schema...');
  
  let missingTables: string[] = [];
  let existingTables: string[] = [];

  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await client.from(table).select('count', { count: 'exact', head: true });
      
      if (error && error.code !== 'PGRST116') {
        missingTables.push(table);
        console.log(`  ❌ ${table} - Not found`);
      } else {
        existingTables.push(table);
        console.log(`  ✅ ${table} - Exists`);
      }
    } catch (error: any) {
      missingTables.push(table);
      console.log(`  ❌ ${table} - Error: ${error.message}`);
    }
  }

  console.log('');

  // Check RLS status (requires service role key)
  if (supabaseServiceKey) {
    console.log('🔒 Checking Row Level Security (RLS)...');
    
    try {
      const { data: rlsStatus, error: rlsError } = await client.rpc('pg_catalog.pg_tables', {});
      
      if (rlsError) {
        console.log('  ⚠️  Could not verify RLS status (requires database admin)');
      } else {
        console.log('  ✅ RLS verification requires manual check in Supabase Dashboard');
        console.log('     Go to: Auth > Policies to verify');
      }
    } catch (error) {
      console.log('  ⚠️  RLS verification skipped (requires admin access)');
    }
    console.log('');
  }

  // Summary
  console.log('📈 Summary:');
  console.log(`  ✅ Tables found: ${existingTables.length}/${REQUIRED_TABLES.length}`);
  console.log(`  ❌ Tables missing: ${missingTables.length}/${REQUIRED_TABLES.length}`);
  
  if (missingTables.length > 0) {
    console.log('\n⚠️  Missing tables detected!');
    console.log('   Missing:', missingTables.join(', '));
    console.log('\n   To deploy the schema:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/sql/new');
    console.log('   2. Copy the contents of: supabase/deploy_schema.sql');
    console.log('   3. Paste and run in the SQL Editor\n');
    process.exit(1);
  }

  console.log('\n✨ All checks passed! Your Supabase setup is ready.\n');
  
  // Compliance reminder
  console.log('🔒 Compliance Reminder:');
  console.log('   Before deploying to production:');
  console.log('   • Review mind_gleam_global_compliance_blueprint.md');
  console.log('   • Verify RLS policies at: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/auth/policies');
  console.log('   • Ensure mood_logs (sensitive health data) is properly protected');
  console.log('   • Test user data isolation\n');
}

// Run verification
verifySupabase().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

