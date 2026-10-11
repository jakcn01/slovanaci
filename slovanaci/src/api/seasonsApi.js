import { supabase } from './supabase.js'; // Import your Supabase client

export const GetSeasonsData = async () => {
    const { data: matchDatesData, error: seasonsError } = await supabase
        .from('Season')
        .select('*')
        .order('Id', { ascending: true });;
    if (seasonsError) throw seasonsError; // Handle goals error
    return matchDatesData;
}

export const AddSeason = async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Název sezóny nesmí být prázdný.');
    const { data, error } = await supabase.from('Season')
        .insert({ Name: trimmedName, IsCurrent: false })
        .select('*').single();
    if (error) throw error;
    return data;
};

export const SetCurrentSeason = async (seasonId) => {
    const seasons = await GetSeasonsData();
    const selected = seasons.find(season => season.Id === seasonId);
    if (!selected) throw new Error('Sezóna nebyla nalezena.');
    const currentIds = seasons.filter(season => season.IsCurrent).map(season => season.Id);
    if (selected.IsCurrent && currentIds.length === 1) return;

    if (currentIds.length > 0) {
        const { error } = await supabase.from('Season')
            .update({ IsCurrent: false }).in('Id', currentIds);
        if (error) throw error;
    }

    const { error } = await supabase.from('Season')
        .update({ IsCurrent: true }).eq('Id', seasonId).select('Id').single();
    if (error) {
        if (currentIds.length > 0) {
            const { error: restoreError } = await supabase.from('Season')
                .update({ IsCurrent: true }).in('Id', currentIds);
            if (restoreError) throw new Error('Změna sezóny selhala a původní sezónu se nepodařilo obnovit. Obnovte seznam a zkontrolujte aktuální sezónu.');
        }
        throw error;
    }
};