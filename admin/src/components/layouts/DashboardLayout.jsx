import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  School as CourseIcon,
  People as UserIcon,
  Category as CategoryIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatePresence } from 'framer-motion';
import './DashboardLayout.scss';

// Logo component - replace with your actual logo
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2L30 9V23L16 30L2 23V9L16 2Z" fill="#4361EE" />
    <path d="M16 8L24 12V20L16 24L8 20V12L16 8Z" fill="white" />
  </svg>
);

const menuItems = [
  { title: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { title: 'Courses', path: '/courses', icon: <CourseIcon /> },
  { title: 'Users', path: '/users', icon: <UserIcon /> },
  { title: 'Categories', path: '/categories', icon: <CategoryIcon /> },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Close sidebar on mobile when location changes
  useEffect(() => {
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    if (window.innerWidth >= 992) {
      setSidebarExpanded(!sidebarExpanded);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Handle profile menu toggle
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current && 
        !profileMenuRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className={`dashboard-layout__header ${sidebarExpanded ? 'dashboard-layout__header--drawer-open' : ''}`}>
        <div className="dashboard-layout__header-content">
          <div className="dashboard-layout__header-left">
            <button 
              className="dashboard-layout__header-toggle" 
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
            <h1 className="dashboard-layout__header-title">Admin Dashboard</h1>
          </div>
          
          <div className="dashboard-layout__header-profile">
            <button 
              ref={profileButtonRef}
              className="dashboard-layout__header-profile-button" 
              onClick={toggleProfileMenu}
              aria-label="Open profile menu"
            >
              <div className="dashboard-layout__header-profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <ProfileIcon />
                )}
              </div>
              <span className="dashboard-layout__header-profile-name">
                {user?.name || 'Admin User'}
              </span>
            </button>
            
            {/* Profile Menu */}
            <div 
              ref={profileMenuRef}
              className={`dashboard-layout__profile-menu ${profileMenuOpen ? 'dashboard-layout__profile-menu--visible' : ''}`}
            >
              <div className="dashboard-layout__profile-menu-header">
                <div className="dashboard-layout__profile-menu-header-name">
                  {user?.name || 'Admin User'}
                </div>
                <div className="dashboard-layout__profile-menu-header-email">
                  {user?.email || 'admin@example.com'}
                </div>
              </div>
              
              <Link to="/profile" className="dashboard-layout__profile-menu-item" onClick={() => setProfileMenuOpen(false)}>
                <PersonIcon />
                <span>My Profile</span>
              </Link>
              
              <Link to="/settings" className="dashboard-layout__profile-menu-item" onClick={() => setProfileMenuOpen(false)}>
                <SettingsIcon />
                <span>Settings</span>
              </Link>
              
              <button 
                className="dashboard-layout__profile-menu-item dashboard-layout__profile-menu-item--danger"
                onClick={handleLogout}
              >
                <LogoutIcon />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Sidebar */}
      <aside className={`dashboard-layout__sidebar ${sidebarOpen ? 'dashboard-layout__sidebar--open' : ''} ${sidebarExpanded ? 'dashboard-layout__sidebar--expanded' : ''}`}>
        <div className="dashboard-layout__sidebar-header">
          <div className="dashboard-layout__sidebar-header-logo">
            <Logo />
            <h2 className="dashboard-layout__sidebar-header-title">LMS Admin</h2>
          </div>
          <button 
            className="dashboard-layout__sidebar-header-close" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="dashboard-layout__sidebar-content">
          <nav className="dashboard-layout__nav">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className={`dashboard-layout__nav-item ${
                  location.pathname === item.path ? 'dashboard-layout__nav-item--active' : ''
                }`}
              >
                <div className="dashboard-layout__nav-item-icon">{item.icon}</div>
                <span className="dashboard-layout__nav-item-text">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="dashboard-layout__sidebar-footer">
          <button className="dashboard-layout__sidebar-footer-button" onClick={handleLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      <div 
        className={`dashboard-layout__overlay ${sidebarOpen ? 'dashboard-layout__overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      {/* Main Content */}
      <main className="dashboard-layout__main">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </div>
  );
}