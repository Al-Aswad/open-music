/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const InvariantError = require('../../exeptions/InvariantError');

class AuthenticationsService {
    constructor(cacheService) {
        this._pool = new Pool();

        this._cacheService = cacheService;
    }

    async addRefreshToken(token) {
        const query = {
            text: 'INSERT INTO authentications VALUES($1)',
            values: [token],
        };

        await this._cacheService.delete(`auth:${token}`);
        await this._pool.query(query);
    }

    async verifyRefreshToken(token) {
        try {
            await this._cacheService.get(`auth:${token}`);
        } catch (error) {
            const query = {
                text: 'SELECT token FROM authentications WHERE token = $1',
                values: [token],
            };
            const result = await this._pool.query(query);

            if (!result.rows.length) {
                throw new InvariantError('Refresh token tidak valid');
            }

            await this._cacheService.set(`auth:${token}`, true);
        }
    }

    async deleteRefreshToken(token) {
        await this.verifyRefreshToken(token);
        const query = {
            text: 'DELETE FROM authentications WHERE token = $1',
            values: [token],
        };
        await this._pool.query(query);
        await this._cacheService.delete(`auth:${token}`);
    }
}

module.exports = AuthenticationsService;
