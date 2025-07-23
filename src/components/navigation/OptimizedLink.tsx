'use client';

import { useNavigation } from './NavigationProvider';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OptimizedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function OptimizedLink({ href, children, className, onClick }: OptimizedLinkProps) {
  const { navigate, prefetchRoute, currentPath } = useNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
    onClick?.();
  };

  const handleMouseEnter = () => {
    prefetchRoute(href);
  };

  const isActive = currentPath === href;

  return (
    <motion.a
      href={href}
      className={cn('cursor-pointer', className)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      data-active={isActive}
    >
      {children}
    </motion.a>
  );
}
