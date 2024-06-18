import { useState } from "react";

import { Card, TextField, ImageList, ImageListItem, Autocomplete, List, ListItem } from "@mui/material";

import { TeamHeroFacet } from "@/lib/db/teamherofacets";

import { Hero } from "./teamherofacets";
import { FacetComponent } from "./facet";

type HeroListComponentProps = {
    heroes : Hero[];
    heroVariantPrefs : TeamHeroFacet[];
}

export const HeroListComponent: React.FC<HeroListComponentProps> = ({ heroes, heroVariantPrefs }) => {
    const [searchTerm, setSearchTerm] = useState('All');
    const filteredHeroes = heroes?.filter(hero =>
        searchTerm === 'All' || hero.localized_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let heroList: string[] = []
    heroes.forEach(hero => heroList.push(hero.localized_name ? hero.localized_name : ''))
    heroList.sort()
    heroList.unshift('All')
    return (
        <div className="rounded-md p-5" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <Autocomplete className="p-5"
                options={heroList}
                renderInput={
                    (params) => <TextField {...params} label="Heroes" variant="outlined" />
                }
                onChange={(_, value) => {
                    setSearchTerm(value ? value : 'All')
                }
                }
            />
            <List className="p-1" sx={{ width: 1, height: 1 }}>
                {filteredHeroes?.map((hero) => {
                    let heroPreferences: TeamHeroFacet[] = []
                    heroVariantPrefs.forEach((teamHeroFacet) => {
                        if (teamHeroFacet.hero_id === hero.id) {
                            heroPreferences.push(teamHeroFacet)
                        }
                    })
                    if (heroPreferences.length > 0) {

                        return (
                            <Card key={hero.id}>
                                <ListItem className="p-1" sx={{ width: 1, height: 1 / 2 }}>
                                    <img
                                        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.name?.replace('npc_dota_hero_', '')}.png`}
                                        alt={hero.localized_name}
                                        loading="lazy"
                                    />
                                <FacetComponent hero={hero} preference={heroPreferences} />
                                </ListItem>
                            </Card>


                        )
                    }
                })}
            </List>
        </div>
    );
}