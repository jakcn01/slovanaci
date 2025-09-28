import { supabase } from './supabase';

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password },
    { emailRedirectTo: "https://jakcn01.github.io/slovanaci/#/slovanaci" }
  );
  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};