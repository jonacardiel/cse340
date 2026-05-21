const homePage = (req, res) => {
  res.render("home", { title: "Home" });
};

const aboutPage = (req, res) => {
  res.render("about", { title: "About" });
};

export { homePage, aboutPage };
