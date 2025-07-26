// هذا الملف يحتوي على الأنواع والدوال المطلوبة للعمل مع قاعدة البيانات
// يتم استخدام pg فقط في API routes (server-side)

let pool: any = null;
let query: any = null;

// تهيئة قاعدة البيانات (فقط في البيئة الخادمية)
const initializeDatabase = async () => {
  if (typeof window !== 'undefined' || pool) {
    return; // تجنب التهيئة في المتصفح أو إذا كانت مهيأة بالفعل
  }
  
  try {
    const { Pool } = await import('pg');
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    query = async (text: string, params?: any[]) => {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    };
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// تهيئة قاعدة البيانات عند الحاجة
const ensureDatabase = async () => {
  if (!query && typeof window === 'undefined') {
    await initializeDatabase();
  }
  if (!query) {
    throw new Error('Database not initialized');
  }
  return query;
};

// أنواع البيانات
export interface User {
  id: string;
  email: string;
  agent_id: string;
  name?: string;
  avatar_url?: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

export interface BotConfig {
  id: string;
  agent_id: string;
  bot_name: string;
  welcome_message: string;
  primary_color: string;
  secondary_color: string;
  voice_id: string;
  avatar_url?: string;
  avatar_emoji?: string;
  max_call_duration: number; // الحد الأقصى لمدة المكالمة بالدقائق
  created_at: string;
  updated_at: string;
}

export interface KnowledgeFile {
  id: string;
  agent_id: string;
  filename: string;
  content: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface FAQ {
  id: string;
  agent_id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  session_id: string;
  started_at: string;
  ended_at?: string;
  user_satisfaction?: number;
}

export interface ConversationMessage {
  id: string;
  session_id: string;
  message_type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

// دوال إدارة المستخدمين
export const users = {
  create: async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        `INSERT INTO users (email, agent_id, name, avatar_url, password, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING *`,
        [userData.email, userData.agent_id, userData.name, userData.avatar_url, userData.password]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getByAgentId: async (agentId: string) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        'SELECT * FROM users WHERE agent_id = $1',
        [agentId]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getByEmail: async (email: string) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  update: async (id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>) => {
    try {
      const db = await ensureDatabase();
      const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
      const values = fields.map(key => updates[key as keyof typeof updates]);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      const result = await db(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// دوال إدارة تكوين البوت
export const botConfigs = {
  getByAgentId: async (agentId: string) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        'SELECT * FROM bot_configs WHERE agent_id = $1',
        [agentId]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  upsert: async (config: Omit<BotConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        `INSERT INTO bot_configs (agent_id, bot_name, welcome_message, primary_color, secondary_color, voice_id, avatar_url, avatar_emoji, max_call_duration, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         ON CONFLICT (agent_id) DO UPDATE SET
         bot_name = EXCLUDED.bot_name,
         welcome_message = EXCLUDED.welcome_message,
         primary_color = EXCLUDED.primary_color,
         secondary_color = EXCLUDED.secondary_color,
         voice_id = EXCLUDED.voice_id,
         avatar_url = EXCLUDED.avatar_url,
         avatar_emoji = EXCLUDED.avatar_emoji,
         max_call_duration = EXCLUDED.max_call_duration,
         updated_at = NOW()
         RETURNING *`,
        [config.agent_id, config.bot_name, config.welcome_message, config.primary_color, config.secondary_color, config.voice_id, config.avatar_url, config.avatar_emoji, config.max_call_duration]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// دوال إدارة ملفات المعرفة
export const knowledgeFiles = {
  getByAgentId: async (agentId: string) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        'SELECT * FROM knowledge_files WHERE agent_id = $1 ORDER BY uploaded_at DESC',
        [agentId]
      );
      return { data: result.rows, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  create: async (fileData: Omit<KnowledgeFile, 'id' | 'uploaded_at'>) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        `INSERT INTO knowledge_files (agent_id, filename, content, file_type, file_size, uploaded_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [fileData.agent_id, fileData.filename, fileData.content, fileData.file_type, fileData.file_size]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  delete: async (id: string) => {
    try {
      const db = await ensureDatabase();
      await db('DELETE FROM knowledge_files WHERE id = $1', [id]);
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error };
    }
  },
};

// دوال إدارة الأسئلة الشائعة
export const faqs = {
  getByAgentId: async (agentId: string) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        'SELECT * FROM faqs WHERE agent_id = $1 ORDER BY created_at DESC',
        [agentId]
      );
      return { data: result.rows, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  create: async (faqData: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        `INSERT INTO faqs (agent_id, question, answer, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [faqData.agent_id, faqData.question, faqData.answer]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  update: async (id: string, updates: Partial<Pick<FAQ, 'question' | 'answer'>>) => {
    try {
      const db = await ensureDatabase();
      const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
      const values = fields.map(key => updates[key as keyof typeof updates]);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      const result = await db(
        `UPDATE faqs SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  delete: async (id: string) => {
    try {
      const db = await ensureDatabase();
      await db('DELETE FROM faqs WHERE id = $1', [id]);
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error };
    }
  },
};

// دوال إدارة المحادثات
export const conversations = {
  getByAgentId: async (agentId: string) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        `SELECT c.*, 
         COALESCE(
           json_agg(
             json_build_object(
               'id', cm.id,
               'session_id', cm.session_id,
               'message_type', cm.message_type,
               'content', cm.content,
               'timestamp', cm.timestamp
             ) ORDER BY cm.timestamp
           ) FILTER (WHERE cm.id IS NOT NULL), 
           '[]'
         ) as conversation_messages
         FROM conversations c
         LEFT JOIN conversation_messages cm ON c.session_id = cm.session_id
         WHERE c.agent_id = $1
         GROUP BY c.id
         ORDER BY c.started_at DESC`,
        [agentId]
      );
      return { data: result.rows, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  getMessagesBySessionId: async (sessionId: string) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        'SELECT * FROM conversation_messages WHERE session_id = $1 ORDER BY timestamp ASC',
        [sessionId]
      );
      return { data: result.rows, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  create: async (conversationData: Omit<Conversation, 'id'>) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        `INSERT INTO conversations (agent_id, session_id, started_at, ended_at, user_satisfaction)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [conversationData.agent_id, conversationData.session_id, conversationData.started_at, conversationData.ended_at, conversationData.user_satisfaction]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  addMessage: async (messageData: Omit<ConversationMessage, 'id'>) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        `INSERT INTO conversation_messages (session_id, message_type, content, timestamp)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [messageData.session_id, messageData.message_type, messageData.content, messageData.timestamp]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateSatisfaction: async (sessionId: string, satisfaction: number) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        'UPDATE conversations SET user_satisfaction = $1 WHERE session_id = $2 RETURNING *',
        [satisfaction, sessionId]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  endConversation: async (sessionId: string) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        'UPDATE conversations SET ended_at = NOW() WHERE session_id = $1 RETURNING *',
        [sessionId]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateMessageCount: async (sessionId: string, messageCount: number) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        'UPDATE conversations SET message_count = $1 WHERE session_id = $2 RETURNING *',
        [messageCount, sessionId]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  addWelcomeMessage: async (sessionId: string, agentId: string, welcomeMessage: string) => {
    try {
      const db = await ensureDatabase();
      const result = await db(
        `INSERT INTO conversation_messages (session_id, message_type, content, timestamp)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [sessionId, 'bot', welcomeMessage, new Date().toISOString()]
      );
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// تصدير كائن database يحتوي على جميع الدوال
export const database = {
  users,
  botConfigs,
  knowledgeFiles,
  faqs,
  conversations,
};