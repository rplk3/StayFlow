import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // Setup axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // Check if user is logged in on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get('http://localhost:5000/api/auth/me');
                setUser(res.data);
            } catch (error) {
                console.error('Token verification failed:', error);
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const updateProfile = async (profileData) => {
        try {
            const res = await axios.put('http://localhost:5000/api/auth/profile', profileData);
            setUser(res.data);
            return { success: true };
        } catch (error) {
            console.error('Frontend Update Profile Error:', error.response?.data || error);
            const errorMsg = error.response?.data?.message || 'Update failed';
            return { success: false, message: errorMsg };
        }
    };

    const register = async (userData) => {
        try {
            await axios.post('http://localhost:5000/api/auth/register', userData);
            // Intentionally bypassing state hydration so user is forced to log in via UI
            return { success: true };
        } catch (error) {
            console.error('Frontend Registration Error:', error.response?.data || error);
            const errorMsg = error.response?.data?.stack || error.response?.data?.error || error.response?.data?.message || 'Registration failed';
            return { success: false, message: errorMsg };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            setToken(res.data.token);
            setUser(res.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const adminRegister = async (userData) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/admin-register', userData);
            return { success: true, message: res.data.message };
        } catch (error) {
            console.error('Admin Registration Error:', error.response?.data || error);
            const errorMsg = error.response?.data?.message || 'Admin registration failed';
            return { success: false, message: errorMsg };
        }
    };

    const adminLogin = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/admin-login', { email, password });
            setToken(res.data.token);
            setUser(res.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Admin login failed' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, token, register, login, logout, updateProfile, adminRegister, adminLogin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
