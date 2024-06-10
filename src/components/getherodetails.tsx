'use server'

export type Facet = {
    title_loc: string;
    description_loc: string;
    icon: string;
    color: number;
}
export type ValveHero = {
    id: number;
    name: string;
    name_loc: string;
    facets: Facet[];
}

export async function getHeroDetails(heroId: number) {
    const response = await fetch(`https://www.dota2.com/datafeed/herodata?language=english&hero_id=${heroId}`)
    if (!response.ok){
        throw new Error('Network response was not ok')
    }
    const body = await response.json()
    const heroDetails = body.result.data.heroes[0] as ValveHero
    return heroDetails 
}