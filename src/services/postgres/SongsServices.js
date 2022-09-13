/* eslint-disable no-underscore-dangle */
const nanoid = require('nanoid');
const { Pool } = require('pg');

class SongsSerives {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({
        title, year, performer, genre, duration, albumId,
    }) {
        const id = `album-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
        };
        const result = await this._pool.query(query);
        return result.rows[0].id;
    }

    async getSongs() {
        const query = {
            text: 'SELECT id, title, performer FROM songs',
        };
        const result = await this._pool.query(query);
        return result.rows;
    }
}

module.exports = SongsSerives;
