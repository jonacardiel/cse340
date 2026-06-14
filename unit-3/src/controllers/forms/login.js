import bcrypt from "bcrypt";
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
  const values = {
    email: req.body.email || ""
  };

  if (!errors.isEmpty()) {
    return res.status(400).render("forms/login/form", {
      title: "Login",
      errors: errors.array(),
      values
    });
  }

  try {
    const user = await findUserForLogin(req.body.email);

    if (Object.keys(user).length === 0) {
      return res.status(400).render("forms/login/form", {
        title: "Login",
        errors: [{ msg: "Email or password is not correct." }],
        values
      });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatch) {
      return res.status(400).render("forms/login/form", {
        title: "Login",
        errors: [{ msg: "Email or password is not correct." }],
        values
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    req.session.user = safeUser;
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
