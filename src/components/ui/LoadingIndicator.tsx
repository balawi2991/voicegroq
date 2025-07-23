'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/components/navigation/NavigationProvider';

export function LoadingIndicator() {
  const { isNavigating } = useNavigation();

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          {/* شريط التحميل العلوي */}
          <motion.div
            className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%]"
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: [0, 0.3, 0.7, 1],
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              scaleX: { duration: 0.8, ease: "easeOut" },
              backgroundPosition: { duration: 1.5, repeat: Infinity, ease: "linear" }
            }}
            style={{ transformOrigin: 'left' }}
          />
          
          {/* تأثير الوهج */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
