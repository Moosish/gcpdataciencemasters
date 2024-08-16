app.get('/api/player/:name', async (req, res) => {
  // Decode the player name from the URL parameter
  const playerName = decodeURIComponent(req.params.name);

  // Use LOWER() to make the query case-insensitive
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
