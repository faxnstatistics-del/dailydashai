"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

const easeOut = [0.4, 0, 0.2, 1] as [number, number, number, number];
const duration = { fast: 0.22, base: 0.28 };

export const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easeOut },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.fast, ease: easeOut },
  },
};

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

export function InteractiveCard({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -2 }}
      transition={{ duration: duration.fast, ease: easeOut }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
