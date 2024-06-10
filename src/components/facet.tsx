import { Card } from "@mui/material";

import { Hero, HeroVariantPreference } from "./test";
import { useEffect, useState } from "react";
import { ValveHero, getHeroDetails } from "./getherodetails";
type HeroListProps = {
    hero : Hero;
    preference: HeroVariantPreference;
}
const colorMap: { [key: number]: string } = {
    0: '#803334', // Dark Red
    1: '#9a7d47', // Dark Yellow / Gold
    2: '#7c8a31', // Olive Green
    3: '#518792', // Steel Blue
    4: '#534a89', // Indigo
    5: '#525559', // Dark Gray
};
export const FacetComponent: React.FC<HeroListProps> = ({hero, preference}) => {
    const [heroDetails, setHeroDetails] = useState<ValveHero>(); // Add this line
    function heroVariantPreferenceToString(heroVariantPreference: HeroVariantPreference): JSX.Element[] {
        let elements: JSX.Element[] = [];
        if (!heroVariantPreference) {
            return elements;
        }
        heroVariantPreference.forEach((count,variant) => {
            console.log("Variant", variant, count)
            const facet = heroDetails?.facets[variant-1];
            if (!facet) {
                return
            }
            const color = colorMap[facet.color];
            elements.push(
                <Card sx={{ width: 1, height: 1 / 2 }} key={variant} style={{ backgroundColor: color }}>
                    <img src={`https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/icons/facets/` + facet.icon + `.png`} alt={facet.title_loc} />
                    <span>Facet {variant}(Count{count}): {facet.title_loc} <br></br>{facet.description_loc}</span>
                </Card>
            )
        })
        return elements;
    }


    useEffect(() => {
        const InitBins = async () => {
            const heroDetails = await getHeroDetails(hero.id)
            setHeroDetails(heroDetails)
        }
        InitBins()
    }, [])
    return (
        <Card className="rounded-md p-5" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            {
                heroVariantPreferenceToString(preference)
            }
        </Card>
    );
}