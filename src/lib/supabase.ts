import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Provided Supabase credentials
export const SUPABASE_URL = 'https://ghwbiibdwywvgrbcunrv.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_YO995Jdx-gNa-yeL9vIXZw_F5vlmORz';

// Initialize Supabase Client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured: boolean = true;

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  createdAt?: string;
}

// Database schema types matching Supabase tables
export interface DbSpesa {
  id?: string;
  user_id: string;
  importo: number;
  categoria: string;
  data: string;
  descrizione: string;
  created_at?: string;
}

export interface DbTurno {
  id?: string;
  user_id: string;
  data: string;
  tipo_turno: string;
  orario_inizio: string;
  orario_fine: string;
  note?: string;
  created_at?: string;
}

// Service functions for Supabase data operations
export const fetchUserSpese = async (userId: string): Promise<DbSpesa[]> => {
  try {
    const { data, error } = await supabase
      .from('spese')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false });

    if (error) {
      console.warn('Errore fetch spese da Supabase:', error.message);
      return [];
    }
    return (data as DbSpesa[]) || [];
  } catch (err) {
    console.error('Exception fetchUserSpese:', err);
    return [];
  }
};

export const insertDbSpesa = async (spesa: DbSpesa): Promise<DbSpesa | null> => {
  try {
    const { data, error } = await supabase
      .from('spese')
      .insert([spesa])
      .select()
      .single();

    if (error) {
      console.warn('Errore inserimento spesa in Supabase:', error.message);
      return null;
    }
    return data as DbSpesa;
  } catch (err) {
    console.error('Exception insertDbSpesa:', err);
    return null;
  }
};

export const fetchUserTurni = async (userId: string): Promise<DbTurno[]> => {
  try {
    const { data, error } = await supabase
      .from('turni')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: true });

    if (error) {
      console.warn('Errore fetch turni da Supabase:', error.message);
      return [];
    }
    return (data as DbTurno[]) || [];
  } catch (err) {
    console.error('Exception fetchUserTurni:', err);
    return [];
  }
};

export const insertDbTurno = async (turno: DbTurno): Promise<DbTurno | null> => {
  try {
    const { data, error } = await supabase
      .from('turni')
      .insert([turno])
      .select()
      .single();

    if (error) {
      console.warn('Errore inserimento turno in Supabase:', error.message);
      return null;
    }
    return data as DbTurno;
  } catch (err) {
    console.error('Exception insertDbTurno:', err);
    return null;
  }
};

// Seed default initial records in Supabase for a newly registered user
export const seedInitialUserRecords = async (userId: string): Promise<{ turni: DbTurno[]; spese: DbSpesa[] }> => {
  const initialTurniData: Omit<DbTurno, 'id' | 'created_at'>[] = [
    {
      user_id: userId,
      data: '2026-10-19',
      tipo_turno: 'mattina',
      orario_inizio: '07:00',
      orario_fine: '15:00',
      note: 'Presidio Ospedaliero Nord - Rep. A',
    },
    {
      user_id: userId,
      data: '2026-10-20',
      tipo_turno: 'mattina',
      orario_inizio: '07:00',
      orario_fine: '15:00',
      note: 'Presidio Ospedaliero Nord - Rep. A',
    },
    {
      user_id: userId,
      data: '2026-10-21',
      tipo_turno: 'pomeriggio',
      orario_inizio: '14:00',
      orario_fine: '22:00',
      note: 'Pronto Soccorso Nord - Emergenza',
    },
    {
      user_id: userId,
      data: '2026-10-22',
      tipo_turno: 'pomeriggio',
      orario_inizio: '14:00',
      orario_fine: '22:00',
      note: 'Pronto Soccorso Nord - Emergenza',
    },
    {
      user_id: userId,
      data: '2026-10-23',
      tipo_turno: 'notte',
      orario_inizio: '22:00',
      orario_fine: '07:00',
      note: 'Terapia Intensiva - Notte',
    },
    {
      user_id: userId,
      data: '2026-10-24',
      tipo_turno: 'riposo',
      orario_inizio: '00:00',
      orario_fine: '00:00',
      note: 'Smonto notte e riposo compensativo',
    },
    {
      user_id: userId,
      data: '2026-10-25',
      tipo_turno: 'riposo',
      orario_inizio: '00:00',
      orario_fine: '00:00',
      note: 'Giorno libero / recupero sport',
    },
  ];

  const initialSpeseData: Omit<DbSpesa, 'id' | 'created_at'>[] = [
    {
      user_id: userId,
      importo: 48.50,
      categoria: 'alimentari',
      data: '2026-10-21',
      descrizione: 'Supermercato Esselunga spesa settimanale',
    },
    {
      user_id: userId,
      importo: 35.00,
      categoria: 'trasporti',
      data: '2026-10-20',
      descrizione: 'Rifornimento carburante tragitto ospedale',
    },
    {
      user_id: userId,
      importo: 18.00,
      categoria: 'svago',
      data: '2026-10-19',
      descrizione: 'Pausa pranzo bar ospedale & caffè',
    },
    {
      user_id: userId,
      importo: 2400.00,
      categoria: 'stipendio',
      data: '2026-10-01',
      descrizione: 'Accredito stipendio mensile & indennità',
    },
  ];

  try {
    const { data: turniData } = await supabase.from('turni').insert(initialTurniData).select();
    const { data: speseData } = await supabase.from('spese').insert(initialSpeseData).select();
    return {
      turni: (turniData as DbTurno[]) || [],
      spese: (speseData as DbSpesa[]) || [],
    };
  } catch (err) {
    console.error('Exception seedInitialUserRecords:', err);
    return { turni: [], spese: [] };
  }
};

// Local storage key for demo testing fallback
const DEMO_STORAGE_KEY = 'chronos_demo_auth_user';

export const getStoredDemoUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredDemoUser = (user: AuthUser | null) => {
  try {
    if (user) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
};
