const express = require('express');
const db = require('../db/connection');
const router = express.Router();

// Input validation middleware
const validateCourse = (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  if (title.length < 3 || title.length > 100) {
    return res.status(400).json({ error: 'Title must be between 3 and 100 characters' });
  }
  if (description.length < 10 || description.length > 1000) {
    return res.status(400).json({ error: 'Description must be between 10 and 1000 characters' });
  }
  next();
};

const validateLesson = (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  if (title.length < 3 || title.length > 100) {
    return res.status(400).json({ error: 'Title must be between 3 and 100 characters' });
  }
  next();
};

const validateResource = (req, res, next) => {
  const { title, url, type } = req.body;
  if (!title || !url || !type) {
    return res.status(400).json({ error: 'Title, URL, and type are required' });
  }
  if (!['video', 'document', 'link'].includes(type)) {
    return res.status(400).json({ error: 'Invalid resource type' });
  }
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  next();
};

// Authorization middleware
const authorizeInstructor = async (req, res, next) => {
  try {
    const [instructors] = await db.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.userId]
    );
    if (!instructors.length || instructors[0].role !== 'instructor') {
      return res.status(403).json({ error: 'Unauthorized: Instructor access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

const validateCourseOwnership = async (req, res, next) => {
  const courseId = req.params.courseId;
  try {
    const [courses] = await db.query(
      'SELECT created_by FROM courses WHERE id = ?',
      [courseId]
    );
    if (!courses.length || courses[0].created_by !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized: Not course owner' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Add a new course
router.post('/add', authorizeInstructor, validateCourse, async (req, res) => {
  const { title, description } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO courses (title, description, created_by) VALUES (?, ?, ?)',
      [title, description, req.user.userId]
    );
    res.status(201).json({ 
      message: 'Course created successfully', 
      courseId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Error creating course' });
  }
});

// Add a new lesson
router.post('/:courseId/lessons/add', 
  authorizeInstructor, 
  validateCourseOwnership,
  validateLesson, 
  async (req, res) => {
    const { courseId } = req.params;
    const { title, description } = req.body;

    try {
      const [result] = await db.query(
        'INSERT INTO lessons (course_id, title, description) VALUES (?, ?, ?)',
        [courseId, title, description]
      );
      res.status(201).json({ 
        message: 'Lesson added successfully', 
        lessonId: result.insertId 
      });
    } catch (error) {
      console.error('Error adding lesson:', error);
      res.status(500).json({ error: 'Error adding lesson' });
    }
});

// Add a resource to a lesson
router.post('/lessons/:lessonId/resources/add',
  authorizeInstructor,
  validateResource,
  async (req, res) => {
    const { lessonId } = req.params;
    const { title, url, type } = req.body;

    try {
      // Verify lesson belongs to instructor's course
      const [lessons] = await db.query(
        `SELECT c.created_by 
         FROM lessons l 
         JOIN courses c ON l.course_id = c.id 
         WHERE l.id = ?`,
        [lessonId]
      );

      if (!lessons.length || lessons[0].created_by !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized: Not lesson owner' });
      }

      const [result] = await db.query(
        'INSERT INTO resources (lesson_id, title, url, type) VALUES (?, ?, ?, ?)',
        [lessonId, title, url, type]
      );
      res.status(201).json({ 
        message: 'Resource added successfully', 
        resourceId: result.insertId 
      });
    } catch (error) {
      console.error('Error adding resource:', error);
      res.status(500).json({ error: 'Error adding resource' });
    }
});

// Get all courses with optimized query
router.get('/', async (req, res) => {
  try {
    const [courses] = await db.query(`
      SELECT 
        c.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', l.id,
            'title', l.title,
            'description', l.description,
            'resources', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', r.id,
                  'title', r.title,
                  'type', r.type
                )
              )
              FROM resources r
              WHERE r.lesson_id = l.id
            )
          )
        ) as lessons
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id
      GROUP BY c.id
    `);

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

// Get user's courses
router.get('/user/:userId', async (req, res) => {
  try {
    const [courses] = await db.query(`
      SELECT 
        c.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', l.id,
            'title', l.title,
            'description', l.description
          )
        ) as lessons
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id
      WHERE c.created_by = ?
      GROUP BY c.id
    `, [req.params.userId]);

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ error: 'Error fetching user courses' });
  }
});

// Get course details
router.get('/:courseId/details', async (req, res) => {
  try {
    const [courses] = await db.query(`
      SELECT 
        c.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', l.id,
            'title', l.title,
            'description', l.description,
            'resources', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', r.id,
                  'title', r.title,
                  'url', r.url,
                  'type', r.type
                )
              )
              FROM resources r
              WHERE r.lesson_id = l.id
            )
          )
        ) as lessons
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.params.courseId]);

    if (!courses.length) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(courses[0]);
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Error fetching course details' });
  }
});

// Enroll in a course
router.post("/enroll", async (req, res) => {
  const { courseId } = req.body;

  try {
    // Get total lessons count
    const [lessonsCount] = await db.query(
      'SELECT COUNT(*) as total FROM lessons WHERE course_id = ?',
      [courseId]
    );

    // Check if already enrolled
    const [existing] = await db.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.userId, courseId]
    );

    if (existing.length) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const [result] = await db.query(
      "INSERT INTO enrollments (user_id, course_id, total_lessons, completed_lessons) VALUES (?, ?, ?, 0)",
      [req.user.userId, courseId, lessonsCount[0].total]
    );

    res.status(201).json({ 
      message: "Enrolled successfully!", 
      enrollmentId: result.insertId 
    });
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ error: "Failed to enroll" });
  }
});

// Update progress
router.put("/enrollments/progress", async (req, res) => {
  const { courseId, completedLessons } = req.body;

  try {
    const [enrollment] = await db.query(
      'SELECT total_lessons FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.userId, courseId]
    );

    if (!enrollment.length) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (completedLessons > enrollment[0].total_lessons) {
      return res.status(400).json({ error: 'Invalid completed lessons count' });
    }

    await db.query(
      "UPDATE enrollments SET completed_lessons = ? WHERE user_id = ? AND course_id = ?",
      [completedLessons, req.user.userId, courseId]
    );

    res.json({ message: "Progress updated successfully!" });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// Get user enrollments
router.get("/enrollments", async (req, res) => {
  try {
    const [enrollments] = await db.query(`
      SELECT 
        c.id,
        c.title,
        c.description,
        e.completed_lessons,
        e.total_lessons,
        (e.completed_lessons / e.total_lessons * 100) as progress
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id 
      WHERE e.user_id = ?`,
      [req.user.userId]
    );

    res.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

module.exports = router;

// const express = require('express');
// const db = require('../db/connection');

// const router = express.Router();

// // Add a new course
// router.post('/add', async (req, res) => {
//   const { title, description, created_by } = req.body;

//   try {
//     const [result] = await db.query(
//       'INSERT INTO courses (title, description, created_by) VALUES (?, ?, ?)',
//       [title, description, created_by]
//     );
//     res.status(201).json({ message: 'Course created successfully', courseId: result.insertId });
//   } catch (error) {
//     console.error('Error creating course:', error);
//     res.status(500).json({ error: 'Error creating course' });
//   }
// });

// // Add a new lesson
// router.post('/:courseId/lessons/add', async (req, res) => {
//   const { courseId } = req.params;
//   const { title, description } = req.body;

//   try {
//     const [result] = await db.query(
//       'INSERT INTO lessons (course_id, title, description) VALUES (?, ?, ?)',
//       [courseId, title, description]
//     );
//     res.status(201).json({ message: 'Lesson added successfully', lessonId: result.insertId });
//   } catch (error) {
//     res.status(500).json({ error: 'Error adding lesson' });
//   }
// });
// // Add a new resource to a lesson
// router.post('/lessons/:lessonId/resources/add', async (req, res) => {
//   const { lessonId } = req.params;
//   const { title, url, type } = req.body;

//   try {
//     const [result] = await db.query(
//       'INSERT INTO resources (lesson_id, title, url, type) VALUES (?, ?, ?, ?)',
//       [lessonId, title, url, type]
//     );
//     res.status(201).json({ message: 'Resource added successfully', resourceId: result.insertId });
//   } catch (error) {
//     res.status(500).json({ error: 'Error adding resource' });
//   }
// });// Add a new resource to a lesson
// router.post('/lessons/:lessonId/resources/add', async (req, res) => {
//   const { lessonId } = req.params;
//   const { title, url, type } = req.body;

//   try {
//     const [result] = await db.query(
//       'INSERT INTO resources (lesson_id, title, url, type) VALUES (?, ?, ?, ?)',
//       [lessonId, title, url, type]
//     );
//     res.status(201).json({ message: 'Resource added successfully', resourceId: result.insertId });
//   } catch (error) {
//     res.status(500).json({ error: 'Error adding resource' });
//   }
// });
// // Get all lessons for a course

// // Get all resources for a lesson
// router.get('/lessons/:lessonId/resources', async (req, res) => {
//   const { lessonId } = req.params;

//   try {
//     const [resources] = await db.query('SELECT * FROM resources WHERE lesson_id = ?', [lessonId]);
//     res.status(200).json(resources);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching resources' });
//   }
// });



// // Get all courses with lessons and resources
// router.get('/', async (req, res) => {
//   try {
//     const [courses] = await db.query('SELECT * FROM courses');

//     // Fetch lessons and resources for each course
//     const detailedCourses = await Promise.all(
//       courses.map(async (course) => {
//         const [lessons] = await db.query('SELECT * FROM lessons WHERE id = ?', [course.id]);
//         const [resources] = await db.query('SELECT * FROM resources WHERE id = ?', [course.id]);
//         return { ...course, lessons, resources };
//       })
//     );

//     res.status(200).json(detailedCourses);
//   } catch (error) {
//     console.error('Error fetching courses:', error);
//     res.status(500).json({ error: 'Error fetching courses' });
//   }
// });

// // Get courses by user with lessons and resources
// router.get('/user/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const [courses] = await db.query('SELECT * FROM courses WHERE created_by = ?', [userId]);

//     const detailedCourses = await Promise.all(
//       courses.map(async (course) => {
//         const [lessons] = await db.query('SELECT * FROM lessons WHERE course_id = ?', [course.id]);
//         const [resources] = await db.query('SELECT * FROM resources WHERE course_id = ?', [course.id]);
//         return { ...course, lessons, resources };
//       })
//     );

//     res.status(200).json(detailedCourses);
//   } catch (error) {
//     console.error('Error fetching user courses:', error);
//     res.status(500).json({ error: 'Error fetching user courses' });
//   }
// });

// // ...existing code...

// // Get all lessons for a course
// router.get('/:courseId/lessons', async (req, res) => {
  
//     try {
//         // First get all lessons
//         const [lessons] = await db.query('SELECT * FROM lessons WHERE course_id = ?', [req.params.courseId]);
        
//         // Then get resources for each lesson
//         const lessonsWithResources = await Promise.all(
//             lessons.map(async (lesson) => {
//                 const [resources] = await db.query(
//                     'SELECT id, title, url, type FROM resources WHERE lesson_id = ?',
//                     [lesson.id]
//                 );
//                 return {
//                     ...lesson,
//                     resources: resources
//                 };
//             })
//         );
        
//         res.status(200).json(lessonsWithResources);
//     } catch (error) {
//         console.error('Error fetching lessons:', error);
//         res.status(500).json({ error: 'Failed to fetch lessons' });
//     }
// });
// // Get resources for a lesson
// router.get('/lessons/:lessonId/resources', async (req, res) => {
//   const { lessonId } = req.params;

//   try {
//     const [resources] = await db.query(
//       'SELECT * FROM resources WHERE lesson_id = ?',
//       [lessonId]
//     );
//     res.json(resources);
//   } catch (error) {
//     console.error('Error fetching resources:', error);
//     res.status(500).json({ error: 'Failed to fetch resources' });
//   }
// });

// // Get course details with lessons and resources
// router.get('/:courseId/details', async (req, res) => {
//   const { courseId } = req.params;

//   try {
//     // Get course info
//     const [course] = await db.query(
//       'SELECT * FROM courses WHERE id = ?',
//       [courseId]
//     );

//     if (!course.length) {
//       return res.status(404).json({ error: 'Course not found' });
//     }

//     // Get lessons
//     const [lessons] = await db.query(
//       'SELECT * FROM lessons WHERE course_id = ?',
//       [courseId]
//     );

//     // Get resources for all lessons
//     const [resources] = await db.query(
//       `SELECT r.* 
//        FROM resources r
//        JOIN lessons l ON l.id = r.lesson_id
//        WHERE l.course_id = ?`,
//       [courseId]
//     );

//     res.json({
//       course: course[0],
//       lessons: lessons,
//       resources: resources
//     });
//   } catch (error) {
//     console.error('Error fetching course details:', error);
//     res.status(500).json({ error: 'Failed to fetch course details' });
//   }
// });

// router.post("/enroll", async (req, res) => {
//   const { userId, courseId, totalLessons } = req.body;

//   try {
//       const [result] = await pool.execute(
//           "INSERT INTO enrollments (user_id, course_id, total_lessons) VALUES (?, ?, ?)",
//           [userId, courseId, totalLessons]
//       );

//       res.status(201).json({ message: "Enrolled successfully!", enrollmentId: result.insertId });
//   } catch (error) {
//       console.error("Error enrolling user:", error);
//       res.status(500).json({ error: "Failed to enroll" });
//   }
// });

// router.put("/enrollments/progress", async (req, res) => {
//   const { userId, courseId, completedLessons } = req.body;

//   try {
//       const [result] = await pool.execute(
//           "UPDATE enrollments SET completed_lessons = ? WHERE user_id = ? AND course_id = ?",
//           [completedLessons, userId, courseId]
//       );

//       res.json({ message: "Progress updated successfully!" });
//   } catch (error) {
//       console.error("Error updating progress:", error);
//       res.status(500).json({ error: "Failed to update progress" });
//   }
// });

// router.get("/enrollments/:userId", async (req, res) => {
//   const userId = parseInt(req.params.userId);

//   try {
//       const [rows] = await pool.execute(
//           "SELECT courses.id, courses.title, e.completed_lessons, e.total_lessons FROM enrollments e JOIN courses ON e.course_id = courses.id WHERE e.user_id = ?",
//           [userId]
//       );

//       res.json(rows);
//   } catch (error) {
//       console.error("Error fetching enrollments:", error);
//       res.status(500).json({ error: "Failed to fetch enrollments" });
//   }
// });


// // ...existing code...

// module.exports = router;

