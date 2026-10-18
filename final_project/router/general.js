const express = require('express');
const axios = require('axios');

let books = require('./booksdb.js');

let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: 'User already exists' });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(201).json({ message: 'User successfully registered' });
});

// Get all books
public_users.get('/', (req, res) => {
    return res.status(200).json(books);
});

// Get book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }

    return res.status(404).json({ message: 'Book not found' });
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();
    const result = {};

    for (let id in books) {
        if (books[id].author.toLowerCase().includes(author)) {
            result[id] = books[id];
        }
    }

    return res.status(200).json(result);
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();
    const result = {};

    for (let id in books) {
        if (books[id].title.toLowerCase().includes(title)) {
            result[id] = books[id];
        }
    }

    return res.status(200).json(result);
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }

    return res.status(404).json({ message: 'Book not found' });
});

const BASE_URL = "http://localhost:5000";

// Get all books using Promise callbacks (Axios)
public_users.get('/async/books', function (req, res) {
    axios.get(`${BASE_URL}/`)
        .then(response => {
            return res.status(200).json(response.data);
        })
        .catch(error => {
            return res.status(500).json({ message: 'Error fetching books', error: error.message });
        });
});

// Search by ISBN using async/await (Axios)
public_users.get('/async/isbn/:isbn', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${req.params.isbn}`);
        return res.status(response.status).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching book by ISBN', error: error.message });
    }
});

// Search by author using async/await (Axios)
public_users.get('/async/author/:author', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/author/${req.params.author}`);
        return res.status(response.status).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching books by author', error: error.message });
    }
});

// Search by title using async/await (Axios)
public_users.get('/async/title/:title', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/title/${req.params.title}`);
        return res.status(response.status).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching books by title', error: error.message });
    }
});

module.exports.general = public_users;