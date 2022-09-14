/* eslint-disable camelcase */
const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../../exeptions/InvariantError');
const AuthorizationError = require('../../exeptions/AuthorizationError');
const NotFoundError = require('../../exeptions/NotFoundError');

class PlaylistsService {
    constructor(collaborationsService) {
        this._pool = new Pool();

        this._collaborationService = collaborationsService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);
        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `
                SELECT playlists.id, playlists.name, users.username FROM playlists
                INNER JOIN users ON playlists.owner = users.id
                LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async addSongToPlaylist(playlist_id, song_id) {
        const id = `playlistsong-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlist_id, song_id],
        };

        const result = await this._pool.query(query);
        return result.rows[0].id;
    }

    async verifySongAvailable(song_id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [song_id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal ditambahkan ke playlist. Id lagu tidak ditemukan');
        }
    }

    async getSongsFromPlaylist(playlist_id) {
        // get playlist with owner
        const query = {
            text: 'SELECT playlists.id,playlists.name,users.username FROM playlists INNER JOIN users ON playlists.owner = users.id WHERE playlists.id = $1',
            values: [playlist_id],
        };

        const resultPlaylists = await this._pool.query(query);

        if (!resultPlaylists.rows.length) {
            throw new InvariantError('Playlist tidak ditemukan');
        }

        // get songs from playlist
        const query2 = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM songs LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
            values: [playlist_id],
        };

        const resultSongs = await this._pool.query(query2);

        return {
            ...resultPlaylists.rows[0],
            songs: resultSongs.rows,
        };
    }

    async deleteSongFromPlaylist(playlist_id, song_id) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlist_id, song_id],
        };

        await this._pool.query(query);
        await this.deleteSong(song_id);
    }

    async deleteSong(id) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE song_id = $1',
            values: [id],
        };

        await this._pool.query(query);
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }

        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlist_id, user_id) {
        try {
            await this.verifyPlaylistOwner(playlist_id, user_id);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationService.verifyCollaborator(playlist_id, user_id);
            } catch {
                throw error;
            }
        }
    }
}

module.exports = PlaylistsService;
