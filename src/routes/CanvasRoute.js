const express = require("express");
const CanvasController = require("../controllers/CanvasController");
const { authenticateToken } = require("../middleware/auth");
const { 
    validateShareCanvas,
    validateCanvasId 
} = require("../middleware/validateRequest");

const router = express.Router();

// Public routes (no authentication required)
router.get("/public", CanvasController.getPublicCanvases);
router.get("/:canvasId", authenticateToken, validateCanvasId, CanvasController.getCanvasById);

// Protected routes (authentication required)
router.get("/", authenticateToken, CanvasController.getCanvasesByUserId);
router.post("/", authenticateToken, CanvasController.createCanvas);
router.put("/:canvasId", authenticateToken, validateCanvasId, CanvasController.updateCanvas);
router.delete("/:canvasId", authenticateToken, validateCanvasId, CanvasController.deleteCanvas);
router.post("/:canvasId/share", authenticateToken, validateCanvasId, validateShareCanvas, CanvasController.shareCanvas);
router.put("/:canvasId/share/:targetUserId", authenticateToken, validateCanvasId, CanvasController.updateSharedPermission);
router.delete("/:canvasId/share/:targetUserId", authenticateToken, validateCanvasId, CanvasController.unshareCanvas);
router.get("/stats/overview", authenticateToken, CanvasController.getCanvasStats);

module.exports = router;