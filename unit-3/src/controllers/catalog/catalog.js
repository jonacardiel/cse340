import { getAllCourses, getCourseBySlug } from "../../models/catalog/catalog.js";

const catalogListPage = async (req, res, next) => {
  try {
    const courses = await getAllCourses();

    res.render("catalog/list", {
      title: "Course Catalog",
      courses
    });
  } catch (error) {
    console.error("Catalog list error:", error);
    next(error);
  }
};

const catalogDetailPage = async (req, res, next) => {
  try {
    const slugId = req.params.slugId;
    const course = await getCourseBySlug(slugId);

    if (Object.keys(course).length === 0) {
      const err = new Error(`Course ${slugId} not found`);
      err.status = 404;
      return next(err);
    }

    res.render("catalog/detail", {
      title: course.name,
      course
    });
  } catch (error) {
    console.error("Catalog detail error:", error);
    next(error);
  }
};

export { catalogListPage, catalogDetailPage };
