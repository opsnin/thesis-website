const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const SECRET_KEY = 'your_jwt_secret_key';

// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    console.log('Signup request received with data:', { username, email, role });

    try {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        console.log('Checking if user already exists:', existingUser ? 'User found' : 'No existing user');

        if (existingUser) {
            console.log('Signup error: User already exists');
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: role === 'teacher' ? 'TEACHER' : 'STUDENT',
            },
        });
        console.log('User created successfully:', { username: user.username, role: user.role });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route returns token, role, username, and userId
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login request received with email:', email);

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        console.log('User lookup result:', user ? 'User found' : 'No user found');

        if (!user) {
            console.log('Login error: Invalid email');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password validation result:', isPasswordValid ? 'Valid password' : 'Invalid password');

        if (!isPasswordValid) {
            console.log('Login error: Invalid password');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        console.log('JWT token generated:', token);

        res.json({ 
            message: 'Login successful', 
            token, 
            role: user.role, 
            username: user.username, 
            userId: user.id
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});  

// Logout route
router.post('/logout', (req, res) => {
    console.log('Logout request received');
    res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
