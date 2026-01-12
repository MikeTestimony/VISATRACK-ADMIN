const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
    async renderRegister(req, res) {
        // prevent caching of auth pages which may allow browsers to retain values
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return res.render('auth/register', { query: req.query });
    }

    async renderLogin(req, res) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return res.render('auth/login', { query: req.query });
    }

    async register(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).render('auth/register', { error: 'Username and password required' });
            }

            const existing = await User.findOne({ username });
            if (existing) {
                return res.status(400).render('auth/register', { error: 'Username already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = new User({
                username,
                password: hashedPassword,
                isAdmin: true,
            });
            await user.save();

            return res.redirect('/login?msg=Account created. Please login.');
        } catch (error) {
            return res.status(500).render('auth/register', { error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).render('auth/login', { error: 'Username and password required' });
            }

            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).render('auth/login', { error: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).render('auth/login', { error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user._id, username: user.username, isAdmin: user.isAdmin },
                process.env.JWT_SECRET || 'your_secret_key',
                { expiresIn: '7d' }
            );

            res.cookie('authToken', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
            return res.redirect('/admin/dashboard');
        } catch (error) {
            return res.status(500).render('auth/login', { error: error.message });
        }
    }

    async logout(req, res) {
        // destroy server session if any and clear auth cookie
        if (req.session) {
            req.session.destroy(err => {
                res.clearCookie('authToken');
                return res.redirect('/login');
            });
        } else {
            res.clearCookie('authToken');
            return res.redirect('/login');
        }
    }
}

module.exports = new AuthController();
