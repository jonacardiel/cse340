const emptyFlash = () => ({
  success: [],
  error: [],
  warning: [],
  info: []
});

const flashMiddleware = (req, res, next) => {
  let sessionNeedsSave = false;

  const originalRedirect = res.redirect.bind(res);
  res.redirect = (...args) => {
    if (sessionNeedsSave && req.session) {
      req.session.save(() => {
        originalRedirect(...args);
      });
      return;
    }

    originalRedirect(...args);
  };

  req.flash = (type, message) => {
    if (!req.session) {
      if (type && message) {
        return;
      }

      return emptyFlash();
    }

    if (!req.session.flash) {
      req.session.flash = emptyFlash();
    }

    if (type && message) {
      if (!req.session.flash[type]) {
        req.session.flash[type] = [];
      }

      req.session.flash[type].push(message);
      sessionNeedsSave = true;
      return;
    }

    if (type && !message) {
      const messages = req.session.flash[type] || [];
      req.session.flash[type] = [];
      return messages;
    }

    const allMessages = req.session.flash || emptyFlash();
    req.session.flash = emptyFlash();
    return allMessages;
  };

  next();
};

const flashLocals = (req, res, next) => {
  res.locals.flash = req.flash;
  next();
};

const flash = (req, res, next) => {
  flashMiddleware(req, res, () => {
    flashLocals(req, res, next);
  });
};

export default flash;