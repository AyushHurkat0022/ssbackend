const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const { ValidationException, NotFoundException, UnauthorizedException } = require("../exceptions");
const { SALT_ROUNDS, ERROR_MESSAGES, VALIDATION_MESSAGES } = require("../constants");

const register = async (name, email, password) => {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        throw new ValidationException(ERROR_MESSAGES.USER.ALREADY_EXISTS, {
            email: VALIDATION_MESSAGES.USER.EMAIL_ALREADY_EXISTS
        });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create({
        name,
        email,
        password: hashedPassword
    });

    return user.toSafeObject();
};

const login = async (email, password) => {
    const user = await UserModel.findByEmail(email);
    if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND, {
            email: VALIDATION_MESSAGES.USER.EMAIL_NOT_FOUND
        });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
        throw new UnauthorizedException(ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS, {
            password: VALIDATION_MESSAGES.USER.PASSWORD_INCORRECT
        });
    }

    return user;
};

const getUserByEmail = async (email) => {
    const user = await UserModel.findByEmail(email);
    if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND, {
            email: VALIDATION_MESSAGES.USER.EMAIL_NOT_FOUND
        });
    }
    return user.toSafeObject();
};

module.exports = {
    register,
    login,
    getUserByEmail
};