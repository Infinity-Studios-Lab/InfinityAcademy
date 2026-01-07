import { createClient } from "@/utils/supabase/server";
import { User } from "@/types/database";

export async function getAllUsers(): Promise<User[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}

export async function getUsersByRole(role: 'student' | 'tutor' | 'parent' | 'admin'): Promise<User[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${role}s:`, error);
    return [];
  }

  return data || [];
}

export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

