import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FiClock, FiUsers, FiBook, FiAward, FiCheck, FiStar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import './CourseDetails.scss';

const API_URL = import.meta.env.VITE_API_URL;

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchCourseDetails();
        if (user) {
            checkEnrollmentStatus();
        }
    }, [id, user]);

    const fetchCourseDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/courses/${id}`);
            if (response.data) {
                setCourse(response.data);
            } else {
                setError('Course information not found');
            }
        } catch (err) {
            console.error('Error fetching course details:', err);
            setError(err.response?.data?.message || 'Failed to fetch course details');
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollmentStatus = async () => {
        if (!user) return;
        
        try {
            const response = await axios.get(`${API_URL}/api/users/courses/enrolled`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && Array.isArray(response.data)) {
                // Check if current course is in the enrolled courses list
                setIsEnrolled(response.data.some(course => course.id === parseInt(id)));
            }
        } catch (err) {
            console.error('Error checking enrollment status:', err);
            // Don't show error to user, just assume not enrolled
            setIsEnrolled(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/courses/${id}` } });
            return;
        }

        if (isEnrolled) {
            navigate('/my-courses');
            return;
        }

        setEnrolling(true);
        try {
            const response = await axios.post(
                `${API_URL}/api/users/courses/enroll`,
                { courseId: id },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data?.success) {
                toast.success('Successfully enrolled in the course!');
                setIsEnrolled(true);
                navigate('/my-courses');
            } else {
                toast.error(response.data?.message || 'Enrollment failed. Please try again.');
            }
        } catch (err) {
            console.error('Error enrolling in course:', err);
            const errorMessage = err.response?.data?.message || 'Enrollment failed. Please try again.';
            toast.error(errorMessage);
            if (err.response?.status === 409) {
                setIsEnrolled(true);
            }
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={fetchCourseDetails} />;
    }

    if (!course) {
        return <NotFoundState navigate={navigate} />;
    }

    return (
        <div className="course-details">
            <div className="course-hero">
                <div className="hero-content">
                    <div className="course-info">
                        <div className="breadcrumbs">
                            <span>Courses</span>
                            <span>{course?.category || 'Uncategorized'}</span>
                            <span>{course?.title}</span>
                        </div>
                        <h1>{course?.title}</h1>
                        <p className="course-tagline">{course?.tagline}</p>
                        <div className="course-meta">
                            <div className="meta-item">
                                <FiUsers />
                                <span>{course?.enrolled_count || 0} students</span>
                            </div>
                            <div className="meta-item">
                                <FiClock />
                                <span>{course?.duration || 'N/A'}</span>
                            </div>
                            <div className="meta-item">
                                <FiStar />
                                <span>{course?.rating || 0} ({course?.reviews_count || 0} reviews)</span>
                            </div>
                        </div>
                        <div className="instructor-info">
                            <img 
                                src={course?.instructor_avatar || '/default-avatar.png'} 
                                alt={course?.instructor || 'Instructor'} 
                            />
                            <div>
                                <span>Created by</span>
                                <h3>{course?.instructor || 'Unknown Instructor'}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="course-card">
                        <div className="preview-image">
                            <img 
                                src={course?.image || '/default-course.jpg'} 
                                alt={course?.title || 'Course'} 
                            />
                            <button className="preview-button">Preview Course</button>
                        </div>
                        <div className="card-content">
                            <div className="price-tag">
                                <span className="current-price">${course?.price || 0}</span>
                                {course?.original_price && (
                                    <span className="original-price">${course.original_price}</span>
                                )}
                            </div>
                            <button 
                                className={`enroll-button ${enrolling ? 'loading' : ''} ${isEnrolled ? 'enrolled' : ''}`}
                                onClick={handleEnroll}
                                disabled={enrolling}
                            >
                                {enrolling ? 'Enrolling...' : isEnrolled ? 'Go to Course' : 'Enroll Now'}
                            </button>
                            {isEnrolled && (
                                <div className="enrolled-status">
                                    <FiCheck /> You're enrolled in this course
                                </div>
                            )}
                            <div className="guarantee">
                                <FiAward />
                                <span>30-Day Money-Back Guarantee</span>
                            </div>
                            <div className="course-includes">
                                <h4>This course includes:</h4>
                                <ul>
                                    <li><FiBook /> {course?.lessons_count || 0} lessons</li>
                                    <li><FiClock /> {course?.duration || 'N/A'} of content</li>
                                    <li><FiCheck /> Full lifetime access</li>
                                    <li><FiAward /> Certificate of completion</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="course-content">
                <div className="content-tabs">
                    <button 
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={activeTab === 'curriculum' ? 'active' : ''}
                        onClick={() => setActiveTab('curriculum')}
                    >
                        Curriculum
                    </button>
                    <button 
                        className={activeTab === 'reviews' ? 'active' : ''}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews
                    </button>
                </div>

                {/* <div className="tab-content">
                    {activeTab === 'overview' && (
                        <CourseOverview course={course} />
                    )}
                    {activeTab === 'curriculum' && (
                        <CourseCurriculum course={course} />
                    )}
                    {activeTab === 'reviews' && (
                        <CourseReviews course={course} />
                    )}
                </div> */}
            </div>
        </div>
    );
};

const LoadingState = () => (
    <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading course details...</p>
    </div>
);

const ErrorState = ({ error, onRetry }) => (
    <div className="error-state">
        <div className="error-icon">!</div>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={onRetry}>Try Again</button>
    </div>
);

const NotFoundState = ({ navigate }) => (
    <div className="not-found-state">
        <div className="not-found-icon">?</div>
        <h2>Course Not Found</h2>
        <p>The course you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/courses')}>Browse Courses</button>
    </div>
);

export default CourseDetails;