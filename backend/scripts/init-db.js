const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    try {
        // Create connection without database selected
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('Connected to MySQL server');

        // Read SQL file
        const sqlFile = await fs.readFile(path.join(__dirname, '../database.sql'), 'utf8');
        
        // Execute SQL commands
        await connection.query(sqlFile);
        
        console.log('Database initialized successfully');

        // Create a test user with hashed password
        const hashedPassword = await bcrypt.hash('password123', 10);
        await connection.query(`
            INSERT INTO users (name, email, password, role) 
            VALUES ('Test User', 'test@example.com', ?, 'user')
            ON DUPLICATE KEY UPDATE email=email;
        `, [hashedPassword]);

        console.log('Test user created with email: test@example.com and password: password123');

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

initializeDatabase(); 