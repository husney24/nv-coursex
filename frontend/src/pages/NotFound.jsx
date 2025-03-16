import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';
import './NotFound.scss';

const NotFound = () => {
    return (
        <div className="not-found">
            <div className="not-found__content">
                <h1>4<span className="zero">0</span>4</h1>
                <h2>Page Not Found</h2>
                <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
                
                <div className="not-found__actions">
                    <Link to="/" className="not-found__button">
                        <FaHome /> Back to Home
                    </Link>
                    <Link to="/courses" className="not-found__button secondary">
                        <FaSearch /> Browse Courses
                    </Link>
                </div>
            </div>
            
            <div className="not-found__animation">
                <div className="circles">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 