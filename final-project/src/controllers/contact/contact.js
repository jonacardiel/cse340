import { body, validationResult } from "express-validator";
import {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus
} from "../../models/contact/contact.js";

const contactValidation = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Full name must be between 2 and 120 characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address."),
  body("subject")
    .trim()
    .isLength({ min: 3, max: 160 })
    .withMessage("Subject must be between 3 and 160 characters."),
  body("message")
    .trim()
    .isLength({ min: 8, max: 5000 })
    .withMessage("Message must be between 8 and 5000 characters.")
];

const statusValidation = [
  body("status")
    .isIn(["Received", "Replied", "Closed"])
    .withMessage("Invalid contact status.")
];

const showContactPage = (req, res) => {
  res.render("contact/form", {
    title: "Contact",
    values: {
      fullName: req.session?.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : "",
      email: req.session?.user?.email || "",
      subject: "",
      message: ""
    },
    errors: []
  });
};

const submitContactMessageHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("contact/form", {
      title: "Contact",
      values: {
        fullName: req.body.fullName || "",
        email: req.body.email || "",
        subject: req.body.subject || "",
        message: req.body.message || ""
      },
      errors: errors.array()
    });
  }

  try {
    await createContactMessage({
      userId: req.session?.user?.id,
      fullName: req.body.fullName,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message
    });

    return res.render("contact/form", {
      title: "Contact",
      values: {
        fullName: req.session?.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : "",
        email: req.session?.user?.email || "",
        subject: "",
        message: ""
      },
      errors: [],
      successMessage: "Message submitted. Our team will follow up soon."
    });
  } catch (error) {
    return next(error);
  }
};

const submitContactMessage = [contactValidation, submitContactMessageHandler];

const showManageContactPage = async (req, res, next) => {
  try {
    const messages = await getAllContactMessages();

    return res.render("contact/manage", {
      title: "Manage Contact Messages",
      messages
    });
  } catch (error) {
    return next(error);
  }
};

const updateContactStatusHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((entry) => entry.msg).join(" "));
    err.status = 400;
    return next(err);
  }

  try {
    const messageId = Number(req.params.messageId);
    const updated = await updateContactMessageStatus({
      messageId,
      status: req.body.status
    });

    if (!updated) {
      const err = new Error("Contact message not found.");
      err.status = 404;
      return next(err);
    }

    return res.redirect("/contact/manage");
  } catch (error) {
    return next(error);
  }
};

const updateContactStatus = [statusValidation, updateContactStatusHandler];

export {
  showContactPage,
  submitContactMessage,
  showManageContactPage,
  updateContactStatus
};
