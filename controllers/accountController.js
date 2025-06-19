const bcrypt = require("bcryptjs");
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const accountController = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", { title: "Login", nav, errors: null });
};

/* ****************************************
 *  Deliver register view
 * *************************************** */
accountController.buildRegister = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/register", { title: "Register", nav, errors: null });
};

/* ****************************************
 *  Deliver management account view
 * *************************************** */
accountController.buildManagement = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  });
};

/* ****************************************
 *  Deliver edit account view
 * *************************************** */
accountController.buildEditAccount = async function (req, res) {
  const { account_id } = req.params;
  const { account_firstname, account_lastname, account_email } =
    res.locals?.accountData;

  const user = await accountModel.getAccountById(account_id);
  if (!user) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.redirect("/account/login");
  }

  const nav = await utilities.getNav();
  res.render("account/edit", {
    title: "Edit Account",
    nav,
    errors: null,
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  });
};

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    console.error("Error hashing password:", error);
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
};

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Error during password comparison:", error);
    throw new Error("Access Forbidden");
  }
};

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountUpdate = async function (req, res) {
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (updateResult?.rows?.length) {
    const accountData = updateResult.rows[0];
    delete accountData.account_password;
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 3600 * 1000,
    });

    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } else {
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 1000,
      });
    }
    req.flash("notice", `Congratulations, your information has been updated.`);
    return res.redirect("/account");
  } else {
    req.flash("notice", "Sorry, the account update failed.");
    return res.redirect(`/account/edit/${account_id}`);
  }
};

/* ****************************************
 *  Process password update
 * ************************************ */
accountController.accountUpdatePassword = async function (req, res) {
  const { account_id, account_password } = req.body;
  const hashedPassword = await bcrypt.hash(account_password, 10);

  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  );

  if (updateResult?.rows?.length) {
    req.flash("notice", `Congratulations, your password has been updated.`);
    return res.redirect("/account");
  } else {
    req.flash("notice", "Sorry, the password update failed.");
    return res.redirect(`/account/edit/${account_id}`);
  }
};

accountController.logout = async function (req, res) {
  req.flash("notice", "You have been logged out.");
  res.clearCookie("jwt");
  return res.redirect("/account/login");
};

module.exports = accountController;
