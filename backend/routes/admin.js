const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Admin login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND role = ?',
            [email, 'admin']
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials or not an admin' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from user object
        delete user.password;

        res.json({ 
            token,
            user
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Get admin profile
router.get('/profile', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, email, role, bio, avatar FROM users WHERE id = ? AND role = ?',
            [req.user.id, 'admin']
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Admin profile fetch error:', error);
        res.status(500).json({ message: 'Error fetching admin profile' });
    }
});

// Get dashboard statistics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Get total courses count
        const [coursesResult] = await pool.query('SELECT COUNT(*) as count FROM courses');
        const coursesCount = coursesResult[0].count;

        // Get total users count
        const [usersResult] = await pool.query('SELECT COUNT(*) as count FROM users');
        const usersCount = usersResult[0].count;

        // Get total categories count
        const [categoriesResult] = await pool.query('SELECT COUNT(*) as count FROM categories');
        const categoriesCount = categoriesResult[0].count;

        // Get average course rating
        const [ratingResult] = await pool.query('SELECT AVG(rating) as avg FROM reviews');
        const averageRating = ratingResult[0].avg || 0;

        // Get enrollment statistics by month (last 6 months)
        const [enrollmentStats] = await pool.query(`
            SELECT 
                DATE_FORMAT(enrolled_at, '%Y-%m') as month,
                COUNT(*) as enrollments
            FROM enrollments
            WHERE enrolled_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(enrolled_at, '%Y-%m')
            ORDER BY month ASC
        `);

        res.json({
            coursesCount,
            usersCount,
            categoriesCount,
            averageRating,
            enrollmentStats
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

// Get all users with pagination and search
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // Get users from the view with pagination and search
        const [users] = await pool.execute(`
            SELECT * FROM admin_users_view
            WHERE 
                name LIKE CONCAT('%', ?, '%') OR 
                email LIKE CONCAT('%', ?, '%') OR
                role LIKE CONCAT('%', ?, '%')
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [search, search, search, limit, offset]);

        // Get total count for pagination with search
        const [countResult] = await pool.execute(`
            SELECT COUNT(*) as total 
            FROM admin_users_view
            WHERE 
                name LIKE CONCAT('%', ?, '%') OR 
                email LIKE CONCAT('%', ?, '%') OR
                role LIKE CONCAT('%', ?, '%')
        `, [search, search, search]);
        
        const total = countResult[0].total;

        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            message: 'Error fetching users',
            error: error.message 
        });
    }
});

// Update user status
router.patch('/users/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.body;
    const userId = req.params.id;

    try {
        // Check if user exists and is not an admin
        const [users] = await pool.query(
            'SELECT role FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (users[0].role === 'admin') {
            return res.status(403).json({ message: 'Cannot update admin user status' });
        }

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const [result] = await pool.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Error updating user status' });
    }
});

// Get all courses with detailed information
router.get('/courses', authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // Get courses from the view with pagination and search
        const [courses] = await pool.execute(`
            SELECT * FROM admin_courses_view
            WHERE 
                CASE 
                    WHEN ? != '' THEN (
                        title LIKE CONCAT('%', ?, '%') OR
                        description LIKE CONCAT('%', ?, '%') OR
                        category_name LIKE CONCAT('%', ?, '%') OR
                        instructor_name LIKE CONCAT('%', ?, '%')
                    )
                    ELSE 1
                END
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [search, search, search, search, search, limit, offset]);

        // Get total count for pagination with search
        const [countResult] = await pool.execute(`
            SELECT COUNT(*) as total
            FROM admin_courses_view
            WHERE 
                CASE 
                    WHEN ? != '' THEN (
                        title LIKE CONCAT('%', ?, '%') OR
                        description LIKE CONCAT('%', ?, '%') OR
                        category_name LIKE CONCAT('%', ?, '%') OR
                        instructor_name LIKE CONCAT('%', ?, '%')
                    )
                    ELSE 1
                END
        `, [search, search, search, search, search]);

        const total = countResult[0].total;

        // Format the response
        const formattedCourses = courses.map(course => ({
            ...course,
            price: parseFloat(course.price) || 0,
            category_name: course.category_name || 'Uncategorized',
            instructor_name: course.instructor_name || 'Unknown Instructor',
            enrolled_students: parseInt(course.enrolled_students) || 0,
            average_rating: parseFloat(course.average_rating) || 0,
            review_count: parseInt(course.review_count) || 0
        }));

        res.json({
            courses: formattedCourses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        console.error('Error details:', error.message, error.sql);
        res.status(500).json({ 
            message: 'Error fetching courses',
            error: error.message 
        });
    }
});

// Create a new course
router.post('/courses', authenticateToken, isAdmin, async (req, res) => {
    const { title, description, price, category_id, instructor_id, duration, level, image_url } = req.body;

    try {
        // Validate required fields
        if (!title || !description || !price || !category_id || !instructor_id) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['title', 'description', 'price', 'category_id', 'instructor_id']
            });
        }

        // Validate price is a positive number
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        // Check if category exists
        const [categories] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
        if (categories.length === 0) {
            return res.status(400).json({ message: 'Invalid category_id' });
        }

        // Check if instructor exists and is an admin/instructor
        const [instructors] = await pool.query(
            'SELECT id FROM users WHERE id = ? AND role = ?', 
            [instructor_id, 'admin']
        );
        if (instructors.length === 0) {
            return res.status(400).json({ message: 'Invalid instructor_id' });
        }

        const [result] = await pool.query(
            `INSERT INTO courses (
                title, description, price, category_id, instructor_id, 
                duration, level, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, price, category_id, instructor_id, 
             duration || null, level || null, image_url || null]
        );

        // Fetch the newly created course with all details
        const [newCourse] = await pool.query(
            'SELECT * FROM admin_courses_view WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newCourse[0]);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ 
            message: 'Error creating course',
            error: error.message 
        });
    }
});

// Update a course
router.put('/courses/:id', authenticateToken, isAdmin, async (req, res) => {
    const { title, description, price, category_id, instructor_id, duration, level, image_url } = req.body;
    const courseId = req.params.id;

    try {
        // Check if course exists
        const [existingCourse] = await pool.query(
            'SELECT * FROM courses WHERE id = ?',
            [courseId]
        );

        if (existingCourse.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Validate required fields
        if (!title || !description || !price || !category_id || !instructor_id) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['title', 'description', 'price', 'category_id', 'instructor_id']
            });
        }

        // Validate price is a positive number
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        // Check if category exists
        const [categories] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
        if (categories.length === 0) {
            return res.status(400).json({ message: 'Invalid category_id' });
        }

        // Check if instructor exists and is an admin/instructor
        const [instructors] = await pool.query(
            'SELECT id FROM users WHERE id = ? AND role = ?', 
            [instructor_id, 'admin']
        );
        if (instructors.length === 0) {
            return res.status(400).json({ message: 'Invalid instructor_id' });
        }

        // Update the course
        await pool.query(
            `UPDATE courses SET 
                title = ?, 
                description = ?, 
                price = ?, 
                category_id = ?, 
                instructor_id = ?,
                duration = ?,
                level = ?,
                image_url = ?
            WHERE id = ?`,
            [title, description, price, category_id, instructor_id, 
             duration || null, level || null, image_url || null, courseId]
        );

        // Fetch the updated course with all details
        const [updatedCourse] = await pool.query(
            'SELECT * FROM admin_courses_view WHERE id = ?',
            [courseId]
        );

        res.json(updatedCourse[0]);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ 
            message: 'Error updating course',
            error: error.message 
        });
    }
});

// Delete a course
router.delete('/courses/:id', authenticateToken, isAdmin, async (req, res) => {
    const courseId = req.params.id;

    try {
        // Check if course exists
        const [existingCourse] = await pool.query(
            'SELECT * FROM courses WHERE id = ?',
            [courseId]
        );

        if (existingCourse.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if course has enrollments
        const [enrollments] = await pool.query(
            'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ? AND status = ?',
            [courseId, 'active']
        );

        if (enrollments[0].count > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete course with active enrollments',
                enrollments: enrollments[0].count
            });
        }

        // Delete the course
        await pool.query('DELETE FROM courses WHERE id = ?', [courseId]);

        res.json({ 
            message: 'Course deleted successfully',
            id: courseId
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ 
            message: 'Error deleting course',
            error: error.message 
        });
    }
});

module.exports = router; 