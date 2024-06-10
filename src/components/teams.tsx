
'use client'
import client from "@/lib/api";
import { components } from "@/lib/api/opendota";
import { Card, ImageList, ImageListItem, TextField } from "@mui/material";
import { use, useEffect, useState } from "react";


type Team = components["schemas"]["TeamObjectResponse"];

type TeamListProps = {
    selectTeam: (teamId: number) => void;
}
export const TeamsList: React.FC<TeamListProps> = ({selectTeam}) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    async function getTeams() {
        const teamsResp = await client.GET("/teams", {
            params: {
            },
        });
        if (!teamsResp.data) {
            return [];
        }

        if (teamsResp.data.length === 0) {
            return [];
        }
        const teams: Team[] = [];
        const oneMonthAgo = Math.floor((Date.now() / 1000) - (30 * 24 * 60 * 60));
        for (let index = 0; index < teamsResp.data.length; index++) {
            const t = teamsResp.data[index] as Team;
            if (t.rating && t.rating < 1200) {
                break;
            }
            if (t.last_match_time && t.last_match_time < oneMonthAgo) {
                continue;
            }
            console.log(t)
            teams.push(t);
        }
        return teams;
    }

    useEffect(() => {
        getTeams().then((teams) => {
            setTeams(teams);
        })
    }, []);
    const filteredTeams = teams?.filter(team =>
        team.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <Card className="navyCard" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <TextField
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
           
            <ImageList sx={{ width: 1/2, height: 1/2 }} cols={5} >
                {filteredTeams.map((team) => (
                    <ImageListItem sx={{ width:1, height: 1}} key={team.team_id}>
                        <img src={team.logo_url ? team.logo_url : ""}
                            alt={team.name ? team.name : ""}
                            loading="lazy"
                            onClick={() => {
                                console.log(team)
                                selectTeam(team.team_id ? team.team_id : 0)
                            }}
                        ></img>
                    </ImageListItem>
                ))}
            </ImageList>
        </Card>

    );
}