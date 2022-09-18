const nanoid = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exeptions/InvariantError');
const NotFoundError = require('../../exeptions/NotFoundError');

/* eslint-disable no-underscore-dangle */
class AlbumsSerives {
    constructor(cacheService) {
        this._pool = new Pool();

        this._cacheService = cacheService;
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

    async addAlbumLikeById(userId, albumId) {
        const id = `user-album-like-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO user_album_likes(id, user_id, album_id) VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal menambahkan like');
        }

        await this._cacheService.delete(`likes:album-${albumId}`);
        return 'Album berhasil disukai';
    }

    async verifyAlbumExist(id) {
        const query = {
            text: 'SELECT id FROM albums WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }
    }

    async countAlbumLikeById(albumId) {
        try {
            const result = await this._cacheService.get(`likes:album-${albumId}`);
            return JSON.parse(result);
        } catch (error) {
            const query = {
                text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };
            const result = await this._pool.query(query);
            await this._cacheService.set(`likes:album-${albumId}`, JSON.stringify(result.rows[0].count));
            return result.rows[0].count;
        }
    }

    async verifyAlbumLikeExist(userId, albumId) {
        const query = {
            text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            return false;
        }
        return true;
    }

    async deleteAlbumLikeById(userId, albumId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        };
        const result = await this._pool.query(query);
        await this._cacheService.delete(`likes:album-${albumId}`);
        if (!result.rows.length) {
            throw new InvariantError('Gagal menghapus like');
        }
    }
}

module.exports = AlbumsSerives;
