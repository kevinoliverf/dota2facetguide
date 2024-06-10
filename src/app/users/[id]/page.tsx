'use client'
import React, { use, useEffect, useState } from "react";
import HeroFacet from "@/components/test"; 
import {TeamsList} from "@/components/teams";

export default function Page({ params }: { params: { id: string } }) {
    const [selectedTeam , setSelectedTeam] = useState<number>(0);
    
    return (
        <div>
            <TeamsList selectTeam={setSelectedTeam} />
            <HeroFacet selectedTeam={selectedTeam}/>
        </div>
    )
}