import { body, validationResult } from "express-validator";
import { createContactForm, getAllContactForms } from "../../models/forms/contact.js";

const contactValidation = [
  body("subject")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Subject needs to be at least 2 characters long."),
  body("message")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Message needs to be at least 10 characters long.")
];

const contactFormPage = (req, res) => {
  res.render("forms/contact/form", {
    title: "Contact Us",
    errors: [],
    values: {
      subject: "",
      message: ""
    }
  });
};

const submitContactForm = [contactValidation, async (req, res) => {
  const errors = validationResult(req);
  const formData = {
    subject: req.body.subject || "",
    message: req.body.message || ""
  };

  if (!errors.isEmpty()) {
    console.log("Contact form validation errors:", errors.array());
    return res.status(400).render("forms/contact/form", {
      title: "Contact Us",
      errors: errors.array(),
      values: formData
    });
  }

  try {
    await createContactForm(formData.subject, formData.message);
    return res.redirect("/contact/responses");
  } catch (error) {
    console.error("Contact form save error:", error);
    return res.status(500).render("errors/500", {
      title: "Server Error",
      error: error.message,
      stack: error.stack
    });
  }
}];

const contactResponsesPage = async (req, res) => {
  try {
    const responses = await getAllContactForms();

    res.render("forms/contact/responses", {
      title: "Contact Responses",
      responses
    });
  } catch (error) {
    console.error("Contact responses error:", error);
    res.status(500).render("errors/500", {
      title: "Server Error",
      error: error.message,
      stack: error.stack
    });
  }
};

export { contactFormPage, submitContactForm, contactResponsesPage };
