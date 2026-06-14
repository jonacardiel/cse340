const addLocalVariables = (req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  res.locals.user = req.session.user || null;
  res.locals.sessionData = req.session;
  res.locals.headAssets = {
    styles: [],
    scripts: []
  };

  res.locals.addHeadAsset = (type, file, priority = 100) => {
    let targetList = res.locals.headAssets.styles;

    if (type === "script") {
      targetList = res.locals.headAssets.scripts;
    }

    let foundAsset = false;

    for (let i = 0; i < targetList.length; i += 1) {
      if (targetList[i].file === file) {
        targetList[i].priority = priority;
        foundAsset = true;
      }
    }

    if (!foundAsset) {
      targetList.push({ file, priority });
    }

    targetList.sort((first, second) => first.priority - second.priority);
  };

  next();
};

export { addLocalVariables };
