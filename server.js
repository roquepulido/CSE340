/*
  server.js
  ----------
  Main entry point for the application. Sets up the Express server, configures middleware, session management, routes, and view engine.
  
  Author: Roque A Pulido
  Date: Jun 18, 2025
*/

/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *
 * - express: Web framework for Node.js
 * - express-ejs-layouts: Layout support for EJS templates
 * - dotenv: Loads environment variables from .env file
 * - session: Session management
 * - pool: PostgreSQL connection pool
 * - bodyParser, cookieParser: Parse request bodies and cookies
 * - static, baseController, inventoryRoute, accountRoute: Route handlers
 * - utilities: Custom utility functions
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const utilities = require("./utilities/");
const session = require("express-session");
const pool = require("./database/");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Middleware
 *
 * - Sets up session store using PostgreSQL
 * - Configures EJS as the view engine and sets the default layout
 * - Applies global middleware for parsing requests and cookies
 * - Registers main application routes
 *
 * More middleware and route configuration continues below...
 * ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
app.use(utilities.checkJWTToken);

/* ***********************
 * Routes
 *************************/
app.use(static);

app.get("/", utilities.handleErrors(baseController.buildHome));
app.get(
  "/intentional-error",
  utilities.handleErrors(baseController.buildIntentionalError)
);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "Sorry, we appear to have lost that page.",
  });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  let message = "";
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404 && err.message) {
    message = `<p id="error-message">${err.message}</p>`;
  } else {
    message =
      '<p id="error-message">Oh no! There was a crash. Maybe try a different route?</p>';
  }
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
