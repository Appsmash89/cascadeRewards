
'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PIN_STORAGE_KEY = 'cascade-admin-pin';
const PIN_LENGTH = 4;

type PinLockProps = {
  onUnlock: () => void;
};

export default function PinLock({ onUnlock }: PinLockProps) {
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Move focus to next input
    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    setError('');
    setIsLoading(true);
    const enteredPin = pin.join('');
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY) || '0000'; // Default PIN

    setTimeout(() => {
      if (enteredPin === storedPin) {
        onUnlock();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin(Array(PIN_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="items-center text-center">
        <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Admin Access</CardTitle>
        <CardDescription>Enter your 4-digit PIN to access developer tools.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="flex gap-3">
          {pin.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-16 text-3xl text-center font-mono"
              disabled={isLoading}
            />
          ))}
        </div>
        <AnimatePresence>
            {error && (
            <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-destructive font-medium"
            >
                {error}
            </motion.p>
            )}
        </AnimatePresence>
        <Button onClick={handleSubmit} size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Unlock'}
        </Button>
      </CardContent>
    </Card>
  );
}
