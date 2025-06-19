const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("index", { title: "Home", nav });
};

baseController.buildIntentionalError = async function (req, res) {
  res.render("index", { title: "Home", nav });
};

module.exports = baseController;
