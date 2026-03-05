import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerGuest } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    roomNumber: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const setGuest = useAuthStore((state) => state.setGuest);
    const [errorMsg, setErrorMsg] = useState('');

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
            roomNumber: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: RegisterFormValues) => registerGuest(data),
        onSuccess: (response) => {
            setGuest(response.data);
            navigate('/');
        },
        onError: (error: any) => {
            setErrorMsg(error.response?.data?.message || 'Registration failed. Please try again.');
        },
    });

    const onSubmit = (data: RegisterFormValues) => {
        setErrorMsg('');
        mutation.mutate(data);
    };

    return (
        <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fc' }}>
            <div className="book-card" style={{ maxWidth: 450, width: '100%', padding: '40px 30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🚌</div>
                    <h2 style={{ color: '#1a2152', fontSize: '1.5rem', fontWeight: 700 }}>Join GuestGo</h2>
                    <p style={{ color: '#8a94b2', fontSize: '0.9rem', marginTop: 5 }}>Create an account to book your transport</p>
                </div>

                {errorMsg && (
                    <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 15px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 20 }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Sarah Smith"
                            {...form.register('name')}
                        />
                        {form.formState.errors.name && (
                            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{form.formState.errors.name.message}</p>
                        )}
                    </div>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                            <label className="form-label">Phone (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="+1 234 567 890"
                                {...form.register('phone')}
                            />
                        </div>
                        <div>
                            <label className="form-label">Room (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="204"
                                {...form.register('roomNumber')}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: 10 }} disabled={mutation.isPending}>
                        {mutation.isPending ? 'Registering...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: '#8a94b2' }}>
                    Already have an account? <Link to="/login" style={{ color: '#2b3aee', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
}
