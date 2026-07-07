import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import {
  emailExists,
  saveUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../../models/forms/registration.js";

const registrationFormPage = (req, res) => {
  res.render("forms/registration/form", {
    title: "User Registration",
    values: {
      name: "",
      email: ""
    }
  });
};

const submitRegistrationForm = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });

    return res.redirect("/register");
  }

  try {
    const emailTaken = await emailExists(req.body.email);

    if (emailTaken) {
      req.flash("warning", "An account with this email already exists.");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await saveUser(req.body.name, req.body.email, hashedPassword);

    req.flash("success", "Registration successful. You can now sign in.");
    return res.redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("error", "Unable to register right now. Please try again later.");
    return res.redirect("/register");
  }
};

const registrationListPage = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.render("forms/registration/list", {
      title: "Registered Users",
      users,
      user: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error("Registration list error:", error);
    res.status(500).render("errors/500", {
      title: "Server Error",
      error: error.message,
      stack: error.stack
    });
  }
};

const showEditAccountForm = async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);
  const currentUser = req.session.user;
  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    req.flash("error", "User not found.");
    return res.redirect("/register/list");
  }

  const canEdit = currentUser.id === targetUserId || currentUser.roleName === "admin";
  if (!canEdit) {
    req.flash("error", "You do not have permission to edit this account.");
    return res.redirect("/register/list");
  }

  res.render("forms/registration/edit", {
    title: "Edit Account",
    targetUser
  });
};

const processEditAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });

    return res.redirect(`/register/${req.params.id}/edit`);
  }

  const targetUserId = parseInt(req.params.id, 10);
  const currentUser = req.session.user;
  const { name, email } = req.body;

  try {
    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
      req.flash("error", "User not found.");
      return res.redirect("/register/list");
    }

    const canEdit = currentUser.id === targetUserId || currentUser.roleName === "admin";
    if (!canEdit) {
      req.flash("error", "You do not have permission to edit this account.");
      return res.redirect("/register/list");
    }

    const emailTaken = await emailExists(email);
    if (emailTaken && targetUser.email !== email) {
      req.flash("error", "An account with this email already exists.");
      return res.redirect(`/register/${targetUserId}/edit`);
    }

    await updateUser(targetUserId, name, email);

    if (currentUser.id === targetUserId) {
      req.session.user.name = name;
      req.session.user.email = email;
    }

    req.flash("success", "Account updated successfully.");
    return res.redirect("/register/list");
  } catch (error) {
    console.error("Error updating account:", error);
    req.flash("error", "An error occurred while updating the account.");
    return res.redirect(`/register/${targetUserId}/edit`);
  }
};

const processDeleteAccount = async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);
  const currentUser = req.session.user;

  if (currentUser.roleName !== "admin") {
    req.flash("error", "You do not have permission to delete accounts.");
    return res.redirect("/register/list");
  }

  if (currentUser.id === targetUserId) {
    req.flash("error", "You cannot delete your own account.");
    return res.redirect("/register/list");
  }

  try {
    const deleted = await deleteUser(targetUserId);

    if (deleted) {
      req.flash("success", "User account deleted successfully.");
    } else {
      req.flash("error", "User not found or already deleted.");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    req.flash("error", "An error occurred while deleting the account.");
  }

  return res.redirect("/register/list");
};

export {
  registrationFormPage,
  submitRegistrationForm,
  registrationListPage,
  showEditAccountForm,
  processEditAccount,
  processDeleteAccount
};
