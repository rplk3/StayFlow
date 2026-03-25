import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const AdminAuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminLogin, adminRegister } = useAuth();

    const [isSignUp, setIsSignUp] = useState(location.pathname === '/admin-register');

    // Forms State
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');

    // Visibility Toggles
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Registration Success State
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    useEffect(() => {
        setIsSignUp(location.pathname === '/admin-register');
        setError('');
    }, [location.pathname]);

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await adminLogin(loginData.email, loginData.password);
        if (res.success) {
            navigate('/admin/dashboard');
        } else {
            setError(res.message);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (registerData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const res = await adminRegister(registerData);
        if (res.success) {
            setRegistrationSuccess(true);
        } else {
            setError(res.message);
        }
    };

    // Shared input style
    const inputStyle = "bg-gray-800 border border-gray-700 outline-none py-3 px-4 my-2 w-full rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-[#feba02] focus:border-transparent transition";
    const btnStyle = "rounded-[20px] border border-[#feba02] bg-[#feba02] text-[#1a1a2e] text-xs font-bold py-3 px-11 tracking-[1px] uppercase transition-transform hover:scale-105 shadow hover:bg-[#e5a800] focus:outline-none";

    return (
        <div className="min-h-screen flex items-center justify-center flex-col py-12 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)' }}>
            <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="w-10 h-10 text-[#feba02]" />
                <h1 className="text-4xl font-extrabold text-white cursor-pointer" onClick={() => navigate('/')}>
                    StayFlow <span className="text-[#feba02]">Admin</span>
                </h1>
            </div>
            <div className={`auth-wrapper ${isSignUp ? 'right-panel-active' : ''}`} style={{ boxShadow: '0 14px 28px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.3)' }}>

                {/* ---------- ADMIN SIGN UP FORM ---------- */}
                <div className="auth-form-wrapper sign-up-wrapper" style={{ backgroundColor: '#1a1a2e' }}>
                    {registrationSuccess ? (
                        <div className="w-full flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#feba02] bg-opacity-20 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="w-10 h-10 text-[#feba02]" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-[#feba02]">Registration Submitted! </h2>
                            <p className="text-gray-400 mb-8 px-4">Your admin account has been created and is pending approval by the Super Admin. You will be able to log in once your account is approved.</p>
                            <button
                                onClick={() => {
                                    setRegistrationSuccess(false);
                                    setIsSignUp(false);
                                    navigate('/admin-login');
                                }}
                                className={btnStyle}
                            >
                                Go to Admin Login
                            </button>
                        </div>
                    ) : (
                        <form className="w-full flex flex-col items-center" onSubmit={handleRegisterSubmit}>
                            <h2 className="text-3xl font-bold mb-4 text-white">Admin Registration</h2>

                            {error && isSignUp && (
                                <div className="w-full p-2 mb-4 text-sm text-red-400 bg-red-900 bg-opacity-30 rounded text-center border border-red-800">{error}</div>
                            )}

                            <input type="text" name="firstName" placeholder="First Name" value={registerData.firstName} onChange={handleRegisterChange} required className={inputStyle} />
                            <input type="text" name="lastName" placeholder="Last Name" value={registerData.lastName} onChange={handleRegisterChange} required className={inputStyle} />
                            <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required className={inputStyle} />

                            <div className="relative w-full my-1">
                                <input type={showRegisterPassword ? "text" : "password"} name="password" placeholder="Password (min 6 chars)" value={registerData.password} onChange={handleRegisterChange} required className="bg-gray-800 border border-gray-700 outline-none py-3 pl-4 pr-10 w-full rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-[#feba02] transition" />
                                <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none">
                                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative w-full my-1">
                                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={registerData.confirmPassword} onChange={handleRegisterChange} required className="bg-gray-800 border border-gray-700 outline-none py-3 pl-4 pr-10 w-full rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-[#feba02] transition" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button type="submit" className={`mt-6 ${btnStyle}`}>Request Admin Access</button>
                        </form>
                    )}
                </div>

                {/* ---------- ADMIN SIGN IN FORM ---------- */}
                <div className="auth-form-wrapper sign-in-wrapper" style={{ backgroundColor: '#1a1a2e' }}>
                    <form className="w-full flex flex-col items-center" onSubmit={handleLoginSubmit}>
                        <h2 className="text-3xl font-bold mb-4 text-white">Admin Sign In</h2>

                        {error && !isSignUp && (
                            <div className="w-full p-2 mb-4 text-sm text-red-400 bg-red-900 bg-opacity-30 rounded text-center border border-red-800">{error}</div>
                        )}

                        <input type="email" name="email" placeholder="Admin Email" value={loginData.email} onChange={handleLoginChange} required className={inputStyle} />

                        <div className="relative w-full my-1">
                            <input type={showLoginPassword ? "text" : "password"} name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required className="bg-gray-800 border border-gray-700 outline-none py-3 pl-4 pr-10 w-full rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-[#feba02] transition" />
                            <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none">
                                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button type="submit" className={`mt-6 ${btnStyle}`}>Sign In</button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="mt-4 text-xs text-gray-400 hover:text-[#feba02] transition-colors underline underline-offset-4"
                        >
                            Back to User Login
                        </button>
                    </form>
                </div>

                {/* ---------- OVERLAY ---------- */}
                <div className="auth-overlay-wrapper">
                    <div className="auth-overlay" style={{ background: 'linear-gradient(to right, #16213e, #0f0c29)' }}>
                        {/* LEFT OVERLAY PANEL (Shown when right-panel-active) */}
                        <div className="auth-overlay-panel auth-overlay-left">
                            <ShieldCheck className="w-12 h-12 text-[#feba02] mb-4" />
                            <h2 className="text-3xl font-bold mb-4 text-white">Already Registered?</h2>
                            <p className="text-sm font-light leading-relaxed my-5 md:px-6 text-gray-300">
                                Sign in with your admin credentials to access the dashboard
                            </p>
                            <button className="ghost-btn rounded-[20px] border border-[#feba02] bg-transparent text-[#feba02] text-xs font-bold py-3 px-11 tracking-[1px] uppercase transition-transform hover:scale-105 shadow" onClick={() => navigate('/admin-login')}>
                                Admin Sign In
                            </button>
                        </div>

                        {/* RIGHT OVERLAY PANEL (Shown when default) */}
                        <div className="auth-overlay-panel auth-overlay-right">
                            <ShieldCheck className="w-12 h-12 text-[#feba02] mb-4" />
                            <h2 className="text-3xl font-bold mb-4 text-[#feba02]">New Admin?</h2>
                            <p className="text-sm font-light leading-relaxed my-5 md:px-6 text-gray-300">
                                Register for admin access. Your account will need to be approved by the Super Admin.
                            </p>
                            <button className="ghost-btn rounded-[20px] border border-[#feba02] bg-transparent text-[#feba02] text-xs font-bold py-3 px-11 tracking-[1px] uppercase transition-transform hover:scale-105 shadow" onClick={() => navigate('/admin-register')}>
                                Register
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminAuthPage;
