import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiGrid, FiList, FiArrowRight } from 'react-icons/fi';
import './Categories.scss';

const API_URL = import.meta.env.VITE_API_URL;

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/categories`);
                setCategories(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filterCategories = (filter) => {
        setSelectedFilter(filter);
        // Add filtering logic based on your requirements
    };

    return (
        <div className="categories-page">
            <div className="categories-hero">
                <div className="hero-content">
                    <h1>Explore Our Course Categories</h1>
                    <p>Discover the perfect learning path from our diverse range of categories</p>
                    <div className="search-bar">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="categories-container">
                <div className="categories-header">
                    <div className="header-left">
                        <h2>All Categories</h2>
                        <p>{filteredCategories.length} categories available</p>
                    </div>
                    <div className="header-controls">
                        <div className="view-toggles">
                            <button 
                                className={viewMode === 'grid' ? 'active' : ''}
                                onClick={() => setViewMode('grid')}
                            >
                                <FiGrid />
                            </button>
                            <button 
                                className={viewMode === 'list' ? 'active' : ''}
                                onClick={() => setViewMode('list')}
                            >
                                <FiList />
                            </button>
                        </div>
                        <select 
                            value={selectedFilter}
                            onChange={(e) => filterCategories(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState error={error} onRetry={fetchCategories} />
                ) : filteredCategories.length === 0 ? (
                    <EmptyState searchTerm={searchTerm} />
                ) : (
                    <div className={`categories-grid ${viewMode}`}>
                        {filteredCategories.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CategoryCard = ({ category }) => (
    <Link to={`/courses?category=${category.id}`} className="category-card">
        <div className="card-content">
            <div className="category-icon">
                <img src={category.icon || '/default-category-icon.png'} alt={category.name} />
            </div>
            <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div className="category-stats">
                    <span>{category.courseCount} courses</span>
                    <span>{category.studentCount} students</span>
                </div>
            </div>
        </div>
        <div className="card-footer">
            <span>Explore Category</span>
            <FiArrowRight />
        </div>
    </Link>
);

const LoadingState = () => (
    <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading categories...</p>
    </div>
);

const ErrorState = ({ error, onRetry }) => (
    <div className="error-state">
        <div className="error-icon">!</div>
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={onRetry}>Try Again</button>
    </div>
);

const EmptyState = ({ searchTerm }) => (
    <div className="empty-state">
        <div className="empty-icon">?</div>
        <h3>{searchTerm ? 'No matching categories found' : 'No categories available'}</h3>
        <p>
            {searchTerm 
                ? `We couldn't find any categories matching "${searchTerm}"`
                : 'Check back later for new categories'
            }
        </p>
    </div>
);

export default Categories;