import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.scss';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1 className="hero-title">
                    Welcome to NV Courses
                </h1>
                <p className="hero-subtitle">
                    Discover and learn from our wide range of courses
                </p>
                {!user ? (
                    <div className="hero-buttons">
                        <Link
                            to="/register"
                            className="hero-button primary"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="hero-button secondary"
                        >
                            Login
                        </Link>
                    </div>
                ) : (
                    <div className="hero-buttons">
                        <Link
                            to="/courses"
                            className="hero-button primary"
                        >
                            Browse Courses
                        </Link>
                    </div>
                )}
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <h3 className="feature-title">Expert Instructors</h3>
                    <p className="feature-description">
                        Learn from industry professionals with years of experience.
                    </p>
                </div>
                <div className="feature-card">
                    <h3 className="feature-title">Flexible Learning</h3>
                    <p className="feature-description">
                        Study at your own pace with lifetime access to courses.
                    </p>
                </div>
                <div className="feature-card">
                    <h3 className="feature-title">Project-Based</h3>
                    <p className="feature-description">
                        Apply your knowledge with hands-on projects and exercises.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;