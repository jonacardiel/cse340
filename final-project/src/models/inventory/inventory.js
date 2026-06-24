import { hasDatabaseConfig, query } from "../db.js";

async function getInventorySnapshot() {
  if (!hasDatabaseConfig()) {
    return {
      categories: [],
      vehicles: [],
      featuredVehicles: [],
      databaseReady: false
    };
  }

  const [categoriesResult, vehiclesResult, featuredResult] = await Promise.all([
    query(`
      SELECT id, name, slug, description
      FROM categories
      ORDER BY name
    `),
    query(`
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
        vehicles.description,
        vehicles.is_featured,
        vehicles.is_available,
        categories.name AS category_name,
        categories.slug AS category_slug,
        (
          SELECT image_url
          FROM vehicle_images
          WHERE vehicle_id = vehicles.id
          ORDER BY sort_order ASC, id ASC
          LIMIT 1
        ) AS primary_image,
        (
          SELECT COALESCE(ROUND(AVG(rating), 1), 0)
          FROM reviews
          WHERE vehicle_id = vehicles.id
        ) AS average_rating,
        (
          SELECT COUNT(*)
          FROM reviews
          WHERE vehicle_id = vehicles.id
        ) AS review_count
      FROM vehicles
      LEFT JOIN categories ON categories.id = vehicles.category_id
      ORDER BY vehicles.is_featured DESC, vehicles.price DESC, vehicles.year DESC
    `),
    query(`
      SELECT
        vehicles.id,
        vehicles.name,
        vehicles.slug,
        vehicles.year,
        vehicles.make,
        vehicles.model,
        vehicles.price,
        vehicles.mileage,
        (
          SELECT image_url
          FROM vehicle_images
          WHERE vehicle_id = vehicles.id
          ORDER BY sort_order ASC, id ASC
          LIMIT 1
        ) AS primary_image
      FROM vehicles
      WHERE vehicles.is_featured = true
      ORDER BY vehicles.year DESC, vehicles.price DESC
    `)
  ]);

  return {
    categories: categoriesResult.rows,
    vehicles: vehiclesResult.rows,
    featuredVehicles: featuredResult.rows,
    databaseReady: true
  };
}

async function getVehiclesByCategorySlug(categorySlug) {
  const snapshot = await getInventorySnapshot();

  if (!snapshot.databaseReady) {
    return {
      ...snapshot,
      activeCategory: null
    };
  }

  const activeCategory = snapshot.categories.find((category) => category.slug === categorySlug) || null;
  const vehicles = snapshot.vehicles.filter((vehicle) => vehicle.category_slug === categorySlug);

  return {
    ...snapshot,
    activeCategory,
    vehicles
  };
}

async function getVehicleBySlug(vehicleSlug) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const vehicleResult = await query(`
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
      categories.name AS category_name,
      categories.slug AS category_slug
    FROM vehicles
    LEFT JOIN categories ON categories.id = vehicles.category_id
    WHERE vehicles.slug = $1
    LIMIT 1
  `, [vehicleSlug]);

  if (vehicleResult.rows.length === 0) {
    return null;
  }

  const vehicle = vehicleResult.rows[0];

  const [imagesResult, reviewsResult] = await Promise.all([
    query(`
      SELECT id, image_url, alt_text, sort_order
      FROM vehicle_images
      WHERE vehicle_id = $1
      ORDER BY sort_order ASC, id ASC
    `, [vehicle.id]),
    query(`
      SELECT
        reviews.id,
        reviews.user_id,
        reviews.rating,
        reviews.review_text,
        reviews.created_at,
        users.first_name,
        users.last_name
      FROM reviews
      INNER JOIN users ON users.id = reviews.user_id
      WHERE reviews.vehicle_id = $1
      ORDER BY reviews.created_at DESC
    `, [vehicle.id])
  ]);

  vehicle.images = imagesResult.rows;
  vehicle.reviews = reviewsResult.rows;
  return vehicle;
}

export { getInventorySnapshot, getVehiclesByCategorySlug, getVehicleBySlug };
