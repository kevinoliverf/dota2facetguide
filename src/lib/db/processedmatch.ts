'use server'
import pool from '@/lib/postgres'

export type ProcessedMatches = {
    id : number;
}

export async function InsertProcessedMatch(match: ProcessedMatches) {
    console.log("Inserting Match", match.id)
    const { rows } = await pool.query('INSERT INTO processed_matches (id) VALUES ($1)',
        [match.id]);
}

export async function GetProcessedMatch(matchId: number) {
    console.log("Getting Match", matchId)
    const { rows } = await pool.query('SELECT * FROM processed_matches WHERE id = $1', [matchId]);
    return rows[0] as ProcessedMatches;
}