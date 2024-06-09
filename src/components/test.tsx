'use client'
import { Card, Button, TextField, Grid, ImageList, ImageListItem } from "@mui/material";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import client from "@/lib/api";
import {components} from "@/lib/api/opendota";
import { get } from "http";

type Hero = components["schemas"]["HeroObjectResponse"];
type TeamMatch = components["schemas"]["TeamMatchObjectResponse"];
type Match = components["schemas"]["MatchResponse"];

type CreateTaskFormProps = {
    userID : string;
}


type HeroVariantPreference = {
    [variant: number]: number;
}
function heroVariantPreferenceToString(heroVariantPreference: HeroVariantPreference | undefined): string {
    if (!heroVariantPreference) {
        return '';
    }
    let variants = '';
    for (const variant in heroVariantPreference) {
        variants += `Variant ${variant}: ${heroVariantPreference[variant]}, `;
    }
    return `${variants}`;
}
const CreateTaskForm: NextPage = () => {
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
        
        //const match = await getMatch(matches[0].match_id ? matches[0].match_id : 0);    
        const match1 = await getMatch(7759259291);
        const match2 = await getMatch(7758894564);
        const updatePreferences = (match: Match) => {
            match.players?.forEach(player => {
                if (!(player.hero_id && player.hero_variant)) {
                    return
                }
                const existingPref = heroVariantPrefs.get(player.hero_id);
                if (existingPref) {
                    existingPref[player.hero_variant] = (existingPref[player.hero_variant] || 0) + 1;
                    heroVariantPrefs.set(player.hero_id, existingPref);

                } else {
                    const newPref: HeroVariantPreference = {
                        [player.hero_variant]: 1
                    };
                    heroVariantPrefs.set(player.hero_id, newPref);
                }
                setHeroVariantPrefs(new Map(heroVariantPrefs));
            })
        }

        updatePreferences(match1);
        updatePreferences(match2);
       
        heroVariantPrefs.forEach((pref, heroId) => {
            console.log(`Hero ID: ${heroId}, Preference: ${heroVariantPreferenceToString(pref)}`);
        })
        return matches;
    }
    // Add this useEffect
    useEffect(() => {
        getHeroes().then(data => setHeroes(data));
        getMatches(9247354)
    }, []);

    const filteredHeroes = heroes?.filter(hero =>
        hero.localized_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <Card className="rounded-md p-5" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <TextField
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <ImageList sx={{ width: 1000, height: 450 }} cols={5} rowHeight={164}>
                {filteredHeroes?.map((hero) => (
                    <div>
                    <ImageListItem key={hero.id}>
                        <img
                            src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.name?.replace('npc_dota_hero_', '')}.png`}
                                alt={hero.localized_name}
                                loading="lazy"
                            />
                        </ImageListItem>
                        {
                           heroVariantPrefs.get(hero.id)
                           ? heroVariantPreferenceToString(heroVariantPrefs.get(hero.id))
                           : <span>No preferences for this hero</span>
                        }
                    </div>


                ))}
            </ImageList>
        </Card>
    );
}


export default CreateTaskForm;