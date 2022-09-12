const nanoid = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exeptions/InvariantError');
const NotFoundError = require('../../exeptions/NotFoundError');

/* eslint-disable no-underscore-dangle */
class AlbumsSerives {
    constructor() {
        this._pool = new Pool();
    }

    async getAlbums() {
        const query = {
            text: 'SELECT * FROM albums',
        };
        const result = await this._pool.query(query);
        return result.rows;
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, year, createdAt, updatedAt],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Album gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT id,name,year FROM albums WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return result.rows[0];
    }

    async editAlbumById(id, {
        title, year, performer, songId,
    }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE albums SET title = $1, year = $2, performer = $3, song_id = $4, updated_at = $5 WHERE id = $6 RETURNING id',
            values: [title, year, performer, songId, updatedAt, id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumsSerives;
