const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("index", { title: "Home", nav });
};

baseController.error = async function (req, res) {
  const err = new Error( "Error in server try later.");
  err.status = 500;
  throw err;
};

module.exports = baseController;
