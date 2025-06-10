import { read, utils } from 'xlsx';
import { supabase } from '../lib/supabase';
import type { CreateClientPayload, CreateFournisseurPayload, WeekSchedule } from '../types';

const DEFAULT_SCHEDULE: WeekSchedule = {
  monday: { start: '09:00', end: '19:00', closed: false },
  tuesday: { start: '09:00', end: '19:00', closed: false },
  wednesday: { start: '09:00', end: '19:00', closed: false },
  thursday: { start: '09:00', end: '19:00', closed: false },
  friday: { start: '09:00', end: '19:00', closed: false },
  saturday: { start: '09:00', end: '19:00', closed: true },
  sunday: { start: '09:00', end: '19:00', closed: true },
};

async function getCountryIdByName(countryName: string): Promise<string | undefined> {
  if (!countryName) return undefined;

  const { data, error } = await supabase
    .from('countries')
    .select('id')
    .ilike('name', countryName)
    .single();

  if (error) {
    console.error('Error fetching country:', error);
    return undefined;
  }

  return data?.id;
}

export async function parseClientsExcel(file: File): Promise<CreateClientPayload[]> {
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = utils.sheet_to_json(worksheet);

  const clients: CreateClientPayload[] = [];
  const errors: { row: number; errors: string[] }[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i] as any;
    const rowErrors: string[] = [];

    // Required fields validation
    if (!row.nom) rowErrors.push('Le nom est requis');
    if (!row.preference_facturation) rowErrors.push('La préférence de facturation est requise');

    // Validate preference_facturation
    if (row.preference_facturation && !['mensuelle', 'hebdomadaire', 'par_transport'].includes(row.preference_facturation)) {
      rowErrors.push('La préférence de facturation doit être: mensuelle, hebdomadaire, ou par_transport');
    }

    // Parse contacts
    let contacts = [];
    try {
      contacts = row.contacts ? JSON.parse(row.contacts) : [];
      if (!Array.isArray(contacts)) {
        rowErrors.push('Le format des contacts est invalide');
      }
    } catch (e) {
      rowErrors.push('Erreur de parsing des contacts');
    }

    // Parse accounting contact
    let accounting_contact = null;
    try {
      accounting_contact = row.accounting_contact ? JSON.parse(row.accounting_contact) : {
        nom: '',
        prenom: '',
        email: '',
        telephone: ''
      };
    } catch (e) {
      rowErrors.push('Erreur de parsing du contact comptable');
    }

    // Parse opening hours
    let opening_hours = DEFAULT_SCHEDULE;
    try {
      opening_hours = row.opening_hours ? JSON.parse(row.opening_hours) : DEFAULT_SCHEDULE;
    } catch (e) {
      rowErrors.push('Erreur de parsing des horaires d\'ouverture');
    }

    // Parse emails
    const emails = row.emails ? row.emails.split(',').map((email: string) => email.trim()) : [];

    // Get country ID
    const country_id = await getCountryIdByName(row.country);

    if (rowErrors.length > 0) {
      errors.push({ row: i + 2, errors: rowErrors });
      continue;
    }

    clients.push({
      nom: row.nom,
      email: row.email,
      emails,
      telephone: row.telephone,
      adresse_facturation: row.adresse_facturation,
      preference_facturation: row.preference_facturation,
      tva_rate: row.tva_rate ? Number(row.tva_rate) : undefined,
      numero_commande_requis: row.numero_commande_requis === 'true',
      siret: row.siret,
      numero_tva: row.numero_tva,
      country_id,
      contacts,
      accounting_contact,
      opening_hours
    });
  }

  if (errors.length > 0) {
    throw new Error('Validation errors:\n' + errors.map(e => 
      `Row ${e.row}: ${e.errors.join(', ')}`
    ).join('\n'));
  }

  return clients;
}

export async function parseFournisseursExcel(file: File): Promise<CreateFournisseurPayload[]> {
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = utils.sheet_to_json(worksheet);

  const fournisseurs: CreateFournisseurPayload[] = [];
  const errors: { row: number; errors: string[] }[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i] as any;
    const rowErrors: string[] = [];

    // Required fields validation
    if (!row.nom) rowErrors.push('Le nom est requis');

    // Parse arrays
    const services_offerts = row.services_offerts ? row.services_offerts.split(';').map((s: string) => s.trim()) : [];
    const zones_couvertes = row.zones_couvertes ? row.zones_couvertes.split(';').map((z: string) => z.trim()) : [];
    const emails = row.emails ? row.emails.split(',').map((email: string) => email.trim()) : [];

    // Get country ID
    const country_id = await getCountryIdByName(row.country);

    if (rowErrors.length > 0) {
      errors.push({ row: i + 2, errors: rowErrors });
      continue;
    }

    fournisseurs.push({
      nom: row.nom,
      contact_nom: row.contact_nom,
      email: row.email,
      emails,
      telephone: row.telephone,
      services_offerts,
      zones_couvertes,
      conditions_paiement: row.conditions_paiement,
      siret: row.siret,
      numero_tva: row.numero_tva,
      country_id
    });
  }

  if (errors.length > 0) {
    throw new Error('Validation errors:\n' + errors.map(e => 
      `Row ${e.row}: ${e.errors.join(', ')}`
    ).join('\n'));
  }

  return fournisseurs;
}