'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlowButton } from '@/components/space/GlowButton';
import { useConversations, useConversationDetails } from '@/hooks/useConversations';
import { 
  MessageSquare, 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Download,
  RefreshCw,
  MessageCircle
} from 'lucide-react';

interface ConversationMessage {
  id: string;
  message_type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface ConversationItem {
  id: string;
  sessionId: string;
  createdAt: string;
  endedAt?: string;
  duration: number; // بالدقائق
  messageCount: number;
  userLocation?: string;
  firstMessage?: {
    content: string;
    timestamp: string;
  };
  lastBotMessage?: {
    content: string;
    timestamp: string;
  };
  satisfaction?: number;
  isActive: boolean;
  messages?: ConversationMessage[];
}

export default function ConversationsPage() {
  const { conversations, isLoading, error } = useConversations();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { conversationDetails, isLoading: detailsLoading } = useConversationDetails(selectedSessionId);
  
  // البيانات الوهمية للاختبار (يمكن إزالتها لاحقاً)
  const [fallbackConversations] = useState<ConversationItem[]>([
    {
      id: '1',
      sessionId: 'session_001',
      createdAt: '2024-01-15 14:30:00',
      endedAt: '2024-01-15 14:35:00',
      duration: 5,
      messageCount: 8,
      userLocation: 'الرياض',
      firstMessage: {
        content: 'ما هي ساعات العمل؟',
        timestamp: '2024-01-15 14:30:15'
      },
      lastBotMessage: {
        content: 'التوصيل مجاني للطلبات أكثر من 200 ريال، وإلا فالتكلفة 25 ريال.',
        timestamp: '2024-01-15 14:32:05'
      },
      isActive: false,
      messages: [
        {
          id: '1',
          message_type: 'bot',
          content: 'مرحباً، أنا مساعد ذكي. كيف يمكنني مساعدتك؟',
          timestamp: '2024-01-15T14:30:00.000Z'
        },
        {
          id: '2',
          message_type: 'user',
          content: 'ما هي ساعات العمل؟',
          timestamp: '2024-01-15T14:30:15.000Z'
        },
        {
          id: '3',
          message_type: 'bot',
          content: 'نعمل من الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً بتوقيت الرياض.',
          timestamp: '2024-01-15T14:30:18.000Z'
        },
        {
          id: '4',
          message_type: 'user',
          content: 'هل تقدمون خدمة التوصيل؟',
          timestamp: '2024-01-15T14:31:00.000Z'
        },
        {
          id: '5',
          message_type: 'bot',
          content: 'نعم، نقدم خدمة التوصيل لجميع مناطق المملكة خلال 2-3 أيام عمل.',
          timestamp: '2024-01-15T14:31:03.000Z'
        },
        {
          id: '6',
          message_type: 'user',
          content: 'كم تكلفة التوصيل؟',
          timestamp: '2024-01-15T14:32:00.000Z'
        },
        {
          id: '7',
          message_type: 'bot',
          content: 'التوصيل مجاني للطلبات أكثر من 200 ريال، وإلا فالتكلفة 25 ريال.',
          timestamp: '2024-01-15T14:32:05.000Z'
        },
        {
          id: '8',
          message_type: 'user',
          content: 'شكراً لك',
          timestamp: '2024-01-15T14:35:00.000Z'
        }
      ]
    },
    {
      id: '2',
      sessionId: 'session_002',
      createdAt: '2024-01-14 10:15:00',
      endedAt: '2024-01-14 10:18:00',
      duration: 3,
      messageCount: 3,
      userLocation: 'جدة',
      firstMessage: {
        content: 'أريد معرفة المزيد عن منتجاتكم',
        timestamp: '2024-01-14 10:15:30'
      },
      lastBotMessage: {
        content: 'بالطبع! لدينا مجموعة واسعة من المنتجات عالية الجودة. هل تبحث عن فئة معينة؟',
        timestamp: '2024-01-14 10:15:35'
      },
      isActive: false,
      messages: [
        {
          id: '9',
          message_type: 'bot',
          content: 'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟',
          timestamp: '2024-01-14T10:15:00.000Z'
        },
        {
          id: '10',
          message_type: 'user',
          content: 'أريد معرفة المزيد عن منتجاتكم',
          timestamp: '2024-01-14T10:15:30.000Z'
        },
        {
          id: '11',
          message_type: 'bot',
          content: 'بالطبع! لدينا مجموعة واسعة من المنتجات عالية الجودة. هل تبحث عن فئة معينة؟',
          timestamp: '2024-01-14T10:15:35.000Z'
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // استخدام البيانات الحقيقية أو الوهمية كبديل
  const displayConversations = conversations || fallbackConversations;


  
  const filteredConversations = displayConversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      (conv.firstMessage?.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
       conv.lastBotMessage?.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = filterDate === '' || 
      conv.createdAt.includes(filterDate);
    
    return matchesSearch && matchesDate;
  });

  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // إذا كان التاريخ غير صالح، حاول استخراج الوقت من النص
        const timePart = timestamp.split(' ')[1] || timestamp.split('T')[1];
        return timePart ? timePart.substring(0, 8) : timestamp;
      }
      return date.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      return timestamp;
    }
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'غير محدد';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // إذا كان التاريخ غير صالح، حاول تنسيقه يدوياً
        const datePart = timestamp.split(' ')[0] || timestamp.split('T')[0];
        return datePart || timestamp;
      }
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return timestamp;
    }
  };

  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return 'غير محدد';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return timestamp;
    }
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
          {isLoading ? (
            // حالة التحميل
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="w-12 h-6 bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white">{displayConversations.length}</div>
                <div className="text-sm text-gray-400">إجمالي المحادثات</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-green-400">
                  {displayConversations.filter(c => c.endedAt).length}
                </div>
                <div className="text-sm text-gray-400">مكتملة</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-blue-400">
                  {displayConversations.length > 0 ? Math.round(displayConversations.reduce((acc, c) => acc + c.messageCount, 0) / displayConversations.length) : 0}
                </div>
                <div className="text-sm text-gray-400">متوسط الرسائل</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-purple-400">
                  {displayConversations.length > 0 ? Math.round(displayConversations.reduce((acc, c) => acc + c.duration, 0) / displayConversations.length) : 0}
                </div>
                <div className="text-sm text-gray-400">متوسط المدة (دقيقة)</div>
              </div>
            </>
          )}
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
              {isLoading ? (
                // حالة التحميل
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 border-b border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-16 h-3 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full h-4 bg-gray-600 rounded animate-pulse mb-2"></div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-3 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-12 h-3 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-red-400">خطأ في تحميل المحادثات</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-400">لا توجد محادثات</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-all ${
                      selectedConversationId === conversation.id
                        ? 'bg-blue-500/20 border-r-4 border-r-blue-500'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => {
                      setSelectedConversationId(conversation.id);
                      setSelectedSessionId(conversation.sessionId);
                    }}
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
                        {formatDate(conversation.createdAt)}
                      </span>
                    </div>
                    
                    <div className="text-white font-medium mb-1 truncate">
                      {conversation.sessionId || `محادثة ${conversation.id}`}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {conversation.messageCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {conversation.duration} دقيقة
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* تفاصيل المحادثة */}
          <motion.div
            className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {selectedConversationId && selectedSessionId ? (
              detailsLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">جاري تحميل تفاصيل المحادثة...</p>
                  </div>
                </div>
              ) : conversationDetails ? (
                <>
                  {/* رأس المحادثة */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          تفاصيل المحادثة
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                           <span>بدأت: {formatDateTime(conversationDetails.createdAt)}</span>
                           {conversationDetails.endedAt && (
                             <span>انتهت: {formatDateTime(conversationDetails.endedAt)}</span>
                           )}
                           <span>المدة: {conversationDetails.duration} دقيقة</span>
                         </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-400">الجلسة</div>
                        <div className="text-white font-medium">
                           {conversationDetails.sessionId}
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* الرسائل */}
                  <div className="p-6 max-h-[500px] overflow-y-auto">
                    <div className="space-y-4">
                       {conversationDetails.messages && conversationDetails.messages.length > 0 ? (
                         // ترتيب الرسائل حسب التاريخ (من الأقدم إلى الأحدث)
                         conversationDetails.messages
                           .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                           .map((message, index) => (
                             <motion.div
                               key={message.id || index}
                               className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: index * 0.1 }}
                             >
                               <div className={`max-w-[80%] p-4 rounded-xl ${
                                 message.message_type === 'user'
                                   ? 'bg-blue-500/20 text-white border border-blue-500/30'
                                   : 'bg-white/10 text-gray-100 border border-white/20'
                               }`}>
                                 <div className="text-sm mb-2 leading-relaxed">
                                   {message.content}
                                 </div>
                                 <div className="text-xs opacity-60 flex items-center gap-2">
                                   <span className={`w-2 h-2 rounded-full ${
                                     message.message_type === 'user' ? 'bg-blue-400' : 'bg-green-400'
                                   }`}></span>
                                   {formatTime(message.timestamp)}
                                 </div>
                               </div>
                             </motion.div>
                           ))
                       ) : (
                         <div className="text-center py-8">
                           <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                           <p className="text-gray-400">لا توجد رسائل في هذه المحادثة</p>
                         </div>
                       )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">خطأ في تحميل تفاصيل المحادثة</p>
                  </div>
                </div>
              )
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
