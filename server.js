// server.js
const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();

app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------------------------------------------------------
// GET all players
// ---------------------------------------------------------
app.get('/players', async (req, res) => {
  const result = await db.query('SELECT * FROM players ORDER BY id');
  res.json(result.rows);
});

// ---------------------------------------------------------
// GET courses
// ---------------------------------------------------------

// ---------------------------------------------------------
// GET holes for a course
// ---------------------------------------------------------
app.get('/courses/:id/holes', async (req, res) => {
  const result = await db.query(
    'SELECT hole_number, par, handicap FROM course_holes WHERE course_id = $1 ORDER BY hole_number',
    [req.params.id]
  );
  res.json(result.rows);
});

// ---------------------------------------------------------
// GET round groups
// ---------------------------------------------------------
app.get('/rounds/:id/groups', async (req, res) => {
  const result = await db.query(
    `SELECT group_number, player_id
     FROM round_groups
     WHERE round_id = $1
     ORDER BY group_number, player_id`,
    [req.params.id]
  );
  res.json(result.rows);
});

// ---------------------------------------------------------
// GET scores for a round
// ---------------------------------------------------------
app.get('/rounds/:id/scores', async (req, res) => {
  const roundId = req.params.id;

  try {
    const result = await db.query(
      `SELECT player_id, hole_number, gross_score
       FROM scores
       WHERE round_id = $1
       ORDER BY player_id, hole_number`,
      [roundId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("GET /rounds/:id/scores error:", err);
    res.status(500).json({ error: "Failed to load scores" });
  }
});
// ---------------------------------------------------------
// POST score update
// ---------------------------------------------------------
app.post('/rounds/:id/scores', async (req, res) => {
  const { player_id, hole_number, gross_score } = req.body;

  await db.query(
    `INSERT INTO scores (round_id, player_id, hole_number, gross_score)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (round_id, player_id, hole_number)
     DO UPDATE SET gross_score = EXCLUDED.gross_score`,
    [req.params.id, player_id, hole_number, gross_score]
  );

  res.json({ success: true });
});

// ---------------------------------------------------------
// GET round setup (course + groups)
// ---------------------------------------------------------
app.get('/rounds/:id/setup', async (req, res) => {
  const roundId = req.params.id;

  const courseResult = await db.query(
    `SELECT course_id FROM rounds WHERE id = $1`,
    [roundId]
  );

  const groupsResult = await db.query(
    `SELECT group_number, player_id
     FROM round_groups
     WHERE round_id = $1
     ORDER BY group_number, player_id`,
    [roundId]
  );

  // NEW: fetch Blue tee
  const blueTeeResult = await db.query(
    `SELECT tees.id
     FROM tees
     INNER JOIN rounds
     ON rounds.course_id = tees.course_id
     WHERE rounds.id = $1 AND tees.name = 'Blue'`,
    [roundId]
  );

  res.json({
    courseKey: courseResult.rows[0]?.course_id,
    groups: groupsResult.rows,
    blueTee: blueTeeResult.rows[0]?.id  // NEW
  });
});

// ---------------------------------------------------------
// POST round setup (course + groups)
// ---------------------------------------------------------
app.post('/rounds/:id/setup', async (req, res) => {
  const roundId = req.params.id;
  const { courseKey, group1, group2 } = req.body;

  // Update course
  await db.query(
    `UPDATE rounds SET course_id = $1 WHERE id = $2`,
    [courseKey, roundId]
  );

  // Clear existing groups
  await db.query(
    `DELETE FROM round_groups WHERE round_id = $1`,
    [roundId]
  );

  // Insert new groups
  for (const pid of group1) {
    await db.query(
      `INSERT INTO round_groups (round_id, group_number, player_id)
       VALUES ($1, 1, $2)`,
      [roundId, pid]
    );
  }

  for (const pid of group2) {
    await db.query(
      `INSERT INTO round_groups (round_id, group_number, player_id)
       VALUES ($1, 2, $2)`,
      [roundId, pid]
    );
  }

  res.json({ success: true });
});

app.get("/courses/:courseId/tees", async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await db.query(
      `SELECT id, name, yardage, rating, slope
       FROM tees
       WHERE course_id = $1
       ORDER BY yardage DESC`,
      [courseId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load tees" });
  }
});

app.post("/rounds/:roundId/apply-tee", async (req, res) => {
  const { courseId, teeId } = req.body;

  try {
    // Get tee rating/slope
    const tee = await db.query(
      `SELECT rating, slope FROM tees WHERE id = $1`,
      [teeId]
    );

    if (tee.rows.length === 0) {
      return res.status(404).json({ error: "Tee not found" });
    }

    const { rating, slope } = tee.rows[0];

    // Update course table
    await db.query(
      `UPDATE courses
       SET rating = $1, slope = $2
       WHERE id = $3`,
      [rating, slope, courseId]
    );

    res.json({ success: true, rating, slope });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to apply tee" });
  }
});


app.get("/courses", async (req, res) => {
  const { rating, slope } = req.query;

  let sql = `
    SELECT c.id, c.name, c.par,
           t.id AS tee_id, t.name AS tee_name,
           t.rating AS rating, t.slope AS slope
    FROM courses c
    JOIN tees t ON t.course_id = c.id
  `;

  const params = [];
  const conditions = [];

  if (rating) {
    params.push(Number(rating));
    conditions.push(`t.rating = $${params.length}`);
  }

  if (slope) {
    params.push(Number(slope));
    conditions.push(`t.slope = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  try {
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load courses" });
  }
});

app.post("/rounds/:roundId/beers", async (req, res) => {
  const roundId = req.params.roundId;
  const { player_id, beers } = req.body;

  try {
    await db.query(
      `INSERT INTO beers (round_id, player_id, beers)
       VALUES ($1, $2, $3)
       ON CONFLICT (round_id, player_id)
       DO UPDATE SET beers = $3`,
      [roundId, player_id, beers]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Beer save error:", err);
    res.status(500).json({ error: "Failed to save beers" });
  }
});

app.get("/rounds/:roundId/beers", async (req, res) => {
  const roundId = Number(req.params.roundId);

  try {
    const result = await db.query(
      `SELECT player_id, beers
       FROM beers
       WHERE round_id = $1
       ORDER BY player_id`,
      [roundId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /rounds/:roundId/beers error:", err);
    res.status(500).json({ error: "Failed to load beer counts" });
  }
});

app.get("/beers/totals", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         p.id AS player_id,
         p.name,
         COALESCE(b1.beers, 0) AS round1,
         COALESCE(b2.beers, 0) AS round2,
         COALESCE(b3.beers, 0) AS round3,
         COALESCE(b1.beers, 0) +
         COALESCE(b2.beers, 0) +
         COALESCE(b3.beers, 0) AS total_beers
       FROM players p
       LEFT JOIN beers b1 ON b1.player_id = p.id AND b1.round_id = 1
       LEFT JOIN beers b2 ON b2.player_id = p.id AND b2.round_id = 2
       LEFT JOIN beers b3 ON b3.player_id = p.id AND b3.round_id = 3
       ORDER BY total_beers DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /beers/totals error:", err);
    res.status(500).json({ error: "Failed to load beer totals" });
  }
});







// ---------------------------------------------------------
/* app.listen(3001, () => {
  console.log('API running on http://localhost:3001');
}); */
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});