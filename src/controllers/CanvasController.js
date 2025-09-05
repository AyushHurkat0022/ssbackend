const CanvasService = require("../services/CanvasService");
const ResponseHelper = require("../utils/responseHelper");
const { SUCCESS_MESSAGES } = require("../constants");

const getCanvasesByUserId = async (req, res) => {
    try {
        const userId = req.user.id;
        const canvases = await CanvasService.getCanvasesByUserId(userId);
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.CANVAS.LIST_FETCHED, { canvases });
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

const getPublicCanvases = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const canvases = await CanvasService.getPublicCanvases(parseInt(page), parseInt(limit));
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.CANVAS.LIST_FETCHED, { canvases });
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

const getCanvasById = async (req, res) => {
    try {
        const { canvasId } = req.params;
        const userId = req.user.id;
        const canvas = await CanvasService.getCanvasById(canvasId, userId);
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.CANVAS.FETCHED, { canvas });
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

const createCanvas = async (req, res) => {
    try {
        const userId = req.user.id;
        const canvasData = req.body;
        const canvas = await CanvasService.createCanvas(userId, canvasData);
        return ResponseHelper.success(res, 201, SUCCESS_MESSAGES.CANVAS.CREATED, { canvas });
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

const updateCanvas = async (req, res) => {
    try {
        const { canvasId } = req.params;
        const userId = req.user.id;
        const updateData = req.body;
        console.log("req", req.method);
        console.log("updateData", userId, updateData);
        const canvas = await CanvasService.updateCanvas(canvasId, userId, updateData);
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.CANVAS.UPDATED, { canvas });
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

const deleteCanvas = async (req, res) => {
    try {
        const { canvasId } = req.params;
        const userId = req.user.id;
        const result = await CanvasService.deleteCanvas(canvasId, userId);
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.CANVAS.DELETED, {});
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

const shareCanvas = async (req, res) => {
    try {
        const { canvasId } = req.params;
        const userId = req.user.id;
        const shareData = req.body;
        
        const canvas = await CanvasService.shareCanvas(canvasId, userId, shareData);
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.CANVAS.SHARED, { canvas });
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

const unshareCanvas = async (req, res) => {
    try {
        const { canvasId, targetUserId } = req.params;
        const userId = req.user.id;
        const canvas = await CanvasService.unshareCanvas(canvasId, userId, targetUserId);
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.CANVAS.UNSHARED, { canvas });
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

const updateSharedPermission = async (req, res) => {
    try {
        const { canvasId, targetUserId } = req.params;
        const { canEdit } = req.body;
        const userId = req.user.id;
        const canvas = await CanvasService.updateSharedPermission(canvasId, userId, targetUserId, canEdit);
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.CANVAS.PERMISSION_UPDATED, { canvas });
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

const getCanvasStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await CanvasService.getCanvasStats(userId);
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.GENERAL.DATA_FETCHED, { stats });
    } catch (error) {
        return ResponseHelper.error(res, error.statusCode || 500, error.message, error.errors || undefined);
    }
};

module.exports = {
    getCanvasesByUserId,
    getPublicCanvases,
    getCanvasById,
    createCanvas,
    updateCanvas,
    deleteCanvas,
    shareCanvas,
    unshareCanvas,
    updateSharedPermission,
    getCanvasStats
};