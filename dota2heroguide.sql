
CREATE TABLE IF NOT EXISTS team_data(
    id SERIAL PRIMARY KEY,
    team_id INT UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    last_fetched TIMESTAMP NOT NULL

); 
CREATE INDEX team_data_team_id_idx ON team_hero_facets(team_id);

CREATE TABLE IF NOT EXISTS team_hero_facets(
    id SERIAL PRIMARY KEY,
    team_id INT NOT NULL,
    player_id INT NOT NULL,
    hero_id INT NOT NULL,
    hero_facet INT NOT NULL,
    count INT NOT NULL,
    last_updated TIMESTAMP NOT NULL
);

CREATE INDEX team_hero_facets_team_id_idx ON team_hero_facets(team_id);

CREATE TABLE IF NOT EXISTS processed_matches(
    id BIGINT PRIMARY KEY
);