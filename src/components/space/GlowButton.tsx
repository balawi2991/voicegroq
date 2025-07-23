'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface GlowButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function GlowButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button',
}: GlowButtonProps) {
  const baseClasses = cn(
    'relative inline-flex items-center justify-center font-medium rounded-xl',
    'transition-all duration-300 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    {
      // الأحجام
      'px-4 py-2 text-sm': size === 'sm',
      'px-6 py-3 text-base': size === 'md',
      'px-8 py-4 text-lg': size === 'lg',
      
      // الأنواع
      'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg': variant === 'primary',
      'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg': variant === 'secondary',
      'border-2 border-blue-500/50 text-blue-400 bg-transparent': variant === 'outline',
    },
    className
  );

  const glowClasses = cn({
    'shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]': variant === 'primary',
    'shadow-[0_0_15px_rgba(107,114,128,0.3)] hover:shadow-[0_0_25px_rgba(107,114,128,0.5)]': variant === 'secondary',
    'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:bg-blue-500/10': variant === 'outline',
  });

  const MotionComponent = motion.button;

  const buttonContent = (
    <MotionComponent
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, glowClasses)}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        y: disabled ? 0 : -2,
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.95,
        y: disabled ? 0 : 0,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
    >
      {/* تأثير الإضاءة الداخلية */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* المحتوى */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* تأثير الموجة عند النقر */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1, opacity: [0, 1, 0] }}
        transition={{ duration: 0.3 }}
      />
    </MotionComponent>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}

// مكون خاص للأزرار العائمة (مثل البوت الصوتي)
interface CustomTheme {
  background?: string;
  glass?: string;
  accent?: string;
}

export function FloatingGlowButton({
  children,
  onClick,
  className,
  color = '#3B82F6',
  size = 64,
  isActive = false,
  customTheme,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: string;
  size?: number;
  isActive?: boolean;
  customTheme?: CustomTheme;
}) {
  // استخدام customTheme إذا كان متوفراً
  const effectiveColor = customTheme?.accent ? customTheme.accent.replace('text-', '#') : color;
  const glassEffect = customTheme?.glass || '';

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative rounded-full flex items-center justify-center',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
        customTheme?.glass || '',
        className
      )}
      style={{
        width: size,
        height: size,
        background: customTheme?.glass
          ? 'transparent'
          : `linear-gradient(135deg, ${effectiveColor}, ${effectiveColor}dd)`,
        boxShadow: customTheme?.glass
          ? `0 0 20px ${effectiveColor}20`
          : `0 0 20px ${effectiveColor}40`,
      }}
      whileHover={{
        scale: 1.1,
        boxShadow: customTheme?.glass
          ? `0 0 30px ${effectiveColor}40, 0 0 60px ${effectiveColor}20`
          : `0 0 30px ${effectiveColor}60, 0 0 60px ${effectiveColor}30`,
      }}
      whileTap={{ scale: 0.95 }}
      animate={isActive ? {
        boxShadow: [
          customTheme?.glass
            ? `0 0 20px ${effectiveColor}20`
            : `0 0 20px ${effectiveColor}40`,
          customTheme?.glass
            ? `0 0 40px ${effectiveColor}40`
            : `0 0 40px ${effectiveColor}60`,
          customTheme?.glass
            ? `0 0 20px ${effectiveColor}20`
            : `0 0 20px ${effectiveColor}40`,
        ],
      } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17,
        boxShadow: { duration: 2, repeat: Infinity }
      }}
    >
      {/* موجات صوتية عند التفعيل */}
      {isActive && (
        <>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: color }}
              animate={{
                scale: [1, 1.5 + i * 0.2],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
      
      {/* المحتوى */}
      <div className="relative z-10 text-white">
        {children}
      </div>
    </motion.button>
  );
}
