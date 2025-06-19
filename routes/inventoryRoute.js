/**
 * inventoryRoute.js
 * -----------------
 * Defines all routes related to inventory management, including viewing, adding, editing, and deleting inventory items and classifications.
 * Applies validation and authorization middleware as needed.
 *
 * Author: Roque A Pulido
 * Date: Jun 18, 2025
 */

const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
const validate = require("../utilities/inventory-validation");

/**
 * Route to build the main vehicle management view
 * Handles GET requests to display the main interface for managing vehicles
 */
router.get(
  "/",
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildVehicleManagement)
);

/**
 * Route to build the add classification view
 * Handles GET requests to display the form for adding a new vehicle classification
 */
router.get(
  "/new/classification",
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildAddClassification)
);

/**
 * Route to build the add inventory view
 * Handles GET requests to display the form for adding new inventory items
 */
router.get(
  "/new/inventory",
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildAddInventory)
);

/**
 * Route to build inventory by classification view
 * Handles GET requests to display inventory items filtered by classification
 */
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

/**
 * Route to build inventory item detail view
 * Handles GET requests to display details for a specific inventory item
 */
router.get(
  "/detail/:itemId",
  utilities.handleErrors(invController.buildByItemId)
);

/**
 * Route to handle new classification creation (POST)
 * Applies validation and error handling middleware
 */
router.post(
  "/new/classification",
  utilities.checkAdminEmployee,
  invValidate.newClassificationRules(),
  invValidate.checkNewClassificationData,
  utilities.handleErrors(invController.createNewClassification)
);

/**
 * Route to handle new inventory item creation (POST)
 * Applies validation and error handling middleware
 */
router.post(
  "/new/inventory",
  utilities.checkAdminEmployee,
  invValidate.newInventoryRules(),
  invValidate.checkNewInventoryData,
  utilities.handleErrors(invController.createNewInventory)
);

/**
 * Route to fetch inventory JSON data
 * Handles GET requests to retrieve inventory data in JSON format for a specific classification
 */
router.get(
  "/getInventory/:classification_id",
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.getInventoryJSON)
);

/**
 * Route to build the edit inventory view
 * Handles GET requests to display the form for editing an existing inventory item
 */
router.get(
  "/edit/:inv_id",
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.editInventoryView)
);

/**
 * Route to build the delete inventory view
 * Handles GET requests to display the confirmation for deleting an inventory item
 */
router.get(
  "/delete/:inv_id",
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.deleteInventoryView)
);

/**
 * Route to build the pending approvals view
 * Handles GET requests to display inventory items pending approval
 */
router.get(
  "/pending",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildPendingView)
);

/**
 * Route to handle inventory updates (POST)
 * Applies validation and error handling middleware
 */
router.post(
  "/update/",
  utilities.checkAdminEmployee,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

/**
 * Route to handle inventory deletion (POST)
 * Applies validation and error handling middleware
 */
router.post(
  "/delete/",
  utilities.checkAdminEmployee,
  invValidate.deleteInventoryRules(),
  invValidate.checkDeleteData,
  utilities.handleErrors(invController.deleteInventory)
);

/**
 * Route to handle pending approval actions for inventory (POST)
 * Applies validation and error handling middleware
 */
router.post(
  "/inventory/:action",
  utilities.checkAdmin,
  validate.checkPendingActions,
  utilities.handleErrors(invController.handleInventoryPendingApproval)
);

/**
 * Route to handle pending approval actions for classifications (POST)
 * Applies validation and error handling middleware
 */
router.post(
  "/classification/:action",
  utilities.checkAdmin,
  validate.checkPendingActions,
  utilities.handleErrors(invController.handleClassificationPendingApproval)
);

module.exports = router;
