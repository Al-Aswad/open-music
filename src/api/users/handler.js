const ClientError = require('../../exeptions/ClientError');

class UsersHandler {
    constructor(service, validator) {
        this._usersService = service;
        this._validator = validator;

        this.postUserHandler = this.postUserHandler.bind(this);
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
        this.getUserByUsernameHandler = this.getUserByUsernameHandler.bind(this);
    }

    async postUserHandler(request, h) {
        try {
            this._validator.validateUserPayload(request.payload);
            const { username, password, fullname } = request.payload;

            const userId = await this._usersService.addUser({ username, password, fullname });
            const response = h.response({
                status: 'success',
                message: 'User berhasil ditambahkan',
                data: {
                    userId,
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

    async getUserByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const user = await this._usersService.getUserById(id);
            return {
                status: 'success',
                data: {
                    user,
                },
            };
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

    async getUserByUsernameHandler(request, h) {
        try {
            const { username } = request.query;
            const users = await this._usersService.getUserByUsername(username);
            return {
                status: 'success',
                data: {
                    users,
                },
            };
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

module.exports = UsersHandler;
