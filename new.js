const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

let actors = [];
let movies = [];
let actorId = 1;
let movieId = 1;

// Validation function
const isDateInFuture = (date) => {
    return new Date(date) > new Date();
};

// Actor Routes
app.post('/actors', (req, res) => {
    const { firstName, lastName, dateOfBirth } = req.body;

    if (!firstName || !lastName || !dateOfBirth) {
        return res.status(400).json({ error: 'FirstName, LastName, and DateOfBirth are required' });
    }

    if (isDateInFuture(dateOfBirth)) {
        return res.status(400).json({ error: 'DateOfBirth cannot be in the future' });
    }

    const actor = { id: actorId++, firstName, lastName, dateOfBirth };
    actors.push(actor);
    res.status(201).json(actor);
});

app.get('/actors', (req, res) => {
    res.json(actors);
});

app.get('/actors/:id', (req, res) => {
    const actor = actors.find(a => a.id === parseInt(req.params.id));
    if (!actor) return res.status(404).json({ error: 'Actor not found' });
    res.json(actor);
});

app.put('/actors/:id', (req, res) => {
    const { firstName, lastName, dateOfBirth } = req.body;
    const actor = actors.find(a => a.id === parseInt(req.params.id));

    if (!actor) return res.status(404).json({ error: 'Actor not found' });

    if (isDateInFuture(dateOfBirth)) {
        return res.status(400).json({ error: 'DateOfBirth cannot be in the future' });
    }

    actor.firstName = firstName || actor.firstName;
    actor.lastName = lastName || actor.lastName;
    actor.dateOfBirth = dateOfBirth || actor.dateOfBirth;

    res.json(actor);
});

app.delete('/actors/:id', (req, res) => {
    const index = actors.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Actor not found' });

    actors.splice(index, 1);
    res.status(204).send();
});

// Movie Routes
app.post('/movies', (req, res) => {
    const { title, creationDate, actorId } = req.body;

    if (!title || !creationDate || !actorId) {
        return res.status(400).json({ error: 'Title, CreationDate, and ActorId are required' });
    }

    if (isDateInFuture(creationDate)) {
        return res.status(400).json({ error: 'CreationDate cannot be in the future' });
    }

    const actor = actors.find(a => a.id === parseInt(actorId));
    if (!actor) return res.status(404).json({ error: 'Actor not found' });

    const movie = { id: movieId++, title, creationDate, actorId };
    movies.push(movie);
    res.status(201).json(movie);
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
});

app.put('/movies/:id', (req, res) => {
    const { title, creationDate, actorId } = req.body;
    const movie = movies.find(m => m.id === parseInt(req.params.id));

    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    if (creationDate && isDateInFuture(creationDate)) {
        return res.status(400).json({ error: 'CreationDate cannot be in the future' });
    }

    if (actorId) {
        const actor = actors.find(a => a.id === parseInt(actorId));
        if (!actor) return res.status(404).json({ error: 'Actor not found' });
    }

    movie.title = title || movie.title;
    movie.creationDate = creationDate || movie.creationDate;
    movie.actorId = actorId || movie.actorId;

    res.json(movie);
});

app.delete('/movies/:id', (req, res) => {
    const index = movies.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Movie not found' });

    movies.splice(index, 1);
    res.status(204).send();
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});