'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import { GlowButton } from '@/components/space/GlowButton';
import { 
  Brain, 
  Upload, 
  FileText, 
  File, 
  Trash2,
  Download,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';

interface KnowledgeFile {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md';
  size: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
}

export default function KnowledgePage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [showTextModal, setShowTextModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب ملفات المعرفة من قاعدة البيانات
  useEffect(() => {
    const fetchKnowledgeFiles = async () => {
      if (!user?.agentId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/knowledge/${user.agentId}`);
        const result = await response.json();

        if (result.success) {
          // تحويل البيانات من قاعدة البيانات إلى تنسيق المكون
          const formattedFiles: KnowledgeFile[] = result.data.map((file: any) => ({
            id: file.id,
            name: file.file_name,
            type: file.file_type as 'pdf' | 'txt' | 'md',
            size: formatFileSize(file.file_size || 0),
            uploadedAt: new Date(file.uploaded_at).toISOString().split('T')[0],
            status: file.status as 'processing' | 'ready' | 'error'
          }));
          setFiles(formattedFiles);
        }
      } catch (error) {
        console.error('Error fetching knowledge files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeFiles();
  }, [user?.agentId]);

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || !user?.agentId) return;

    setIsUploading(true);

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];

      // التحقق من نوع الملف
      const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
        alert(`نوع الملف ${file.name} غير مدعوم`);
        continue;
      }

      try {
        // قراءة محتوى الملف
        const content = await readFileContent(file);

        // رفع الملف إلى قاعدة البيانات
        const response = await fetch(`/api/knowledge/${user.agentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.md') ? 'md' : 'txt',
            content: content,
            fileSize: file.size
          })
        });

        const result = await response.json();

        if (result.success) {
          // إضافة الملف للقائمة
          const newFile: KnowledgeFile = {
            id: result.data.id,
            name: result.data.file_name,
            type: result.data.file_type as 'pdf' | 'txt' | 'md',
            size: formatFileSize(result.data.file_size || 0),
            uploadedAt: new Date(result.data.uploaded_at).toISOString().split('T')[0],
            status: result.data.status as 'processing' | 'ready' | 'error'
          };
          setFiles(prev => [...prev, newFile]);
        } else {
          alert(`فشل في رفع الملف ${file.name}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`فشل في رفع الملف ${file.name}`);
      }
    }

    setIsUploading(false);
  };

  // دالة لقراءة محتوى الملف
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const deleteFile = async (id: string) => {
    if (!user?.agentId) return;

    try {
      const response = await fetch(`/api/knowledge/${user.agentId}?fileId=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setFiles(prev => prev.filter(f => f.id !== id));
      } else {
        alert('فشل في حذف الملف');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('فشل في حذف الملف');
    }
  };

  const addTextContent = async () => {
    if (!textContent.trim() || !user?.agentId) return;

    try {
      // رفع المحتوى النصي إلى قاعدة البيانات
      const response = await fetch(`/api/knowledge/${user.agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'محتوى نصي.txt',
          fileType: 'txt',
          content: textContent,
          fileSize: new Blob([textContent]).size
        })
      });

      const result = await response.json();

      if (result.success) {
        // إضافة الملف للقائمة
        const newFile: KnowledgeFile = {
          id: result.data.id,
          name: result.data.file_name,
          type: result.data.file_type as 'pdf' | 'txt' | 'md',
          size: formatFileSize(result.data.file_size || 0),
          uploadedAt: new Date(result.data.uploaded_at).toISOString().split('T')[0],
          status: result.data.status as 'processing' | 'ready' | 'error'
        };
        setFiles(prev => [...prev, newFile]);
        setTextContent('');
        setShowTextModal(false);
      } else {
        alert('فشل في حفظ المحتوى النصي');
      }
    } catch (error) {
      console.error('Error adding text content:', error);
      alert('فشل في حفظ المحتوى النصي');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <File className="w-8 h-8 text-red-400" />;
      case 'md':
        return <FileText className="w-8 h-8 text-blue-400" />;
      default:
        return <FileText className="w-8 h-8 text-green-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-400';
      case 'processing':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'جاهز';
      case 'processing':
        return 'قيد المعالجة...';
      case 'error':
        return 'خطأ';
      default:
        return 'غير معروف';
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
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">إدارة المعرفة</h1>
          </div>
          <p className="text-gray-400">
            ارفع الملفات والمحتوى الذي سيستخدمه مساعدك للإجابة على الأسئلة
          </p>
        </motion.div>

        {/* منطقة الرفع */}
        <motion.div
          className={`bg-white/5 backdrop-blur-sm rounded-xl p-8 border-2 border-dashed transition-all ${
            isDragging 
              ? 'border-blue-400 bg-blue-400/10' 
              : 'border-white/20 hover:border-white/40'
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              اسحب الملفات هنا أو انقر للرفع
            </h3>
            <p className="text-gray-400 mb-6">
              يدعم PDF, TXT, MD حتى 10MB لكل ملف
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              
              <GlowButton
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'جاري الرفع...' : 'اختيار ملفات'}
              </GlowButton>
              
              <GlowButton
                variant="outline"
                onClick={() => setShowTextModal(true)}
              >
                <Plus className="w-4 h-4" />
                إضافة نص
              </GlowButton>
            </div>
          </div>
        </motion.div>

        {/* قائمة الملفات */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white">
              الملفات المرفوعة ({files.length})
            </h3>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">جاري تحميل الملفات...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">لم يتم رفع أي ملفات بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                  >
                    {getFileIcon(file.type)}
                    
                    <div className="flex-1">
                      <div className="text-white font-medium">{file.name}</div>
                      <div className="text-sm text-gray-400">
                        {file.size} • {file.uploadedAt}
                      </div>
                    </div>
                    
                    <div className={`text-sm font-medium ${getStatusColor(file.status)}`}>
                      {getStatusText(file.status)}
                      {file.status === 'processing' && (
                        <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin inline-block mr-2" />
                      )}
                      {file.status === 'ready' && (
                        <CheckCircle className="w-4 h-4 inline-block mr-2" />
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="تحميل"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* مودال إضافة نص */}
        <AnimatePresence>
          {showTextModal && (
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
                  <h3 className="text-xl font-bold text-white">إضافة محتوى نصي</h3>
                  <button
                    onClick={() => setShowTextModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full h-64 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                  placeholder="اكتب المحتوى الذي تريد إضافته لمعرفة المساعد..."
                />
                
                <div className="flex gap-4 mt-6">
                  <GlowButton
                    onClick={addTextContent}
                    disabled={!textContent.trim()}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة المحتوى
                  </GlowButton>
                  
                  <GlowButton
                    variant="outline"
                    onClick={() => setShowTextModal(false)}
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
