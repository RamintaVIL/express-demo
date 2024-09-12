const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'movie_db',
    password: 'postgres',
    port: 5432,
});

// CRUD for actors
app.get('/actor', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM actor');
        response.json(result.rows);
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.get('/actor/:id', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM actor WHERE id = $1', [request.params.id]);
        if (result.rows.length === 0) {
            return response.status(404).send('Actor not found');
        }
        response.json(result.rows[0]);
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.post('/actor', async (request, response) => {
    const { name, surname, dateOfBirth } = request.body;
    const date = new Date(dateOfBirth);
    const today = new Date();
    if (date > today) {
        return response.status(400).send('Date of birth cannot be in the future');
    }

    try {
        const result = await pool.query(
            'INSERT INTO actor (name, surname, date_of_birth) VALUES ($1, $2, $3) RETURNING *',
            [name, surname, dateOfBirth]
        );
        response.status(201).json(result.rows[0]);
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.put('/actor/:id', async (request, response) => {
    const { name, surname, dateOfBirth } = request.body;

    try {
        const result = await pool.query(
            'UPDATE actor SET name = COALESCE($1, name), surname = COALESCE($2, surname), date_of_birth = COALESCE($3, date_of_birth) WHERE id = $4 RETURNING *',
            [name, surname, dateOfBirth, request.params.id]
        );
        if (result.rows.length === 0) {
            return response.status(404).send('Actor not found');
        }
        response.json(result.rows[0]);
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.delete('/actor/:id', async (request, response) => {
    try {
        const result = await pool.query('DELETE FROM actor WHERE id = $1 RETURNING *', [request.params.id]);
        if (result.rows.length === 0) {
            return response.status(404).send('Actor not found');
        }
        response.status(204).send();
    } catch (err) {
        response.status(500).send(err.message);
    }
});

// CRUD for movies
app.get('/movie', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM movie');
        response.json(result.rows);
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.get('/movie/:id', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM movie WHERE id = $1', [request.params.id]);
        if (result.rows.length === 0) {
            return response.status(404).send('Movie not found');
        }
        response.json(result.rows[0]);
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.post('/movie', async (request, response) => {
    const { title, creationDate, actorId } = request.body;
    const date = new Date(creationDate);
    const today = new Date();
    if (date > today) {
        return response.status(400).send('Date of the movie cannot be in the future');
    }

    try {
        const actorCheck = await pool.query('SELECT * FROM actor WHERE id = $1', [actorId]);
        if (actorCheck.rows.length === 0) {
            return response.status(404).send('Actor not found');
        }

        const result = await pool.query(
            'INSERT INTO movie (title, creation_date, actor_id) VALUES ($1, $2, $3) RETURNING *',
            [title, creationDate, actorId]
        );
        response.status(201).json(result.rows[0]);
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.put('/movie/:id', async (request, response) => {
    const { title, creationDate, actorId } = request.body;

    try {
        if (actorId) {
            const actorCheck = await pool.query('SELECT * FROM actor WHERE id = $1', [actorId]);
            if (actorCheck.rows.length === 0) {
                return response.status(404).send('Actor not found');
            }
        }

        const result = await pool.query(
            'UPDATE movie SET title = COALESCE($1, title), creation_date = COALESCE($2, creation_date), actor_id = COALESCE($3, actor_id) WHERE id = $4 RETURNING *',
            [title, creationDate, actorId, request.params.id]
        );
        if (result.rows.length === 0) {
            return response.status(404).send('Movie not found');
        }
        response.json(result.rows[0]);
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.delete('/movie/:id', async (request, response) => {
    try {
        const result = await pool.query('DELETE FROM movie WHERE id = $1 RETURNING *', [request.params.id]);
        if (result.rows.length === 0) {
            return response.status(404).send('Movie not found');
        }
        response.status(204).send();
    } catch (err) {
        response.status(500).send(err.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
