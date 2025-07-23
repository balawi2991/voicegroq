const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Sanad Bot database...');

  try {
    // إنشاء جدول المستخدمين
    console.log('📝 Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          agent_id TEXT UNIQUE NOT NULL,
          full_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.error('❌ Error creating users table:', usersError);
    } else {
      console.log('✅ Users table created successfully');
    }

    // إنشاء جدول تكوين البوت
    console.log('📝 Creating bot_configs table...');
    const { error: configsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.bot_configs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          agent_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL DEFAULT 'مساعد ذكي',
          avatar_url TEXT,
          avatar_emoji TEXT NOT NULL DEFAULT '🤖',
          voice_id TEXT NOT NULL DEFAULT 'ar-male-1',
          button_color TEXT NOT NULL DEFAULT '#3B82F6',
          welcome_message TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (configsError) {
      console.error('❌ Error creating bot_configs table:', configsError);
    } else {
      console.log('✅ Bot configs table created successfully');
    }

    // إدراج بيانات تجريبية
    console.log('📝 Inserting demo data...');
    const { error: demoError } = await supabase
      .from('users')
      .upsert({
        email: 'demo@sanadbot.ai',
        agent_id: 'agent_demo_123',
        full_name: 'مستخدم تجريبي'
      }, { onConflict: 'email' });

    if (demoError) {
      console.error('❌ Error inserting demo user:', demoError);
    } else {
      console.log('✅ Demo user created successfully');
    }

    const { error: demoBotError } = await supabase
      .from('bot_configs')
      .upsert({
        agent_id: 'agent_demo_123',
        name: 'مساعد ذكي',
        voice_id: 'ar-male-1',
        button_color: '#3B82F6'
      }, { onConflict: 'agent_id' });

    if (demoBotError) {
      console.error('❌ Error creating demo bot config:', demoBotError);
    } else {
      console.log('✅ Demo bot config created successfully');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Demo credentials:');
    console.log('   Email: demo@sanadbot.ai');
    console.log('   Password: demo123456');
    console.log('   Agent ID: agent_demo_123');
    console.log('');
    console.log('🌐 You can now test the application at http://localhost:3000');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
