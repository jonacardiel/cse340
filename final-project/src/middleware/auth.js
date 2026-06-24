const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  return res.redirect("/login");
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.session?.user?.role;

    if (userRole && allowedRoles.includes(userRole)) {
      return next();
    }

    const err = new Error("You do not have permission to access this resource.");
    err.status = 403;
    return next(err);
  };
};

export { requireLogin, requireRole };
