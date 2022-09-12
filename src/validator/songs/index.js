const InvariantError = require('../../exeptions/InvariantError');
const { AlbumPayloadSchema } = require('./schema');

const SongsValidator = {
    validateAlbumPayload: (payload) => {
        const validationResult = AlbumPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = SongsValidator;
