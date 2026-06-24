import { query, hasDatabaseConfig } from "../db.js";

async function emailExists(email) {
  if (!hasDatabaseConfig()) {
    return false;
  }

  const result = await query(
    `SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)) AS exists`,
    [email]
  );

  return result.rows[0].exists;
}

async function findUserByEmail(email) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const result = await query(
    `SELECT id, first_name, last_name, email, password_hash, role, created_at
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
}

async function createCustomerUser({ firstName, lastName, email, passwordHash }) {
  const result = await query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id, first_name, last_name, email, role, created_at`,
    [firstName, lastName, email, passwordHash]
  );

  return result.rows[0];
}

async function getDashboardSummary(user) {
  if (!hasDatabaseConfig()) {
    return {
      stats: [],
      recentItems: []
    };
  }

  if (user.role === "customer") {
    const [reviewCount, requestCount] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total FROM reviews WHERE user_id = $1`, [user.id]),
      query(`SELECT COUNT(*)::int AS total FROM service_requests WHERE user_id = $1`, [user.id])
    ]);

    return {
      stats: [
        { label: "Your Reviews", value: reviewCount.rows[0].total },
        { label: "Service Requests", value: requestCount.rows[0].total }
      ],
      recentItems: []
    };
  }

  const [vehicleCount, reviewCount, requestCount, messageCount] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total FROM vehicles`),
    query(`SELECT COUNT(*)::int AS total FROM reviews`),
    query(`SELECT COUNT(*)::int AS total FROM service_requests`),
    query(`SELECT COUNT(*)::int AS total FROM contact_messages`)
  ]);

  return {
    stats: [
      { label: "Vehicles", value: vehicleCount.rows[0].total },
      { label: "Reviews", value: reviewCount.rows[0].total },
      { label: "Service Requests", value: requestCount.rows[0].total },
      { label: "Messages", value: messageCount.rows[0].total }
    ],
    recentItems: []
  };
}

export { emailExists, findUserByEmail, createCustomerUser, getDashboardSummary };
