const InvariantError = require('../../exeptions/InvariantError');
const { UserPayloadSchema } = require('./shema');

const UserValidator = {
    validateUserPayload: (payload) => {
        const validationResult = UserPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = UserValidator;
