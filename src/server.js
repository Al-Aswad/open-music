require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// user
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UserValidator = require('./validator/users');
// album
const albums = require('./api/albums');
const AlbumsSerives = require('./services/postgres/AlbumServices');
const StorageService = require('./services/storage/StorageService');
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
// playlist
const playlists = require('./api/playlists');
const PlaylistsValidator = require('./validator/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsValidator = require('./validator/Collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');

// export
const _exports = require('./api/exports');
const ExportService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// CacheService
const CacheService = require('./services/redis/CacheService');

const init = async () => {
    const cacheService = new CacheService();
    const albumsServices = new AlbumsSerives(cacheService);
    const songsServices = new SongsSerives();
    const usersServices = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const storageService = new StorageService(path.resolve(__dirname, 'api/albums/uploads/file/images'));

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
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsServices,
                storageService,
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
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistsValidator,
            },
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: _exports,
            options: {
                service: ExportService,
                playlistService: playlistsService,
                validator: ExportsValidator,
            },
        },
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
