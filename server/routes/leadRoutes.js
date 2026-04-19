const express = require("express");
const { Op } = require("sequelize");
const { body, param, validationResult } = require("express-validator");
const { Lead, LeadNote } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const serializeLead = (lead, includeNotes = false) => {
  const item = lead.get ? lead.get({ plain: true }) : lead;
  const notes = includeNotes
    ? (item.notes || [])
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((note) => ({ text: note.text, createdAt: note.createdAt }))
    : [];

  return {
    _id: String(item.id),
    name: item.name,
    email: item.email,
    company: item.company,
    phone: item.phone,
    source: item.source,
    status: item.status,
    nextFollowUpAt: item.nextFollowUpAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    notes
  };
};

const leadValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("company").optional().trim(),
  body("phone").optional().trim(),
  body("source")
    .optional()
    .isIn(["Website", "LinkedIn", "Referral", "Other"])
    .withMessage("Invalid source"),
  body("status")
    .optional()
    .isIn(["new", "contacted", "converted"])
    .withMessage("Invalid status"),
  body("nextFollowUpAt")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Next follow-up date must be valid")
];

const getLeadSort = (sortBy, sortOrder) => {
  const allowedFields = new Set(["name", "email", "company", "source", "status", "nextFollowUpAt", "createdAt"]);
  const field = allowedFields.has(sortBy) ? sortBy : "createdAt";
  return [[field, sortOrder === "asc" ? "ASC" : "DESC"]];
};

router.post("/", leadValidation, async (req, res) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ message: validation.array()[0].msg });
  }

  const lead = await Lead.create({
    name: req.body.name,
    email: req.body.email,
    company: req.body.company || "",
    phone: req.body.phone || "",
    source: req.body.source || "Website",
    status: req.body.status || "new",
    nextFollowUpAt: req.body.nextFollowUpAt ? new Date(req.body.nextFollowUpAt) : null
  });

  return res.status(201).json(serializeLead(lead, true));
});

router.get("/", authMiddleware, async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const status = (req.query.status || "all").toLowerCase();
  const search = (req.query.search || "").trim();
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = (req.query.sortOrder || "desc").toLowerCase();

  const query = {};
  if (status !== "all") {
    query.status = status;
  }

  if (search) {
    query[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  const [leads, total, stats] = await Promise.all([
    Lead.findAll({
      where: query,
      order: getLeadSort(sortBy, sortOrder),
      offset: (page - 1) * limit,
      limit
    }),
    Lead.count({ where: query }),
    Promise.all([
      Lead.count(),
      Lead.count({ where: { status: "new" } }),
      Lead.count({ where: { status: "contacted" } }),
      Lead.count({ where: { status: "converted" } })
    ])
  ]);

  const statsPayload = {
    total: stats[0],
    new: stats[1],
    contacted: stats[2],
    converted: stats[3]
  };

  return res.json({
    leads: leads.map((lead) => serializeLead(lead, false)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1)
    },
    stats: statsPayload
  });
});

router.get("/:id", authMiddleware, [param("id").isInt({ min: 1 }).withMessage("Invalid lead id")], async (req, res) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ message: validation.array()[0].msg });
  }

  const lead = await Lead.findByPk(Number(req.params.id), {
    include: [{ model: LeadNote, as: "notes", attributes: ["text", "createdAt"] }]
  });

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  return res.json(serializeLead(lead, true));
});

router.put(
  "/:id",
  authMiddleware,
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid lead id"),
    body("status").optional().isIn(["new", "contacted", "converted"]).withMessage("Invalid status"),
    body("nextFollowUpAt")
      .optional({ values: "falsy" })
      .isISO8601()
      .withMessage("Next follow-up date must be valid"),
    body("source")
      .optional()
      .isIn(["Website", "LinkedIn", "Referral", "Other"])
      .withMessage("Invalid source"),
    body("noteText").optional().isString().trim().isLength({ min: 1 }).withMessage("Note cannot be empty")
  ],
  async (req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({ message: validation.array()[0].msg });
    }

    const leadId = Number(req.params.id);
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const fields = ["name", "email", "company", "phone", "source", "status", "nextFollowUpAt"];
    fields.forEach((field) => {
      if (typeof req.body[field] !== "undefined") {
        if (field === "nextFollowUpAt") {
          lead[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          lead[field] = req.body[field];
        }
      }
    });

    if (req.body.noteText) {
      await LeadNote.create({
        leadId,
        text: req.body.noteText.trim()
      });
    }

    await lead.save();

    const updatedLead = await Lead.findByPk(leadId, {
      include: [{ model: LeadNote, as: "notes", attributes: ["text", "createdAt"] }]
    });

    return res.json(serializeLead(updatedLead, true));
  }
);

router.delete(
  "/:id",
  authMiddleware,
  [param("id").isInt({ min: 1 }).withMessage("Invalid lead id")],
  async (req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({ message: validation.array()[0].msg });
    }

    const deletedRows = await Lead.destroy({
      where: { id: Number(req.params.id) }
    });

    if (!deletedRows) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json({ message: "Lead deleted successfully" });
  }
);

module.exports = router;