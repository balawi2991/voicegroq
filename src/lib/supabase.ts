import { createClient } from '@supabase/supabase-js';

// تكوين Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// أنواع قاعدة البيانات
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          agent_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          agent_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          agent_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bot_configs: {
        Row: {
          id: string;
          agent_id: string;
          name: string;
          avatar_url: string | null;
          avatar_emoji: string;
          voice_id: string;
          button_color: string;
          welcome_message: string | null;
        
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          name: string;
          avatar_url?: string | null;
          avatar_emoji?: string;
          voice_id: string;
          button_color: string;
          welcome_message?: string | null;
        
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          name?: string;
          avatar_url?: string | null;
          avatar_emoji?: string;
          voice_id?: string;
          button_color?: string;
          welcome_message?: string | null;
        
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      knowledge_files: {
        Row: {
          id: string;
          agent_id: string;
          file_name: string;
          file_type: string;
          content: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          file_name: string;
          file_type: string;
          content: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          file_name?: string;
          file_type?: string;
          content?: string;
          uploaded_at?: string;
        };
      };
      faqs: {
        Row: {
          id: string;
          agent_id: string;
          question: string;
          answer: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          question: string;
          answer: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          question?: string;
          answer?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          session_id: string;
          agent_id: string;
          started_at: string;
          ended_at: string | null;
          message_count: number;
          user_location: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          agent_id: string;
          started_at?: string;
          ended_at?: string | null;
          message_count?: number;
          user_location?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          agent_id?: string;
          started_at?: string;
          ended_at?: string | null;
          message_count?: number;
          user_location?: string | null;
        };
      };
      conversation_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'bot';
          text: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'bot';
          text: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'bot';
          text?: string;
          timestamp?: string;
        };
      };
    };
  };
}

// دوال مساعدة للمصادقة
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};

// دوال مساعدة لإدارة البيانات
export const database = {
  // إدارة المستخدمين
  users: {
    create: async (userData: Database['public']['Tables']['users']['Insert']) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      return { data, error };
    },

    getByAgentId: async (agentId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('agent_id', agentId)
        .single();
      return { data, error };
    },

    update: async (id: string, updates: Database['public']['Tables']['users']['Update']) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // إدارة تكوين البوت
  botConfigs: {
    getByAgentId: async (agentId: string) => {
      const { data, error } = await supabase
        .from('bot_configs')
        .select('*')
        .eq('agent_id', agentId)
        .single();
      return { data, error };
    },

    upsert: async (config: Database['public']['Tables']['bot_configs']['Insert']) => {
      const { data, error } = await supabase
        .from('bot_configs')
        .upsert(config, { onConflict: 'agent_id' })
        .select()
        .single();
      return { data, error };
    },
  },

  // إدارة ملفات المعرفة
  knowledgeFiles: {
    getByAgentId: async (agentId: string) => {
      const { data, error } = await supabase
        .from('knowledge_files')
        .select('*')
        .eq('agent_id', agentId)
        .order('uploaded_at', { ascending: false });
      return { data, error };
    },

    create: async (fileData: Database['public']['Tables']['knowledge_files']['Insert']) => {
      const { data, error } = await supabase
        .from('knowledge_files')
        .insert(fileData)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('knowledge_files')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // إدارة الأسئلة الشائعة
  faqs: {
    getByAgentId: async (agentId: string) => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    create: async (faqData: Database['public']['Tables']['faqs']['Insert']) => {
      const { data, error } = await supabase
        .from('faqs')
        .insert(faqData)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: Database['public']['Tables']['faqs']['Update']) => {
      const { data, error } = await supabase
        .from('faqs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // إدارة المحادثات
  conversations: {
    getByAgentId: async (agentId: string) => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_messages (*)
        `)
        .eq('agent_id', agentId)
        .order('started_at', { ascending: false });
      return { data, error };
    },

    create: async (conversationData: Database['public']['Tables']['conversations']['Insert']) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();
      return { data, error };
    },

    addMessage: async (messageData: Database['public']['Tables']['conversation_messages']['Insert']) => {
      const { data, error } = await supabase
        .from('conversation_messages')
        .insert(messageData)
        .select()
        .single();
      return { data, error };
    },
  },
};
