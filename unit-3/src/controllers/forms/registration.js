import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { emailExists, saveUser, getAllUsers } from "../../models/forms/registration.js";

const registrationValidation = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name needs to be at least 2 characters long."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address."),
  body("emailConfirm")
    .custom((value, { req }) => value === req.body.email)
    .withMessage("Email addresses must match."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password needs to be at least 8 characters long.")
    .matches(/(?=.*[0-9])(?=.*[^A-Za-z0-9])/)
    .withMessage("Password must contain a number and a special character."),
  body("passwordConfirm")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password confirmation does not match.")
];

const registrationFormPage = (req, res) => {
  res.render("forms/registration/form", {
    title: "User Registration",
    errors: [],
    values: {
      name: "",
      email: ""
    }
  });
};

const submitRegistrationForm = [registrationValidation, async (req, res) => {
  const errors = validationResult(req);
  const formData = {
    name: req.body.name || "",
    email: req.body.email || ""
  };

  if (!errors.isEmpty()) {
    console.log("Registration validation errors:", errors.array());
    return res.status(400).render("forms/registration/form", {
      title: "User Registration",
      errors: errors.array(),
      values: formData
    });
  }

  try {
    const emailTaken = await emailExists(req.body.email);

    if (emailTaken) {
      console.log("Email already registered");
      return res.status(400).render("forms/registration/form", {
        title: "User Registration",
        errors: [{ msg: "That email is already registered." }],
        values: formData
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await saveUser(req.body.name, req.body.email, hashedPassword);

    console.log("Registration saved successfully");
    return res.redirect("/register/list");
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).render("errors/500", {
      title: "Server Error",
      error: error.message,
      stack: error.stack
    });
  }
}];

const registrationListPage = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.render("forms/registration/list", {
      title: "Registered Users",
      users
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

export { registrationFormPage, submitRegistrationForm, registrationListPage };
