import express from "express";

import {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getStatistics,
} from "../controllers/girviController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ========================================
// ALL GIRVI ROUTES ARE PROTECTED
// ========================================

router.use(protect);

// ========================================
// STATISTICS
// IMPORTANT: /statistics MUST COME BEFORE /:id
// ========================================

router.get("/statistics", getStatistics);

// ========================================
// CREATE
// ========================================

router.post("/", createRecord);

// ========================================
// GET ALL
// ========================================

router.get("/", getRecords);

// ========================================
// GET SINGLE
// ========================================

router.get("/:id", getRecord);

// ========================================
// UPDATE
// ========================================

router.put("/:id", updateRecord);

// ========================================
// DELETE
// ========================================

router.delete("/:id", deleteRecord);

export default router;