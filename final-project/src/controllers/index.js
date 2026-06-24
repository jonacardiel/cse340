const homePage = (req, res) => {
  res.render("home", {
    title: "Driven Auto",
    hero: {
      heading: "Used cars, service tracking, and a customer account system.",
      subheading: "This final project starts with the dealership foundation and will grow into the full Option B workflow."
    }
  });
};

const aboutPage = (req, res) => {
  res.render("about", {
    title: "About Driven Auto"
  });
};

export { homePage, aboutPage };
