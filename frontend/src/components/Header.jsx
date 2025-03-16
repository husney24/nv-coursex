import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.scss';

const Header = () => {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <div className="logo-container">
                    <Link to="/" className="logo">
                        <span className="logo-text">NV<span className="highlight">Academy</span></span>
                    </Link>
                </div>

                <div className="mobile-toggle" onClick={toggleMobileMenu}>
                    <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
                </div>

                <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                    <ul>
                        <li className={location.pathname === '/courses' ? 'active' : ''}>
                            <Link to="/courses">Explore Courses</Link>
                        </li>
                        <li className={location.pathname === '/categories' ? 'active' : ''}>
                            <Link to="/categories">Categories</Link>
                        </li>
                        <li className={location.pathname === '/instructors' ? 'active' : ''}>
                            <Link to="/instructors">Instructors</Link>
                        </li>
                        {user && (
                            <li className={location.pathname === '/my-courses' ? 'active' : ''}>
                                <Link to="/my-courses">My Learning</Link>
                            </li>
                        )}
                    </ul>
                </nav>

                <div className={`auth-box ${mobileMenuOpen ? 'open' : ''}`}>
                    {user ? (
                        <div className="user-menu">
                            <div className="user-profile">
                                <img
                                    src={user.avatar || '/default-avatar.jpg'}
                                    alt="Profile"
                                    className="avatar"
                                />
                                <span className="user-name">{user.name}</span>
                            </div>
                            <div className="dropdown-menu">
                                <Link to="/profile" className="dropdown-item">
                                    <i className="fas fa-user"></i> Profile
                                </Link>
                                <Link to="/my-courses" className="dropdown-item">
                                    <i className="fas fa-graduation-cap"></i> My Courses
                                </Link>
                                <Link to="/settings" className="dropdown-item">
                                    <i className="fas fa-cog"></i> Settings
                                </Link>
                                <button onClick={logout} className="dropdown-item logout">
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-login">
                                Log In
                            </Link>
                            <Link to="/register" className="btn btn-register">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;