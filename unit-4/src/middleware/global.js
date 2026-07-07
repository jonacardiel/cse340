const addLocalVariables = (req, res, next) => {
  res.locals.year = new Date().getFullYear();
  next();
};

export { addLocalVariables };
