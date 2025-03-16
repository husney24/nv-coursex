const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all categories with course counts
router.get('/', async (req, res) => {
    try {
        const [categories] = await pool.execute(`
            SELECT c.*, 
                   COUNT(DISTINCT co.id) as course_count,
                   COUNT(DISTINCT e.id) as student_count
            FROM categories c
            LEFT JOIN courses co ON c.id = co.category_id
            LEFT JOIN enrollments e ON co.id = e.course_id
            GROUP BY c.id
        `);

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Get category by ID with its courses
router.get('/:id', async (req, res) => {
    try {
        const [categories] = await pool.execute(`
            SELECT c.*, 
                   COUNT(DISTINCT co.id) as course_count,
                   COUNT(DISTINCT e.id) as student_count
            FROM categories c
            LEFT JOIN courses co ON c.id = co.category_id
            LEFT JOIN enrollments e ON co.id = e.course_id
            WHERE c.id = ?
            GROUP BY c.id
        `, [req.params.id]);

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const category = categories[0];

        // Get courses in this category
        const [courses] = await pool.execute(`
            SELECT c.*, 
                   COUNT(DISTINCT e.id) as enrolled_students,
                   AVG(r.rating) as average_rating,
                   COUNT(DISTINCT r.id) as review_count
            FROM courses c
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN reviews r ON c.id = r.course_id
            WHERE c.category_id = ?
            GROUP BY c.id
        `, [req.params.id]);

        category.courses = courses;

        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Error fetching category' });
    }
});

// Create a new category
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description]
        );
        res.status(201).json({
            id: result.insertId,
            name,
            description
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category' });
    }
});

// Update a category
router.put('/:id', async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE categories SET name = ?, description = ? WHERE id = ?',
            [name, description, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ id: req.params.id, name, description });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Error updating category' });
    }
});

// Delete a category
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category' });
    }
});

module.exports = router; 