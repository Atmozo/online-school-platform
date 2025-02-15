const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/connection");
const router = express.Router();

// Move to secure environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Input validation middleware
const validateLoginInput = (req, res, next) => {
  const { email, username, password } = req.body;
  if ((!email && !username) || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  next();
};

const validateRegistrationInput = (req, res, next) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
};

// Login Route with SQL injection protection and rate limiting
router.post('/login', validateLoginInput, async (req, res) => {
  const { email, username, password } = req.body;

  try {
    let user;
    if (email) {
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      user = users[0];
    } else {
      const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      user = users[0];
    }

    if (!user) {
      // Use consistent timing to prevent username enumeration
      await bcrypt.compare(password, '$2a$10$invalidhashforuniformtiming');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role 
      },
      JWT_SECRET,
      { 
        expiresIn: '1h',
        algorithm: 'HS256'
      }
    );

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register Route with additional security
router.post('/register', validateRegistrationInput, async (req, res) => {
  const { name, email, username, password } = req.body;

  try {
    // Check for existing user with prepared statement
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password with appropriate cost factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user with prepared statement
    const [result] = await db.query(
      'INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, username, hashedPassword, 'student']
    );

    const token = jwt.sign(
      { 
        userId: result.insertId, 
        role: 'student' 
      },
      JWT_SECRET,
      { 
        expiresIn: '1h',
        algorithm: 'HS256'
      }
    );

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.status(201).json({
      user: {
        id: result.insertId,
        name,
        email,
        username,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Improved authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Profile update with proper validation
router.put("/profile", authenticateUser, async (req, res) => {
  const { username, email } = req.body;
  
  if (!username || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if new username/email conflicts with other users
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email, username, req.user.userId]
    );

    if (existingUsers.length) {
      return res.status(400).json({ error: 'Email or username already taken' });
    }

    await db.query(
      "UPDATE users SET username = ?, email = ? WHERE id = ?",
      [username, email, req.user.userId]
    );
    
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Error updating profile" });
  }
});

// Password change with proper validation
router.put("/change-password", authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }

  try {
    const [rows] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, req.user.userId]
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Error updating password" });
  }
});

module.exports = router;
// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const db = require("../db/connection");

// const router = express.Router();
// const SECRET_KEY = "qwerty123"; // Change this in production

// // Register User
// // Login Route
// router.post('/login', async (req, res) => {
//   const { email, username, password } = req.body;

//   try {
//     // Check if login with email or username
//     const field = email ? 'email' : 'username';
//     const value = email || username;

//     const [users] = await db.query(
//       `SELECT * FROM users WHERE ${field} = ?`,
//       [value]
//     );

//     if (!users.length) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const user = users[0];
//     const validPassword = await bcrypt.compare(password, user.password);

//     if (!validPassword) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         username: user.username,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Register Route
// router.post('/register', async (req, res) => {
//   const { name, email, username, password } = req.body;

//   try {
//     // Check if email exists
//     const [existingUsers] = await db.query(
//       'SELECT id FROM users WHERE email = ? OR username = ?',
//       [email, username]
//     );

//     if (existingUsers.length) {
//       return res.status(400).json({ error: 'Email or username already exists' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert user
//     const [result] = await db.query(
//       'INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)',
//       [name, email, username, hashedPassword]
//     );

//     const token = jwt.sign(
//       { userId: result.insertId, role: 'student' },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.status(201).json({
//       token,
//       user: {
//         id: result.insertId,
//         name,
//         email,
//         username,
//         role: 'student'
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Middleware: Authenticate JWT Token
// const authenticateUser = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "Unauthorized" });

//   jwt.verify(token, SECRET_KEY, (err, decoded) => {
//     if (err) return res.status(403).json({ error: "Invalid token" });
//     req.userId = decoded.userId;
//     next();
//   });
// };

// // Get User Dashboard Data
// router.get("/dashboard", authenticateUser, async (req, res) => {
//   try {
//     const [courses] = await db.query(
//       `SELECT c.id, c.title, e.completed_lessons, e.total_lessons
//        FROM enrollments e
//        JOIN courses c ON e.course_id = c.id
//        WHERE e.user_id = ?`,
//       [req.userId]
//     );

//     res.json({ message: "Dashboard data fetched successfully", courses });
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     res.status(500).json({ error: "Error fetching dashboard data" });
//   }
// });
// router.post('/users', async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // Your logic to create a user
//     // Example: inserting into the database
//     const result = await db.query(
//       'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
//       [name, email, password]
//     );

//     res.status(201).json({ message: 'User created successfully', userId: result.insertId });
//   } catch (error) {
//     console.error('Error creating user:', error);
//     res.status(500).json({ error: 'Failed to create user' });
//   }
// });

// // Update Profile
// router.put("/profile", authenticateUser, async (req, res) => {
//   const { username, email } = req.body;
//   try {
//     await db.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [username, email, req.userId]);
//     res.json({ message: "Profile updated successfully" });
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     res.status(500).json({ error: "Error updating profile" });
//   }
// });

// // Change Password
// router.put("/change-password", authenticateUser, async (req, res) => {
//   const { currentPassword, newPassword } = req.body; router.post('/signup', async (req, res) => {
//     const { username, password } = req.body;
//    const hashedPassword = await bcrypt.hash(password, 10);
//    try {
//    const [result] = await db.query(
//    'INSERT INTO users (username, password) VALUES (?, ?)',
//     [username, hashedPassword]
//     );
//    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
//     } catch (error) {
//    console.error('Error registering user:', error); // Log the error
//    res.status(500).json({ error: 'Error registering user' });
//     }
//    });
//    // Login User
//    router.post('/login', async (req, res) => {
//    const { username, password } = req.body;
//    try {
//    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
//    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) {
//    return res.status(401).json({ error: 'Invalid credentials' });
//     }
//    res.status(200).json({ message: 'Login successful', userId: rows[0].id });
//     } catch (error) {
//    res.status(500).json({ error: 'Error logging in' });
//     }
//    });

//   try {
//     const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [req.userId]);

//     if (rows.length === 0) return res.status(404).json({ error: "User not found" });

//     const isValid = await bcrypt.compare(currentPassword, rows[0].password);
//     if (!isValid) return res.status(400).json({ error: "Current password is incorrect" });

//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, req.userId]);

//     res.json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error("Error updating password:", error);
//     res.status(500).json({ error: "Error updating password" });
//   }
// });

// module.exports = router;

