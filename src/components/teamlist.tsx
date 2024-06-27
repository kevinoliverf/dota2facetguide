'use client'
import { useEffect, useState } from "react";

import { Autocomplete, Box, Card, TextField } from "@mui/material";

import client from "@/lib/api/opendota/client";
import { components } from "@/lib/api/opendota/schema";


type Team = components["schemas"]["TeamObjectResponse"];

type TeamListComponentProps = {
    selectedTeam: number
    setSelectedTeam: (teamId: number) => void;
    setSelectedTeamName: (teamName: string) => void;
}
export const TeamListComponent: React.FC<TeamListComponentProps> = ({selectedTeam, setSelectedTeam, setSelectedTeamName}) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeamSchema, setSelectedTeamSchema] = useState<Team>();   
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState("");

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
            teams.push(t);
        }
        return teams;
    }

    useEffect(() => {
        getTeams().then((teams) => {
            setTeams(teams);
            setLoading(false);
        })
    }, []);

    useEffect(() => {
        if(loading){
            return
        }
        const foundTeam = teams.find(team => team.team_id === selectedTeam);
        if (foundTeam) {
            setSelectedTeamSchema(foundTeam)
        }
    }, [teams,loading,selectedTeam]);

    // Lets users type team name in the Autocomplete
    const filterOptions = (options: Team[], { inputValue }: { inputValue: string }) => {
        const lowerInputValue = inputValue.toLowerCase();
        return options.filter(option =>
            option.name?.toLowerCase().includes(lowerInputValue)
        );
    };
    return (
        <Card className="rounded-md p-5" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <Autocomplete
                options={teams}
                renderOption={(props, option, { selected }) => {
                    return (
                        <Box className={`p-2 ${selected ? 'selected-class' : ''}`} display="flex" alignItems="center"
                            component="li"
                            {...props}>
                            <img src={option.logo_url ? option.logo_url : ""}
                                loading="lazy"
                                style={{ width: '24px', height: '24px', marginRight: '8px', backgroundColor: 'black' }}
                            ></img> {option.name ? option.name : ""}
                        </Box>
                    )
                }
                }
                renderInput={
                    (params) => <TextField {...params} label="Teams" variant="outlined" />
                }
                filterOptions={filterOptions}
                value={selectedTeamSchema}
                inputValue={inputValue}
                onInputChange={(_, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                getOptionLabel={(option) => option.name ? option.name : ""}
                onChange={(_, value) => {
                    if (value) {
                        setSelectedTeam(value.team_id ? value.team_id : 0)
                        setSelectedTeamName(value.name ? value.name : "")
                        setSelectedTeamSchema(value);
                    } else {
                        setSelectedTeam(0)
                        setSelectedTeamName("")
                        setSelectedTeamSchema(undefined);
                    }
                    
                }
                }
            />
        </Card>

    );
}