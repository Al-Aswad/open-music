const InvariantError = require('../../exeptions/InvariantError');
const ExportPlaylistSchema = require('./schema');

const ExportsValidator = {
    ValidateExportsPlaylistPayload: (payload) => {
        const validateResult = ExportPlaylistSchema.validate(payload);

        if (validateResult.error) {
            throw new InvariantError(validateResult.error);
        }
    },
};

module.exports = ExportsValidator;
