'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlowButton } from '@/components/space/GlowButton';
import { 
  MessageSquare, 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Download,
  RefreshCw
} from 'lucide-react';

interface ConversationMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  duration: string;
  messageCount: number;
  messages: ConversationMessage[];
  userLocation?: string;
}

export default function ConversationsPage() {
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      sessionId: 'session_001',
      startedAt: '2024-01-15 14:30:00',
      endedAt: '2024-01-15 14:35:00',
      duration: '5 دقائق',
      messageCount: 8,
      userLocation: 'الرياض',
      messages: [
        {
          id: '1',
          role: 'bot',
          text: 'مرحباً، أنا مساعد ذكي. كيف يمكنني مساعدتك؟',
          timestamp: '14:30:00'
        },
        {
          id: '2',
          role: 'user',
          text: 'ما هي ساعات العمل؟',
          timestamp: '14:30:15'
        },
        {
          id: '3',
          role: 'bot',
          text: 'نعمل من الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً بتوقيت الرياض.',
          timestamp: '14:30:18'
        },
        {
          id: '4',
          role: 'user',
          text: 'هل تقدمون خدمة التوصيل؟',
          timestamp: '14:31:00'
        },
        {
          id: '5',
          role: 'bot',
          text: 'نعم، نقدم خدمة التوصيل لجميع مناطق المملكة خلال 2-3 أيام عمل.',
          timestamp: '14:31:03'
        },
        {
          id: '6',
          role: 'user',
          text: 'كم تكلفة التوصيل؟',
          timestamp: '14:32:00'
        },
        {
          id: '7',
          role: 'bot',
          text: 'التوصيل مجاني للطلبات أكثر من 200 ريال، وإلا فالتكلفة 25 ريال.',
          timestamp: '14:32:05'
        },
        {
          id: '8',
          role: 'user',
          text: 'شكراً لك',
          timestamp: '14:35:00'
        }
      ]
    },
    {
      id: '2',
      sessionId: 'session_002',
      startedAt: '2024-01-15 16:45:00',
      endedAt: '2024-01-15 16:47:00',
      duration: '2 دقيقة',
      messageCount: 4,
      userLocation: 'جدة',
      messages: [
        {
          id: '1',
          role: 'bot',
          text: 'مرحباً، أنا مساعد ذكي. كيف يمكنني مساعدتك؟',
          timestamp: '16:45:00'
        },
        {
          id: '2',
          role: 'user',
          text: 'كيف يمكنني التواصل معكم؟',
          timestamp: '16:45:30'
        },
        {
          id: '3',
          role: 'bot',
          text: 'يمكنك التواصل معنا عبر البريد الإلكتروني info@company.com أو الهاتف 920000000',
          timestamp: '16:45:35'
        },
        {
          id: '4',
          role: 'user',
          text: 'ممتاز، شكراً',
          timestamp: '16:47:00'
        }
      ]
    },
    {
      id: '3',
      sessionId: 'session_003',
      startedAt: '2024-01-14 10:15:00',
      duration: '1 دقيقة',
      messageCount: 2,
      userLocation: 'الدمام',
      messages: [
        {
          id: '1',
          role: 'bot',
          text: 'مرحباً، أنا مساعد ذكي. كيف يمكنني مساعدتك؟',
          timestamp: '10:15:00'
        },
        {
          id: '2',
          role: 'user',
          text: 'مرحبا',
          timestamp: '10:16:00'
        }
      ]
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.messages.some(msg => 
        msg.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesDate = filterDate === '' || 
      conv.startedAt.includes(filterDate);
    
    return matchesSearch && matchesDate;
  });

  const formatTime = (timestamp: string) => {
    return timestamp.split(' ')[1] || timestamp;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-SA');
  };

  const exportConversations = () => {
    // TODO: تصدير المحادثات
    console.log('Exporting conversations...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* العنوان والأدوات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold text-white">المحادثات</h1>
              </div>
              <p className="text-gray-400">
                تصفح وراجع جميع المحادثات التي تمت مع زوار موقعك
              </p>
            </div>
            
            <div className="flex gap-3">
              <GlowButton variant="outline" onClick={exportConversations}>
                <Download className="w-4 h-4" />
                تصدير
              </GlowButton>
              
              <GlowButton variant="outline">
                <RefreshCw className="w-4 h-4" />
                تحديث
              </GlowButton>
            </div>
          </div>
        </motion.div>

        {/* الإحصائيات */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-white">{conversations.length}</div>
            <div className="text-sm text-gray-400">إجمالي المحادثات</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-green-400">
              {conversations.filter(c => c.endedAt).length}
            </div>
            <div className="text-sm text-gray-400">مكتملة</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(conversations.reduce((acc, c) => acc + c.messageCount, 0) / conversations.length)}
            </div>
            <div className="text-sm text-gray-400">متوسط الرسائل</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-purple-400">3.4</div>
            <div className="text-sm text-gray-400">متوسط المدة (دقيقة)</div>
          </div>
        </motion.div>

        {/* أدوات البحث والتصفية */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="البحث في المحادثات..."
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-lg px-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* المحتوى الرئيسي */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* قائمة المحادثات */}
          <motion.div
            className="lg:col-span-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">
                المحادثات ({filteredConversations.length})
              </h3>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-all ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-500/20 border-r-4 border-r-blue-500'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {conversation.userLocation || 'غير محدد'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(conversation.startedAt)}
                    </span>
                  </div>
                  
                  <div className="text-white font-medium mb-1 truncate">
                    {conversation.messages[1]?.text || 'محادثة جديدة'}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {conversation.messageCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {conversation.duration}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* تفاصيل المحادثة */}
          <motion.div
            className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {selectedConversation ? (
              <>
                {/* رأس المحادثة */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        تفاصيل المحادثة
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>بدأت: {formatDate(selectedConversation.startedAt)} - {formatTime(selectedConversation.startedAt)}</span>
                        {selectedConversation.endedAt && (
                          <span>انتهت: {formatTime(selectedConversation.endedAt)}</span>
                        )}
                        <span>المدة: {selectedConversation.duration}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-400">الموقع</div>
                      <div className="text-white font-medium">
                        {selectedConversation.userLocation || 'غير محدد'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* الرسائل */}
                <div className="p-6 max-h-[500px] overflow-y-auto">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className={`max-w-[80%] p-4 rounded-xl ${
                          message.role === 'user'
                            ? 'bg-blue-500/20 text-white'
                            : 'bg-white/10 text-gray-100'
                        }`}>
                          <div className="text-sm mb-1">
                            {message.text}
                          </div>
                          <div className="text-xs opacity-60">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">اختر محادثة لعرض تفاصيلها</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
