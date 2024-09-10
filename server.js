const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

let actors = [];
let movies = [];
let actorId = 1;
let movieId = 1;

app.get('/actor', (request, response) => {
    response.json(actors);
});

app.get('/actor/:id', (request, response) => {
    const actor = actors.find(a => a.id === parseInt(request.params.id));
    if (!actor) return response.status(404).send('Actor not found');
    response.json(actor);
});

app.post('/actor', (request, response) => {
    const { name, surname, dateOfBirth } = request.body;
    const date = new Date(dateOfBirth);
    const today = new Date();
    if (date > today) {
        return response.status(400).send('Date of birth can not be in the future');
    }
    const actor = {
        id: actorId++,
        name,
        surname,
        dateOfBirth,
    }
    actors.push(actor);
    response.status(201).json(actor);
});

app.put('/actor/:id', (request, response) => {
    const actor = actors.find(a => a.id === parseInt(request.params.id));
    if (!actor) return response.status(404).send('Actor not found');
    const { name, surname, dateOfBirth } = request.body
    if (name !== undefined) actor.name = name;
    if (surname !== undefined) actor.surname = surname;
    if (dateOfBirth !== undefined) actor.dateOfBirth = dateOfBirth;
    response.json(actor);
});

app.delete('/actor/:id', (request, response) => {
    const actorId = parseInt(request.params.id, 10);
    const actorIndex = actors.findIndex(a => a.id === actorId);
    if (actorIndex === -1) return response.status(404).send('Actor not found');

    actors.splice(actorIndex, 1);
    response.status(204).send();
});

// ---------------------------------------------------------------------------------
app.get('/movie', (request, response) => {
    response.json(movies);
});

app.get('/movie/:id', (request, response) => {
    const movie = movies.find(m => m.id === parseInt(request.params.id));
    if (!movie) return response.status(404).send('Movie not found');
    response.json(movie);
});

app.post('/movie', (request, response) => {
    const { title, creationDate, actorId } = request.body;
    const date = new Date(creationDate);
    const today = new Date();
    if (date > today) {
        return response.status(400).send('Date of the movie can not be in the future');
    }
    const movie = {
        id: movieId++,
        title,
        creationDate,
        actorId,
    }
    actors.push(movie);
    response.status(201).json(movie);
});

app.put('/movie/:id', (request, response) => {
    const movie = movies.find(m => m.id === request.params.id, 10);
    if (!movie) return response.status(404).send('Movie not found');

    if (actorId) {
        const actor = actors.find(a => a.id === parseInt(actorId));
        if (!actor) return res.status(404).send('Actor not found');
    }

    const { title, creationDate, actorId } = req.body;
    movie.title = title || movie.title;
    movie.creationDate = creationDate || movie.creationDate;
    movie.actorId = actorId || movie.actorId;
    response.json(movie);
});

app.delete('/movie/:id', (request, response) => {
    const movieIndex = movies.findIndex(m => m.id === request.params.id);
    if (movieIndex === -1) return response.status(404).send('Movie not found');

    movies.splice(movieIndex, 1);
    response.status(204).send();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
// Create REST api with Express and Js For Movie and Actor management.
// The api should store data in memory.

// for simplicity lets say actor can be involved in just a single movie.

// 1. Actor can have FirstName, LastName and DateOfBirth
// 2. Date of birth cannot be in future.
// 3. Movie can have title, creationDate and a single actor associated.Actor Id has to be supplied.
// 4. When creating movie, if actor id is not supplied, 400 has to be returned.If Actor does not exist, 404 must be returned.
// 5. Create CRUD for Movies and Actors.