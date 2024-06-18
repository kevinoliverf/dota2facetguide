'use client'
import React, {useState } from "react";

import TeamHeroFacetComponent from "@/components/teamherofacets"; 
import {TeamListComponent} from "@/components/teamlist";
import Footer from "./footer";

export default function Page() {
    const [selectedTeam , setSelectedTeam] = useState<number>(0);
    const [selectedTeamName , setSelectedTeamName] = useState<string>('');
    
    return (
        <div >
            <h1>Welcome to the Dota 2 Hero Facet Guide</h1>
            <h2>Select a top team to discover their preferred hero facets</h2>
            <TeamListComponent selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} setSelectedTeamName={setSelectedTeamName} />
            <TeamHeroFacetComponent selectedTeam={selectedTeam} selectedTeamName={selectedTeamName}/>
            <Footer />
        </div>
    )
}