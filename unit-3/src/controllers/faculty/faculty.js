import { getAllFaculty, getFacultyBySlug } from "../../models/faculty/faculty.js";

const facultyListPage = async (req, res, next) => {
  try {
    const sort = req.query.sort || "name";
    const faculty = await getAllFaculty(sort);

    res.render("faculty/list", {
      title: "Faculty",
      faculty
    });
  } catch (error) {
    console.error("Faculty list error:", error);
    next(error);
  }
};

const facultyDetailPage = async (req, res, next) => {
  try {
    const slugId = req.params.slugId;
    const faculty = await getFacultyBySlug(slugId);

    if (Object.keys(faculty).length === 0) {
      const err = new Error(`Faculty ${slugId} not found`);
      err.status = 404;
      return next(err);
    }

    res.render("faculty/detail", {
      title: faculty.name,
      faculty
    });
  } catch (error) {
    console.error("Faculty detail error:", error);
    next(error);
  }
};

export { facultyListPage, facultyDetailPage };
