
const express = require('express');
const db = require('../db/connection');
const NodeCache = require('node-cache');
const router = express.Router();

// Create a cache instance with a TTL of 1 hour (3600 seconds)
const resourceCache = new NodeCache({ stdTTL: 3600 });

// GET resources for a specific course
router.get('/courses/:courseId/resources', async (req, res) => {
  const { courseId } = req.params;
  const cacheKey = `course_resources_${courseId}`;

  // Try to get cached resources
  let resources = resourceCache.get(cacheKey);
  if (resources) {
    console.log("Serving resources from cache");
    return res.status(200).json(resources);
  }

  try {
    // If not cached, fetch from the database
    const [rows] = await db.query('SELECT * FROM resources WHERE course_id = ?', [courseId]);
    resources = rows;
    // Store the fetched resources in cache
    resourceCache.set(cacheKey, resources);
    console.log("Serving resources from DB and caching the result");
    res.status(200).json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});
router.post('/lessons/:lessonId/resources', async (req, res) => {
  const { lessonId } = req.params;
  
  const { title, url, type, courseId } = req.body; 
  try {
    const [result] = await db.query(
      'INSERT INTO resources (lesson_id, title, url, type) VALUES (?, ?, ?, ?)',
      [lessonId, title, url, type]
    );
    // Invalidate the cache for the associated course resources
    if (courseId) {
      const cacheKey = `course_resources_${courseId}`;
      resourceCache.del(cacheKey);
    }
    res.status(201).json({ message: 'Resource added successfully', resourceId: result.insertId });
  } catch (error) {
    console.error("Error adding resource:", error);
    res.status(500).json({ error: "Error adding resource" });
  }
});

module.exports = router;
