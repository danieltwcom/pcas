const pg = require('pg');

if (process.env.NODE_ENV === 'production') {
    pg.defaults.size = 20;
    var pool = new pg.Client(process.env.DATABASE_URL);
    pool.connect();
} else {
    var pool = new pg.Pool({
        user: process.env.PGSQL_USER,
        host: process.env.DATABASE_URL,
        password:process.env.PGSQL_PASSWORD,
        database: process.env.PGSQL_DATABASE,
        max:process.env.PGSQL_MAX,
        port: process.env.DB_PORT
    });
}

module.exports = pool;