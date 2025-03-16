import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.scss';

const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { success, error } = await login(formData.email, formData.password);
            if (!success) {
                setError(error);
            }
        } catch (err) {
            setError('Failed to log in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <img src="/logo.png" alt="NV Courses Logo" />
                </div>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Log in to continue your learning journey</p>
                
                {error && <div className="error-alert">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                            <button 
                                type="button" 
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-options">
                        <div className="remember-me">
                            <input 
                                type="checkbox" 
                                id="rememberMe" 
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            <label htmlFor="rememberMe">Remember me</label>
                        </div>
                        <Link to="/forgot-password" className="forgot-password">
                            Forgot Password?
                        </Link>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-button"
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i> Logging in...
                            </>
                        ) : 'Login'}
                    </button>
                    
                    <div className="divider">
                        <span className="divider-text">or login with</span>
                    </div>
                    
                    <div className="social-auth">
                        <button type="button" className="social-button google">
                            <i className="fab fa-google"></i> Google
                        </button>
                        <button type="button" className="social-button facebook">
                            <i className="fab fa-facebook-f"></i> Facebook
                        </button>
                    </div>
                    
                    <p className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;