const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;
const SECRET_KEY = 'your_secret_key'; // Use a strong secret key

// Middleware
app.use(express.json());
app.use(cors()); // Allow frontend to communicate with backend

// Simulated database
const users = [
    { username: 'user123', password: bcrypt.hashSync('password123', 10) }
];

// Login endpoint with JWT authentication
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: 'Login successful!', token });
});

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ success: false, message: 'No token provided.' });
    }

    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }
        req.user = decoded;
        next();
    });
};

// Payment endpoint with authentication
app.post('/api/payment', authenticate, (req, res) => {
    const { amount, currency } = req.body;

    // Validate payment details
    if (!amount || amount <= 0 || !currency) {
        return res.status(400).json({ success: false, message: 'Invalid payment details.' });
    }

    res.status(200).json({ success: true, message: 'Payment successful!' });
});

// Serve the frontend HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
    console.log(🚀 Server running at http://localhost:${port});
});