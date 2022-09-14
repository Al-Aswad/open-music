require('dotenv').config();
const Hapi = require('@hapi/hapi');

// user
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UserValidator = require('./validator/users');
// album
const albums = require('./api/albums');
const AlbumsSerives = require('./services/postgres/AlbumServices');
const AlbumsValidator = require('./validator/albums');
// song
const songs = require('./api/songs');
const SongsSerives = require('./services/postgres/SongsServices');
const SongsValidator = require('./validator/songs');
// authentication
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokeniz/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

const init = async () => {
    const albumsServices = new AlbumsSerives();
    const songsServices = new SongsSerives();
    const usersServices = new UsersService();
    const authenticationsService = new AuthenticationsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsServices,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsServices,
                validator: SongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersServices,
                validator: UserValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                service: authenticationsService,
                usersService: usersServices,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
