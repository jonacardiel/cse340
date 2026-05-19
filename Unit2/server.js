import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// this is just hardcoded data for now until we use a real database later
const courses = {
  CS121: {
    id: "CS121",
    title: "Introduction to Programming",
    description: "Learn programming fundamentals using JavaScript and basic web development concepts.",
    credits: 3,
    sections: [
      { time: "9:00 AM", room: "STC 392", professor: "Brother Jack" },
      { time: "2:00 PM", room: "STC 394", professor: "Sister Enkey" },
      { time: "11:00 AM", room: "STC 390", professor: "Brother Keers" }
    ]
  },
  MATH110: {
    id: "MATH110",
    title: "College Algebra",
    description: "Fundamental algebraic concepts including functions, graphing, and problem solving.",
    credits: 4,
    sections: [
      { time: "8:00 AM", room: "MC 301", professor: "Sister Anderson" },
      { time: "1:00 PM", room: "MC 305", professor: "Brother Miller" },
      { time: "3:00 PM", room: "MC 307", professor: "Brother Thompson" }
    ]
  },
  ENG101: {
    id: "ENG101",
    title: "Academic Writing",
    description: "Develop writing skills for academic and professional communication.",
    credits: 3,
    sections: [
      { time: "10:00 AM", room: "GEB 201", professor: "Sister Anderson" },
      { time: "12:00 PM", room: "GEB 205", professor: "Brother Davis" },
      { time: "4:00 PM", room: "GEB 203", professor: "Sister Enkey" }
    ]
  }
};

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/products", (req, res) => {
  res.render("products", { title: "Products" });
});

app.get("/student", (req, res) => {
  const student = {
    name: "Jeff Student",
    id: "A01234567",
    email: "jeff.student@example.edu",
    address: "123 College Ave, Rexburg, ID"
  };

  res.render("student", { title: "Student", student });
});

app.get("/catalog", (req, res) => {
  res.render("catalog", {
    title: "Course Catalog",
    courses
  });
});

// route param grabs the course id like /catalog/CS121
app.get("/catalog/:courseId", (req, res, next) => {
  const courseId = req.params.courseId;
  const course = courses[courseId];

  if (!course) {
    const err = new Error(`Course ${courseId} not found`);
    err.status = 404;
    return next(err);
  }

  const sortBy = req.query.sort || "time";
  const sortedSections = [...course.sections];

  switch (sortBy) {
    case "professor":
      sortedSections.sort((a, b) => a.professor.localeCompare(b.professor));
      break;
    case "room":
      sortedSections.sort((a, b) => a.room.localeCompare(b.room));
      break;
    case "time":
    default:
      break;
  }

  console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);

  res.render("course-detail", {
    title: `${course.id} - ${course.title}`,
    course,
    sections: sortedSections,
    currentSort: sortBy
  });
});

app.use((req, res, next) => {
  const err = new Error("Page not found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).render("error", {
    title: `${status} Error`,
    status,
    message: err.message || "Something went wrong"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
