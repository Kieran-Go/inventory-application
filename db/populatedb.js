require("dotenv").config();
const { Client } = require("pg");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("No DB_URL found in .env");
    process.exit(1);
}

const SQL = `
CREATE TABLE IF NOT EXISTS genre (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS developer (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS game (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    release_date DATE,
    genre_id INTEGER,
    FOREIGN KEY (genre_id) REFERENCES genre(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS game_developer (
    game_id INTEGER REFERENCES game(id) ON DELETE CASCADE,
    developer_id INTEGER REFERENCES developer(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, developer_id)
);

INSERT INTO genre (name) VALUES 
    ('RPG'), 
    ('Horror'), 
    ('Platformer') 
ON CONFLICT DO NOTHING;

INSERT INTO developer (name) VALUES 
    ('SquareSoft'), 
    ('Capcom'), 
    ('Nintendo') 
ON CONFLICT DO NOTHING;

INSERT INTO game (title, platform, release_date, genre_id)
VALUES 
    ('Final Fantasy VII', 'Playstation', '1997-01-31', 1),
    ('Resident Evil 2', 'Playstation', '2011-09-22', 2),
    ('Super Mario Bros.', 'Nintendo Entertainment System', '1985-09-13', 3)
ON CONFLICT DO NOTHING;

INSERT INTO game_developer (game_id, developer_id) VALUES
    (1, 1),
    (2, 2),
    (3, 3)
ON CONFLICT DO NOTHING;
`;

async function main() {
    console.log("seeding...");
    const client = new Client({
        connectionString: dbUrl,
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("Finished");
}

main();