const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [key, ...valueParts] = trimmed.split('=')
    const value = valueParts.join('=').trim()
    if (key && !process.env[key]) {
      process.env[key] = value.replace(/^"|"$/g, '')
    }
  })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  console.error('Create a .env file with these values or export them before running npm run seed:users.')
  process.exit(1)
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAuthUser({ email, password, name, role }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role,
    },
  })

  if (error) {
    if (error.message && error.message.includes('already registered')) {
      console.log(`Auth user already exists: ${email}`)
      return null
    }
    throw error
  }

  return data.user?.id
}

async function createSeedUser(user) {
  const timestamp = new Date().toISOString()

  const { data: existingProfile } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()

  let userId = existingProfile?.id

  if (!userId) {
    console.log(`Creating auth user for ${user.role}: ${user.email}`)
    userId = await createAuthUser(user)
  } else {
    console.log(`Found existing profile for ${user.email} (id: ${userId})`)
  }

  if (!userId) {
    console.error(`Unable to resolve user id for ${user.email}`)
    return
  }

  const { error: profileError } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone || null,
        updated_at: timestamp,
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    throw profileError
  }

  await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_type: 'free',
        status: 'active',
        ai_calls_limit: 50,
        ai_calls_used: 0,
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        updated_at: timestamp,
      },
      { onConflict: 'user_id' }
    )

  if (user.role === 'lawyer') {
    await supabaseAdmin
      .from('lawyers')
      .upsert(
        {
          user_id: userId,
          bar_number: 'BAR-12345',
          specializations: ['Family Law', 'Contracts'],
          experience_years: 7,
          hourly_rate: 120,
          bio: 'Experienced lawyer specializing in family law and contract disputes.',
          education: 'LL.B., National Law University',
          verified: false,
          rating: 4.8,
          total_reviews: 12,
          total_cases: 40,
          city: 'Lahore',
          languages: ['English', 'Urdu'],
          available: true,
          updated_at: timestamp,
        },
        { onConflict: 'user_id' }
      )
  }

  console.log(`Seeded ${user.role} user: ${user.email}`)
}

async function main() {
  try {
    const users = [
      {
        email: 'admin@example.com',
        password: 'Admin123!',
        name: 'Admin User',
        role: 'admin',
        phone: '+923001234567',
      },
      {
        email: 'test.lawyer@example.com',
        password: 'Lawyer123!',
        name: 'Test Lawyer',
        role: 'lawyer',
        phone: '+923009876543',
      },
      {
        email: 'test.client@example.com',
        password: 'Client123!',
        name: 'Test Client',
        role: 'client',
        phone: '+923001112233',
      },
    ]

    for (const user of users) {
      await createSeedUser(user)
    }

    console.log('Seed complete.')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

main()
