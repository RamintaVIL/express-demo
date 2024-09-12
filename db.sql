-- Create actor table
CREATE TABLE actor (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL
);

-- Create movie table
CREATE TABLE movie (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    creation_date DATE NOT NULL,
    actor_id INT,
    FOREIGN KEY (actor_id) REFERENCES actor(id)
);