'use client'
import React, { useEffect, useState } from "react";

import { Card } from "@mui/material";

import client from "@/lib/api/opendota/client";
import {components} from "@/lib/api/opendota/schema";
import { UpdateTeamData, GetTeamData} from "../lib/db/teamdata";
import { TeamHeroFacet, ListTeamHeroFacets, InsertTeamHeroFacets } from "@/lib/db/teamherofacets";
import { GetProcessedMatch, InsertProcessedMatch } from "@/lib/db/processedmatch";

import { HeroListComponent } from "./herolist"; 

export type Hero = components["schemas"]["HeroObjectResponse"];
type TeamMatch = components["schemas"]["TeamMatchObjectResponse"];
type Match = components["schemas"]["MatchResponse"];



async function getHeroes() {
    const resp = await client.GET("/heroes", {
        params: {
            query: { max_length: 500 },
        },
    });
    const heroes = resp.data as Hero[]
    return heroes;
}

async function getMatch(matchId: number) {
    const matchResp = await client.GET("/matches/{match_id}", {
        params: {
            path: { match_id: matchId },
        },
    });
    const match = matchResp.data as Match

    return match;
}

type TeamHeroFacetComponentProps = {
    selectedTeam: number;
    selectedTeamName: string;
}
const TeamHeroFacetComponent: React.FC<TeamHeroFacetComponentProps> = ({ selectedTeam, selectedTeamName}) => {
    const [heroes, setHeroes] = useState<Hero[]>([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [heroVariantPrefs, setHeroVariantPrefs] = useState<TeamHeroFacet[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    
    const processMatch = async (match: Match, selectedTeam: number, selectedTeamName: string) => {
        // Map <TeamID, Map<HeroID, TeamHeroFacet>>
        const matchTeamPrefs = new Map<number, Map<number, TeamHeroFacet>>();
        if (!match.radiant_team || !match.dire_team)  {
            return
        }

        // Get each teams hero facet preferences
        let radiantTeamId, direTeamId = 0
        radiantTeamId = match.radiant_team['team_id']
        direTeamId = match.dire_team['team_id']
        await ListTeamHeroFacets(radiantTeamId).then(data => {
            const radiantTeamPrefs = new Map<number, TeamHeroFacet>();
            for (const teamHeroFacet of data) {
                radiantTeamPrefs.set(teamHeroFacet.hero_id, teamHeroFacet);
                matchTeamPrefs.set(radiantTeamId, radiantTeamPrefs);
            }
        })

        await ListTeamHeroFacets(direTeamId).then(data => {
            const direTeamPrefs = new Map<number, TeamHeroFacet>();
            for (const teamHeroFacet of data) {
                direTeamPrefs.set(teamHeroFacet.hero_id, teamHeroFacet);
                matchTeamPrefs.set(direTeamId, direTeamPrefs);
            }
        })
        
        // Update the preferences based on the match
        console.log("UpdatePreferences based on match ", match.match_id)
        match.players?.forEach(player => {
            if (!(player.hero_id && player.hero_variant)) {
                return
            }

            console.log("Player", player.account_id, player.hero_id, player.player_slot)
            let team_id = 0;
            if (player.player_slot === undefined || player.player_slot === null) {
                console.log("ERROR: Player slot not found", player)
                return
            }
            if (match.radiant_team && player.player_slot < 128) {
                team_id = match.radiant_team['team_id']
            } else if (match.dire_team) {
                team_id = match.dire_team['team_id']
            }

            let teamHeroFacets = matchTeamPrefs.get(team_id)
            if (!teamHeroFacets) {
                console.log("No Team Hero Facets found", team_id)
                teamHeroFacets = new Map<number, TeamHeroFacet>() 
            }
            let totalVariantPreferenceCount = 1
            const teamHeroFacet = teamHeroFacets.get(player.hero_id)
            if (teamHeroFacet) {
                totalVariantPreferenceCount = teamHeroFacet.count + 1
            } 
            const updatedTeamHeroFacet: TeamHeroFacet = {
                id: undefined,
                team_id: team_id,
                player_id: player.account_id ? player.account_id : 0,
                hero_id: player.hero_id,
                hero_facet: player.hero_variant,
                count: totalVariantPreferenceCount,
                last_updated: new Date(),
            }

            teamHeroFacets.set(player.hero_id, updatedTeamHeroFacet)
            console.log("Pushed Team Hero Facet", updatedTeamHeroFacet)
            matchTeamPrefs.set(team_id, teamHeroFacets)
            console.log("Updated team prefs", matchTeamPrefs)
            InsertTeamHeroFacets(updatedTeamHeroFacet)
        })
       
        let teamHeroFacets = matchTeamPrefs.get(selectedTeam)
        if (!teamHeroFacets) {
            console.log("No Team Hero Facets found for selected team")
            return
        }
        let selectedTeamPreferences: TeamHeroFacet[] = []; 
        teamHeroFacets.forEach((thf) => {
            selectedTeamPreferences.push(thf)
        })

        setHeroVariantPrefs(selectedTeamPreferences);
    }
    
    async function updateTeamData(teamId: number) {
        if (teamId === 0) {
            return [];
        }
        const teamData = await GetTeamData(teamId)
        const today = new Date();
        let matches: TeamMatch[] = [];
        today.setHours(0, 0, 0, 0);
        if (teamData) {
            teamData.last_fetched.setHours(0, 0, 0, 0);
            console.log(today, teamData.last_fetched)
            if (teamData.last_fetched.getTime() === today.getTime()) {
                console.log("Team already processed for today")
                const teamHeroFacets = await ListTeamHeroFacets(teamId)
                setHeroVariantPrefs(teamHeroFacets);
                return [];
            }
        }

        const resp = await client.GET("/teams/{team_id}/matches", {
            params: {
                path: { team_id: teamId },
            },
        });
        matches = resp.data as TeamMatch[]

        if (matches.length === 0) {
            return [];
        }

        UpdateTeamData(teamId, selectedTeamName)

        const oneMonthAgo = Math.floor((Date.now() / 1000) - (30 * 24 * 60 * 60));
        for (let index = 0; index < 10; index++) {
            const match = matches[index] as Match;
            if (!match.match_id) {
                continue;
            }
            if (match.start_time && match.start_time < oneMonthAgo) {
                break;
            }
            if (await GetProcessedMatch(match.match_id)) {
                console.log("Match already processed", match.match_id)
                continue;
            }
            const matchInfo = await getMatch(match.match_id)
            await InsertProcessedMatch({ id: match.match_id })
            await processMatch(matchInfo, selectedTeam, selectedTeamName);
        }

        return matches;
    }
    // Add this useEffect
    useEffect(() => {
        getHeroes().then(data => setHeroes(data));
    }, []);
    useEffect(() => {
        setIsLoading(true);
        updateTeamData(selectedTeam).then(() => setIsLoading(false))
    }, [selectedTeam]);




    const filteredHeroes = heroes?.filter(hero =>
        hero.localized_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
            <HeroListComponent heroes={filteredHeroes} heroVariantPrefs={heroVariantPrefs} />
    );
}


export default TeamHeroFacetComponent;