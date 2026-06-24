import { body, validationResult } from "express-validator";
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  getVehicleAdminList,
  createVehicle,
  getVehicleById,
  updateVehicleForOwner,
  updateVehicleForEmployee,
  deleteVehicle
} from "../../models/admin/content.js";

const slugify = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const categoryValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Category name must be between 2 and 80 characters."),
  body("description")
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Category description must be between 5 and 1000 characters.")
];

const vehicleCreateValidation = [
  body("name").trim().isLength({ min: 4, max: 120 }).withMessage("Name must be between 4 and 120 characters."),
  body("year").isInt({ min: 1990, max: 2100 }).withMessage("Year must be valid."),
  body("make").trim().isLength({ min: 2, max: 80 }).withMessage("Make is required."),
  body("model").trim().isLength({ min: 1, max: 80 }).withMessage("Model is required."),
  body("price").isFloat({ min: 1 }).withMessage("Price must be a positive number."),
  body("mileage").isInt({ min: 0 }).withMessage("Mileage must be 0 or greater."),
  body("transmission").trim().isLength({ min: 2, max: 30 }).withMessage("Transmission is required."),
  body("fuelType").trim().isLength({ min: 2, max: 30 }).withMessage("Fuel type is required."),
  body("drivetrain").trim().isLength({ min: 2, max: 30 }).withMessage("Drivetrain is required."),
  body("vin").trim().isLength({ min: 8, max: 32 }).withMessage("VIN must be between 8 and 32 characters."),
  body("description").trim().isLength({ min: 8, max: 4000 }).withMessage("Description must be between 8 and 4000 characters.")
];

const employeeVehicleValidation = [
  body("price").isFloat({ min: 1 }).withMessage("Price must be a positive number."),
  body("description").trim().isLength({ min: 8, max: 4000 }).withMessage("Description must be between 8 and 4000 characters.")
];

const showCategoryManager = async (req, res, next) => {
  try {
    const categories = await getCategoryList();

    return res.render("admin/categories", {
      title: "Manage Categories",
      categories,
      errors: [],
      values: {
        name: "",
        description: ""
      }
    });
  } catch (error) {
    return next(error);
  }
};

const createCategoryHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const categories = await getCategoryList();
    return res.status(400).render("admin/categories", {
      title: "Manage Categories",
      categories,
      errors: errors.array(),
      values: {
        name: req.body.name || "",
        description: req.body.description || ""
      }
    });
  }

  try {
    await createCategory({
      name: req.body.name,
      slug: slugify(req.body.name),
      description: req.body.description
    });

    return res.redirect("/admin/categories");
  } catch (error) {
    return next(error);
  }
};

const createCategoryRoute = [categoryValidation, createCategoryHandler];

const updateCategoryHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((entry) => entry.msg).join(" "));
    err.status = 400;
    return next(err);
  }

  try {
    const updated = await updateCategory({
      categoryId: Number(req.params.categoryId),
      name: req.body.name,
      slug: slugify(req.body.name),
      description: req.body.description
    });

    if (!updated) {
      const err = new Error("Category not found.");
      err.status = 404;
      return next(err);
    }

    return res.redirect("/admin/categories");
  } catch (error) {
    return next(error);
  }
};

const updateCategoryRoute = [categoryValidation, updateCategoryHandler];

const removeCategory = async (req, res, next) => {
  try {
    await deleteCategory(Number(req.params.categoryId));
    return res.redirect("/admin/categories");
  } catch (error) {
    return next(error);
  }
};

const showVehicleManager = async (req, res, next) => {
  try {
    const [vehicles, categories] = await Promise.all([
      getVehicleAdminList(),
      getCategoryList()
    ]);

    return res.render("admin/vehicles", {
      title: "Manage Vehicles",
      vehicles,
      categories,
      errors: [],
      userRole: req.session.user.role,
      values: {}
    });
  } catch (error) {
    return next(error);
  }
};

const createVehicleHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const [vehicles, categories] = await Promise.all([
      getVehicleAdminList(),
      getCategoryList()
    ]);

    return res.status(400).render("admin/vehicles", {
      title: "Manage Vehicles",
      vehicles,
      categories,
      errors: errors.array(),
      userRole: req.session.user.role,
      values: req.body
    });
  }

  try {
    await createVehicle({
      categoryId: Number(req.body.categoryId) || null,
      createdByUserId: req.session.user.id,
      name: req.body.name,
      slug: slugify(req.body.name),
      year: Number(req.body.year),
      make: req.body.make,
      model: req.body.model,
      price: Number(req.body.price),
      mileage: Number(req.body.mileage),
      transmission: req.body.transmission,
      fuelType: req.body.fuelType,
      drivetrain: req.body.drivetrain,
      color: req.body.color || null,
      vin: req.body.vin,
      description: req.body.description,
      isFeatured: req.body.isFeatured === "on",
      isAvailable: req.body.isAvailable === "on",
      imageUrl: req.body.imageUrl || null,
      imageAlt: req.body.imageAlt || null
    });

    return res.redirect("/admin/vehicles");
  } catch (error) {
    return next(error);
  }
};

const createVehicleRoute = [vehicleCreateValidation, createVehicleHandler];

const showEditVehiclePage = async (req, res, next) => {
  try {
    const [vehicle, categories] = await Promise.all([
      getVehicleById(Number(req.params.vehicleId)),
      getCategoryList()
    ]);

    if (!vehicle) {
      const err = new Error("Vehicle not found.");
      err.status = 404;
      return next(err);
    }

    return res.render("admin/vehicle-edit", {
      title: "Edit Vehicle",
      vehicle,
      categories,
      errors: [],
      userRole: req.session.user.role
    });
  } catch (error) {
    return next(error);
  }
};

const updateVehicleHandler = async (req, res, next) => {
  const userRole = req.session.user.role;
  const validators = userRole === "owner" ? vehicleCreateValidation : employeeVehicleValidation;

  for (const validator of validators) {
    await validator.run(req);
  }

  const errors = validationResult(req);

  try {
    const [vehicle, categories] = await Promise.all([
      getVehicleById(Number(req.params.vehicleId)),
      getCategoryList()
    ]);

    if (!vehicle) {
      const err = new Error("Vehicle not found.");
      err.status = 404;
      return next(err);
    }

    if (!errors.isEmpty()) {
      const updatedViewVehicle = {
        ...vehicle,
        ...req.body,
        price: req.body.price,
        mileage: req.body.mileage,
        is_featured: req.body.isFeatured === "on",
        is_available: req.body.isAvailable === "on",
        fuel_type: req.body.fuelType || vehicle.fuel_type
      };

      return res.status(400).render("admin/vehicle-edit", {
        title: "Edit Vehicle",
        vehicle: updatedViewVehicle,
        categories,
        errors: errors.array(),
        userRole
      });
    }

    if (userRole === "owner") {
      await updateVehicleForOwner({
        vehicleId: Number(req.params.vehicleId),
        categoryId: Number(req.body.categoryId) || null,
        name: req.body.name,
        slug: slugify(req.body.name),
        year: Number(req.body.year),
        make: req.body.make,
        model: req.body.model,
        price: Number(req.body.price),
        mileage: Number(req.body.mileage),
        transmission: req.body.transmission,
        fuelType: req.body.fuelType,
        drivetrain: req.body.drivetrain,
        color: req.body.color || null,
        vin: req.body.vin,
        description: req.body.description,
        isFeatured: req.body.isFeatured === "on",
        isAvailable: req.body.isAvailable === "on",
        imageUrl: req.body.imageUrl || null,
        imageAlt: req.body.imageAlt || null
      });
    } else {
      await updateVehicleForEmployee({
        vehicleId: Number(req.params.vehicleId),
        price: Number(req.body.price),
        description: req.body.description,
        isAvailable: req.body.isAvailable === "on"
      });
    }

    return res.redirect("/admin/vehicles");
  } catch (error) {
    return next(error);
  }
};

const deleteVehicleHandler = async (req, res, next) => {
  try {
    await deleteVehicle(Number(req.params.vehicleId));
    return res.redirect("/admin/vehicles");
  } catch (error) {
    return next(error);
  }
};

export {
  showCategoryManager,
  createCategoryRoute as createCategory,
  updateCategoryRoute as updateCategory,
  removeCategory,
  showVehicleManager,
  createVehicleRoute as createVehicle,
  showEditVehiclePage,
  updateVehicleHandler as updateVehicle,
  deleteVehicleHandler as deleteVehicle
};
