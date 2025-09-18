#!/usr/bin/env node

/**
 * Test script to verify Supabase authentication setup
 * Run with: node scripts/test-auth.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Authentication Setup...\n')

// Check environment variables
console.log('📋 Environment Check:')
console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
console.log(`   SUPABASE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing environment variables!')
  console.log('   Please update your .env.local file with real Supabase credentials.')
  console.log('   See scripts/setup-auth.md for instructions.')
  process.exit(1)
}

if (supabaseUrl.includes('dummy') || supabaseKey.includes('dummy')) {
  console.log('\n⚠️  Using dummy credentials!')
  console.log('   Replace with real Supabase project credentials.')
  console.log('   See scripts/setup-auth.md for instructions.')
  process.exit(1)
}

// Test connection
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🔌 Testing Connection:')
    
    // Test basic connection
    const { data, error } = await supabase.from('incidents').select('count', { count: 'exact', head: true })
    
    if (error) {
      if (error.message.includes('relation "incidents" does not exist')) {
        console.log('   ❌ Database tables not found')
        console.log('   📝 Run the database migrations in Supabase SQL Editor')
        console.log('   📄 See scripts/setup-database.md for instructions')
        return false
      } else {
        console.log(`   ❌ Connection error: ${error.message}`)
        return false
      }
    }
    
    console.log('   ✅ Database connection successful')
    console.log(`   📊 Incidents table exists`)
    return true
    
  } catch (err) {
    console.log(`   ❌ Connection failed: ${err.message}`)
    return false
  }
}

async function testAuth() {
  try {
    console.log('\n🔐 Testing Authentication:')
    
    // Test auth endpoint
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log(`   ❌ Auth error: ${error.message}`)
      return false
    }
    
    console.log('   ✅ Authentication service available')
    console.log('   👤 Ready to create users')
    return true
    
  } catch (err) {
    console.log(`   ❌ Auth test failed: ${err.message}`)
    return false
  }
}

async function runTests() {
  const connectionOk = await testConnection()
  const authOk = await testAuth()
  
  console.log('\n📊 Test Results:')
  console.log(`   Database: ${connectionOk ? '✅ Ready' : '❌ Needs Setup'}`)
  console.log(`   Authentication: ${authOk ? '✅ Ready' : '❌ Needs Setup'}`)
  
  if (connectionOk && authOk) {
    console.log('\n🎉 All tests passed!')
    console.log('   Your Supabase setup is ready for real users.')
    console.log('   You can now:')
    console.log('   • Create accounts via the signup page')
    console.log('   • Sign in with real credentials')
    console.log('   • Store persistent user data')
    console.log('\n💡 Demo mode will still work alongside real authentication.')
  } else {
    console.log('\n🔧 Setup needed:')
    console.log('   1. Follow scripts/setup-auth.md for Supabase setup')
    console.log('   2. Run database migrations')
    console.log('   3. Configure authentication settings')
    console.log('   4. Run this test again')
  }
}

runTests().catch(console.error)