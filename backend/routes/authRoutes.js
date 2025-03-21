const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Generate JWT token
 * @param {string} id - User ID to include in token payload
 * @returns {string} - JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    // Validation middleware
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      const userExists = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (userExists) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists' 
        });
      }

      // Create new user
      const user = await User.create({
        username,
        email,
        password
      });

      // Generate token and respond with user data
      if (user) {
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id)
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    // Validation middleware
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user by email and include password field for verification
      const user = await User.findOne({ email }).select('+password');

      // Check if user exists and password is correct
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id)
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

module.exports = router; 