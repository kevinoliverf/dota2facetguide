'use client'
import { Card, Button, TextField, Grid, ImageList, ImageListItem } from "@mui/material";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import client from "@/lib/api";
import {components} from "@/lib/api/opendota";
import { get } from "http";
import { HeroList } from "./heroes"; 

export type Hero = components["schemas"]["HeroObjectResponse"];
type TeamMatch = components["schemas"]["TeamMatchObjectResponse"];
type Match = components["schemas"]["MatchResponse"];

type HeroFacetProps = {
    selectedTeam : number;
}


// Map of variant to count
export type HeroVariantPreference = Map<number, number>; 

const HeroFacet: React.FC<HeroFacetProps> = ({selectedTeam}) => {
    const [heroes, setHeroes] = useState<Hero[]>([]); // Add this line
    const [searchTerm, setSearchTerm] = useState('');
    const [heroVariantPrefs, setHeroVariantPrefs] = useState<Map <number, HeroVariantPreference>>(new Map());
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
    async function getMatches(teamId: number) {
        const resp = await client.GET("/teams/{team_id}/matches", {
            params: {
                path: { team_id: teamId },
            },
        });
        const matches = resp.data as TeamMatch[] 

        if (matches.length === 0) {
            return [];
        }
        
        
        const updatePreferences = (newHeroVariantPrefs: Map<number, HeroVariantPreference>, match: Match) => {
            match.players?.forEach(player => {
                if (!(player.hero_id && player.hero_variant)) {
                    return
                }
                const existingPref = newHeroVariantPrefs.get(player.hero_id);
                if (existingPref) {
                    const updatedCount = (existingPref.get(player.hero_variant) || 0) + 1
                    existingPref.set(player.hero_variant, updatedCount) ;
                    newHeroVariantPrefs.set(player.hero_id, existingPref);

                } else {
                    const newPref = new Map<number, number>();
                    newPref.set(player.hero_variant, 1);
                    newHeroVariantPrefs.set(player.hero_id, newPref);
                }
                setHeroVariantPrefs(newHeroVariantPrefs);
            })
        }

        
        const oneMonthAgo = Math.floor((Date.now() / 1000) - (30 * 24 * 60 * 60));
        const newHeroVariantPrefs = new Map();
        for (let index = 0; index < 5; index++) {
            const match = matches[index] as Match;
            if (!match.match_id) {
                continue;
            }
            if (match.start_time && match.start_time < oneMonthAgo) {
                break;
            }
            const matchInfo = await getMatch(match.match_id)
            updatePreferences(newHeroVariantPrefs,matchInfo);
        }

        setHeroVariantPrefs(newHeroVariantPrefs);
        return matches;
    }
    // Add this useEffect
    useEffect(() => {
        getHeroes().then(data => setHeroes(data));
    }, []);
    useEffect(() => {
        getMatches(selectedTeam)
    }, [selectedTeam]);
    const filteredHeroes = heroes?.filter(hero =>
        hero.localized_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <Card className="rounded-md p-5" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
           <HeroList heroes={filteredHeroes} heroVariantPrefs={heroVariantPrefs}/>
        </Card>
    );
}


export default HeroFacet;