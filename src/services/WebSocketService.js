const jwt = require('jsonwebtoken');
const Canvas = require('../models/CanvasModel');
const User = require('../models/UserModel');
const { WEBSOCKET } = require('../constants');

class WebSocketService {
    constructor(io) {
        this.io = io;
        this.canvasRooms = new Map(); // canvasId -> Set of socketIds
        this.userSessions = new Map(); // socketId -> { userId, canvasId, userInfo }
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    setupMiddleware() {
        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                
                if (!token) {
                    return next(new Error(WEBSOCKET.ERRORS.TOKEN_REQUIRED));
                }

                // Use a fallback JWT_SECRET for development if not set
                const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';
                if (!process.env.JWT_SECRET) {
                    console.warn('JWT_SECRET not configured, using fallback for development');
                }

                const decoded = jwt.verify(token, jwtSecret);
                
                // Check if we have the user ID (it might be 'id' or 'userId')
                const userId = decoded.id || decoded.userId;
                if (!userId) {
                    return next(new Error(WEBSOCKET.ERRORS.TOKEN_STRUCTURE));
                }
                
                const user = await User.findById(userId).select('name email');
                
                if (!user) {
                    return next(new Error(WEBSOCKET.ERRORS.USER_NOT_FOUND));
                }

                socket.userId = userId;
                socket.userInfo = user;
                next();
            } catch (error) {
                console.error('WebSocket auth error:', error.message);
                next(new Error(WEBSOCKET.ERRORS.TOKEN_INVALID));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            // Join canvas room
            socket.on(WEBSOCKET.EVENTS.JOIN_CANVAS, async (data) => {
                await this.handleJoinCanvas(socket, data);
            });

            // Handle canvas updates
            socket.on(WEBSOCKET.EVENTS.CANVAS_UPDATE, async (data) => {
                await this.handleCanvasUpdate(socket, data);
            });

            // Handle cursor position updates
            socket.on(WEBSOCKET.EVENTS.CURSOR_UPDATE, (data) => {
                this.handleCursorUpdate(socket, data);
            });

            // Handle element creation
            socket.on(WEBSOCKET.EVENTS.ELEMENT_CREATE, async (data) => {
                await this.handleElementCreate(socket, data);
            });

            // Handle element update
            socket.on(WEBSOCKET.EVENTS.ELEMENT_UPDATE, async (data) => {
                await this.handleElementUpdate(socket, data);
            });

            // Handle element delete
            socket.on(WEBSOCKET.EVENTS.ELEMENT_DELETE, async (data) => {
                await this.handleElementDelete(socket, data);
            });

            // Handle canvas name update
            socket.on(WEBSOCKET.EVENTS.CANVAS_NAME_UPDATE, async (data) => {
                await this.handleCanvasNameUpdate(socket, data);
            });

            // Handle disconnect
            socket.on(WEBSOCKET.EVENTS.DISCONNECT, () => {
                this.handleDisconnect(socket);
            });
        });
    }

    async handleJoinCanvas(socket, data) {
        try {
            const { canvasId } = data;
            
            if (!canvasId) {
                socket.emit('error', { message: 'Canvas ID is required' });
                return;
            }

            // Check if user has access to this canvas
            const canvas = await Canvas.findByCanvasId(canvasId, socket.userId);
            if (!canvas) {
                socket.emit('error', { message: WEBSOCKET.ERRORS.ACCESS_DENIED });
                return;
            }

            // Join the canvas room
            socket.join(`${WEBSOCKET.ROOM_PREFIX}${canvasId}`);
            
            // Store user session
            this.userSessions.set(socket.id, {
                userId: socket.userId,
                canvasId: canvasId,
                userInfo: socket.userInfo
            });

            // Add to canvas rooms tracking
            if (!this.canvasRooms.has(canvasId)) {
                this.canvasRooms.set(canvasId, new Set());
            }
            
            // Remove any existing connections from the same user to prevent duplicates
            const existingSocketIds = this.canvasRooms.get(canvasId);
            for (const existingSocketId of existingSocketIds) {
                const existingSession = this.userSessions.get(existingSocketId);
                if (existingSession && existingSession.userId === socket.userId) {
                    // Remove the old connection
                    existingSocketIds.delete(existingSocketId);
                    this.userSessions.delete(existingSocketId);
                }
            }
            
            // Add the new connection
            this.canvasRooms.get(canvasId).add(socket.id);

            // Send current canvas data to the joining user
            socket.emit('canvas-joined', {
                canvasId,
                elements: canvas.elements,
                name: canvas.name,
                owner: canvas.owner,
                shared_with: canvas.shared_with,
                isPublic: canvas.isPublic
            });

            // Get current room users
            const roomUsers = this.getRoomUsers(canvasId);
            
            // Notify other users in the room about the new user
            socket.to(`${WEBSOCKET.ROOM_PREFIX}${canvasId}`).emit(WEBSOCKET.EVENTS.USER_JOINED, {
                userId: socket.userId,
                userInfo: socket.userInfo,
                timestamp: new Date()
            });

            // Send current users in the room to the joining user
            socket.emit(WEBSOCKET.EVENTS.ROOM_USERS, roomUsers);
            
            // Broadcast updated user list to all users in the room
            this.io.to(`${WEBSOCKET.ROOM_PREFIX}${canvasId}`).emit(WEBSOCKET.EVENTS.ROOM_USERS, roomUsers);


        } catch (error) {
            console.error('Error joining canvas:', error);
            socket.emit('error', { message: WEBSOCKET.ERRORS.JOIN_FAILED });
        }
    }

    async handleCanvasUpdate(socket, data) {
        try {
            const { canvasId, elements, name } = data;
            
            const userSession = this.userSessions.get(socket.id);
            
            if (!userSession || userSession.canvasId !== canvasId) {
                socket.emit('error', { message: WEBSOCKET.ERRORS.NOT_IN_ROOM });
                return;
            }

            // Check if user has edit permission
            const canvas = await Canvas.findByCanvasId(canvasId, socket.userId);
            
            if (!canvas) {
                socket.emit('error', { message: WEBSOCKET.ERRORS.CANVAS_NOT_FOUND });
                return;
            }
            
            const canEdit = canvas.canUserEdit(socket.userId);
            
            if (!canEdit) {
                socket.emit('error', { message: WEBSOCKET.ERRORS.NO_EDIT_PERMISSION });
                return;
            }

            // Update canvas in database
            const updateData = {};
            if (elements !== undefined) updateData.elements = elements;
            if (name !== undefined) updateData.name = name;

            await Canvas.findByIdAndUpdate(canvasId, updateData, { new: true });

            // Broadcast update to other users in the room
            socket.to(`${WEBSOCKET.ROOM_PREFIX}${canvasId}`).emit(WEBSOCKET.EVENTS.CANVAS_UPDATED, {
                canvasId,
                elements,
                name,
                updatedBy: socket.userId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error updating canvas:', error);
            socket.emit('error', { message: WEBSOCKET.ERRORS.UPDATE_FAILED });
        }
    }

    async handleElementCreate(socket, data) {
        try {
            const { canvasId, element } = data;
            
            const userSession = this.userSessions.get(socket.id);
            
            if (!userSession || userSession.canvasId !== canvasId) {
                return;
            }

            // Check if user has edit permission
            const canvas = await Canvas.findByCanvasId(canvasId, socket.userId);
            
            if (!canvas) {
                return;
            }
            
            const canEdit = canvas.canUserEdit(socket.userId);
            
            if (!canEdit) {
                return;
            }

            // Add element to canvas in database
            await Canvas.findByIdAndUpdate(
                canvasId,
                { $push: { elements: element } },
                { new: true }
            );

            // Broadcast element creation to other users
            socket.to(`canvas-${canvasId}`).emit('element-created', {
                canvasId,
                element,
                createdBy: socket.userId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error creating element:', error);
        }
    }

    async handleElementUpdate(socket, data) {
        try {
            const { canvasId, elementId, updates } = data;
            const userSession = this.userSessions.get(socket.id);
            
            if (!userSession || userSession.canvasId !== canvasId) {
                return;
            }

            // Check if user has edit permission
            const canvas = await Canvas.findByCanvasId(canvasId, socket.userId);
            if (!canvas || !canvas.canUserEdit(socket.userId)) {
                return;
            }

            // Update element in database
            await Canvas.findByIdAndUpdate(
                canvasId,
                { $set: { [`elements.$[elem]`]: { ...updates, id: elementId } } },
                { 
                    new: true,
                    arrayFilters: [{ "elem.id": elementId }]
                }
            );

            // Broadcast element update to other users immediately
            socket.to(`canvas-${canvasId}`).emit('element-updated', {
                canvasId,
                elementId,
                updates,
                updatedBy: socket.userId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error updating element:', error);
        }
    }

    async handleElementDelete(socket, data) {
        try {
            const { canvasId, elementId } = data;
            const userSession = this.userSessions.get(socket.id);
            
            if (!userSession || userSession.canvasId !== canvasId) {
                return;
            }

            // Check if user has edit permission
            const canvas = await Canvas.findByCanvasId(canvasId, socket.userId);
            if (!canvas || !canvas.canUserEdit(socket.userId)) {
                return;
            }

            // Remove element from database
            await Canvas.findByIdAndUpdate(
                canvasId,
                { $pull: { elements: { id: elementId } } },
                { new: true }
            );

            // Broadcast element deletion to other users
            socket.to(`canvas-${canvasId}`).emit('element-deleted', {
                canvasId,
                elementId,
                deletedBy: socket.userId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error deleting element:', error);
        }
    }

    async handleCanvasNameUpdate(socket, data) {
        try {
            const { canvasId, name } = data;
            const userSession = this.userSessions.get(socket.id);
            
            if (!userSession || userSession.canvasId !== canvasId) {
                return;
            }

            // Check if user has edit permission
            const canvas = await Canvas.findByCanvasId(canvasId, socket.userId);
            if (!canvas || !canvas.canUserEdit(socket.userId)) {
                return;
            }

            // Update canvas name in database
            await Canvas.findByIdAndUpdate(canvasId, { name });

            // Broadcast name update to other users
            socket.to(`canvas-${canvasId}`).emit('canvas-name-updated', {
                canvasId,
                name,
                updatedBy: socket.userId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error updating canvas name:', error);
        }
    }

    handleCursorUpdate(socket, data) {
        const { canvasId, position } = data;
        const userSession = this.userSessions.get(socket.id);
        
        if (!userSession || userSession.canvasId !== canvasId) {
            return;
        }

        // Broadcast cursor position to other users
        socket.to(`canvas-${canvasId}`).emit('cursor-updated', {
            userId: socket.userId,
            userInfo: socket.userInfo,
            position,
            timestamp: new Date()
        });
    }

    handleDisconnect(socket) {
        const userSession = this.userSessions.get(socket.id);
        
        if (userSession) {
            const { canvasId } = userSession;
            
            // Remove from canvas rooms tracking
            if (this.canvasRooms.has(canvasId)) {
                this.canvasRooms.get(canvasId).delete(socket.id);
                if (this.canvasRooms.get(canvasId).size === 0) {
                    this.canvasRooms.delete(canvasId);
                }
            }

            // Notify other users about the disconnect
            socket.to(`canvas-${canvasId}`).emit('user-left', {
                userId: socket.userId,
                userInfo: socket.userInfo,
                timestamp: new Date()
            });

            // Remove user session
            this.userSessions.delete(socket.id);

            // Get updated room users and broadcast to all remaining users
            const roomUsers = this.getRoomUsers(canvasId);
            this.io.to(`canvas-${canvasId}`).emit('room-users', roomUsers);


        }
    }

    getRoomUsers(canvasId) {
        const roomUsers = [];
        const socketIds = this.canvasRooms.get(canvasId);
        const uniqueUsers = new Map(); // Track unique users by userId
        
        if (socketIds) {
            socketIds.forEach(socketId => {
                const session = this.userSessions.get(socketId);
                if (session) {
                    // Only add if this user isn't already in the list
                    if (!uniqueUsers.has(session.userId)) {
                        uniqueUsers.set(session.userId, {
                            userId: session.userId,
                            userInfo: session.userInfo
                        });
                    }
                }
            });
        }
        

        
        // Convert Map values to array
        return Array.from(uniqueUsers.values());
    }


}

module.exports = WebSocketService; 