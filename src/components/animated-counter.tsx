
'use client';

import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

type AnimatedCounterProps = {
  to: number;
};

export default function AnimatedCounter({ to }: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, {
      duration: 0.8,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [to, count]);

  return <motion.span>{rounded}</motion.span>;
}
