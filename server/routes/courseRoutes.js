

const express = require('express');
const db = require('../db/connection');

const router = express.Router();

// Add a new course
router.post('/add', async (req, res) => {
  const { title, description, created_by } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO courses (title, description, created_by) VALUES (?, ?, ?)',
      [title, description, created_by]
    );
    res.status(201).json({ message: 'Course created successfully', courseId: result.insertId });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Error creating course' });
  }
});

// Add a new lesson
router.post('/:courseId/lessons/add', async (req, res) => {
  const { courseId } = req.params;
  const { title, description } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO lessons (course_id, title, description) VALUES (?, ?, ?)',
      [courseId, title, description]
    );
    res.status(201).json({ message: 'Lesson added successfully', lessonId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error adding lesson' });
  }
});
// Add a new resource to a lesson
router.post('/lessons/:lessonId/resources/add', async (req, res) => {
  const { lessonId } = req.params;
  const { title, url, type } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO resources (lesson_id, title, url, type) VALUES (?, ?, ?, ?)',
      [lessonId, title, url, type]
    );
    res.status(201).json({ message: 'Resource added successfully', resourceId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error adding resource' });
  }
});// Add a new resource to a lesson
router.post('/lessons/:lessonId/resources/add', async (req, res) => {
  const { lessonId } = req.params;
  const { title, url, type } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO resources (lesson_id, title, url, type) VALUES (?, ?, ?, ?)',
      [lessonId, title, url, type]
    );
    res.status(201).json({ message: 'Resource added successfully', resourceId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error adding resource' });
  }
});
// Get all lessons for a course

// Get all resources for a lesson
router.get('/lessons/:lessonId/resources', async (req, res) => {
  const { lessonId } = req.params;

  try {
    const [resources] = await db.query('SELECT * FROM resources WHERE lesson_id = ?', [lessonId]);
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching resources' });
  }
});



// Get all courses with lessons and resources
// Get all courses with lessons, resources, and thumbnails
router.get('/', async (req, res) => {
  try {
    const [courses] = await db.query('SELECT * FROM courses');
    // Fetch lessons and resources for each course
    const detailedCourses = await Promise.all(
      courses.map(async (course) => {
        const [lessons] = await db.query('SELECT * FROM lessons WHERE course_id = ?', [course.id]);
        const [resources] = await db.query('SELECT * FROM resources WHERE course_id = ?', [course.id]);
        return { ...course, lessons, resources };
      })
    );
    res.status(200).json(detailedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

// Get courses by user with lessons, resources, and thumbnails
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [courses] = await db.query('SELECT * FROM courses WHERE created_by = ?', [userId]);
    const detailedCourses = await Promise.all(
      courses.map(async (course) => {
        const [lessons] = await db.query('SELECT * FROM lessons WHERE course_id = ?', [course.id]);
        const [resources] = await db.query('SELECT * FROM resources WHERE course_id = ?', [course.id]);
        return { ...course, lessons, resources };
      })
    );
    res.status(200).json(detailedCourses);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ error: 'Error fetching user courses' });
  }
});

// Add new endpoint to update course thumbnail
router.put('/:courseId/thumbnails', async (req, res) => {
  const { courseId } = req.params;
  const { thumbnails } = req.body;
  
  try {
    await db.query('UPDATE courses SET thumbnails = ? WHERE id = ?', [thumbnails, courseId]);
    res.status(200).json({ message: 'Thumbnail updated successfully' });
  } catch (error) {
    console.error('Error updating thumbnail:', error);
    res.status(500).json({ error: 'Error updating thumbnail' });
  }
});
// Get all lessons for a course
router.get('/:courseId/lessons', async (req, res) => {
  
    try {
        // First get all lessons
        const [lessons] = await db.query('SELECT * FROM lessons WHERE course_id = ?', [req.params.courseId]);
        
        // Then get resources for each lesson
        const lessonsWithResources = await Promise.all(
            lessons.map(async (lesson) => {
                const [resources] = await db.query(
                    'SELECT id, title, url, type FROM resources WHERE lesson_id = ?',
                    [lesson.id]
                );
                return {
                    ...lesson,
                    resources: resources
                };
            })
        );
        
        res.status(200).json(lessonsWithResources);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});
// Get resources for a lesson
router.get('/lessons/:lessonId/resources', async (req, res) => {
  const { lessonId } = req.params;

  try {
    const [resources] = await db.query(
      'SELECT * FROM resources WHERE lesson_id = ?',
      [lessonId]
    );
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get course details with lessons and resources
router.get('/:courseId/details', async (req, res) => {
  const { courseId } = req.params;

  try {
    // Get course info
    const [course] = await db.query(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (!course.length) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get lessons
    const [lessons] = await db.query(
      'SELECT * FROM lessons WHERE course_id = ?',
      [courseId]
    );

    // Get resources for all lessons
    const [resources] = await db.query(
      `SELECT r.* 
       FROM resources r
       JOIN lessons l ON l.id = r.lesson_id
       WHERE l.course_id = ?`,
      [courseId]
    );

    res.json({
      course: course[0],
      lessons: lessons,
      resources: resources
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

router.post("/enroll", async (req, res) => {
  const { userId, courseId, totalLessons } = req.body;

  try {
      const [result] = await pool.execute(
          "INSERT INTO enrollments (user_id, course_id, total_lessons) VALUES (?, ?, ?)",
          [userId, courseId, totalLessons]
      );

      res.status(201).json({ message: "Enrolled successfully!", enrollmentId: result.insertId });
  } catch (error) {
      console.error("Error enrolling user:", error);
      res.status(500).json({ error: "Failed to enroll" });
  }
});

router.put("/enrollments/progress", async (req, res) => {
  const { userId, courseId, completedLessons } = req.body;

  try {
      const [result] = await pool.execute(
          "UPDATE enrollments SET completed_lessons = ? WHERE user_id = ? AND course_id = ?",
          [completedLessons, userId, courseId]
      );

      res.json({ message: "Progress updated successfully!" });
  } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
  }
});

router.get("/enrollments/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
      const [rows] = await pool.execute(
          "SELECT courses.id, courses.title, e.completed_lessons, e.total_lessons FROM enrollments e JOIN courses ON e.course_id = courses.id WHERE e.user_id = ?",
          [userId]
      );

      res.json(rows);
  } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});


// ...existing code...

module.exports = router;

