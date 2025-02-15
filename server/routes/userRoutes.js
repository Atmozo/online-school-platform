const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/connection');

const router = express.Router();

// Register User
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
      // Check if username already exists
      const [existingUsername] = await db.query(
          'SELECT id FROM users WHERE username = ?',
          [username]
      );
      
      if (existingUsername.length > 0) {
          return res.status(400).json({ error: 'Username already taken' });
      }
      
      // Check if email already exists
      const [existingEmail] = await db.query(
          'SELECT id FROM users WHERE email = ?',
          [email]
      );
      
      if (existingEmail.length > 0) {
          return res.status(400).json({ error: 'Email already registered' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user - created_at will be automatically set by MySQL
      const [result] = await db.query(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hashedPassword]
      );
      
      res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertId
      });
      
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Error registering user' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { loginIdentifier, password } = req.body;
  
  try {
      // Check if loginIdentifier is email or username
      const isEmail = loginIdentifier.includes('@');
      
      // Query based on email or username
      const [users] = await db.query(
          isEmail 
              ? 'SELECT id, username, email, password FROM users WHERE email = ?'
              : 'SELECT id, username, email, password FROM users WHERE username = ?',
          [loginIdentifier]
      );
      
      if (users.length === 0) {
          return res.status(401).json({
              error: `Invalid ${isEmail ? 'email' : 'username'} or password`
          });
      }
      
      const user = users[0];
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
          return res.status(401).json({
              error: `Invalid ${isEmail ? 'email' : 'username'} or password`
          });
      }
      
      // Remove password from response
      delete user.password;
      
      res.status(200).json({
          message: 'Login successful',
          user
      });
      
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Error logging in' });
  }
});

// Password Reset Request
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
      const [user] = await db.query(
          'SELECT id FROM users WHERE email = ?',
          [email]
      );
      
      if (user.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

   
      
      res.status(200).json({
          message: 'Password reset instructions sent to email'
      });
      
  } catch (error) {
      console.error('Error requesting password reset:', error);
      res.status(500).json({ error: 'Error processing password reset request' });
  }
});

// 📌 DASHBOARD ENDPOINT
router.get('/dashboard', async (req, res) => {
  try {
    // Fetch stats
    const [courseCount] = await db.query('SELECT COUNT(*) as totalCourses FROM courses');
    const [lessonCount] = await db.query('SELECT COUNT(*) as totalLessons FROM lessons');
    const [resourceCount] = await db.query('SELECT COUNT(*) as totalResources FROM resources');
    const [tasks] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');

    res.status(200).json({
      stats: {
        courses: courseCount[0].totalCourses,
        lessons: lessonCount[0].totalLessons,
        resources: resourceCount[0].totalResources,
      },
      tasks,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Add a new task
router.post('/tasks', async (req, res) => {
  const { title, description, status, user_id } = req.body;

  if (!user_id || !title) {
      return res.status(400).json({ 
          error: 'User ID and title are required' 
      });
  }

  try {
      const [result] = await db.query(
          'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
          [user_id, title, description, status || 'pending']
      );
      
      res.status(201).json({ 
          message: 'Task added successfully', 
          taskId: result.insertId 
      });
  } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ error: 'Failed to add task' });
  }
});

// Update task
router.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status, title, description, user_id } = req.body;

  try {
      // First check if task exists and belongs to user
      const [task] = await db.query(
          'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
          [id, user_id]
      );

      if (task.length === 0) {
          return res.status(404).json({ 
              error: 'Task not found or unauthorized' 
          });
      }

      // Update the task
      const [result] = await db.query(
          'UPDATE tasks SET status = ?, title = ?, description = ? WHERE id = ? AND user_id = ?',
          [status, title, description, id, user_id]
      );

      res.status(200).json({ 
          message: 'Task updated successfully' 
      });
  } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body; // Get user_id from request body or auth token

  try {
      const [result] = await db.query(
          'DELETE FROM tasks WHERE id = ? AND user_id = ?', 
          [id, user_id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ 
              error: 'Task not found or unauthorized' 
          });
      }

      res.status(200).json({ 
          message: 'Task deleted successfully' 
      });
  } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
  }
});

// 📌 TASK FILTER ENDPOINTS
// Get all tasks for a user
router.get('/tasks', async (req, res) => {
  const { user_id } = req.query; // Get user_id from query or auth token

  if (!user_id) {
      return res.status(400).json({ 
          error: 'User ID is required' 
      });
  }

  try {
      const [tasks] = await db.query(
          'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
          [user_id]
      );
      
      res.status(200).json(tasks);
  } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Filter tasks by status for a user
router.get('/tasks/status/:status', async (req, res) => {
  const { status } = req.params;
  const { user_id } = req.query; // Get user_id from query or auth token

  if (!user_id) {
      return res.status(400).json({ 
          error: 'User ID is required' 
      });
  }

  try {
      const [tasks] = await db.query(
          'SELECT * FROM tasks WHERE status = ? AND user_id = ? ORDER BY created_at DESC',
          [status, user_id]
      );
      
      res.status(200).json(tasks);
  } catch (error) {
      console.error('Error fetching tasks by status:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Search tasks by title or description
router.get('/tasks/search', async (req, res) => {
  const { query, user_id } = req.query;

  if (!user_id) {
      return res.status(400).json({ 
          error: 'User ID is required' 
      });
  }

  try {
      const [tasks] = await db.query(
          'SELECT * FROM tasks WHERE user_id = ? AND (title LIKE ? OR description LIKE ?) ORDER BY created_at DESC',
          [user_id, `%${query}%`, `%${query}%`]
      );
      
      res.status(200).json(tasks);
  } catch (error) {
      console.error('Error searching tasks:', error);
      res.status(500).json({ error: 'Failed to search tasks' });
  }
});
module.exports = router;
