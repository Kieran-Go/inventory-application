const express = require("express");
const app = express();

// Enable overriding methods (Useful for using PUT methods in forms)
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Declare routes
const inventoryRouter = require("./routes/inventoryRouter");

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set static folder for assets
app.use(express.static("public"));

// Parse data on req.body
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use("/", inventoryRouter);

// Listen for port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));