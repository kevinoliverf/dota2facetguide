'use server'
import pool from '@/lib/postgres'

export type TeamHeroFacet = {
    id: number | undefined;
    team_id: number;
    player_id: number;
    hero_id: number;
    hero_facet: number;
    count: number;
    last_updated: Date;
}

export async function InsertTeamHeroFacets(teamHeroFacet: TeamHeroFacet) {
    const teamherofacet = await GetTeamHeroFacets(teamHeroFacet.team_id, teamHeroFacet.hero_id)
    if (teamherofacet.length > 0){
        const { rows } = await pool.query('UPDATE team_hero_facets SET count = $1, last_updated = $2 WHERE team_id = $3 and hero_id = $4',
        [teamHeroFacet.count, new Date().toISOString(), teamHeroFacet.team_id, teamHeroFacet.hero_id]);
        console.log(rows)
        return
    }
    const { rows } = await pool.query('INSERT INTO team_hero_facets (team_id, player_id, hero_id, hero_facet, count, last_updated) VALUES ($1, $2, $3, $4, $5, $6)',
        [teamHeroFacet.team_id, teamHeroFacet.player_id, teamHeroFacet.hero_id, teamHeroFacet.hero_facet, teamHeroFacet.count, new Date().toISOString()]);
    console.log(rows)
}

export async function GetTeamHeroFacets(teamId: number, hero_id: number) {
    const { rows } = await pool.query('SELECT * FROM team_hero_facets WHERE team_id = $1 and hero_id = $2', [teamId, hero_id]);
    return rows as TeamHeroFacet[];
}
export async function ListTeamHeroFacets(teamId: number) {
    const { rows } = await pool.query('SELECT * FROM team_hero_facets WHERE team_id = $1', [teamId]);
    return rows as TeamHeroFacet[];
}