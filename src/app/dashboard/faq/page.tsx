'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import { GlowButton } from '@/components/space/GlowButton';
import { 
  HelpCircle, 
  Plus, 
  Edit3, 
  Trash2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  MessageSquare
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
}

export default function FAQPage() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  // جلب الأسئلة الشائعة من قاعدة البيانات
  useEffect(() => {
    const fetchFAQs = async () => {
      if (!user?.agentId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/faq/${user.agentId}`);
        const result = await response.json();

        if (result.success) {
          // تحويل البيانات من قاعدة البيانات إلى تنسيق المكون
          const formattedFAQs: FAQ[] = result.data.map((faq: any) => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            isActive: faq.is_active,
            createdAt: new Date(faq.created_at).toISOString().split('T')[0]
          }));
          setFaqs(formattedFAQs);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [user?.agentId]);

  const addFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim() || !user?.agentId) return;

    try {
      const response = await fetch(`/api/faq/${user.agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newFaq.question,
          answer: newFaq.answer,
          isActive: true
        })
      });

      const result = await response.json();

      if (result.success) {
        const newFaqItem: FAQ = {
          id: result.data.id,
          question: result.data.question,
          answer: result.data.answer,
          isActive: result.data.is_active,
          createdAt: new Date(result.data.created_at).toISOString().split('T')[0]
        };
        setFaqs(prev => [newFaqItem, ...prev]);
        setNewFaq({ question: '', answer: '' });
        setShowAddModal(false);
      } else {
        alert('فشل في إضافة السؤال');
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      alert('فشل في إضافة السؤال');
    }
  };

  const updateFaq = async (id: string, updates: Partial<FAQ>) => {
    if (!user?.agentId) return;

    try {
      const response = await fetch(`/api/faq/${user.agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          question: updates.question,
          answer: updates.answer,
          isActive: updates.isActive
        })
      });

      const result = await response.json();

      if (result.success) {
        setFaqs(prev => prev.map(faq =>
          faq.id === id ? { ...faq, ...updates } : faq
        ));
      } else {
        alert('فشل في تحديث السؤال');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert('فشل في تحديث السؤال');
    }
  };

  const deleteFaq = async (id: string) => {
    if (!user?.agentId) return;

    try {
      const response = await fetch(`/api/faq/${user.agentId}?faqId=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setFaqs(prev => prev.filter(faq => faq.id !== id));
      } else {
        alert('فشل في حذف السؤال');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('فشل في حذف السؤال');
    }
  };

  const saveEdit = () => {
    if (!editingFaq) return;
    
    updateFaq(editingFaq.id, {
      question: editingFaq.question,
      answer: editingFaq.answer
    });
    
    setEditingFaq(null);
  };

  const toggleActive = (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (faq) {
      updateFaq(id, { isActive: !faq.isActive });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold text-white">الأسئلة الشائعة</h1>
              </div>
              <p className="text-gray-400">
                أضف أسئلة وأجوبة سريعة ليستخدمها المساعد قبل البحث في المعرفة الكاملة
              </p>
            </div>
            
            <GlowButton onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              إضافة سؤال
            </GlowButton>
          </div>
        </motion.div>

        {/* الإحصائيات */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-white">{faqs.length}</div>
            <div className="text-sm text-gray-400">إجمالي الأسئلة</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-green-400">
              {faqs.filter(f => f.isActive).length}
            </div>
            <div className="text-sm text-gray-400">مفعلة</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">
              {faqs.filter(f => !f.isActive).length}
            </div>
            <div className="text-sm text-gray-400">معطلة</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round((faqs.filter(f => f.isActive).length / faqs.length) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-400">معدل التفعيل</div>
          </div>
        </motion.div>

        {/* قائمة الأسئلة */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white">
              قائمة الأسئلة والأجوبة
            </h3>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">جاري تحميل الأسئلة...</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">لم يتم إضافة أي أسئلة بعد</p>
                <GlowButton onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4" />
                  إضافة أول سؤال
                </GlowButton>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <motion.div
                    key={faq.id}
                    className={`p-6 rounded-xl border transition-all ${
                      faq.isActive 
                        ? 'bg-white/5 border-white/20' 
                        : 'bg-white/2 border-white/10 opacity-60'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                  >
                    {editingFaq?.id === faq.id ? (
                      // وضع التحرير
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            السؤال
                          </label>
                          <input
                            type="text"
                            value={editingFaq.question}
                            onChange={(e) => setEditingFaq({
                              ...editingFaq,
                              question: e.target.value
                            })}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            الإجابة
                          </label>
                          <textarea
                            value={editingFaq.answer}
                            onChange={(e) => setEditingFaq({
                              ...editingFaq,
                              answer: e.target.value
                            })}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <GlowButton onClick={saveEdit} size="sm">
                            <Save className="w-4 h-4" />
                            حفظ
                          </GlowButton>
                          
                          <GlowButton
                            variant="outline"
                            onClick={() => setEditingFaq(null)}
                            size="sm"
                          >
                            <X className="w-4 h-4" />
                            إلغاء
                          </GlowButton>
                        </div>
                      </div>
                    ) : (
                      // وضع العرض
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2">
                              {faq.question}
                            </h4>
                            <p className="text-gray-300 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 mr-4">
                            <button
                              onClick={() => toggleActive(faq.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title={faq.isActive ? 'تعطيل' : 'تفعيل'}
                            >
                              {faq.isActive ? (
                                <ToggleRight className="w-5 h-5 text-green-400" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            
                            <button
                              onClick={() => setEditingFaq(faq)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="تحرير"
                            >
                              <Edit3 className="w-4 h-4 text-blue-400" />
                            </button>
                            
                            <button
                              onClick={() => deleteFaq(faq.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>تم الإنشاء: {faq.createdAt}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            faq.isActive 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {faq.isActive ? 'مفعل' : 'معطل'}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* مودال إضافة سؤال جديد */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-space-dark border border-white/20 rounded-xl p-6 w-full max-w-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                    إضافة سؤال جديد
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      السؤال
                    </label>
                    <input
                      type="text"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq(prev => ({
                        ...prev,
                        question: e.target.value
                      }))}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      placeholder="ما هو السؤال الذي يطرحه العملاء؟"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      الإجابة
                    </label>
                    <textarea
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq(prev => ({
                        ...prev,
                        answer: e.target.value
                      }))}
                      className="w-full h-32 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                      placeholder="اكتب الإجابة التي سيقولها المساعد..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <GlowButton
                    onClick={addFaq}
                    disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة السؤال
                  </GlowButton>
                  
                  <GlowButton
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    إلغاء
                  </GlowButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
