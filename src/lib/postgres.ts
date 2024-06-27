import { Pool } from 'pg';
import fs from 'fs';

let pgclient: Pool;
if (process.env.PG_CACERT) {
    pgclient = new Pool({
        connectionString: process.env.PG_CONNSTRING,
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync(process.env.PG_CACERT).toString(),
        },
        connectionTimeoutMillis: 5000,

    })
} else{
    pgclient = new Pool({
        connectionString: process.env.PG_CONNSTRING,
        connectionTimeoutMillis: 500,
    })
}


pgclient.on('error', (err, client) => {
    client.on('error', error => console.error(`${new Date().toISOString()} - PG client error:`, error));
})

export default pgclient;