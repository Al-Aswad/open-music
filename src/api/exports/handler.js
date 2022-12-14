const ClientError = require('../../exeptions/ClientError');

class ExportsHandler {
    constructor(service, playlistService, validator) {
        this._service = service;
        this._validator = validator;
        this._playlistService = playlistService;

        this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }

    async postExportPlaylistHandler(request, h) {
        try {
            this._validator.ValidateExportsPlaylistPayload(request.payload);

            const { playlistId } = request.params;
            await this._playlistService.verifyPlaylistAccess(
                playlistId,
                request.auth.credentials.id,
            );

            // const message = {
            //     playlistId,
            //     userId: request.auth.credentials.id,
            //     targetEmail: request.payload.targetEmail,
            // };

            // await this._service.sendMessage('export:playlists', JSON.stringify(message));

            const message = {
                playlistId,
                userId: request.auth.credentials.id,
                targetEmail: request.payload.targetEmail,
            };

            await this._service.sendMessage('export:playlists', JSON.stringify(message));

            const response = h.response({
                status: 'success',
                message: 'Permintaan Anda sedang kami proses',
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = ExportsHandler;
