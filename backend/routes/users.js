const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middleware/auth');
const { pool } = require('../config/database');

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, email, role, bio, avatar FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's enrolled courses
        const [enrollments] = await pool.query(
            `SELECT c.*, e.enrolled_at, e.status
             FROM enrollments e
             JOIN courses c ON e.course_id = c.id
             WHERE e.user_id = ?
             ORDER BY e.enrolled_at DESC`,
            [req.user.id]
        );

        res.json({
            user: users[0],
            enrollments
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    const { name, email, bio } = req.body;

    try {
        await pool.query(
            'UPDATE users SET name = ?, email = ?, bio = ? WHERE id = ?',
            [name, email, bio, req.user.id]
        );

        const [users] = await pool.query(
            'SELECT id, name, email, role, bio, avatar FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({ user: users[0] });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Update user avatar
router.patch('/profile/avatar', authenticateToken, async (req, res) => {
    try {
        const { avatar } = req.body;

        await pool.query(
            'UPDATE users SET avatar = ? WHERE id = ?',
            [avatar, req.user.id]
        );

        res.json({ message: 'Avatar updated successfully', avatar });
    } catch (error) {
        console.error('Avatar update error:', error);
        res.status(500).json({ message: 'Error updating avatar' });
    }
});

// Get user's enrolled courses
router.get('/courses', authenticateToken, async (req, res) => {
    try {
        const [courses] = await pool.query(
            `SELECT 
                c.*,
                cat.name as category_name,
                e.enrolled_at,
                e.status as enrollment_status,
                COALESCE(up.progress_percentage, 0) as progress,
                COALESCE(up.last_accessed, e.enrolled_at) as last_accessed
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN user_progress up ON up.course_id = c.id AND up.user_id = e.user_id
            WHERE e.user_id = ? AND e.status = 'active'
            ORDER BY e.enrolled_at DESC`,
            [req.user.id]
        );

        // Get ratings for the courses
        try {
            const courseIds = courses.map(course => course.id);
            if (courseIds.length > 0) {
                const [ratings] = await pool.query(
                    `SELECT course_id, 
                            AVG(rating) as average_rating,
                            COUNT(id) as review_count
                    FROM reviews
                    WHERE course_id IN (?)
                    GROUP BY course_id`,
                    [courseIds]
                );

                // Merge ratings with courses
                courses.forEach(course => {
                    const rating = ratings.find(r => r.course_id === course.id);
                    course.average_rating = rating ? rating.average_rating : null;
                    course.review_count = rating ? rating.review_count : 0;
                });
            }
        } catch (error) {
            // If reviews table doesn't exist, set default values
            courses.forEach(course => {
                course.average_rating = null;
                course.review_count = 0;
            });
        }

        res.json(courses);
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ message: 'Error fetching enrolled courses' });
    }
});

// Get all instructors
router.get('/instructors', async (req, res) => {
    try {
        const [instructors] = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.avatar,
                u.bio,
                u.title,
                COUNT(DISTINCT c.id) as courses_count,
                COUNT(DISTINCT e.user_id) as students_count,
                COALESCE(AVG(r.rating), 0) as average_rating
            FROM users u
            LEFT JOIN courses c ON u.id = c.instructor_id
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN reviews r ON c.id = r.course_id
            WHERE u.role = 'instructor'
            GROUP BY u.id
            ORDER BY courses_count DESC`,
            []
        );

        res.json(instructors);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Error fetching instructors' });
    }
});

module.exports = router; 