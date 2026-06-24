import {
  getInventorySnapshot,
  getVehiclesByCategorySlug,
  getVehicleBySlug
} from "../../models/inventory/inventory.js";

const inventoryListPage = async (req, res, next) => {
  try {
    const snapshot = await getInventorySnapshot();

    res.render("inventory/list", {
      title: "Inventory",
      ...snapshot,
      activeCategory: null
    });
  } catch (error) {
    next(error);
  }
};

const inventoryCategoryPage = async (req, res, next) => {
  try {
    const categoryData = await getVehiclesByCategorySlug(req.params.categorySlug);

    if (categoryData.databaseReady && !categoryData.activeCategory) {
      const err = new Error("Inventory category not found.");
      err.status = 404;
      return next(err);
    }

    return res.render("inventory/list", {
      title: categoryData.activeCategory ? `${categoryData.activeCategory.name} Inventory` : "Inventory",
      ...categoryData
    });
  } catch (error) {
    return next(error);
  }
};

const inventoryDetailPage = async (req, res, next) => {
  try {
    const vehicle = await getVehicleBySlug(req.params.vehicleSlug);

    if (!vehicle) {
      const err = new Error("Vehicle not found.");
      err.status = 404;
      return next(err);
    }

    return res.render("inventory/detail", {
      title: vehicle.name,
      vehicle
    });
  } catch (error) {
    return next(error);
  }
};

export { inventoryListPage, inventoryCategoryPage, inventoryDetailPage };
