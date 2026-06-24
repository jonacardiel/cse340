const addLocalVariables = (req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  res.locals.user = req.session ? req.session.user || null : null;
  res.locals.isLoggedIn = Boolean(req.session && req.session.user);
  res.locals.headAssets = {
    styles: [],
    scripts: []
  };

  res.locals.addHeadAsset = (type, file, priority = 100) => {
    const assetList = type === "script" ? res.locals.headAssets.scripts : res.locals.headAssets.styles;
    const existingAsset = assetList.find((asset) => asset.file === file);

    if (existingAsset) {
      existingAsset.priority = priority;
    } else {
      assetList.push({ file, priority });
    }

    assetList.sort((first, second) => first.priority - second.priority);
  };

  res.locals.addHeadAsset("style", "/css/main.css", 1);
  next();
};

export { addLocalVariables };
