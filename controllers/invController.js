const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  if (data.length === 0) {
    return next({ status: 404, message: "No type classification found" });
  }
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};
/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInventoryById(inv_id);
  if (!data) {
    return next({ status: 404, message: "Vehicle not found" });
  }
  const detail = await utilities.buildDetailView(data);
  let nav = await utilities.getNav();
  res.render("./inventory/detail", {
    title: data.inv_make + " " + data.inv_model,
    nav,
    detail,
  });
};

module.exports = invCont;
