require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

const NODE_ENV = process.env.NODE_ENV || "production";
const PORT = process.env.PORT || 3000;

// Static files middleware
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the templating engine
app.set("view engine", "ejs");
// Tell Express where to find your templates
app.set("views", path.join(__dirname, "src/views"));

/**
 * Routes
 */
app.get("/", (req, res) => {
  const title = "Welcome Home";
  res.render("home", { title, NODE_ENV });
});

app.get("/about", (req, res) => {
  const title = "About Me";
  res.render("about", { title, NODE_ENV });
});

app.get("/products", (req, res) => {
  const title = "Our Products";
  res.render("products", { title, NODE_ENV });
});

app.get("/student", (req, res) => {
  const title = "Student Information";
  const student = {
    name: "Jane Doe",
    id: "A01234567",
    email: "jane.doe@example.edu",
    address: "123 College Ave, Rexburg, ID"
  };

  res.render("student", { title, student, NODE_ENV });
});

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on http://localhost:${PORT}`);
});
