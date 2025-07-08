const pool = require("./pool");

async function getAllGames() {
    const { rows } = await pool.query(`
        SELECT
            game.id,
            game.title,
            game.platform,
            game.release_date,
            game.genre_id,
            genre.name AS genre_name,
            json_agg(developer.name) AS developers
        FROM game
        LEFT JOIN genre ON game.genre_id = genre.id
        LEFT JOIN game_developer ON game.id = game_developer.game_id
        LEFT JOIN developer ON developer.id = game_developer.developer_id
        GROUP BY game.id, genre.name
        ORDER BY game.id;
    `);
    return rows;
}

async function getGamesByGenre(genreId) {
    const { rows } = await pool.query(`
        SELECT
            game.id,
            game.title,
            game.platform,
            game.release_date,
            game.genre_id,
            genre.name AS genre_name,
            json_agg(developer.name) AS developers
        FROM game
        LEFT JOIN genre ON game.genre_id = genre.id
        LEFT JOIN game_developer ON game.id = game_developer.game_id
        LEFT JOIN developer ON developer.id = game_developer.developer_id
        WHERE genre_id = $1
        GROUP BY game.id, genre.name
        ORDER BY game.id;
    `, [genreId]);
    return rows;
}

async function getGamesByDeveloper(devId) {
    const { rows } = await pool.query(`
        SELECT
            game.id,
            game.title,
            game.platform,
            game.release_date,
            game.genre_id,
            genre.name AS genre_name,
            json_agg(DISTINCT developer.name) AS developers
        FROM game
        LEFT JOIN genre ON game.genre_id = genre.id
        LEFT JOIN game_developer ON game.id = game_developer.game_id
        LEFT JOIN developer ON developer.id = game_developer.developer_id
        WHERE game.id IN (
            SELECT game_id FROM game_developer WHERE developer_id = $1
        )
        GROUP BY game.id, genre.name
        ORDER BY game.id;
    `, [devId]);
    return rows;
}


async function getAllGenres() {
    const { rows } = await pool.query("SELECT * FROM genre");
    return rows;
}

async function getAllDevelopers() {
    const { rows } = await pool.query("SELECT * FROM developer");
    return rows;
}

async function getGenreName(genreId) {
    const result = await pool.query("SELECT name FROM genre WHERE id = $1", [genreId]);
    return result.rows[0].name;
}

async function getGame(gameId) {
    const { rows } = await pool.query(`
        SELECT
            game.id,
            game.title,
            game.platform,
            game.release_date,
            game.genre_id,
            json_agg(DISTINCT developer.id) AS developer_ids
        FROM game
        LEFT JOIN game_developer ON game.id = game_developer.game_id
        LEFT JOIN developer ON developer.id = game_developer.developer_id
        WHERE game.id = $1
        GROUP BY game.id
    `, [gameId]);
    return rows[0];
}

async function getDeveloperName(devId) {
    const result = await pool.query("SELECT name FROM developer WHERE id = $1", [devId]);
    return result.rows[0].name;
}

async function addGameToDB(title, platform, release_date, genre_id) {
    const insertGameQuery = `
        INSERT INTO game (title, platform, release_date, genre_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `;
    const result = await pool.query(insertGameQuery, [title, platform, release_date, genre_id]);
    return result.rows[0].id;
}

async function addGenreToDB(name) {
    await pool.query(`INSERT INTO genre(name) VALUES ($1)`, [name]);
}

async function addDeveloperToDB(name) {
    await pool.query(`INSERT INTO developer(name) VALUES ($1)`, [name]);
}

async function createGameDeveloperRelationship(gameId, devId) {
    await pool.query(
        "INSERT INTO game_developer (game_id, developer_id) VALUES ($1, $2)",
        [gameId, devId]
    );
}

async function removeGameDeveloperRelationship(gameId) {
    await pool.query(`DELETE FROM game_developer WHERE game_id = $1`, [gameId]);
}


async function updateGame(id, title, platform, release_date, genre_id, developer_ids) {
    // Update the game fields
    await pool.query(`
        UPDATE game
        SET title = $1,
            platform = $2,
            release_date = $3,
            genre_id = $4
        WHERE id = $5
    `, [title, platform, release_date, genre_id, id]);

    // Remove all old developer relationships for this game
    await removeGameDeveloperRelationship(id);

    // Insert new developer relationships
    // Make sure developer_ids is an array (in case only one developer sent)
    const devIds = Array.isArray(developer_ids) ? developer_ids : [developer_ids];

    await Promise.all(devIds.map(devId => 
        pool.query(`INSERT INTO game_developer (game_id, developer_id) VALUES ($1, $2)`, [id, devId])
    ));
}

async function deleteGame(gameId) {
    await pool.query("DELETE FROM game WHERE id = $1", [gameId]);
}

async function deleteGenre(genreId) {
    await pool.query("DELETE FROM genre WHERE id = $1", [genreId]);
}

async function deleteDeveloper(devId) {
    await pool.query("DELETE FROM developer WHERE id = $1", [devId]);
}



module.exports = {
    getAllGames,
    getAllGenres,
    getAllDevelopers,
    getGame,
    getGamesByGenre,
    getGamesByDeveloper,
    addGameToDB,
    addGenreToDB,
    addDeveloperToDB,
    getGenreName,
    getDeveloperName,
    updateGame,
    createGameDeveloperRelationship,
    removeGameDeveloperRelationship,
    deleteGame,
    deleteGenre,
    deleteDeveloper,
}