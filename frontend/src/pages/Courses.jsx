import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiFilter, FiStar, FiClock, FiUsers, FiBookOpen } from 'react-icons/fi';
import './Courses.scss';

const API_URL = import.meta.env.VITE_API_URL;

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        sort: 'newest'
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCategories();  // Ensure categories are loaded first

        const fetchCourses = async () => {
            try {
                const params = new URLSearchParams();
                if (filters.category) params.append('category', filters.category);
                if (filters.search) params.append('search', filters.search);
                if (filters.sort) params.append('sort', filters.sort);

                const response = await axios.get(`${API_URL}/api/courses?${params.toString()}`);
                setCourses(response.data);
            } catch (err) {
                setError('Failed to fetch courses');
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
    };

    const renderRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FiStar key={i} className="star filled" />);
        }
        
        if (hasHalfStar) {
            stars.push(<FiStar key="half" className="star half-filled" />);
        }
        
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FiStar key={`empty-${i}`} className="star" />);
        }
        
        return stars;
    };

    return (
        <div className="courses-page">
            <div className="courses-hero">
                <div className="hero-content">
                    <h1>Expand Your Knowledge</h1>
                    <p>Discover courses that match your interests and career goals</p>
                    <form className="hero-search" onSubmit={handleSearchSubmit}>
                        <div className="search-input-container">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="What do you want to learn today?"
                            />
                        </div>
                        <button type="submit" className="search-button">Search</button>
                    </form>
                </div>
            </div>

            <div className="courses-container">
                <div className="courses-header">
                    <div className="header-left">
                        <h2>Browse Courses</h2>
                        <p>{courses.length} courses available</p>
                    </div>
                    <div className="header-right">
                        <button className="filter-toggle" onClick={toggleFilters}>
                            <FiFilter />
                            <span>Filters</span>
                        </button>
                        <select
                            name="sort"
                            value={filters.sort}
                            onChange={handleFilterChange}
                            className="sort-select"
                        >
                            <option value="newest">Newest First</option>
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="courses-loading">
                        <div className="spinner"></div>
                        <p>Loading courses...</p>
                    </div>
                ) : error ? (
                    <div className="courses-error">
                        <h3>Oops! Something went wrong</h3>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-button">
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="courses-grid">
                        {courses.map((course) => (
                            <div key={course.id} className="course-card">
                                <div className="course-image-container">
                                    <img
                                        src={course.thumbnail || '/default-course.jpg'}
                                        alt={course.title}
                                        className="course-image"
                                    />
                                    <div className="course-overlay">
                                        <Link to={`/courses/${course.id}`} className="view-course">
                                            View Course
                                        </Link>
                                    </div>
                                    <div className="course-level">{course.level || 'Beginner'}</div>
                                </div>
                                <div className="course-content">
                                    <div className="course-category-tag">{course.category || 'Uncategorized'}</div>
                                    <h3 className="course-title">{course.title}</h3>
                                    <p className="course-description">{course.description}</p>
                                    <div className="course-stats">
                                        <div className="course-stat">
                                            <FiClock />
                                            <span>{course.duration || '10h 30m'}</span>
                                        </div>
                                        <div className="course-stat">
                                            <FiBookOpen />
                                            <span>{course.lessons || '12'} lessons</span>
                                        </div>
                                        <div className="course-stat">
                                            <FiUsers />
                                            <span>{course.students || '2,543'} students</span>
                                        </div>
                                    </div>
                                    <div className="course-footer">
                                        <div className="course-rating">
                                            {renderRatingStars(course.rating || 4.5)}
                                            <span className="rating-count">({course.ratingCount || 128})</span>
                                        </div>
                                        <div className="course-price">
                                            {course.originalPrice && (
                                                <span className="original-price">
                                                    ${parseFloat(course.originalPrice).toFixed(2)}
                                                </span>
                                            )}
                                            <span className="current-price">
                                                ${parseFloat(course.price || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {courses.length === 0 && !loading && (
                    <div className="no-courses">
                        <h3>No courses found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                        <button 
                            onClick={() => setFilters({ category: '', search: '', sort: 'newest' })}
                            className="reset-filters"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
