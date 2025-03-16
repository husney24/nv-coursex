const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306
        });

        console.log('Successfully connected to MySQL!');
        
        // Try to create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log('Database created or already exists');
        
        // Switch to the database
        await connection.query(`USE ${process.env.DB_NAME}`);
        console.log('Successfully switched to database:', process.env.DB_NAME);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed');
        }
    }
}

testConnection(); 