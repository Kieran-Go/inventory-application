const { Router } = require("express");
const router = Router();
const inventoryController = require("../controllers/inventoryController");

// Handle index route
router.get("/", (req, res) => res.render("index"));

// Handle "games" route to show all games
router.get("/games", inventoryController.getAllGames);

// Handle "genres" route to show a list of all genres
router.get("/genres", inventoryController.getAllGenres);

// Handle "developers" route to show a list of all developers
router.get("/developers", inventoryController.getAllDevelopers);

// Handle route for getting games based on genre and devs
router.get("/genres/:id", inventoryController.getGamesByGenre);
router.get("/developers/:id", inventoryController.getGamesByDeveloper);

// Handle routes for sending users to forms
router.get("/new_game", inventoryController.newGame);
router.get("/new_genre", inventoryController.newGenre);
router.get("/new_developer", inventoryController.newDeveloper);

// Route for updating game fields
router.get("/games/:id/edit", inventoryController.editForm);
router.put("/games/:id", inventoryController.editGame);

// Routes for deleting
router.delete("/games/:id/delete", inventoryController.deleteGame);
router.delete("/genres/:id/delete", inventoryController.deleteGenre);
router.delete("/developers/:id/delete", inventoryController.deleteDeveloper);

// Handle POST routes
router.post("/games", inventoryController.addGameToDB);
router.post("/genres", inventoryController.addGenreToDB);
router.post("/developers", inventoryController.addDeveloperToDB);

module.exports = router;