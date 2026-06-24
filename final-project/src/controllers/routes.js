import { Router } from "express";
import { homePage, aboutPage } from "./index.js";
import {
	inventoryListPage,
	inventoryCategoryPage,
	inventoryDetailPage
} from "./inventory/inventory.js";
import {
	createReview,
	showEditReviewPage,
	updateReview,
	deleteReview
} from "./reviews/reviews.js";
import {
	showCreateServiceRequestPage,
	createServiceRequest,
	showMyServiceRequestsPage,
	showManageServiceRequestsPage,
	updateServiceRequestStatus
} from "./service/service.js";
import {
	showContactPage,
	submitContactMessage,
	showManageContactPage,
	updateContactStatus
} from "./contact/contact.js";
import {
	showLoginPage,
	processLogin,
	showRegistrationPage,
	processRegistration,
	processLogout,
	showDashboard
} from "./auth/auth.js";
import {
	showCategoryManager,
	createCategory,
	updateCategory,
	removeCategory,
	showVehicleManager,
	createVehicle,
	showEditVehiclePage,
	updateVehicle,
	deleteVehicle
} from "./admin/content.js";
import { requireLogin, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", homePage);
router.get("/about", aboutPage);
router.get("/inventory", inventoryListPage);
router.get("/inventory/category/:categorySlug", inventoryCategoryPage);
router.get("/inventory/:vehicleSlug", inventoryDetailPage);
router.get("/contact", showContactPage);
router.post("/contact", submitContactMessage);
router.get("/contact/manage", requireLogin, requireRole("employee", "owner"), showManageContactPage);
router.post("/contact/:messageId/status", requireLogin, requireRole("employee", "owner"), updateContactStatus);
router.post("/inventory/:vehicleSlug/reviews", requireLogin, requireRole("customer"), createReview);
router.get("/reviews/:reviewId/edit", requireLogin, requireRole("customer"), showEditReviewPage);
router.post("/reviews/:reviewId/edit", requireLogin, requireRole("customer"), updateReview);
router.post("/reviews/:reviewId/delete", requireLogin, requireRole("customer"), deleteReview);
router.get("/service-requests/new/:vehicleSlug", requireLogin, requireRole("customer"), showCreateServiceRequestPage);
router.post("/service-requests/new/:vehicleSlug", requireLogin, requireRole("customer"), createServiceRequest);
router.get("/service-requests/mine", requireLogin, requireRole("customer"), showMyServiceRequestsPage);
router.get("/service-requests/manage", requireLogin, requireRole("employee", "owner"), showManageServiceRequestsPage);
router.post("/service-requests/:requestId/status", requireLogin, requireRole("employee", "owner"), updateServiceRequestStatus);
router.get("/admin/categories", requireLogin, requireRole("owner"), showCategoryManager);
router.post("/admin/categories", requireLogin, requireRole("owner"), createCategory);
router.post("/admin/categories/:categoryId/edit", requireLogin, requireRole("owner"), updateCategory);
router.post("/admin/categories/:categoryId/delete", requireLogin, requireRole("owner"), removeCategory);
router.get("/admin/vehicles", requireLogin, requireRole("employee", "owner"), showVehicleManager);
router.post("/admin/vehicles", requireLogin, requireRole("owner"), createVehicle);
router.get("/admin/vehicles/:vehicleId/edit", requireLogin, requireRole("employee", "owner"), showEditVehiclePage);
router.post("/admin/vehicles/:vehicleId/edit", requireLogin, requireRole("employee", "owner"), updateVehicle);
router.post("/admin/vehicles/:vehicleId/delete", requireLogin, requireRole("owner"), deleteVehicle);
router.get("/login", showLoginPage);
router.post("/login", processLogin);
router.get("/register", showRegistrationPage);
router.post("/register", processRegistration);
router.get("/logout", processLogout);
router.get("/dashboard", requireLogin, showDashboard);

export default router;
