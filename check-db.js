import { database } from './src/lib/supabase.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database for agent_1753098702984_wnwt07md8...');
    
    const result = await database.botConfigs.getByAgentId('agent_1753098702984_wnwt07md8');
    
    console.log('📊 Database result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data) {
      console.log('\n📝 Welcome message in database:');
      console.log(result.data.welcome_message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabase();