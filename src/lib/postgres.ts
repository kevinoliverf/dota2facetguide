import { Pool } from 'pg';
import fs from 'fs';

let pgclient: Pool;
if (process.env.PGCACERT) {
    pgclient = new Pool({
        connectionString: process.env.PGCONNSTRING,
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync(process.env.PGCACERT).toString(),
        },
        connectionTimeoutMillis: 5000,

    })
} else{
    pgclient = new Pool({
        connectionString: process.env.PGCONNSTRING,
        connectionTimeoutMillis: 500,
    })
}


pgclient.on('error', (err, client) => {
    client.on('error', error => console.error(`${new Date().toISOString()} - PG client error:`, error));
})

export default pgclient;