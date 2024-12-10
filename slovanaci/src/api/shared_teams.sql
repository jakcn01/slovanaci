DROP FUNCTION shared_teams_stats(int);
CREATE OR REPLACE FUNCTION shared_teams_stats(player_id int)
RETURNS TABLE (teammate_id bigint, teammate_name text, shared_teams_count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        "Players"."Id" AS teammate_id,
        "Players"."Name" AS teammate_name,
        COALESCE(shared_counts.shared_teams_count, 0) AS shared_teams_count
    FROM 
        "Players"
    LEFT JOIN (
        SELECT 
            tp2."PlayerId" AS teammate_id,
            COUNT(DISTINCT tp1."TeamId" ) AS shared_teams_count
        FROM 
            "Team_Players" tp1
        INNER JOIN "Team_Players" tp2 
            ON tp1."TeamId"  = tp2."TeamId"  AND tp1."PlayerId" != tp2."PlayerId"
        WHERE 
            tp1."PlayerId" = player_id
        GROUP BY 
            tp2."PlayerId"
    ) AS shared_counts 
    ON "Players"."Id" = shared_counts.teammate_id
    WHERE "Players"."Id" != player_id -- Exclude the specified player from the results
    Order by shared_teams_count desc;
END;
$$ LANGUAGE plpgsql;
