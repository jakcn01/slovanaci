import { supabase } from './supabase';
import { serializeSettingValue } from '../const/settings';

export const GetSettingsData = async () => {
  const { data, error } = await supabase.from('Settings').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const UpdateSetting = async (setting, value) => {
  const serializedValue = serializeSettingValue(setting, value);
  const { data, error } = await supabase.from('Settings')
    .update({ Value: serializedValue }).eq('id', setting.id).select('*').single();
  if (error) throw error;
  return data;
};