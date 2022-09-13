/* eslint-disable no-underscore-dangle */
const nanoid = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exeptions/NotFoundError');

class SongsSerives {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({
        title, year, performer, genre, duration, albumId,
    }) {
        const id = `song-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
        };
        const result = await this._pool.query(query);
        return result.rows[0].id;
    }

    async getSongs(title, performer) {
        if (title && performer) {
            const result = await this._pool.query(
                'SELECT id, title, performer FROM songs WHERE lower(title) LIKE $1 AND lower(performer) LIKE $2',
                [`%${title}%`, `%${performer}%`],
            );
            return result.rows;
        } if (title) {
            const result = await this._pool.query(
                'SELECT id, title, performer FROM songs WHERE lower(title) LIKE $1',
                [`%${title}%`],
            );
            return result.rows;
        } if (performer) {
            const result = await this._pool.query(
                'SELECT id, title, performer FROM songs WHERE lower(performer) LIKE $1',
                [`%${performer}%`],
            );
            return result.rows;
        }

        const result = await this._pool.query('SELECT id, title, performer FROM songs');
        return result.rows;
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT id, title, year, performer, genre, duration, album_id FROM songs WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return result.rows[0];
    }

    async editSongById(id, {
        title, year, performer, genre, duration, albumId,
    }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
            values: [title, year, performer, genre, duration, albumId, updatedAt, id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = SongsSerives;
