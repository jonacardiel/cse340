const showHome = (req, res) => {
  res.render('home', {
    title: 'Unit 4 Starter',
    message: 'Unit 4 folder scaffold is ready.'
  });
};

export { showHome };
