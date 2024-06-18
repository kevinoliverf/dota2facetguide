'use client'
import React, {useState } from "react";

import TeamHeroFacetComponent from "@/components/teamherofacets"; 
import { GetTeamData } from "@/lib/db/teamdata";

export default function Page({params}: {params: {id: string}}) {
    const id = parseInt(params.id);
    const [selectedTeam , setSelectedTeam] = useState<number>(id);
    const [selectedTeamName, setSelectedTeamName] = useState<string>('');
    const setTeamName = async() => {
       const teamData = await GetTeamData(id)
       setSelectedTeamName(teamData.team_name)
    }
    setTeamName()
    return (
        <div>
            <h1> {selectedTeamName} </h1>
            <TeamHeroFacetComponent selectedTeam={selectedTeam} selectedTeamName={selectedTeamName} />
        </div>
    )
}