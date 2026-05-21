import { Router } from "express";
import { facultyListPage, facultyDetailPage } from "./faculty/faculty.js";
import { homePage, aboutPage } from "./index.js";

const router = Router();

router.get("/", homePage);
router.get("/about", aboutPage);
router.get("/faculty", facultyListPage);
router.get("/faculty/:facultyId", facultyDetailPage);

export default router;
