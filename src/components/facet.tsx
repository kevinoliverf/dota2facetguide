import { useEffect, useState } from "react";

import { Card } from "@mui/material";

import { Hero } from "./teamherofacets";
import { ValveHero, getHeroDetails } from "../lib/api/valve/getherodetails";
import { TeamHeroFacet } from "@/lib/db/teamherofacets";

const colorMap: { [key: number]: string } = {
    0: '#803334', // Dark Red
    1: '#9a7d47', // Dark Yellow / Gold
    2: '#7c8a31', // Olive Green
    3: '#518792', // Steel Blue
    4: '#534a89', // Indigo
    5: '#525559', // Dark Gray
};

type FacetComponentProps = {
    hero : Hero;
    preference: TeamHeroFacet[];
}

export const FacetComponent: React.FC<FacetComponentProps> = ({hero, preference}) => {
    const [heroDetails, setHeroDetails] = useState<ValveHero>(); // Add this line

    function heroVariantToCard(heroVariantPreference: TeamHeroFacet[]): JSX.Element[] {
        let elements: JSX.Element[] = [];
        if (!heroVariantPreference) {
            return elements;
        }
        heroVariantPreference.forEach((teamHeroVariant) => {
            // variant is indexed starting at 1, ValveHero is at 0
            const variant = teamHeroVariant.hero_facet;
            const count = teamHeroVariant.count;
            const facet = heroDetails?.facets[variant-1];
            if (!facet) {
                return
            }
            const color = colorMap[facet.color];
            elements.push(
                <Card sx={{ width: 1, height: 1 }} key={variant} style={{ backgroundColor: color }}>
                    <img src={`https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/icons/facets/` + facet.icon + `.png`} alt={facet.title_loc} />
                    <h2>{facet.title_loc}</h2>
                    <span>Picked {count} times: <br></br>{facet.description_loc.
                        replace(/<[^>]*>/g, "").
                        replace('{s:facet_ability_name}', facet.title_loc).
                        replace(/%.*?%/g," a percentage").
                        replace(/\{.*?\}|%/g, "")}</span>
                </Card>
            )
        })
        return elements;
    }


    useEffect(() => {
        const InitSetHero = async () => {
            const heroDetails = await getHeroDetails(hero.id)
            setHeroDetails(heroDetails)
        }
        InitSetHero()
    }, [])

    return (
        <div className="rounded-md p-5" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            {
                heroVariantToCard(preference)
            }
        </div>
    );
}