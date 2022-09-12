require('dotenv').config();
const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const songs = require('./api/songs');
const AlbumsSerives = require('./services/postgres/AlbumServices');
const SongsSerives = require('./services/postgres/SongsServices');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');

const init = async () => {
    const albumsServices = new AlbumsSerives();
    const songsServices = new SongsSerives();
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register({
        plugin: albums,
        options: {
            service: albumsServices,
            validator: AlbumsValidator,
        },
    });
    await server.register({
        plugin: songs,
        options: {
            service: songsServices,
            validator: SongsValidator,
        },
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
