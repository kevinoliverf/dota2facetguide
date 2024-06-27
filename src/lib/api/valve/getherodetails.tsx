'use server'

import redis from '@/lib/redis'

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
    let client;
    try {
        console.log("CONNECTING")
        client = await redis();
        console.log("DONE CONNECTING")
    } catch (error) {
        console.error('Error connecting to Redis:', error)
        throw error
    }
    const key = `hero:${heroId}`
    try {
        console.log("GETTING")
        const valveHeroDetails = await client.get(key)
        console.log("DONE GETTING")
        if (valveHeroDetails) {
            return JSON.parse(valveHeroDetails) as ValveHero
        }
    } catch (error) {
        console.error('Error getting hero details from Redis:', error)
    }


    const response = await fetch(`https://www.dota2.com/datafeed/herodata?language=english&hero_id=${heroId}`, {cache: 'no-store'})
    if (!response.ok){
        throw new Error('Network response was not ok')
    }
    const body = await response.json()
    client.set(key, JSON.stringify(body.result.data.heroes[0]))
    const heroDetails = body.result.data.heroes[0] as ValveHero
    return heroDetails 
}