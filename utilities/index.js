const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += /*html*/ `
      <li>
        <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
        <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make } ${vehicle.inv_model} on CSE Motors" /></a>
        <div class="namePrice">
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span class="price">$ ${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>
      `;
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the detail view HTML
 * ************************************ */
Util.buildDetailView = async function (data) {
  return /*html*/ `
 <div class="detail-view">
  <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}" />
  <h2 class="detail-title">${data.inv_make} ${data.inv_model}</h2>
  <p class="description">Description: ${data.inv_description}</p>
  <p class="year">Year: ${data.inv_year}</p>
    <p class="color">Color: ${data.inv_color}</p>
    <p class="miles">Miles: ${new Intl.NumberFormat("en-US").format(
      data.inv_miles
    )}</p>
    <p class="price">Price: $${new Intl.NumberFormat("en-US").format(
      data.inv_price
    )}</p>
 </div>
 `;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
