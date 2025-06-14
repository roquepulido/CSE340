// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const inventoryValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail));

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildInventoryManagement));
// Route to add classification
router.get(
  "/classification/add",
  utilities.handleErrors(invController.buildAddClassification)
);
// Route create classification
router.post(
    "/classification/add",
    inventoryValidate.newClassificationRules(),
    inventoryValidate.checkNewClassificationData,
    utilities.handleErrors(invController.createNewClassification)
);
// Route to add inventory
router.get(
  "/add",
  utilities.handleErrors(invController.buildAddInventory)
);
// Route to create inventory
router.post(
  "/add",
  inventoryValidate.newInventoryRules(),
  inventoryValidate.checkNewInventoryData,
  utilities.handleErrors(invController.createNewInventory)
);

module.exports = router;
