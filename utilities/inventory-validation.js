/**
 * inventory-validation.js
 * ----------------------
 * Contains validation rules and middleware for inventory and classification forms.
 * Uses express-validator to enforce input requirements and sanitize data.
 *
 * Author: Roque A Pulido
 * Date: Jun 18, 2025
 */

const utilities = require(".");
const { body, validationResult } = require("express-validator");
const { ALLOWED_ACTIONS } = require("./shared");
const validate = {};

/*  **********************************
 *  New Classification Validation Rules
 *  Returns an array of validation rules for new classification form submissions.
 * ********************************* */
validate.newClassificationRules = () => {
  return [
    // Validate classification name: alphabetic characters only, no spaces
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z]+$/)
      .withMessage("Provide a correct classification name."),
  ];
};

/*  **********************************
 *  New Inventory Validation Rules
 *  Returns an array of validation rules for new inventory form submissions.
 * ********************************* */
validate.newInventoryRules = () => {
  return [
    // Validate Classification: Ensure a selection is made (not empty)
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Classification is required."),

    // Validate Make: Alphanumeric characters and spaces
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required.")
      .matches(/^[A-Za-z0-9 ]+$/)
      .withMessage("Make must contain only letters, numbers, and spaces."),

    // Validate Model: Alphanumeric characters and spaces
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required.")
      .matches(/^[A-Za-z0-9 ]+$/)
      .withMessage("Model must contain only letters, numbers, and spaces."),

    // Validate Description: Cannot be empty
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    // Validate Image Path: Match a valid relative image path
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required.")
      .matches(
        /^\/images\/[a-zA-Z0-9_\-/]+\.((png)|(jpg)|(jpeg)|(gif)|(webp))$/
      )
      .withMessage(
        'Image path must follow the format "/images/.../filename.extension".'
      ),

    // Validate Thumbnail Path: Match a valid relative thumbnail path
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required.")
      .matches(
        /^\/images\/[a-zA-Z0-9_\-/]+\.((png)|(jpg)|(jpeg)|(gif)|(webp))$/
      )
      .withMessage(
        'Thumbnail path must follow the format "/images/.../filename.extension".'
      ),

    // Validate Price: Must be a positive number
    body("inv_price")
      .notEmpty()
      .withMessage("Price is required.")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    // Validate Year: Between 1886 and the current year
    body("inv_year")
      .notEmpty()
      .withMessage("Year is required.")
      .isInt({ min: 1886, max: new Date().getFullYear() })
      .withMessage(
        `Year must be between 1886 and ${new Date().getFullYear()}.`
      ),

    // Validate Miles: Must be a non-negative integer
    body("inv_miles")
      .notEmpty()
      .withMessage("Miles is required.")
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative integer."),

    // Validate Color: Alphabetic characters only
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required.")
      .matches(/^[A-Za-z]+$/)
      .withMessage("Color must contain only alphabetic characters."),
  ];
};

/*  **********************************
 *  Delete Inventory Item Validation Rules
 * ********************************* */
validate.deleteInventoryRules = () => {
  return [
    // Validate ID
    body("inv_id").trim().notEmpty().withMessage("ID is required."),

    // Validate Make: Alphanumeric characters and spaces
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required.")
      .matches(/^[A-Za-z0-9 ]+$/)
      .withMessage("Make must contain only letters, numbers, and spaces."),

    // Validate Model: Alphanumeric characters and spaces
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required.")
      .matches(/^[A-Za-z0-9 ]+$/)
      .withMessage("Model must contain only letters, numbers, and spaces."),

    // Validate Price: Must be a positive number
    body("inv_price")
      .notEmpty()
      .withMessage("Price is required.")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    // Validate Year: Between 1886 and the current year
    body("inv_year")
      .notEmpty()
      .withMessage("Year is required.")
      .isInt({ min: 1886, max: new Date().getFullYear() })
      .withMessage(
        `Year must be between 1886 and ${new Date().getFullYear()}.`
      ),
  ];
};

/* ******************************
 * Check New Classification Data and Return Errors
 * ***************************** */
validate.checkNewClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsFiltered = errors
      .array()
      .filter((e) => e.msg !== "Invalid value");
    errors.errors = errorsFiltered;

    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

/* ******************************
 * Check New Inventory Data and Return Errors
 * ***************************** */
validate.checkNewInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Filter out generic "Invalid value" errors for clarity
    const errorsFiltered = errors
      .array()
      .filter((e) => e.msg !== "Invalid value");
    errors.errors = errorsFiltered;

    let nav = await utilities.getNav();

    // Render the form with errors and pre-fill the fields with user input
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      selectClassification: await utilities.buildClassificationList(
        classification_id
      ),
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};

/* ******************************
 * Check Edit Inventory Data and Return Errors
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Filter out generic "Invalid value" errors for clarity
    const errorsFiltered = errors
      .array()
      .filter((e) => e.msg !== "Invalid value");
    errors.errors = errorsFiltered;

    let nav = await utilities.getNav();

    const itemName = `${inv_make} ${inv_model}`;
    // Render the form with errors and pre-fill the fields with user input
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      selectClassification: await utilities.buildClassificationList(
        classification_id
      ),
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_id,
    });
    return;
  }
  next();
};

/* ******************************
 * Check Edit Inventory Data and Return Errors
 * ***************************** */
validate.checkDeleteData = async (req, res, next) => {
  const { inv_id, inv_make, inv_model, inv_price, inv_year } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Filter out generic "Invalid value" errors for clarity
    const errorsFiltered = errors
      .array()
      .filter((e) => e.msg !== "Invalid value");
    errors.errors = errorsFiltered;

    let nav = await utilities.getNav();

    const itemName = `${inv_make} ${inv_model}`;
    // Render the form with errors and pre-fill the fields with user input
    res.render("inventory/delete-inventory", {
      errors,
      title: "Delete " + itemName,
      nav,
      inv_make,
      inv_model,
      inv_price,
      inv_year,
      inv_id,
    });
    return;
  }
  next();
};

validate.checkPendingActions = async (req, res, next) => {
  const { action } = req.params;
  if (!Object.values(ALLOWED_ACTIONS).includes(action)) {
    req.flash("notice", "Invalid action.");
    return res.redirect("/inv/pending");
  }
  next();
};

module.exports = validate;
