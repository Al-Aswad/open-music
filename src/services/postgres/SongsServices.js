/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');

class SongsSerives {
    constructor() {
        this._pool = new Pool();
    }
}

module.exports = SongsSerives;
