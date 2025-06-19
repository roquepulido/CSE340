/**
 * inventory-model.js
 * ------------------
 * Data access layer for inventory and classification data.
 * Contains functions to query the PostgreSQL database for inventory operations.
 *
 * Author: Roque A Pulido
 * Date: Jun 18, 2025
 */

const pool = require("../database/");

/* ***************************
 *  Get all classification data
 *  Returns a list of all classifications with at least one approved inventory item.
 * ************************** */
async function getClassifications() {
  return await pool.query(//sql
    `SELECT c.classification_id ,c.classification_name FROM public.inventory i
    INNER JOIN public.classification c ON i.classification_id = c.classification_id
    WHERE i.inv_approved = true AND i.account_id IS NOT NULL
    GROUP BY c.classification_name, c.classification_id
    ORDER BY c.classification_id ASC;`
  );
}

/* ***************************
 *  Get all approved classifications
 *  Returns all classifications marked as approved.
 * ************************** */
async function getClassificationsAproved() {
  return await pool.query(
    //sql
    `SELECT * FROM public.classification
    WHERE classification_approved = true 
    ORDER BY classification_id ASC;`
  );
}

/* ***************************
 *  Get classification name by ID
 *  Returns the name of a classification given its ID.
 * ************************** */
async function getClassificationNameById(params) {
  const data = await pool.query(
    //sql
    "SELECT classification_name FROM public.classification WHERE classification_id = $1",
    [params]
  );
  return data.rows[0]?.classification_name;
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 *  Returns all inventory items for a given classification.
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(//sql
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1 AND i.inv_approved = true`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}
/* ***************************
 *  Get inventory data by item_id
 * ************************** */
async function getInventoryByItemId(item_id) {
  try {
    const data = await pool.query(//sql
      `SELECT * FROM public.inventory
      WHERE inv_id = $1 ORDER BY inv_id DESC`,
      [item_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getinventorybyitemid error " + error);
  }
}

/* ***************************
 *  Get all pending inventory items
 *  Returns all inventory items that are pending approval.
 * ************************** */
async function getPendingInventory() {
  try {
    const data = await pool.query(//sql
      `SELECT * FROM public.inventory i 
      INNER JOIN public.classification c ON i.classification_id = c.classification_id
      WHERE i.inv_approved = false ORDER BY i.inv_id ASC;`
    );
    return data.rows;
  } catch (error) {
    console.error("getpendinginventory error " + error);
  }
}

/* ***************************
 *  Get all pending classifications
 *  Returns all classifications that are pending approval.
 * ************************** */
async function getPendingClassifications() {
  try {
    const data = await pool.query(//sql
      `SELECT * FROM public.classification
      WHERE classification_approved = false ORDER BY classification_id ASC`
    );
    return data.rows;
  } catch (error) {
    console.error("getpendinginventory error " + error);
  }
}

/* ***************************
 *  Create a new classification
 *  Adds a new classification to the database.
 * ************************** */
async function createNewClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("createnewclassification error " + error);
  }
}

/* ***************************
 *  Create a new inventory item
 *  Adds a new inventory item to the database.
 * ************************** */
async function createNewInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color
) {
  try {
    const sql =
      "INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *";
    return await pool.query(sql, [
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
    ]);
  } catch (error) {
    console.error("createnewinventory error " + error);
  }
}

/* ***************************
 *  Update Inventory Data
 *  Modifies existing inventory item details.
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}

/* ***************************
 *  Delete Inventory Item by ID
 *  Removes an inventory item from the database.
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    new Error("Delete Inventory Error");
  }
}

/* ***************************
 *  Update Classification Approval
 *  Modifies the approval status of a classification.
 * ************************** */
async function updateClassificationApproval(
  account_id,
  classification_id,
  approvedOrNot
) {
  try {
    console.log(`Updating classification approval for ID: ${classification_id}, Approved: ${approvedOrNot} by Account ID: ${account_id}`);
    const sql = approvedOrNot
      ? "UPDATE public.classification SET classification_approved = $1, account_id = $2 WHERE classification_id = $3 RETURNING *"
      : "DELETE FROM public.classification WHERE classification_id = $1 RETURNING *";

    const params = approvedOrNot
      ? [approvedOrNot, account_id, classification_id]
      : [classification_id];

    const data = await pool.query(sql, params);
    return data.rows;
  } catch (error) {
    throw new Error("Modify Classification Approval Error");
  }
}

/* ***************************
 *  Update Inventory Approval
 *  Modifies the approval status of an inventory item.
 * ************************** */
async function updateInventoryApproval(account_id, inv_id, approvedOrNot) {
  try {
    const sql = approvedOrNot
      ? "UPDATE public.inventory SET inv_approved = $1, account_id = $2 WHERE inv_id = $3 RETURNING *"
      : "DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *";

    const params = approvedOrNot
      ? [approvedOrNot, account_id, inv_id]
      : [inv_id];

    const data = await pool.query(sql, params);
    return data.rows;
  } catch (error) {
    throw new Error("Modify Inventory Approval Error");
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByItemId,
  createNewClassification,
  getClassificationNameById,
  createNewInventory,
  updateInventory,
  deleteInventoryItem,
  getPendingInventory,
  getPendingClassifications,
  updateClassificationApproval,
  updateInventoryApproval,
  getClassificationsAproved,
};
