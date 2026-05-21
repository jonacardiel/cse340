import { getFacultyById, getSortedFaculty } from "../../models/faculty/faculty.js";

const facultyListPage = (req, res) => {
  const sort = req.query.sort;
  const faculty = getSortedFaculty(sort);
  res.render("faculty/list", { faculty, title: "Faculty" });
};

const facultyDetailPage = (req, res, next) => {
  const id = req.params.facultyId;
  const m = getFacultyById(id);

  if (!m) {
    const err = new Error("Faculty not found");
    err.status = 404;
    next(err);
  } else {
    res.render("faculty/detail", { faculty: m, title: m.name });
  }
};

export { facultyListPage, facultyDetailPage };
