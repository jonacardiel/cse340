import { query } from "../db.js";

async function getCategoryList() {
  const result = await query(`
    SELECT id, name, slug, description
    FROM categories
    ORDER BY name
  `);

  return result.rows;
}

async function createCategory({ name, slug, description }) {
  const result = await query(`
    INSERT INTO categories (name, slug, description)
    VALUES ($1, $2, $3)
    RETURNING id
  `, [name, slug, description]);

  return result.rows[0] || null;
}

async function updateCategory({ categoryId, name, slug, description }) {
  const result = await query(`
    UPDATE categories
    SET name = $1,
        slug = $2,
        description = $3
    WHERE id = $4
    RETURNING id
  `, [name, slug, description, categoryId]);

  return result.rows[0] || null;
}

async function deleteCategory(categoryId) {
  const result = await query(`
    DELETE FROM categories
    WHERE id = $1
    RETURNING id
  `, [categoryId]);

  return result.rows[0] || null;
}

async function getVehicleAdminList() {
  const result = await query(`
    SELECT
      vehicles.id,
      vehicles.name,
      vehicles.slug,
      vehicles.year,
      vehicles.make,
      vehicles.model,
      vehicles.price,
      vehicles.mileage,
      vehicles.transmission,
      vehicles.fuel_type,
      vehicles.drivetrain,
      vehicles.color,
      vehicles.vin,
      vehicles.description,
      vehicles.is_featured,
      vehicles.is_available,
      vehicles.category_id,
      categories.name AS category_name
    FROM vehicles
    LEFT JOIN categories ON categories.id = vehicles.category_id
    ORDER BY vehicles.updated_at DESC, vehicles.id DESC
  `);

  return result.rows;
}

async function createVehicle({
  categoryId,
  createdByUserId,
  name,
  slug,
  year,
  make,
  model,
  price,
  mileage,
  transmission,
  fuelType,
  drivetrain,
  color,
  vin,
  description,
  isFeatured,
  isAvailable,
  imageUrl,
  imageAlt
}) {
  const vehicleResult = await query(`
    INSERT INTO vehicles (
      category_id,
      created_by_user_id,
      name,
      slug,
      year,
      make,
      model,
      price,
      mileage,
      transmission,
      fuel_type,
      drivetrain,
      color,
      vin,
      description,
      is_featured,
      is_available
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING id, slug
  `, [
    categoryId,
    createdByUserId,
    name,
    slug,
    year,
    make,
    model,
    price,
    mileage,
    transmission,
    fuelType,
    drivetrain,
    color,
    vin,
    description,
    isFeatured,
    isAvailable
  ]);

  const vehicle = vehicleResult.rows[0];

  if (imageUrl) {
    await query(`
      INSERT INTO vehicle_images (vehicle_id, image_url, alt_text, sort_order)
      VALUES ($1, $2, $3, 1)
    `, [vehicle.id, imageUrl, imageAlt || name]);
  }

  return vehicle;
}

async function getVehicleById(vehicleId) {
  const result = await query(`
    SELECT
      vehicles.id,
      vehicles.name,
      vehicles.slug,
      vehicles.year,
      vehicles.make,
      vehicles.model,
      vehicles.price,
      vehicles.mileage,
      vehicles.transmission,
      vehicles.fuel_type,
      vehicles.drivetrain,
      vehicles.color,
      vehicles.vin,
      vehicles.description,
      vehicles.is_featured,
      vehicles.is_available,
      vehicles.category_id,
      (
        SELECT image_url
        FROM vehicle_images
        WHERE vehicle_id = vehicles.id
        ORDER BY sort_order ASC, id ASC
        LIMIT 1
      ) AS primary_image,
      (
        SELECT alt_text
        FROM vehicle_images
        WHERE vehicle_id = vehicles.id
        ORDER BY sort_order ASC, id ASC
        LIMIT 1
      ) AS primary_image_alt
    FROM vehicles
    WHERE vehicles.id = $1
    LIMIT 1
  `, [vehicleId]);

  return result.rows[0] || null;
}

async function updateVehicleForOwner({
  vehicleId,
  categoryId,
  name,
  slug,
  year,
  make,
  model,
  price,
  mileage,
  transmission,
  fuelType,
  drivetrain,
  color,
  vin,
  description,
  isFeatured,
  isAvailable,
  imageUrl,
  imageAlt
}) {
  const updated = await query(`
    UPDATE vehicles
    SET category_id = $1,
        name = $2,
        slug = $3,
        year = $4,
        make = $5,
        model = $6,
        price = $7,
        mileage = $8,
        transmission = $9,
        fuel_type = $10,
        drivetrain = $11,
        color = $12,
        vin = $13,
        description = $14,
        is_featured = $15,
        is_available = $16,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $17
    RETURNING id, slug
  `, [
    categoryId,
    name,
    slug,
    year,
    make,
    model,
    price,
    mileage,
    transmission,
    fuelType,
    drivetrain,
    color,
    vin,
    description,
    isFeatured,
    isAvailable,
    vehicleId
  ]);

  if (imageUrl) {
    const existingImage = await query(`
      SELECT id
      FROM vehicle_images
      WHERE vehicle_id = $1
      ORDER BY sort_order ASC, id ASC
      LIMIT 1
    `, [vehicleId]);

    if (existingImage.rows.length > 0) {
      await query(`
        UPDATE vehicle_images
        SET image_url = $1,
            alt_text = $2
        WHERE id = $3
      `, [imageUrl, imageAlt || name, existingImage.rows[0].id]);
    } else {
      await query(`
        INSERT INTO vehicle_images (vehicle_id, image_url, alt_text, sort_order)
        VALUES ($1, $2, $3, 1)
      `, [vehicleId, imageUrl, imageAlt || name]);
    }
  }

  return updated.rows[0] || null;
}

async function updateVehicleForEmployee({ vehicleId, price, description, isAvailable }) {
  const result = await query(`
    UPDATE vehicles
    SET price = $1,
        description = $2,
        is_available = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, slug
  `, [price, description, isAvailable, vehicleId]);

  return result.rows[0] || null;
}

async function deleteVehicle(vehicleId) {
  const result = await query(`
    DELETE FROM vehicles
    WHERE id = $1
    RETURNING id
  `, [vehicleId]);

  return result.rows[0] || null;
}

export {
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
};
