import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.scss';

const CourseCard = ({ course }) => {
  // Function to determine level badge color
  const getLevelClass = (level) => {
    switch(level.toLowerCase()) {
      case 'beginner':
        return 'beginner';
      case 'intermediate':
        return 'intermediate';
      case 'advanced':
        return 'advanced';
      default:
        return '';
    }
  };

  return (
    <div className="course-card">
      <div className="course-image">
        <img src={course.image_url || '/default-course.jpg'} alt={course.title} />
        <span className={`course-level ${getLevelClass(course.level)}`}>{course.level}</span>
      </div>
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">by {course.instructor}</p>
        <p className="course-description">{course.description}</p>
        <div className="course-details">
          <span className="course-duration">{course.duration}</span>
          <span className="course-category">{course.category_name}</span>
        </div>
        <div className="course-footer">
          <span className="course-price">${course.price}</span>
          <Link to={`/courses/${course.id}`} className="view-course-btn">
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;