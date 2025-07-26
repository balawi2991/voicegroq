const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up Sanad Bot database with Neon PostgreSQL...');

  try {
    // إنشاء جدول المستخدمين
    console.log('📝 Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        agent_id TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT,
        password TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created successfully');

    // إنشاء جدول تكوين البوت
    console.log('📝 Creating bot_configs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bot_configs (
        id SERIAL PRIMARY KEY,
        agent_id TEXT UNIQUE NOT NULL,
        bot_name TEXT NOT NULL DEFAULT 'مساعد ذكي',
        welcome_message TEXT,
        primary_color TEXT NOT NULL DEFAULT '#3B82F6',
        secondary_color TEXT NOT NULL DEFAULT '#1E40AF',
        voice_id TEXT NOT NULL DEFAULT 'ar-male-1',
        avatar_url TEXT,
        max_call_duration INTEGER NOT NULL DEFAULT 3,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Bot configs table created successfully');

    // إنشاء جدول ملفات المعرفة
    console.log('📝 Creating knowledge_files table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS knowledge_files (
        id SERIAL PRIMARY KEY,
        agent_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        content TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Knowledge files table created successfully');

    // إنشاء جدول الأسئلة الشائعة
    console.log('📝 Creating faqs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        agent_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ FAQs table created successfully');

    // إنشاء جدول المحادثات
    console.log('📝 Creating conversations table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        agent_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,
        user_satisfaction INTEGER
      );
    `);
    console.log('✅ Conversations table created successfully');

    // إنشاء جدول رسائل المحادثات
    console.log('📝 Creating conversation_messages table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        message_type TEXT NOT NULL CHECK (message_type IN ('user', 'bot')),
        content TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Conversation messages table created successfully');

    // إنشاء فهارس للأداء
    console.log('📝 Creating indexes...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_agent_id ON users(agent_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bot_configs_agent_id ON bot_configs(agent_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_knowledge_files_agent_id ON knowledge_files(agent_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_faqs_agent_id ON faqs(agent_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON conversation_messages(session_id);');
    console.log('✅ Indexes created successfully');

    // إدراج بيانات تجريبية
    console.log('📝 Inserting demo data...');
    
    // إنشاء مستخدم تجريبي
    const agentId = 'agent_demo_123';
    await pool.query(`
      INSERT INTO users (email, agent_id, name, password)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING;
    `, ['demo@sanadbot.ai', agentId, 'مستخدم تجريبي', 'demo123456']);
    
    // إنشاء تكوين البوت التجريبي
    await pool.query(`
      INSERT INTO bot_configs (agent_id, bot_name, welcome_message, primary_color, secondary_color, voice_id, max_call_duration)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (agent_id) DO UPDATE SET
        bot_name = EXCLUDED.bot_name,
        welcome_message = EXCLUDED.welcome_message,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        voice_id = EXCLUDED.voice_id,
        max_call_duration = EXCLUDED.max_call_duration,
        updated_at = NOW();
    `, [agentId, 'مساعد ذكي', 'مرحباً! كيف يمكنني مساعدتك اليوم؟', '#3B82F6', '#1E40AF', 'ar-male-1', 3]);
    
    // إدراج أسئلة شائعة تجريبية
    const faqs = [
      ['ما هي ساعات العمل؟', 'نعمل من الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً بتوقيت الرياض.'],
      ['كيف يمكنني التواصل معكم؟', 'يمكنك التواصل معنا عبر البريد الإلكتروني أو الهاتف أو من خلال هذا المساعد الذكي.'],
      ['هل تقدمون خدمة التوصيل؟', 'نعم، نقدم خدمة التوصيل لجميع مناطق المملكة خلال 2-3 أيام عمل.']
    ];
    
    for (const [question, answer] of faqs) {
      await pool.query(`
        INSERT INTO faqs (agent_id, question, answer)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING;
      `, [agentId, question, answer]);
    }
    
    console.log('✅ Demo data inserted successfully');

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
  } finally {
    await pool.end();
  }
}

setupDatabase();