const ClientError = require('../../exeptions/ClientError');

class Playlistshandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
        this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
        this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
        this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
        try {
            this._validator.validatePlaylistPayload(request.payload);
            const { name } = request.payload;
            const { id: credentialId } = request.auth.credentials;

            const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

            const response = h.response({
                status: 'success',
                message: 'Playlist berhasil ditambahkan',
                data: {
                    playlistId,
                },
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

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getPlaylistsHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const playlists = await this._service.getPlaylists(credentialId);

            const response = h.response({
                status: 'success',
                data: {
                    playlists,
                },
            });
            response.code(200);
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

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async deletePlaylistByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;
            await this._service.verifyPlaylistOwner(id, credentialId);
            await this._service.deletePlaylistById(id);

            const response = h.response({
                status: 'success',
                message: 'Playlist berhasil dihapus',
            });
            response.code(200);
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

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async postSongToPlaylistHandler(request, h) {
        try {
            this._validator.validateSongToPlaylistPayload(request.payload);
            const { id } = request.params;
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;

            await this._service.verifyPlaylistAccess(id, credentialId);
            await this._service.verifySongAvailable(songId);
            await this._service.addSongToPlaylist(id, songId);

            await this._service.addPlaylistActivity(id, songId, credentialId, 'add', id);

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan ke playlist',
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

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getSongsFromPlaylistHandler(request, h) {
        try {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;
            await this._service.verifyPlaylistAccess(id, credentialId);
            const playlist = await this._service.getSongsFromPlaylist(id);

            const response = h.response({
                status: 'success',
                data: {
                    playlist,
                },
            });
            response.code(200);
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

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async deleteSongFromPlaylistHandler(request, h) {
        try {
            this._validator.deleteSongFromPlaylistPayload(request.payload);
            const { id } = request.params;
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;
            await this._service.verifyPlaylistAccess(id, credentialId);
            await this._service.deleteSongFromPlaylist(id, songId);
            await this._service.addPlaylistActivity(id, songId, credentialId, 'delete', id);

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil dihapus dari playlist',
            });
            response.code(200);
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

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getPlaylistActivitiesHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const { id } = request.params;

            await this._service.verifyPlaylistAccess(id, credentialId);
            const activities = await this._service.getPlaylistActivities(id);

            const response = h.response({
                status: 'success',
                data: {
                    playlistId: id,
                    activities,
                },
            });
            response.code(200);
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

            // Server ERROR!
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

module.exports = Playlistshandler;
