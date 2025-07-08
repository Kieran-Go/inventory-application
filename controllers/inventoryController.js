const { render } = require("ejs");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

async function getAllGames(req, res) {
    const games = await db.getAllGames();
    const heading = "All Games"
    res.render("gameList", { games: games, heading: heading });
}

async function getAllGenres(req, res) {
    const genres = await db.getAllGenres();
    res.render("genres", { genres: genres });
}

async function getAllDevelopers(req, res) {
    const devs = await db.getAllDevelopers();
    res.render("developers", { devs: devs });
}

async function getGamesByGenre(req, res) {
    const genreId = req.params.id;
    const games = await db.getGamesByGenre(genreId);
    const genreName = await db.getGenreName(genreId);
    const heading = `${genreName} Games`;
    res.render("gameList", { games: games, heading: heading });
}

async function getGamesByDeveloper(req, res) {
    const devId = req.params.id;
    const games = await db.getGamesByDeveloper(devId);
    const devName = await db.getDeveloperName(devId);
    const heading = `Games by ${devName}`;
    res.render("gameList", { games: games, heading: heading });
}

async function newGame(req, res) {
    const genres = await db.getAllGenres();
    const devs = await db.getAllDevelopers();
    res.render("newGame", {genres: genres, devs: devs});
}

async function newGenre(req, res) {
    res.render("newGenre");
}

async function newDeveloper(req, res) {
    res.render("newDeveloper");
}

async function addGameToDB(req, res) {
    // Destructure form data from the request body
    const { title, platform, release_date, genre_id, developer_ids } = req.body;

    // Insert the new game into the 'game' table and get its new ID
    const newId = await db.addGameToDB(title, platform, release_date, genre_id); 

    // Ensure developer_ids is always an array (in case only one developer was selected)
    const devIds = Array.isArray(developer_ids) ? developer_ids : [developer_ids];

    // Insert a row into the 'game_developer' table for each selected developer
    // Use Promise.all to run them in parallel and wait for all to finish
    await Promise.all(devIds.map(devId => db.createGameDeveloperRelationship(newId, devId)));

    res.redirect("/games");
}

async function addGenreToDB(req, res) {
    await db.addGenreToDB(req.body.name);
    res.redirect("/");
}

async function addDeveloperToDB(req, res) {
    await db.addDeveloperToDB(req.body.name);
    res.redirect("/");
}

async function editForm(req, res) {
    const game = await db.getGame(req.params.id);
    const genres = await db.getAllGenres();
    const devs = await db.getAllDevelopers();
    res.render("editForm", { game: game, genres: genres, devs: devs });
}

async function editGame(req, res) {
    const gameId = req.params.id;
    const { title, platform, release_date, genre_id, developer_ids } = req.body;

    await db.updateGame(gameId, title, platform, release_date, genre_id, developer_ids);
    res.redirect("/games");
}

async function deleteGame(req, res) {
    const gameId = req.params.id;
    await db.deleteGame(gameId);
    res.redirect("/games");
}

async function deleteGenre(req, res) {
    const genreId = req.params.id;
    await db.deleteGenre(genreId);
    res.redirect("/genres");
}

async function deleteDeveloper(req, res) {
    const devId = req.params.id;
    await db.deleteDeveloper(devId);
    res.redirect("/developers");
}

module.exports = {
    getAllGames,
    getAllGenres,
    getAllDevelopers,
    getGamesByGenre,
    getGamesByDeveloper,
    newGame,
    newGenre,
    newDeveloper,
    addGameToDB,
    addGenreToDB,
    addDeveloperToDB,
    editForm,
    editGame,
    deleteGame,
    deleteGenre,
    deleteDeveloper,
};