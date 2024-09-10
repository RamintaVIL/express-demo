const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

let actors = [];
let indexId = 0;

// Get all actors

// app.get yra metodas. Tai reiškia, kad kai klientas siunčia GET užklausą į / actor, ši funkcija bus iškviesta.
app.get('/actor', (request, response) => {
    // response.json(actors) konvertuoja actors masyvą į JSON formatą ir siunčia jį atgal klientui.
    response.json(actors);
});

// Get a specific actor by ID
// Maršruto nustatymas
app.get('/actor/:id', (request, response) => {
    // find grąžina pirmą aktorių, kurio id atitinka actorId.Jei toks aktorius nerandamas, grąžinama undefined.
    const actor = actors.find(a => a.id === request.params.id);
    if (!actor) return response.status(404).send('Actor not found');
    response.json(actor);
});

// Create a new actor
app.post('/actor', (request, response) => {
    // Naudojama destruktūrizacija, kad būtų lengviau gauti firstName, lastName ir dateOfBirth laukus iš request.body.
    const { firstName, lastName, dateOfBirth } = request.body;
    const date = new Date(dateOfBirth);
    // const today = new Date(); sukuriamas Date objektas, kuris atitinka dabartinę datą ir laiką.
    const today = new Date();
    if (date > today) {
        return response.status(400).send('Date of birth can not be in the future');
    }
    // sukuriami duomenys apie aktoriu
    const actor = {
        id: indexId++,
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth,
    }

    actors.push(actor);
    response.status(201).json(actor);
});

// Update an actor by ID
app.put('/actor/:id', (request, response) => {
    // find metodas, grąžina pirmą elemtą, kuris atitinka sąlygą.
    // (aktoriaus ID) yra lygus request.params.id (užklausos URL parametras, kuris yra aktoriaus ID).
    const actor = actors.find(a => a.id === request.params.id);
    if (!actor) return response.status(404).send('Actor not found');

    actor.firstName = request.body.firstName || actor.firstName;
    // Ši eilutė veikia panašiai kaip pirmoji. Ji atnaujina actor.lastName į naują reikšmę, jei klientas pateikia lastName lauką, arba išlaiko esamą reikšmę, jei lauką pateikti nebuvo.
    actor.lastName = request.body.lastName || actor.lastName;
    actor.dateOfBirth = request.body.dateOfBirth || actor.dateOfBirth;
    response.json(actor);
});

// Delete an actor by ID
app.delete('/actor/:id', (request, response) => {
    const actorIndex = actors.findIndex(a => a.id === request.params.id);
    // findIndex yra JavaScript masyvo metodas, kuris grąžina pirmo elemento indekso vertę, kuris atitinka pateiktą sąlygą. Jei nė vienas elementas neatitinka sąlygos, metodas grąžina -1
    if (actorIndex === -1) return response.status(404).send('Actor not found');

    // splice yra JavaScript masyvo metodas, kuris leidžia keisti masyvo turinį pridedant arba šalinant elementus. pašalinti elementą iš masyvo remiantis jo indeksu.
    // Nurodo, nuo kurio indekso pradės pašalinti elementus.
    // kiek elementų turi būti pašalinta.
    actors.splice(actorIndex, 1);
    response.status(204).send();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

