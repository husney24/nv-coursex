const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all instructors
router.get('/', async (req, res) => {
    try {
        const [instructors] = await pool.execute(`
            SELECT 
                i.*,
                u.name,
                u.email,
                u.avatar,
                u.bio,
                COUNT(DISTINCT c.id) as total_courses,
                COALESCE(COUNT(DISTINCT e.id), 0) as total_students,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as total_reviews
            FROM instructors i
            JOIN users u ON i.user_id = u.id
            LEFT JOIN courses c ON c.instructor_id = u.id
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN reviews r ON c.id = r.course_id
            GROUP BY i.id, u.id
            ORDER BY total_courses DESC, total_students DESC
        `);

        // Format the response
        const formattedInstructors = instructors.map(instructor => ({
            id: instructor.id,
            name: instructor.name,
            email: instructor.email,
            avatar: instructor.avatar,
            bio: instructor.bio,
            total_courses: parseInt(instructor.total_courses) || 0,
            total_students: parseInt(instructor.total_students) || 0,
            average_rating: parseFloat(instructor.average_rating) || 0,
            total_reviews: parseInt(instructor.total_reviews) || 0
        }));

        res.json(formattedInstructors);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Error fetching instructors' });
    }
});

// Get instructor by ID
router.get('/:id', async (req, res) => {
    try {
        const [instructors] = await pool.execute(`
            SELECT 
                i.*,
                u.name,
                u.email,
                u.avatar,
                u.bio,
                COUNT(DISTINCT c.id) as total_courses,
                COALESCE(COUNT(DISTINCT e.id), 0) as total_students,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as total_reviews
            FROM instructors i
            JOIN users u ON i.user_id = u.id
            LEFT JOIN courses c ON c.instructor_id = u.id
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN reviews r ON c.id = r.course_id
            WHERE i.id = ?
            GROUP BY i.id, u.id
        `, [req.params.id]);

        if (instructors.length === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        const instructor = {
            ...instructors[0],
            total_courses: parseInt(instructors[0].total_courses) || 0,
            total_students: parseInt(instructors[0].total_students) || 0,
            average_rating: parseFloat(instructors[0].average_rating) || 0,
            total_reviews: parseInt(instructors[0].total_reviews) || 0
        };

        // Get instructor's courses
        const [courses] = await pool.execute(`
            SELECT 
                c.*,
                cat.name as category_name,
                COALESCE(COUNT(DISTINCT e.id), 0) as enrolled_students,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as review_count
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN reviews r ON c.id = r.course_id
            WHERE c.instructor_id = ?
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `, [instructor.user_id]);

        instructor.courses = courses.map(course => ({
            ...course,
            enrolled_students: parseInt(course.enrolled_students) || 0,
            average_rating: parseFloat(course.average_rating) || 0,
            review_count: parseInt(course.review_count) || 0
        }));

        res.json(instructor);
    } catch (error) {
        console.error('Error fetching instructor:', error);
        res.status(500).json({ message: 'Error fetching instructor' });
    }
});

module.exports = router; 