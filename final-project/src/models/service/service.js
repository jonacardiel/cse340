import { query } from "../db.js";

async function getVehicleBySlug(vehicleSlug) {
  const result = await query(`
    SELECT id, slug, name, year, make, model
    FROM vehicles
    WHERE slug = $1
    LIMIT 1
  `, [vehicleSlug]);

  return result.rows[0] || null;
}

async function createServiceRequest({ userId, vehicleId, serviceType, customerNotes, requestedDate }) {
  const result = await query(`
    INSERT INTO service_requests (user_id, vehicle_id, service_type, customer_notes, requested_date, status)
    VALUES ($1, $2, $3, $4, $5, 'Submitted')
    RETURNING id
  `, [userId, vehicleId, serviceType, customerNotes, requestedDate || null]);

  return result.rows[0] || null;
}

async function createServiceRequestNote({ requestId, authorUserId, noteText, noteType }) {
  await query(`
    INSERT INTO service_request_notes (service_request_id, author_user_id, note_text, note_type)
    VALUES ($1, $2, $3, $4)
  `, [requestId, authorUserId || null, noteText, noteType]);
}

async function getServiceRequestsForCustomer(userId) {
  const result = await query(`
    SELECT
      service_requests.id,
      service_requests.service_type,
      service_requests.customer_notes,
      service_requests.status,
      service_requests.requested_date,
      service_requests.created_at,
      vehicles.name AS vehicle_name,
      vehicles.slug AS vehicle_slug
    FROM service_requests
    LEFT JOIN vehicles ON vehicles.id = service_requests.vehicle_id
    WHERE service_requests.user_id = $1
    ORDER BY service_requests.created_at DESC
  `, [userId]);

  return result.rows;
}

async function getNotesForRequestIds(requestIds) {
  if (requestIds.length === 0) {
    return [];
  }

  const result = await query(`
    SELECT
      service_request_notes.id,
      service_request_notes.service_request_id,
      service_request_notes.note_text,
      service_request_notes.note_type,
      service_request_notes.created_at,
      users.first_name,
      users.last_name
    FROM service_request_notes
    LEFT JOIN users ON users.id = service_request_notes.author_user_id
    WHERE service_request_notes.service_request_id = ANY($1::int[])
    ORDER BY service_request_notes.created_at DESC
  `, [requestIds]);

  return result.rows;
}

async function getManageableServiceRequests() {
  const result = await query(`
    SELECT
      service_requests.id,
      service_requests.service_type,
      service_requests.customer_notes,
      service_requests.status,
      service_requests.requested_date,
      service_requests.created_at,
      users.first_name AS customer_first_name,
      users.last_name AS customer_last_name,
      users.email AS customer_email,
      vehicles.name AS vehicle_name,
      vehicles.slug AS vehicle_slug
    FROM service_requests
    LEFT JOIN users ON users.id = service_requests.user_id
    LEFT JOIN vehicles ON vehicles.id = service_requests.vehicle_id
    ORDER BY
      CASE service_requests.status
        WHEN 'Submitted' THEN 1
        WHEN 'In Progress' THEN 2
        ELSE 3
      END,
      service_requests.created_at ASC
  `);

  return result.rows;
}

async function updateServiceRequestStatusById({ requestId, status }) {
  const result = await query(`
    UPDATE service_requests
    SET status = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id
  `, [status, requestId]);

  return result.rows[0] || null;
}

export {
  getVehicleBySlug,
  createServiceRequest,
  createServiceRequestNote,
  getServiceRequestsForCustomer,
  getNotesForRequestIds,
  getManageableServiceRequests,
  updateServiceRequestStatusById
};
