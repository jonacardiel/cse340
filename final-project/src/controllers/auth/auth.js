import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import {
  emailExists,
  findUserByEmail,
  createCustomerUser,
  getDashboardSummary
} from "../../models/auth/auth.js";
import { hasDatabaseConfig } from "../../models/db.js";

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password is required.")
];

const registrationValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters."),
  body("lastName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/(?=.*[0-9])(?=.*[^A-Za-z0-9])/) 
    .withMessage("Password must include a number and a special character."),
  body("passwordConfirm")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password confirmation must match.")
];

const buildAuthViewModel = (values = {}) => {
  return {
    values: {
      firstName: values.firstName || "",
      lastName: values.lastName || "",
      email: values.email || ""
    },
    errors: [],
    databaseReady: hasDatabaseConfig()
  };
};

const sanitizeSessionUser = (user) => {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at
  };
};

const showLoginPage = (req, res) => {
  res.render("auth/login", {
    title: "Login",
    errors: [],
    values: { email: "" },
    databaseReady: hasDatabaseConfig()
  });
};

const processLogin = [loginValidation, async (req, res, next) => {
  const errors = validationResult(req);
  const values = { email: req.body.email || "" };

  if (!errors.isEmpty()) {
    return res.status(400).render("auth/login", {
      title: "Login",
      errors: errors.array(),
      values,
      databaseReady: hasDatabaseConfig()
    });
  }

  if (!hasDatabaseConfig()) {
    return res.status(503).render("auth/login", {
      title: "Login",
      errors: [{ msg: "Configure DB_URL before using authentication." }],
      values,
      databaseReady: false
    });
  }

  try {
    const user = await findUserByEmail(req.body.email);

    if (!user) {
      return res.status(400).render("auth/login", {
        title: "Login",
        errors: [{ msg: "Invalid email or password." }],
        values,
        databaseReady: true
      });
    }

    const passwordMatches = await bcrypt.compare(req.body.password, user.password_hash);

    if (!passwordMatches) {
      return res.status(400).render("auth/login", {
        title: "Login",
        errors: [{ msg: "Invalid email or password." }],
        values,
        databaseReady: true
      });
    }

    req.session.user = sanitizeSessionUser(user);
    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
}];

const showRegistrationPage = (req, res) => {
  res.render("auth/register", {
    title: "Register",
    ...buildAuthViewModel()
  });
};

const processRegistration = [registrationValidation, async (req, res, next) => {
  const errors = validationResult(req);
  const viewModel = buildAuthViewModel(req.body);

  if (!errors.isEmpty()) {
    return res.status(400).render("auth/register", {
      title: "Register",
      ...viewModel,
      errors: errors.array()
    });
  }

  if (!hasDatabaseConfig()) {
    return res.status(503).render("auth/register", {
      title: "Register",
      ...viewModel,
      errors: [{ msg: "Configure DB_URL before creating accounts." }],
      databaseReady: false
    });
  }

  try {
    const existingEmail = await emailExists(req.body.email);

    if (existingEmail) {
      return res.status(400).render("auth/register", {
        title: "Register",
        ...viewModel,
        errors: [{ msg: "That email address is already registered." }]
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const createdUser = await createCustomerUser({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      passwordHash
    });

    req.session.user = {
      id: createdUser.id,
      firstName: createdUser.first_name,
      lastName: createdUser.last_name,
      email: createdUser.email,
      role: createdUser.role,
      createdAt: createdUser.created_at
    };

    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
}];

const processLogout = (req, res) => {
  if (!req.session) {
    return res.redirect("/");
  }

  req.session.destroy((error) => {
    if (error) {
      res.clearCookie("connect.sid");
      return res.redirect("/");
    }

    res.clearCookie("connect.sid");
    return res.redirect("/");
  });
};

const showDashboard = async (req, res, next) => {
  try {
    const dashboard = await getDashboardSummary(req.session.user);

    return res.render("dashboard", {
      title: "Dashboard",
      dashboard,
      user: req.session.user
    });
  } catch (error) {
    return next(error);
  }
};

export {
  showLoginPage,
  processLogin,
  showRegistrationPage,
  processRegistration,
  processLogout,
  showDashboard
};
