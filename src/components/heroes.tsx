import { Card, TextField, ImageList, ImageListItem } from "@mui/material";
import { Hero, HeroVariantPreference } from "./test";
import { FacetComponent } from "./facet";
import { useState } from "react";

type HeroListProps = {
    heroes : Hero[];
    heroVariantPrefs : Map<number, HeroVariantPreference>;
}


export const HeroList: React.FC<HeroListProps> = ({ heroes, heroVariantPrefs }) => {
    const [searchTerm, setSearchTerm] = useState('');
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
            <ImageList sx={{ width: 1, height: 1 }} cols={5} rowHeight={164}>
                {filteredHeroes?.map((hero) => {
                    const preference = heroVariantPrefs.get(hero.id);
                    if (!preference) {
                        return (
                            <div key={hero.id}>
                                <ImageListItem key={hero.id}>
                                    <img
                                        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.name?.replace('npc_dota_hero_', '')}.png`}
                                        alt={hero.localized_name}
                                        loading="lazy"
                                    />
                                </ImageListItem>
                            </div>
                        )

                    }
                    return (
                        <Card key={hero.id}>
                            <ImageListItem sx={{ width: 1, height: 1 / 2 }}>
                                <img
                                    src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.name?.replace('npc_dota_hero_', '')}.png`}
                                    alt={hero.localized_name}
                                    loading="lazy"
                                />
                            </ImageListItem>
                            <FacetComponent hero={hero} preference={preference} />
                        </Card>


                    )
                })}
            </ImageList>
        </Card>
    );
}