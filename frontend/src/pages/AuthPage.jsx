import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';
import Swal from 'sweetalert2';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register } = useAuth();

    // Determine default mode based on route
    const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');

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
        setIsSignUp(location.pathname === '/register');
        setError('');
    }, [location.pathname]);

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(loginData.email, loginData.password);
        if (res.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Successfully logged in.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/my-account');
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

        const res = await register(registerData);
        if (res.success) {
            setRegistrationSuccess(true);
        } else {
            setError(res.message);
        }
    };

    // Shared input style
    const inputStyle = "bg-gray-100 border-none outline-none py-3 px-4 my-2 w-full rounded focus:ring-2 focus:ring-[#0071C2] transition";
    const btnStyle = "rounded-[20px] border border-[#003B95] bg-[#003B95] text-white text-xs font-bold py-3 px-11 tracking-[1px] uppercase transition-transform hover:scale-105 shadow hover:bg-[#002f74] focus:outline-none";

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gray-50 flex-col py-12 sm:px-6 lg:px-8">
            <button 
                onClick={() => navigate('/')} 
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-[#003B95] transition-colors bg-white border shadow-sm hover:bg-gray-50 px-4 py-2 rounded-lg"
            >
                <ArrowLeft size={18} />
                <span className="font-medium text-sm">Back to Home</span>
            </button>

            <h1 className="text-4xl font-extrabold text-[#003B95] mb-8 mt-4 cursor-pointer" onClick={() => navigate('/')}>
                StayFlow
            </h1>
            <div className={`auth-wrapper ${isSignUp ? 'right-panel-active' : ''}`}>
                
                {/* ---------- SIGN UP FORM ---------- */}
                <div className="auth-form-wrapper sign-up-wrapper bg-white">
                    {registrationSuccess ? (
                        <div className="w-full flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-[#003B95]">Registration Successful 🎉</h2>
                            <p className="text-gray-600 mb-8 px-4">Your account has been created. You can now use your credentials to access your StayFlow account.</p>
                            <button 
                                onClick={() => {
                                    setRegistrationSuccess(false);
                                    setIsSignUp(false);
                                }}
                                className={btnStyle}
                            >
                                Try login in to you account here
                            </button>
                        </div>
                    ) : (
                        <form className="w-full flex flex-col items-center" onSubmit={handleRegisterSubmit}>
                            <h2 className="text-3xl font-bold mb-4 text-gray-800">Create Account</h2>
                            
                            {error && isSignUp && (
                                <div className="w-full p-2 mb-4 text-sm text-red-600 bg-red-100 rounded text-center">{error}</div>
                            )}
                            
                            <input type="text" name="firstName" placeholder="First Name" value={registerData.firstName} onChange={handleRegisterChange} required className={inputStyle} />
                            <input type="text" name="lastName" placeholder="Last Name" value={registerData.lastName} onChange={handleRegisterChange} required className={inputStyle} />
                            <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required className={inputStyle} />
                            
                            <div className="relative w-full my-1">
                                <input type={showRegisterPassword ? "text" : "password"} name="password" placeholder="Password (min 6 chars)" value={registerData.password} onChange={handleRegisterChange} required className="bg-gray-100 border-none outline-none py-3 pl-4 pr-10 w-full rounded focus:ring-2 focus:ring-[#0071C2] transition" />
                                <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative w-full my-1">
                                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={registerData.confirmPassword} onChange={handleRegisterChange} required className="bg-gray-100 border-none outline-none py-3 pl-4 pr-10 w-full rounded focus:ring-2 focus:ring-[#0071C2] transition" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            
                            <button type="submit" className={`mt-6 ${btnStyle}`}>Sign Up</button>
                        </form>
                    )}
                </div>

                {/* ---------- SIGN IN FORM ---------- */}
                <div className="auth-form-wrapper sign-in-wrapper bg-white">
                    <form className="w-full flex flex-col items-center" onSubmit={handleLoginSubmit}>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Sign in</h2>
                        
                        {error && !isSignUp && (
                            <div className="w-full p-2 mb-4 text-sm text-red-600 bg-red-100 rounded text-center">{error}</div>
                        )}

                        <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} required className={inputStyle} />
                        
                        <div className="relative w-full my-1">
                            <input type={showLoginPassword ? "text" : "password"} name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required className="bg-gray-100 border-none outline-none py-3 pl-4 pr-10 w-full rounded focus:ring-2 focus:ring-[#0071C2] transition" />
                            <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        <a href="#" className="text-sm my-4 text-[#0071C2] hover:underline">Forgot your password?</a>
                        
                        <button type="submit" className={btnStyle}>Sign In</button>
                        
                        <button 
                            type="button"
                            onClick={() => navigate('/admin-login')}
                            className="mt-4 text-xs text-gray-500 hover:text-[#003B95] transition-colors underline underline-offset-4"
                        >
                            Are you an Admin?
                        </button>
                    </form>
                </div>

                {/* ---------- OVERLAY ---------- */}
                <div className="auth-overlay-wrapper">
                    <div className="auth-overlay">
                        {/* LEFT OVERLAY PANEL (Shown when right-panel-active) */}
                        <div className="auth-overlay-panel auth-overlay-left">
                            <h2 className="text-3xl font-bold mb-4 text-white">Welcome Back!</h2>
                            <p className="text-sm font-light leading-relaxed my-5 md:px-6 text-white text-opacity-90">
                                To keep connected with us please login with your personal info
                            </p>
                            <button className={`ghost-btn rounded-[20px] border border-white bg-transparent text-white text-xs font-bold py-3 px-11 tracking-[1px] uppercase transition-transform hover:scale-105 shadow`} onClick={() => navigate('/login')}>
                                Sign In
                            </button>
                        </div>

                        {/* RIGHT OVERLAY PANEL (Shown when default) */}
                        <div className="auth-overlay-panel auth-overlay-right">
                            <h2 className="text-3xl font-bold mb-4 text-[#feba02]">Hello, Traveler!</h2>
                            <p className="text-sm font-light leading-relaxed my-5 md:px-6 text-white text-opacity-90">
                                Enter your personal details and start your journey with StayFlow
                            </p>
                            <button className={`ghost-btn rounded-[20px] border border-white bg-transparent text-white text-xs font-bold py-3 px-11 tracking-[1px] uppercase transition-transform hover:scale-105 shadow`} onClick={() => navigate('/register')}>
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthPage;
