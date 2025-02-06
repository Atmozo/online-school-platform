const express = require('express');
const cors = require('cors');
const db = require('../db/connection');
const router = express.Router();

// Enable CORS for development
router.use(cors());

/**
 * GET /api/quizzes
 * Retrieve all quizzes with their questions and options
 */
router.get('/quizzes', async (req, res) => {
  try {
    // Get all quizzes
    const [quizRows] = await db.query(
      'SELECT id, title, created_by, created_at FROM quizzes'
    );

    // Get questions and options for each quiz
    const quizzesWithDetails = await Promise.all(
      quizRows.map(async (quiz) => {
        // Get quiz questions
        const [questionRows] = await db.query(
          'SELECT id, question, correct_answer FROM questions WHERE quiz_id = ?',
          [quiz.id]
        );

        // Get options for each question
        const questionsWithOptions = await Promise.all(
          questionRows.map(async (question) => {
            const [optionRows] = await db.query(
              'SELECT id, option_text FROM options WHERE question_id = ?',
              [question.id]
            );

            return {
              id: question.id,
              question: question.question,
              correct_answer: question.correct_answer,
              options: optionRows.map(opt => ({
                id: opt.id,
                option_text: opt.option_text
              }))
            };
          })
        );

        return {
          id: quiz.id,
          title: quiz.title,
          created_by: quiz.created_by,
          created_at: quiz.created_at,
          questions: questionsWithOptions
        };
      })
    );

    res.json(quizzesWithDetails);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

/**
 * POST /api/quizzes
 * Save a new quiz with questions and options
 */
router.post('/quizzes', async (req, res) => {
  const { title, created_by, questions } = req.body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "Quiz title and at least one question are required." });
  }

  try {
    // Start transaction
    await db.query('START TRANSACTION');

    // Insert quiz record
    const [quizResult] = await db.query(
      'INSERT INTO quizzes (title, created_by) VALUES (?, ?)',
      [title, created_by || null]
    );
    const quizId = quizResult.insertId;

    // Insert questions and options
    for (const q of questions) {
      const { question, options, correctAnswer } = q;
      
      const [questionResult] = await db.query(
        'INSERT INTO questions (quiz_id, question, correct_answer) VALUES (?, ?, ?)',
        [quizId, question, correctAnswer]
      );
      const questionId = questionResult.insertId;

      // Insert options
      for (const optionText of options) {
        await db.query(
          'INSERT INTO options (question_id, option_text) VALUES (?, ?)',
          [questionId, optionText]
        );
      }
    }

    // Commit transaction
    await db.query('COMMIT');
    res.status(201).json({ message: 'Quiz created successfully', quizId });
  } catch (error) {
    // Rollback on error
    await db.query('ROLLBACK');
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});
// Add new questions to an existing quiz (quiz id provided in the URL)
router.post('/quizzes/:quizId/questions', async (req, res) => {
  const { quizId } = req.params;
  const { questions } = req.body; // Expecting an array of questions

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "At least one question is required." });
  }

  try {
    for (const q of questions) {
      // Insert each question into the questions table
      const [questionResult] = await db.query(
        'INSERT INTO questions (quiz_id, question, correct_answer) VALUES (?, ?, ?)',
        [quizId, q.question, q.correctAnswer]
      );
      const questionId = questionResult.insertId;

      // Insert the options for this question
      for (const optionText of q.options) {
        await db.query(
          'INSERT INTO options (question_id, option_text) VALUES (?, ?)',
          [questionId, optionText]
        );
      }
    }
    res.status(201).json({ message: "Questions added successfully to quiz " + quizId });
  } catch (error) {
    console.error("Error adding questions:", error);
    res.status(500).json({ error: "Failed to add questions" });
  }
});

module.exports = router;


module.exports = router;