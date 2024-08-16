const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();
const bigquery = new BigQuery();

// Middleware
app.use(cors()); // Enable CORS to allow frontend access
app.use(express.json());

// Endpoint to fetch all players (with optional filtering)
app.get('/api/players', async (req, res) => {
  const { league, team, nationality, position } = req.query;

  // Base query
  let query = `
    SELECT Player, Nation, Position, Squad, Competition
    FROM \`polar-ensign-432610-t7.squadsight_scouting.scouting_data\`
    WHERE 1=1
  `;

  // Append filtering conditions based on query parameters
  if (league) {
    query += ` AND LOWER(Competition) LIKE '%${league.toLowerCase()}%'`;
  }
  if (team) {
    query += ` AND LOWER(Squad) LIKE '%${team.toLowerCase()}%'`;
  }
  if (nationality) {
    query += ` AND LOWER(Nation) LIKE '%${nationality.toLowerCase()}%'`;
  }
  if (position) {
    query += ` AND LOWER(Position) LIKE '%${position.toLowerCase()}%'`;
  }

  try {
    const [rows] = await bigquery.query({ query });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to fetch a specific player's details
app.get('/api/player/:name', async (req, res) => {
  const playerName = decodeURIComponent(req.params.name);

  const query = `
    SELECT *
    FROM \`polar-ensign-432610-t7.squadsight_scouting.scouting_data\`
    WHERE LOWER(Player) = LOWER(@playerName)
  `;

  const options = {
    query: query,
    params: { playerName },
    location: 'US',
  };

  try {
    const [rows] = await bigquery.query(options);
    if (rows.length === 0) {
      res.status(404).send({ error: 'Player not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error('Error fetching player details:', err);
    res.status(500).send('Server error');
  }
});

// Default route to test if the API is running
app.get('/', (req, res) => {
  res.send('SquadSight API is running.');
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
