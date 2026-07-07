import { validationResult } from "express-validator";
import { createContactForm, getAllContactForms } from "../../models/forms/contact.js";

const contactFormPage = (req, res) => {
  res.render("forms/contact/form", {
    title: "Contact Us",
    values: {
      subject: "",
      message: ""
    }
  });
};

const submitContactForm = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });

    return res.redirect("/contact");
  }

  try {
    const { subject, message } = req.body;
    await createContactForm(subject, message);
    req.flash("success", "Thank you for contacting us! We will respond soon.");
    return res.redirect("/contact");
  } catch (error) {
    console.error("Contact form save error:", error);
    req.flash("error", "Unable to submit your message. Please try again later.");
    return res.redirect("/contact");
  }
};

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
