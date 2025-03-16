import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiStar, FiUsers, FiBook, FiUser } from 'react-icons/fi';
import './Instructors.scss';

const API_URL = import.meta.env.VITE_API_URL;

const Instructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/instructors`);
                console.log('Instructors response:', response.data); // Debug log
                setInstructors(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching instructors:', error.response || error);
                setError(error.response?.data?.message || 'Failed to load instructors');
                setLoading(false);
            }
        };

        fetchInstructors();
    }, []);

    if (loading) {
        return (
            <div className="instructors">
                <div className="instructors__container">
                    <div className="instructors__loading">
                        <div className="instructors__loading-spinner"></div>
                        <p className="instructors__loading-text">Loading our expert instructors...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="instructors">
                <div className="instructors__container">
                    <div className="instructors__error">
                        <p className="instructors__error-text instructors__error--error">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="instructors">
            <div className="instructors__container">
                <div className="instructors__header">
                    <h1 className="instructors__header-title">Meet Our Expert Instructors</h1>
                    <p className="instructors__header-subtitle">
                        Learn from industry professionals with years of experience in their fields.
                        Our instructors are passionate about sharing their knowledge and helping you succeed.
                    </p>
                </div>

                {instructors.length > 0 ? (
                    <div className="instructors__grid">
                        {instructors.map((instructor) => (
                            <div key={instructor.id} className="instructors__card">
                                <div className="instructors__card-profile">
                                    <img 
                                        src={instructor.avatar || '/default-avatar.png'} 
                                        alt={instructor.name} 
                                        className="instructors__card-avatar"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/default-avatar.png';
                                        }}
                                    />
                                    <div className="instructors__card-info">
                                        <h3 className="instructors__card-name">
                                            {instructor.name}
                                        </h3>
                                        <p className="instructors__card-title">
                                            Expert Instructor
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="instructors__card-content">
                                    <p className="instructors__card-bio">
                                        {instructor.bio || 'No bio available for this instructor yet.'}
                                    </p>
                                    
                                    <div className="instructors__card-stats">
                                        <div className="instructors__card-stat">
                                            <div className="instructors__card-stat-value">
                                                {instructor.total_courses}
                                            </div>
                                            <div className="instructors__card-stat-label">
                                                <FiBook /> Courses
                                            </div>
                                        </div>
                                        
                                        <div className="instructors__card-stat">
                                            <div className="instructors__card-stat-value">
                                                {instructor.total_students}
                                            </div>
                                            <div className="instructors__card-stat-label">
                                                <FiUsers /> Students
                                            </div>
                                        </div>
                                        
                                        <div className="instructors__card-stat">
                                            <div className="instructors__card-stat-value">
                                                {instructor.average_rating.toFixed(1)}
                                            </div>
                                            <div className="instructors__card-stat-label">
                                                <FiStar /> Rating
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Link to={`/instructors/${instructor.id}`} className="instructors__card-view">
                                        View Full Profile
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="instructors__empty">
                        <div className="instructors__empty-icon">
                            <FiUser />
                        </div>
                        <p className="instructors__empty-text">
                            No instructors found at the moment. Please check back later.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Instructors;