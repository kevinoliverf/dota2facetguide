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
    const key = `hero:${heroId}`
    try {
        client = await redis();
        try {
            const valveHeroDetails = await client.get(key)
            if (valveHeroDetails) {
                return JSON.parse(valveHeroDetails) as ValveHero
            }
        } catch (error) {
            console.error('Error getting hero details from Redis:', error)
        }

    } catch (error) {
        console.error('Error connecting to Redis:', error)
    }

    const response = await fetch(`https://www.dota2.com/datafeed/herodata?language=english&hero_id=${heroId}`, { cache: 'no-store' })
    if (!response.ok) {
        throw new Error('Network response was not ok')
    }
    const body = await response.json()
    try {
        client = await redis();
        client.set(key, JSON.stringify(body.result.data.heroes[0]))
    } catch (error) {
        console.error('Failed to set to Redis:', error)
    }
    const heroDetails = body.result.data.heroes[0] as ValveHero
    return heroDetails
}