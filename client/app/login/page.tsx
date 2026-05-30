'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
   const dispatch = useAppDispatch();
   const router = useRouter();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);

   const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
         await dispatch(login({ email, password })).unwrap();
         toast.success('С возвращением!');
         router.push('/');
      } catch (err) {
         toast.error((err as Error)?.message || 'Не удалось войти');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="mx-auto max-w-sm py-16">
         <h1 className="mb-6 text-2xl font-bold">Вход</h1>
         <form onSubmit={submit} className="flex flex-col gap-3">
            <Input
               type="email"
               placeholder="Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
            />
            <Input
               type="password"
               placeholder="Пароль"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
            />
            <Button type="submit" variant="primary" disabled={loading}>
               {loading ? 'Входим...' : 'Войти'}
            </Button>
         </form>
         <p className="mt-4 text-sm text-[var(--color-muted)]">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-white hover:underline">
               Зарегистрироваться
            </Link>
         </p>
      </div>
   );
}
