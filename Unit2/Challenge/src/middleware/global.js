const addLocalVariables = (req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  next();
};

export { addLocalVariables };
