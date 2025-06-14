const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};

/* ***************************
 *  Build Views functions
 * ************************** */

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

/* ***************************
 *  Build Inventory management view
 * ************************** */
invCont.buildInventoryManagement = async function (req, res, next) {
  console.log("buildInventoryManagement called");

  let nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Build Add Inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    errors: null,
    selectClassification: await utilities.getCatClassificationList(),
  });
};

/* ***************************
 *  Build Add Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Create functions
 * ************************** */

/* ***************************
 *  Create a new classification
 * ************************** */
invCont.createNewClassification = async function (req, res, next) {
  console.log(
    `createNewClassification called: ${JSON.stringify(
      req.body
    )}, ${JSON.stringify(req.params)}, ${JSON.stringify(req.query)}`
  );

  const { classification_name } = req.body;
  const data = await invModel.createNewClassification(classification_name);
  let nav = await utilities.getNav();
  if (data) {
    req.flash(
      "notice",
      `The ${classification_name} classification was successfully added.`
    );
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the creation failed.");
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};

/* ***************************
 *  Create a new inventory item
 * ************************** */
invCont.createNewInventory = async function (req, res, next) {
  console.log(
    `createNewInventory:  req.body: ${JSON.stringify(req.body)}, req.params: ${JSON.stringify(
      req.params
    )}, req.query:  ${JSON.stringify(req.query)}`
  );

  const data = await invModel.createNewInventory(req.body);
  console.log(`createNewInventory data: ${JSON.stringify(data)}`);
  
  let nav = await utilities.getNav();
  if (data.rowCount > 0) {
    req.flash("notice", `The ${req.body.inv_make} ${req.body.inv_model} was successfully added.`);
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null
    });
  } else {
    req.flash("notice", "Sorry, the creation failed.");
    res.status(501).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      selectClassification: await utilities.getCatClassificationList(
        req.body.classification_id
      ),
      errors: null,
      classification_id: req.body.classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_year: req.body.inv_year,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
    });
  }
};
module.exports = invCont;
