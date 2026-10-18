const express = require('express');
const jwt = require('jsonwebtoken');

let books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

// Check whether username already exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};

// Login
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, "secretkey", { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login successful', token });
    }

    return res.status(401).json({ message: 'Invalid username or password' });
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;
    const review = req.query.review || req.body.review;

    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (!review) {
        return res.status(400).json({ message: 'Review text is required' });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: 'Review added/updated successfully',
        reviews: books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: 'No review by this user for the given book' });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: 'Review deleted successfully',
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;