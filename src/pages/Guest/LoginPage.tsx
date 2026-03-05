import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginGuest } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const setGuest = useAuthStore((state) => state.setGuest);
    const [errorMsg, setErrorMsg] = useState('');

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: LoginFormValues) => loginGuest(data),
        onSuccess: (response) => {
            setGuest(response.data);
            navigate('/');
        },
        onError: (error: any) => {
            setErrorMsg(error.response?.data?.message || 'Login failed. Please try again.');
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        setErrorMsg('');
        mutation.mutate(data);
    };

    return (
        <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fc' }}>
            <div className="book-card" style={{ maxWidth: 400, width: '100%', padding: '40px 30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🚌</div>
                    <h2 style={{ color: '#1a2152', fontSize: '1.5rem', fontWeight: 700 }}>Welcome to GuestGo</h2>
                    <p style={{ color: '#8a94b2', fontSize: '0.9rem', marginTop: 5 }}>Log in to book your hotel transport</p>
                </div>

                {errorMsg && (
                    <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 15px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 20 }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="guest@example.com"
                            {...form.register('email')}
                        />
                        {form.formState.errors.email && (
                            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            {...form.register('password')}
                        />
                        {form.formState.errors.password && (
                            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: 10 }} disabled={mutation.isPending}>
                        {mutation.isPending ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: '#8a94b2' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#2b3aee', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
