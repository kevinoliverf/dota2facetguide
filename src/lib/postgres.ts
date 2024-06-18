import { Pool } from 'pg';

const pgclient = (() => {
    console.log("CREATE NEW PG CLIENT")
    const pgclient = new Pool({
        connectionString: process.env.PGCONNSTRING,
    }
    )
    return pgclient;
})();



export default pgclient;