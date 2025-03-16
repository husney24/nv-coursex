const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { pool, testConnection } = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const categoryRoutes = require('./routes/categories');
const instructorRoutes = require('./routes/instructors');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Test database connection and start server
const startServer = async () => {
    try {
        // Test database connection
        const isConnected = await testConnection();
        
        if (isConnected) {
            console.log('\x1b[42m\x1b[30m%s\x1b[0m', ' DATABASE CONNECTED ');
            console.log('\x1b[36m%s\x1b[0m', `Connected to MySQL database: ${process.env.DB_NAME}`);
        } else {
            console.log('\x1b[41m\x1b[37m%s\x1b[0m', ' DATABASE CONNECTION FAILED ');
            process.exit(1);
        }

        // Start the server
        const server = app.listen(PORT, () => {
            console.log('\x1b[42m\x1b[30m%s\x1b[0m', ' SERVER RUNNING ');
            console.log('\x1b[36m%s\x1b[0m', `Server is running on port ${PORT}`);
        });

        // Handle server shutdown gracefully
        process.on('SIGTERM', () => {
            console.info('\n\x1b[33m%s\x1b[0m', 'SIGTERM signal received. Closing HTTP server...');
            server.close(() => {
                console.log('\x1b[31m%s\x1b[0m', 'HTTP server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('\x1b[41m\x1b[37m%s\x1b[0m', ' ERROR STARTING SERVER ');
        console.error(error);
        process.exit(1);
    }
};

startServer();

module.exports = app; 