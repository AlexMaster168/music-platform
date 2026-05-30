'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { register } from '@/store/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
   const dispatch = useAppDispatch();
   const router = useRouter();
   const [displayName, setDisplayName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);

   const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
         await dispatch(register({ displayName, email, password })).unwrap();
         toast.success('Аккаунт создан!');
         router.push('/');
      } catch (err) {
         toast.error((err as Error)?.message || 'Не удалось зарегистрироваться');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="mx-auto max-w-sm py-16">
         <h1 className="mb-6 text-2xl font-bold">Регистрация</h1>
         <form onSubmit={submit} className="flex flex-col gap-3">
            <Input
               placeholder="Имя"
               value={displayName}
               onChange={(e) => setDisplayName(e.target.value)}
               required
            />
            <Input
               type="email"
               placeholder="Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
            />
            <Input
               type="password"
               placeholder="Пароль (минимум 6 символов)"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               minLength={6}
               required
            />
            <Button type="submit" variant="primary" disabled={loading}>
               {loading ? 'Создаём...' : 'Зарегистрироваться'}
            </Button>
         </form>
         <p className="mt-4 text-sm text-[var(--color-muted)]">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-white hover:underline">
               Войти
            </Link>
         </p>
      </div>
   );
}
