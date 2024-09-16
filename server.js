// Ši eilutė importuoja express modulį, kuris yra Node.js
const express = require('express');
// Importuojama pg (PostgreSQL) biblioteka ir iš jos gaunamas Pool objektas. Jis naudojamas ryšiui su PostgreSQL duomenų baze tvarkyti.
const { Pool } = require('pg');
// Sukuriamas „Express“ programos objektas app, kuris reprezentuoja serverį
const app = express();
// Nustatomas port, per kurį bus pasiekiamas serveris (šiuo atveju 3000).
const port = 3000;

// Middleware to parse JSON bodies
// leidžia apdoroti JSON formato duomenis iš HTTP užklausų kūno (angl. request body). Tai būtina norint apdoroti duomenis iš POST arba PUT užklausų.
app.use(express.json());

// Sukuriamas Pool objektas, kuris naudoja „PostgreSQL“ ryšio parametrus ir leidžia vykdyti SQL užklausas prieš duomenų bazę.
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'movie_db',
    password: 'postgres',
    port: 5432,
});

// CRUD for actors
// Grąžina visus aktorius iš db.
// Viduje gali būti naudojamas await, o funkcija automatiškai grąžina „promisą“.
app.get('/actor', async (request, response) => {
    try {
        // vykdome SQL užklausą, kuri iš lentelės actor gauna visus aktorius.
        // siunčia SQL užklausą į duomenų bazę, o su await programa palaukia, kol gaus atsakymą, bet neužblokuoja viso serverio veikimo.
        const result = await pool.query('SELECT * FROM actor');
        // siunčiame json formatu atsakymas. 
        response.json(result.rows);
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.get('/actor/:id', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM actor WHERE id = $1', [request.params.id]);
        // negrąžina jokio rezultato
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
        // Vykdoma SQL INSERT užklausa, kuri įterpia naują aktorių į lentelę ir grąžina pridėtą įrašą.
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
        // SQL UPDATE užklausa, kuri atnaujina aktoriaus informaciją. Jei vienas iš laukų nėra pateiktas, paliekama ankstesnė reikšmė (naudojama COALESCE).
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

// try ir catch vadinama klaidų valdymo mechanizmu arba klaidų tvarkymo bloku.
// try blokas: įdedamas kodas, kuris gali sukelti klaidą.Jei klaidos neatsiranda, kodas vykdomas toliau.
// catch blokas: Jei vykdant kodą try bloke įvyksta klaida, valdymas perduodamas catch blokui. Čia klaida apdorojama, o vartotojui galima siųsti klaidos pranešimą ar atlikti kitus veiksmus.

// async yra raktažodis, kuris naudojamas apibrėžti funkciją, kuri vykdo operacijas asinchroniškai. Kai funkcija pažymima kaip async, ji automatiškai grąžina „promisą“ (angl. promise), o tai reiškia, kad ji gali atlikti ilgai trunkančias operacijas (pvz., duomenų bazės užklausas) nesustabdydama kitų programos dalių.
// Asinchroninės operacijos: Daugelis operacijų, kaip duomenų bazės užklausos, HTTP užklausos ar failų skaitymas, yra ilgai trunkančios.Jei tokios operacijos būtų vykdomos sinchroniškai(blokuojančiai), serveris turėtų laukti jų pabaigos ir per tą laiką negalėtų atlikti kitų darbų.Naudojant asinchroninį kodą, serveris gali atlikti kitus darbus, kol laukia atsakymo. async / await leidžia rašyti asinchroninį kodą taip, lyg jis būtų sinchroninis, todėl jis tampa paprastesnis ir aiškesnis.

// await yra raktažodis, kuris naudojamas laukti, kol „promisas“ (grąžintas funkcijos) bus išspręstas (t.y., operacija bus baigta). Naudojant await, galima dirbti su asinchroninėmis operacijomis taip, lyg jos būtų vykdomos sinchroniškai – tai reiškia, kad kodas laukia atsakymo, bet visos programos veikimas neužšaldomas.
// await: Leidžia laukti, kol „promisas“ bus išspręstas(operacija baigta), taip tarsi „užšaldant“ kodą tame taške, bet neužblokuojant kitų serverio operacijų.