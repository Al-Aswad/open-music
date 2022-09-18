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
            text: 'SELECT id,name,year, cover FROM albums WHERE id = $1',
            values: [id],
        };
        const querySongs = {
            text: 'SELECT id,title,performer FROM songs WHERE album_id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        const resultSongs = await this._pool.query(querySongs);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        const { cover: ulrImage } = result.rows[0];
        let coverUrl = null;
        if (ulrImage !== null) {
            coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/cover/${ulrImage}`;
        }

        delete result.rows[0].cover;

        const albumResult = {
            ...result.rows[0],
            coverUrl,
        };

        return {
            ...albumResult,
            songs: resultSongs.rows,
        };
    }

    async editAlbumById(id, {
        name, year,
    }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }

    async addAlbumCoverById(id, meta) {
        const filename = +new Date() + meta.filename;
        const query = {
            text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING cover',
            values: [filename, id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gambar untuk album gagal diunggah');
        }

        return result.rows[0].cover;
    }
}

module.exports = AlbumsSerives;
