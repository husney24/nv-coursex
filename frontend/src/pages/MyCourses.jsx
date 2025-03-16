import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './MyCourses.scss';

const API_URL = import.meta.env.VITE_API_URL;

const MyCourses = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('in-progress'); // 'in-progress' or 'completed'

    useEffect(() => {
        fetchEnrolledCourses();
    }, [user]);

    const fetchEnrolledCourses = async () => {
        if (!user) {
            setError('Please log in to view your courses');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/api/users/courses`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Ensure we have an array of courses
            const courses = Array.isArray(response.data) ? response.data : [];
            setEnrolledCourses(courses);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            setError(error.response?.data?.message || 'Failed to load your courses');
            setLoading(false);
        }
    };

    const filteredCourses = enrolledCourses.filter(course => {
        if (activeTab === 'completed') {
            return course.progress_percentage === 100;
        }
        return course.progress_percentage < 100;
    });

    if (loading) return <div className="my-courses__loading">Loading...</div>;
    if (error) return <div className="my-courses__error my-courses__error--error">{error}</div>;

    return (
        <div className="my-courses">
            <div className="my-courses__container">
                <div className="my-courses__header">
                    <h1>My Courses</h1>
                </div>

                {/* Tabs */}
                <div className="my-courses__tabs">
                    <button
                        className={`my-courses__tabs-button ${
                            activeTab === 'in-progress' ? 'my-courses__tabs-button--active' : ''
                        }`}
                        onClick={() => setActiveTab('in-progress')}
                    >
                        In Progress
                    </button>
                    <button
                        className={`my-courses__tabs-button ${
                            activeTab === 'completed' ? 'my-courses__tabs-button--active' : ''
                        }`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed
                    </button>
                </div>

                {/* Course Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="my-courses__grid">
                        {filteredCourses.map(course => (
                            <Link
                                to={`/courses/${course.id}`}
                                key={course.id}
                                className="my-courses__card"
                            >
                                <img
                                    src={course.thumbnail || '/placeholder-course.jpg'}
                                    alt={course.title}
                                    className="my-courses__card-image"
                                />
                                <div className="my-courses__card-content">
                                    <div className="my-courses__card-category">{course.category_name}</div>
                                    <h3 className="my-courses__card-title">{course.title}</h3>
                                    
                                    {/* Progress Bar */}
                                    <div className="my-courses__card-progress">
                                        <div className="my-courses__card-progress-header">
                                            <span>Progress</span>
                                            <span>{course.progress_percentage}%</span>
                                        </div>
                                        <div className="my-courses__card-progress-bar">
                                            <div
                                                className="my-courses__card-progress-bar-fill"
                                                style={{ width: `${course.progress_percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Last Accessed */}
                                    <div className="my-courses__card-last-accessed">
                                        Last accessed: {new Date(course.last_accessed).toLocaleDateString()}
                                    </div>

                                    {/* Continue/Review Button */}
                                    <button className="my-courses__card-button">
                                        {course.progress_percentage === 100 ? 'Review Course' : 'Continue Learning'}
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="my-courses__empty">
                        {activeTab === 'completed' 
                            ? "You haven't completed any courses yet"
                            : "You haven't enrolled in any courses yet"}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;