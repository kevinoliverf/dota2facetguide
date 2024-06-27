'use server'
import pool from '@/lib/postgres'

export type TeamData = {
    team_id: number;
    team_name: string;
    last_fetched: Date;
}


export async function GetTeamData(teamId: number) {
    console.log("Getting TeamData of team id", teamId)
    const { rows } = await pool.query('SELECT * FROM team_data WHERE team_id = $1', [teamId]);
    return rows[0] as TeamData;
}


export async function UpdateTeamData(teamId: number, teamName: string) {
    console.log("Updating TeamData of team id", teamId)
    const { rows } = await pool.query("INSERT INTO team_data (team_id, team_name, last_fetched) VALUES ($1, $2, $3) \
        ON CONFLICT (team_id) DO UPDATE SET last_fetched = $3 ",
         [teamId, teamName, new Date().toISOString()]);
    console.log(rows)
}

