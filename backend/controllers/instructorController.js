const { pool } = require('../config/database');

// Get all instructors
const getAllInstructors = async (req, res) => {
    try {
        const [instructors] = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.avatar,
                u.bio,
                u.title,
                COUNT(DISTINCT c.id) as courses_count,
                COUNT(DISTINCT e.user_id) as students_count,
                COALESCE(AVG(r.rating), 0) as average_rating
            FROM users u
            LEFT JOIN courses c ON c.instructor_id = u.id
            LEFT JOIN enrollments e ON e.course_id = c.id
            LEFT JOIN reviews r ON r.course_id = c.id
            WHERE u.role = 'instructor'
            GROUP BY u.id
        `);

        res.json(instructors);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Error fetching instructors' });
    }
};

// Get instructor by ID
const getInstructorById = async (req, res) => {
    try {
        const [instructor] = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.avatar,
                u.bio,
                u.title,
                COUNT(DISTINCT c.id) as courses_count,
                COUNT(DISTINCT e.user_id) as students_count,
                COALESCE(AVG(r.rating), 0) as average_rating
            FROM users u
            LEFT JOIN courses c ON c.instructor_id = u.id
            LEFT JOIN enrollments e ON e.course_id = c.id
            LEFT JOIN reviews r ON r.course_id = c.id
            WHERE u.id = ? AND u.role = 'instructor'
            GROUP BY u.id
        `, [req.params.id]);

        if (instructor.length === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        // Get instructor's courses
        const [courses] = await pool.query(`
            SELECT 
                c.*,
                COUNT(DISTINCT e.user_id) as enrolled_count,
                COALESCE(AVG(r.rating), 0) as average_rating
            FROM courses c
            LEFT JOIN enrollments e ON e.course_id = c.id
            LEFT JOIN reviews r ON r.course_id = c.id
            WHERE c.instructor_id = ?
            GROUP BY c.id
        `, [req.params.id]);

        res.json({
            ...instructor[0],
            courses
        });
    } catch (error) {
        console.error('Error fetching instructor:', error);
        res.status(500).json({ message: 'Error fetching instructor details' });
    }
};

module.exports = {
    getAllInstructors,
    getInstructorById
}; 