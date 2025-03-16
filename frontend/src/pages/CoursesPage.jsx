import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import './CoursesPage.css';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/courses').then(res => res.json()),
      fetch('http://localhost:5000/api/categories').then(res => res.json())
    ])
      .then(([coursesData, categoriesData]) => {
        setCourses(coursesData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = !filters.category || course.category_id.toString() === filters.category;
    const matchesLevel = !filters.level || course.level === filters.level;
    const matchesSearch = !filters.search || 
      course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description.toLowerCase().includes(filters.search.toLowerCase());

    return matchesCategory && matchesLevel && matchesSearch;
  });

  if (loading) {
    return (
      <div className="courses-page">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>All Courses</h1>
        <p>Browse our collection of expert-led courses</p>
      </div>

      <div className="filters">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search courses..."
          className="search-input"
        />

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          name="level"
          value={filters.level}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="no-courses">
          <p>No courses found matching your criteria.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage; 