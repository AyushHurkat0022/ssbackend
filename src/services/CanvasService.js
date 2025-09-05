const CanvasModel = require("../models/CanvasModel");
const UserModel = require("../models/UserModel");
const { NotFoundException, UnauthorizedException, ValidationException } = require("../exceptions");
const { ERROR_MESSAGES, VALIDATION_MESSAGES } = require("../constants");

const getCanvasesByUserId = async (userId) => {
    const canvases = await CanvasModel.findAllByUserId(userId);
    return canvases || [];
};

const getPublicCanvases = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const canvases = await CanvasModel.findPublicCanvases(limit, skip);
    return canvases || [];
};

const getCanvasById = async (canvasId, userId) => {
    const canvas = await CanvasModel.findByCanvasId(canvasId, userId);
    
    if (!canvas) {
        throw new NotFoundException(ERROR_MESSAGES.CANVAS.NOT_FOUND);
    }
    
    return canvas;
};

const createCanvas = async (userId, canvasData = {}) => {
    const canvas = await CanvasModel.create({
        owner: userId,
        name: canvasData.name || "Untitled Canvas",
        description: canvasData.description || "",
        elements: canvasData.elements || [],
        isPublic: canvasData.isPublic || false,
        settings: canvasData.settings || {
            backgroundColor: "#ffffff",
            gridEnabled: false,
            gridSize: 20
        }
    });
    
    return canvas.populate('owner', 'name email');
};

const updateCanvas = async (canvasId, userId, updateData) => {
    const canvas = await CanvasModel.findById(canvasId);
    
    if (!canvas) {
        throw new NotFoundException(ERROR_MESSAGES.CANVAS.NOT_FOUND);
    }
    
    // Check if user can edit
    if (!canvas.canUserEdit(userId)) {
        throw new UnauthorizedException(ERROR_MESSAGES.AUTHENTICATION.INSUFFICIENT_PERMISSIONS);
    }
    
    // Only allow updating specific fields
    const allowedUpdates = {
        name: updateData.name,
        description: updateData.description,
        elements: updateData.elements,
        isPublic: updateData.isPublic,
        settings: updateData.settings
    };
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
        if (allowedUpdates[key] === undefined) {
            delete allowedUpdates[key];
        }
    });
    
    const updatedCanvas = await CanvasModel.findByIdAndUpdate(
        canvasId,
        allowedUpdates,
        { new: true, runValidators: true }
    ).populate('owner', 'name email')
     .populate('shared_with.user', 'name email');
    
    return updatedCanvas;
};

const deleteCanvas = async (canvasId, userId) => {
    const canvas = await CanvasModel.findById(canvasId);
    
    if (!canvas) {
        throw new NotFoundException(ERROR_MESSAGES.CANVAS.NOT_FOUND);
    }
    
    // Check if user can delete
    if (!canvas.canUserDelete(userId)) {
        throw new UnauthorizedException(ERROR_MESSAGES.AUTHENTICATION.INSUFFICIENT_PERMISSIONS);
    }
    
    await CanvasModel.findByIdAndDelete(canvasId);
    return { message: "Canvas deleted successfully" };
};

const shareCanvas = async (canvasId, userId, shareData) => {
    const canvas = await CanvasModel.findById(canvasId);
    
    if (!canvas) {
        throw new NotFoundException(ERROR_MESSAGES.CANVAS.NOT_FOUND);
    }
    
    // Only owner can share
    if (canvas.owner.toString() !== userId.toString()) {
        throw new UnauthorizedException(ERROR_MESSAGES.AUTHENTICATION.INSUFFICIENT_PERMISSIONS);
    }
    
    // Find user to share with
    const userToShare = await UserModel.findByEmail(shareData.email);
    if (!userToShare) {
        throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
    }
    
    // Can't share with yourself
    if (userToShare._id.toString() === userId.toString()) {
        throw new ValidationException(VALIDATION_MESSAGES.SHARING.EMAIL_SELF_SHARE);
    }
    
    await canvas.addSharedUser(userToShare._id, shareData.canEdit || false);
    
    return canvas.populate([
        { path: 'owner', select: 'name email' },
        { path: 'shared_with.user', select: 'name email' }
    ]);
};

const unshareCanvas = async (canvasId, userId, targetUserId) => {
    const canvas = await CanvasModel.findById(canvasId);
    
    if (!canvas) {
        throw new NotFoundException(ERROR_MESSAGES.CANVAS.NOT_FOUND);
    }
    
    // Only owner can unshare
    if (canvas.owner.toString() !== userId.toString()) {
        throw new UnauthorizedException(ERROR_MESSAGES.AUTHENTICATION.INSUFFICIENT_PERMISSIONS);
    }
    
    await canvas.removeSharedUser(targetUserId);
    
    return canvas.populate([
        { path: 'owner', select: 'name email' },
        { path: 'shared_with.user', select: 'name email' }
    ]);
};

const updateSharedPermission = async (canvasId, userId, targetUserId, canEdit) => {
    const canvas = await CanvasModel.findById(canvasId);
    
    if (!canvas) {
        throw new NotFoundException(ERROR_MESSAGES.CANVAS.NOT_FOUND);
    }
    
    // Only owner can update permissions
    if (canvas.owner.toString() !== userId.toString()) {
        throw new UnauthorizedException(ERROR_MESSAGES.AUTHENTICATION.INSUFFICIENT_PERMISSIONS);
    }
    
    await canvas.updateSharedUserPermission(targetUserId, canEdit);
    
    return canvas.populate([
        { path: 'owner', select: 'name email' },
        { path: 'shared_with.user', select: 'name email' }
    ]);
};

const getCanvasStats = async (userId) => {
    const stats = await CanvasModel.aggregate([
        {
            $facet: {
                total: [
                    { $match: { owner: userId } },
                    { $count: "count" }
                ],
                shared: [
                    { $match: { "shared_with.user": userId } },
                    { $count: "count" }
                ],
                public: [
                    { $match: { owner: userId, isPublic: true } },
                    { $count: "count" }
                ]
            }
        }
    ]);
    
    return {
        total: stats[0].total[0]?.count || 0,
        shared: stats[0].shared[0]?.count || 0,
        public: stats[0].public[0]?.count || 0
    };
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