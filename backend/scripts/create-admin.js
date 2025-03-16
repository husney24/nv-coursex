const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function createAdmin() {
    const adminData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // This will be hashed
        role: 'admin'
    };

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Check if admin already exists
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [adminData.email]
        );

        if (existingUsers.length > 0) {
            // Update existing user to admin
            await pool.query(
                'UPDATE users SET role = ?, password = ? WHERE email = ?',
                [adminData.role, hashedPassword, adminData.email]
            );
            console.log('Existing user updated to admin');
        } else {
            // Create new admin user
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [adminData.name, adminData.email, hashedPassword, adminData.role]
            );
            console.log('New admin user created');
        }

        console.log('Admin credentials:');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin(); 