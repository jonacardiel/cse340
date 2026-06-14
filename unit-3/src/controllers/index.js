const homePage = (req, res) => {
  res.render("home", {
    title: "Unit 3 Home"
  });
};

const aboutPage = (req, res) => {
  res.render("about", {
    title: "About This Project"
  });
};

const dashboardPage = (req, res) => {
  res.render("dashboard", {
    title: "Dashboard",
    sessionData: req.session
  });
};

export { homePage, aboutPage, dashboardPage };
