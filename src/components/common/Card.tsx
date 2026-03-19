// src/components/common/Card.tsx
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  hover?: boolean;
  animate?: boolean;
  delay?: number;
}

export default function Card({
  children,
  className = '',
  hover,
  animate = false,
  delay = 0,
  ...props
}: CardProps) {
  const baseClasses = `bg-white rounded-lg border border-gray-100 ${
    hover ? 'cursor-pointer' : ''
  } ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay, ease: 'easeOut' }}
        whileHover={hover ? {
          y: -4,
          boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.12)',
          borderColor: '#e5e7eb'
        } : undefined}
        whileTap={hover ? { scale: 0.99 } : undefined}
        className={baseClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={hover ? {
        y: -4,
        boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.12)',
        borderColor: '#e5e7eb'
      } : undefined}
      whileTap={hover ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2 }}
      className={baseClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}

// Animated Card for lists
interface AnimatedCardProps extends CardProps {
  index?: number;
}

export function AnimatedCard({
  children,
  className = '',
  hover,
  index = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      whileHover={hover ? {
        y: -4,
        boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.12)',
        borderColor: '#e5e7eb'
      } : undefined}
      whileTap={hover ? { scale: 0.99 } : undefined}
      className={`bg-white rounded-lg border border-gray-100 ${hover ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
