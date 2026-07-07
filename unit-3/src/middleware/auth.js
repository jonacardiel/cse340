// Middleware to require authentication for protected routes.
// Redirects to login page if user is not authenticated.
const requireLogin = (req, res, next) => {
  // Check if user is logged in via session; we can beef this up later with roles and permissions
  if (req.session && req.session.user) {
    // User is authenticated - set UI state and continue
    res.locals.isLoggedIn = true;
    next();
  } else {
    // User is not authenticated - redirect to login
    req.flash("error", "You must be logged in to access this page.");
    res.redirect("/login");
  }
};

const requireRole = (roleName) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.flash("error", "You must be logged in to access this page.");
      return res.redirect("/login");
    }

    if (req.session.user.roleName !== roleName) {
      req.flash("error", "You do not have permission to access this page.");
      return res.redirect("/");
    }

    next();
  };
};

export { requireLogin, requireRole };
