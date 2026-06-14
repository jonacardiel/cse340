import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { findUserForLogin } from "../../models/forms/login.js";

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
];

const loginFormPage = (req, res) => {
  res.render("forms/login/form", {
    title: "Login",
    errors: [],
    values: {
      email: ""
    }
  });
};

const submitLoginForm = [loginValidation, async (req, res) => {
  const errors = validationResult(req);
  const formData = {
    email: req.body.email || ""
  };

  if (!errors.isEmpty()) {
    return res.status(400).render("forms/login/form", {
      title: "Login",
      errors: errors.array(),
      values: formData
    });
  }

  try {
    const foundUser = await findUserForLogin(req.body.email);

    if (Object.keys(foundUser).length === 0) {
      return res.status(400).render("forms/login/form", {
        title: "Login",
        errors: [{ msg: "Email or password is not correct." }],
        values: formData
      });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, foundUser.password);

    if (!passwordMatch) {
      return res.status(400).render("forms/login/form", {
        title: "Login",
        errors: [{ msg: "Email or password is not correct." }],
        values: formData
      });
    }

    const sessionUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email
    };

    req.session.user = sessionUser;
    return res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).render("errors/500", {
      title: "Server Error",
      error: error.message,
      stack: error.stack
    });
  }
}];

const logoutUser = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);
      return res.status(500).render("errors/500", {
        title: "Server Error",
        error: error.message,
        stack: error.stack
      });
    }

    res.clearCookie("connect.sid");
    return res.redirect("/login");
  });
};

export { loginFormPage, submitLoginForm, logoutUser };
