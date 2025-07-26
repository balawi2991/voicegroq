const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateBotConfigs() {
  console.log('🚀 Migrating bot_configs table to add missing columns...');

  try {
    // إضافة عمود max_call_duration إذا لم يكن موجوداً
    console.log('📝 Adding max_call_duration column...');
    await pool.query(`
      ALTER TABLE bot_configs 
      ADD COLUMN IF NOT EXISTS max_call_duration INTEGER NOT NULL DEFAULT 3;
    `);
    console.log('✅ max_call_duration column added successfully');

    // إضافة عمود avatar_emoji إذا لم يكن موجوداً
    console.log('📝 Adding avatar_emoji column...');
    await pool.query(`
      ALTER TABLE bot_configs 
      ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '🤖';
    `);
    console.log('✅ avatar_emoji column added successfully');

    // التحقق من الأعمدة الموجودة
    console.log('📝 Checking current table structure...');
    const result = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'bot_configs' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Current bot_configs table structure:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'none'})`);
    });

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateBotConfigs();