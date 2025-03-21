const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const { generateRecommendations } = require('../services/openaiService');
const Todo = require('../models/Todo');
const path = require('path');
const fs = require('fs');

/**
 * @route   GET /api/todos
 * @desc    Get all todos for authenticated user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    // Get todos for current user, sorted by most recently created
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Server error fetching todos' });
  }
});

/**
 * @route   POST /api/todos
 * @desc    Create a new todo with optional AI recommendations and image
 * @access  Private
 */
router.post(
  '/',
  protect,
  upload.single('image'),
  handleMulterError,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, getRecommendations } = req.body;
      
      // Process file upload
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
      
      // Log file upload for debugging
      if (req.file) {
        console.log(`File uploaded: ${req.file.filename} (${req.file.size} bytes) - Path: ${imagePath}`);
        console.log(`File physical path: ${req.file.path}`);
      }
      
      // Get AI recommendations if requested
      let recommendations = null;
      if (getRecommendations === 'true') {
        console.log('Requesting AI recommendations for todo:', title);
        try {
          recommendations = await generateRecommendations(title, description);
          console.log('AI recommendations received:', recommendations ? 'Yes' : 'No');
        } catch (recError) {
          console.error('Error getting recommendations:', recError);
          recommendations = "Error processing AI recommendations.";
        }
      }

      // Create todo
      const todo = await Todo.create({
        title,
        description,
        image: imagePath,
        recommendations,
        user: req.user._id
      });

      res.status(201).json(todo);
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error creating todo:', error);
      res.status(500).json({ message: 'Server error creating todo' });
    }
  }
);

/**
 * @route   GET /api/todos/:id
 * @desc    Get a single todo by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    // Check if todo exists and belongs to user
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Verify user owns this todo
    if (todo.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this todo' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ message: 'Server error fetching todo' });
  }
});

/**
 * @route   PUT /api/todos/:id
 * @desc    Update a todo by ID
 * @access  Private
 */
router.put(
  '/:id',
  protect,
  upload.single('image'),
  handleMulterError,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let todo = await Todo.findById(req.params.id);

      // Check if todo exists
      if (!todo) {
        // Delete uploaded file if todo doesn't exist
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: 'Todo not found' });
      }

      // Verify user owns this todo
      if (todo.user.toString() !== req.user._id.toString()) {
        // Delete uploaded file if unauthorized
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(403).json({ message: 'Not authorized to update this todo' });
      }

      // Handle image upload
      let imagePath = todo.image;
      if (req.file) {
        // Delete old image if exists
        if (todo.image) {
          try {
            const oldImagePath = path.join(__dirname, '..', todo.image);
            console.log(`Checking old image at: ${oldImagePath}`);
            if (fs.existsSync(oldImagePath)) {
              console.log(`Deleting old image: ${oldImagePath}`);
              fs.unlinkSync(oldImagePath);
            } else {
              console.log(`Old image not found: ${oldImagePath}`);
            }
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
        imagePath = `/uploads/${req.file.filename}`;
        console.log(`New image path: ${imagePath}`);
      }

      // Handle AI recommendations if requested
      if (req.body.getRecommendations === 'true') {
        const title = req.body.title || todo.title;
        const description = req.body.description || todo.description;
        req.body.recommendations = await generateRecommendations(title, description);
      }

      // Update todo with new values
      const updatedTodo = await Todo.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          image: imagePath,
          updatedAt: Date.now()
        },
        { new: true }
      );

      res.json(updatedTodo);
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error updating todo:', error);
      res.status(500).json({ message: 'Server error updating todo' });
    }
  }
);

/**
 * @route   DELETE /api/todos/:id
 * @desc    Delete a todo by ID
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    // Check if todo exists
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Verify user owns this todo
    if (todo.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this todo' });
    }

    // Delete associated image if exists
    if (todo.image) {
      const imagePath = path.join(__dirname, '..', todo.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete todo
    await todo.deleteOne();

    res.json({ message: 'Todo removed' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Server error deleting todo' });
  }
});

/**
 * @route   GET /api/todos/search
 * @desc    Search todos by title and description
 * @access  Private
 */
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Use text index search for best results
    const todos = await Todo.find({ 
      $text: { $search: query },
      user: req.user._id 
    }).sort({ score: { $meta: 'textScore' } });

    res.json(todos);
  } catch (error) {
    console.error('Error searching todos:', error);
    res.status(500).json({ message: 'Server error searching todos' });
  }
});

module.exports = router; 