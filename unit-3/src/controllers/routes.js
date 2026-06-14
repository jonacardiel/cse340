import { Router } from "express";
import { requireLogin } from "../middleware/auth.js";
import { homePage, aboutPage } from "./index.js";
import { catalogListPage, catalogDetailPage } from "./catalog/catalog.js";
import { facultyListPage, facultyDetailPage } from "./faculty/faculty.js";
import { contactFormPage, submitContactForm, contactResponsesPage } from "./forms/contact.js";
import { registrationFormPage, submitRegistrationForm, registrationListPage } from "./forms/registration.js";
import loginRoutes, { processLogout, showDashboard } from "./forms/login.js";

const router = Router();

router.use("/catalog", (req, res, next) => {
  if (res.locals.addHeadAsset) {
    res.locals.addHeadAsset("style", "/css/catalog.css", 10);
  }

  next();
});

router.use("/faculty", (req, res, next) => {
  if (res.locals.addHeadAsset) {
    res.locals.addHeadAsset("style", "/css/faculty.css", 10);
  }

  next();
});

router.use("/contact", (req, res, next) => {
  if (res.locals.addHeadAsset) {
    res.locals.addHeadAsset("style", "/css/contact.css", 10);
  }

  next();
});

router.use("/register", (req, res, next) => {
  if (res.locals.addHeadAsset) {
    res.locals.addHeadAsset("style", "/css/registration.css", 10);
  }

  next();
});

router.use("/login", (req, res, next) => {
  if (res.locals.addHeadAsset) {
    res.locals.addHeadAsset("style", "/css/login.css", 10);
  }

  next();
});

router.get("/", homePage);
router.get("/about", aboutPage);

router.get("/catalog", catalogListPage);
router.get("/catalog/:slugId", catalogDetailPage);
router.get("/faculty", facultyListPage);
router.get("/faculty/:slugId", facultyDetailPage);

router.get("/contact", contactFormPage);
router.post("/contact", submitContactForm);
router.get("/contact/responses", contactResponsesPage);

router.get("/register", registrationFormPage);
router.post("/register", submitRegistrationForm);
router.get("/register/list", registrationListPage);

// Login routes (form and submission)
router.use("/login", loginRoutes);

// Authentication-related routes at root level
router.get("/logout", processLogout);
router.get("/dashboard", requireLogin, showDashboard);

export default router;
