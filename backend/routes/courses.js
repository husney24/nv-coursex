const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authenticateToken = require('../middleware/authenticateToken');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const [courses] = await pool.execute(`
            SELECT c.*, cat.name as category_name, 
                   COUNT(DISTINCT e.id) as enrolled_students,
                   AVG(r.rating) as average_rating,
                   COUNT(DISTINCT r.id) as review_count
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN reviews r ON c.id = r.course_id
            GROUP BY c.id
        `);

        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Get course by ID
router.get('/:id', async (req, res) => {
    try {
        const [courses] = await pool.execute(`
            SELECT c.*, cat.name as category_name,
                   COUNT(DISTINCT e.id) as enrolled_students,
                   AVG(r.rating) as average_rating,
                   COUNT(DISTINCT r.id) as review_count
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN reviews r ON c.id = r.course_id
            WHERE c.id = ?
            GROUP BY c.id
        `, [req.params.id]);

        if (courses.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Get course reviews
        const [reviews] = await pool.execute(`
            SELECT r.*, u.name as user_name, u.avatar as user_avatar
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.course_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.id]);

        const course = courses[0];
        course.reviews = reviews;

        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
});

// Get user's enrolled courses
router.get('/user/enrolled', authenticateToken, async (req, res) => {
    try {
        const [courses] = await pool.execute(`
            SELECT c.*, cat.name as category_name,
                   e.enrolled_at, e.status,
                   up.progress_percentage
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN user_progress up ON e.user_id = up.user_id AND e.course_id = up.course_id
            WHERE e.user_id = ?
        `, [req.user.id]);

        res.json(courses);
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ message: 'Error fetching enrolled courses' });
    }
});

// Enroll in a course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
    try {
        // Check if already enrolled
        const [existing] = await pool.execute(
            'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
            [req.user.id, req.params.id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Create enrollment
        await pool.execute(
            'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );

        // Create initial progress record
        await pool.execute(
            'INSERT INTO user_progress (user_id, course_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );

        // Add activity record
        await pool.execute(
            'INSERT INTO user_activity (user_id, course_id, activity_type, description) VALUES (?, ?, ?, ?)',
            [req.user.id, req.params.id, 'enrollment', 'Enrolled in the course']
        );

        res.status(201).json({ message: 'Successfully enrolled in course' });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ message: 'Error enrolling in course' });
    }
});

// Unsubscribe from a course
router.post('/:id/unsubscribe', authenticateToken, async (req, res) => {
    try {
        const [enrollment] = await pool.query(
            'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND status = "active"',
            [req.user.id, req.params.id]
        );

        if (enrollment.length === 0) {
            return res.status(404).json({ message: 'Active enrollment not found' });
        }

        // Update enrollment status
        await pool.query(
            'UPDATE enrollments SET status = "unsubscribed" WHERE id = ?',
            [enrollment[0].id]
        );

        // Log activity
        await pool.query(
            'INSERT INTO user_activity (user_id, course_id, activity_type, description) VALUES (?, ?, "unsubscribe", "Unsubscribed from course")',
            [req.user.id, req.params.id]
        );

        res.json({ message: 'Successfully unsubscribed from course' });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ message: 'Error unsubscribing from course' });
    }
});

// Update course progress
router.post('/:id/progress', authenticateToken, async (req, res) => {
    try {
        const { progress_percentage } = req.body;

        // Check if progress record exists
        const [existingProgress] = await pool.query(
            'SELECT * FROM user_progress WHERE user_id = ? AND course_id = ?',
            [req.user.id, req.params.id]
        );

        if (existingProgress.length > 0) {
            // Update existing progress
            await pool.query(
                'UPDATE user_progress SET progress_percentage = ?, last_accessed = NOW() WHERE id = ?',
                [progress_percentage, existingProgress[0].id]
            );
        } else {
            // Create new progress record
            await pool.query(
                'INSERT INTO user_progress (user_id, course_id, progress_percentage) VALUES (?, ?, ?)',
                [req.user.id, req.params.id, progress_percentage]
            );
        }

        // If course completed, log activity
        if (progress_percentage === 100) {
            await pool.query(
                'INSERT INTO user_activity (user_id, course_id, activity_type, description) VALUES (?, ?, "completion", "Completed course")',
                [req.user.id, req.params.id]
            );
        }

        res.json({ message: 'Progress updated successfully' });
    } catch (error) {
        console.error('Progress update error:', error);
        res.status(500).json({ message: 'Error updating progress' });
    }
});

module.exports = router; 