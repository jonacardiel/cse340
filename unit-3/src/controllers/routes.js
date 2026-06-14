import { Router } from "express";
import { requireLogin } from "../middleware/auth.js";
import { homePage, aboutPage, dashboardPage } from "./index.js";
import { catalogListPage, catalogDetailPage } from "./catalog/catalog.js";
import { facultyListPage, facultyDetailPage } from "./faculty/faculty.js";
import { contactFormPage, submitContactForm, contactResponsesPage } from "./forms/contact.js";
import { registrationFormPage, submitRegistrationForm, registrationListPage } from "./forms/registration.js";
import { loginFormPage, submitLoginForm, logoutUser } from "./forms/login.js";

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

router.get("/", homePage);
router.get("/about", aboutPage);
router.get("/dashboard", requireLogin, dashboardPage);

router.get("/catalog", catalogListPage);
router.get("/catalog/:slugId", catalogDetailPage);
router.get("/faculty", facultyListPage);
router.get("/faculty/:slugId", facultyDetailPage);

router.get("/contact", contactFormPage);
router.post("/contact", submitContactForm);
router.get("/contact/responses", contactResponsesPage);

router.get("/registration", registrationFormPage);
router.post("/registration", submitRegistrationForm);
router.get("/registration/list", registrationListPage);

router.get("/login", loginFormPage);
router.post("/login", submitLoginForm);
router.get("/logout", logoutUser);

export default router;
