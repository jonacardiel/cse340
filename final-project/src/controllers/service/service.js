import { body, validationResult } from "express-validator";
import {
  getVehicleBySlug,
  createServiceRequest,
  createServiceRequestNote,
  getServiceRequestsForCustomer,
  getNotesForRequestIds,
  getManageableServiceRequests,
  updateServiceRequestStatusById
} from "../../models/service/service.js";

const serviceRequestValidation = [
  body("serviceType")
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Service type must be between 3 and 120 characters."),
  body("customerNotes")
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage("Notes must be between 5 and 2000 characters."),
  body("requestedDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Requested date must be a valid date.")
];

const statusValidation = [
  body("status")
    .isIn(["Submitted", "In Progress", "Completed"])
    .withMessage("Invalid status value."),
  body("statusNote")
    .trim()
    .isLength({ min: 2, max: 1000 })
    .withMessage("Status note must be between 2 and 1000 characters.")
];

const showCreateServiceRequestPage = async (req, res, next) => {
  try {
    const vehicle = await getVehicleBySlug(req.params.vehicleSlug);

    if (!vehicle) {
      const err = new Error("Vehicle not found.");
      err.status = 404;
      return next(err);
    }

    return res.render("service/new", {
      title: "Request Service",
      vehicle,
      values: {
        serviceType: "",
        customerNotes: "",
        requestedDate: ""
      },
      errors: []
    });
  } catch (error) {
    return next(error);
  }
};

const createServiceRequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    const vehicle = await getVehicleBySlug(req.params.vehicleSlug);

    if (!vehicle) {
      const err = new Error("Vehicle not found.");
      err.status = 404;
      return next(err);
    }

    if (!errors.isEmpty()) {
      return res.status(400).render("service/new", {
        title: "Request Service",
        vehicle,
        values: {
          serviceType: req.body.serviceType || "",
          customerNotes: req.body.customerNotes || "",
          requestedDate: req.body.requestedDate || ""
        },
        errors: errors.array()
      });
    }

    const created = await createServiceRequest({
      userId: req.session.user.id,
      vehicleId: vehicle.id,
      serviceType: req.body.serviceType,
      customerNotes: req.body.customerNotes,
      requestedDate: req.body.requestedDate
    });

    await createServiceRequestNote({
      requestId: created.id,
      authorUserId: req.session.user.id,
      noteText: "Request submitted by customer.",
      noteType: "customer-visible"
    });

    return res.redirect("/service-requests/mine");
  } catch (error) {
    return next(error);
  }
};

const createServiceRequestRoute = [serviceRequestValidation, createServiceRequestHandler];

const showMyServiceRequestsPage = async (req, res, next) => {
  try {
    const requests = await getServiceRequestsForCustomer(req.session.user.id);
    const requestIds = requests.map((request) => request.id);
    const notes = await getNotesForRequestIds(requestIds);

    const notesByRequestId = {};
    for (const note of notes) {
      const key = Number(note.service_request_id);
      if (!notesByRequestId[key]) {
        notesByRequestId[key] = [];
      }
      notesByRequestId[key].push(note);
    }

    return res.render("service/my-requests", {
      title: "My Service Requests",
      requests,
      notesByRequestId
    });
  } catch (error) {
    return next(error);
  }
};

const showManageServiceRequestsPage = async (req, res, next) => {
  try {
    const requests = await getManageableServiceRequests();
    const requestIds = requests.map((request) => request.id);
    const notes = await getNotesForRequestIds(requestIds);

    const notesByRequestId = {};
    for (const note of notes) {
      const key = Number(note.service_request_id);
      if (!notesByRequestId[key]) {
        notesByRequestId[key] = [];
      }
      notesByRequestId[key].push(note);
    }

    return res.render("service/manage", {
      title: "Manage Service Requests",
      requests,
      notesByRequestId,
      errors: []
    });
  } catch (error) {
    return next(error);
  }
};

const updateServiceRequestStatusHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((entry) => entry.msg).join(" "));
    err.status = 400;
    return next(err);
  }

  try {
    const requestId = Number(req.params.requestId);
    const updated = await updateServiceRequestStatusById({
      requestId,
      status: req.body.status
    });

    if (!updated) {
      const err = new Error("Service request not found.");
      err.status = 404;
      return next(err);
    }

    await createServiceRequestNote({
      requestId,
      authorUserId: req.session.user.id,
      noteText: req.body.statusNote,
      noteType: "status"
    });

    return res.redirect("/service-requests/manage");
  } catch (error) {
    return next(error);
  }
};

const updateServiceRequestStatus = [statusValidation, updateServiceRequestStatusHandler];

export {
  showCreateServiceRequestPage,
  createServiceRequestRoute as createServiceRequest,
  showMyServiceRequestsPage,
  showManageServiceRequestsPage,
  updateServiceRequestStatus
};
