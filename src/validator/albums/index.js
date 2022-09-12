const InvariantError = require('../../exeptions/InvariantError');
const { NotePayloadSchema } = require('./schema');

const AlbumsValidator = {
  validateNotePayload: (payload) => {
    const validationResult = NotePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
