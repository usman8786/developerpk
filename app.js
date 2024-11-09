const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cors = require('cors'); // Import cors
const users = require('./users');

const app = express();

// Use CORS
// app.use(cors()); // Enable CORS for all routes by default
app.use(cors({
    origin: 'http://localhost:3001', // Ensure this matches your frontend URL exactly
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // List allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Add other headers if needed
    credentials: true
}));
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'your_secret_key', // Replace with a secure secret in production
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(new LocalStrategy(
    function(username, password, done) {
        const user = users.find(u => u.username === username);
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (user.password !== password) { // Use hashed passwords in production
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    }
));

// Serialize and deserialize user
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    const user = users.find(u => u.id === id);
    done(null, user);
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

app.post('/login',
    // passport.authenticate('local', { failureRedirect: '/login-failure' }),
    (req, res) => {
        res.json({ message: 'Login successful', user: req.user });
    }
);

app.get('/login-failure', (req, res) => {
    res.json({ message: 'Login failed' });
});

app.get('/home', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ message: 'Welcome to the home page', user: req.user });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.post('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.json({ message: 'Logout successful' });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
