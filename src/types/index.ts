// Add User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'exploit' | 'compta' | 'direction';
  created_at?: string;
}

// Add SlipStatus type
export type SlipStatus = 'loaded' | 'waiting' | 'delivered' | 'dispute';

// Add Contact type
export interface Contact {
  id?: string;
  client_id?: string;
  service: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
}

// Add AccountingContact type
export interface AccountingContact {
  id?: string;
  client_id?: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
}

// Add Country type
export interface Country {
  id: string;
  name: string;
  code: string;
  flag_url: string;
}

// Add WeekSchedule type for opening hours
export interface WeekSchedule {
  monday: { start: string; end: string; closed?: boolean };
  tuesday: { start: string; end: string; closed?: boolean };
  wednesday: { start: string; end: string; closed?: boolean };
  thursday: { start: string; end: string; closed?: boolean };
  friday: { start: string; end: string; closed?: boolean };
  saturday: { start: string; end: string; closed?: boolean };
  sunday: { start: string; end: string; closed?: boolean };
}

// Add Client type
export interface Client {
  id: string;
  nom: string;
  email?: string;
  emails?: string[];
  telephone?: string;
  adresse_facturation?: string;
  preference_facturation?: 'mensuelle' | 'hebdomadaire' | 'par_transport';
  tva_rate?: number;
  numero_commande_requis?: boolean;
  country_id?: string;
  siret?: string;
  numero_tva?: string;
  opening_hours?: WeekSchedule;
  contacts?: Contact[];
  accounting_contact?: AccountingContact;
  created_at?: string;
  updated_at?: string;
}

// Add CreateClientPayload type
export interface CreateClientPayload {
  nom: string;
  email?: string;
  emails?: string[];
  telephone?: string;
  adresse_facturation?: string;
  preference_facturation?: 'mensuelle' | 'hebdomadaire' | 'par_transport';
  tva_rate?: number;
  numero_commande_requis?: boolean;
  country_id?: string;
  siret?: string;
  numero_tva?: string;
  opening_hours?: WeekSchedule;
  contacts?: Contact[];
  accounting_contact?: AccountingContact;
}

// Add Fournisseur type
export interface Fournisseur {
  id: string;
  nom: string;
  contact_nom?: string;
  email?: string;
  emails?: string[];
  telephone?: string;
  services_offerts?: string[];
  zones_couvertes?: string[];
  conditions_paiement?: string;
  country_id?: string;
  siret?: string;
  numero_tva?: string;
  created_at?: string;
  updated_at?: string;
}

// Add CreateFournisseurPayload type
export interface CreateFournisseurPayload {
  nom: string;
  contact_nom?: string;
  email?: string;
  emails?: string[];
  telephone?: string;
  services_offerts?: string[];
  zones_couvertes?: string[];
  conditions_paiement?: string;
  country_id?: string;
  siret?: string;
  numero_tva?: string;
}

// Add Vehicule type
export interface Vehicule {
  id: string;
  immatriculation: string;
  type: string;
  capacite_kg?: number;
  capacite_m3?: number;
  created_at?: string;
  updated_at?: string;
}

// Add TransportSlip type
export interface TransportSlip {
  id: string;
  number: string;
  status: SlipStatus;
  client_id?: string;
  clients?: Client;
  vehicule_id?: string;
  vehicules?: Vehicule;
  loading_date: string;
  loading_time: string;
  loading_address: string;
  loading_contact: string;
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
  delivery_contact: string;
  goods_description: string;
  volume?: number;
  weight?: number;
  vehicle_type: string;
  exchange_type: string;
  instructions: string;
  price: number;
  payment_method: string;
  observations?: string;
  photo_required: boolean;
  order_number?: string;
  documents?: Record<string, { url: string; uploaded_at: string }>;
  created_at?: string;
  updated_at?: string;
  kilometers?: number;
  price_per_km?: number;
  loading_time_start?: string;
  loading_time_end?: string;
  delivery_time_start?: string;
  delivery_time_end?: string;
  custom_vehicle_type?: string;
  tailgate?: boolean;
}

// Add FreightSlip type
export interface FreightSlip {
  id: string;
  number: string;
  status: SlipStatus;
  client_id?: string;
  clients?: Client;
  fournisseur_id?: string;
  fournisseurs?: Fournisseur;
  loading_date: string;
  loading_time: string;
  loading_address: string;
  loading_contact: string;
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
  delivery_contact: string;
  goods_description: string;
  volume?: number;
  weight?: number;
  metre?: number;
  vehicle_type: string;
  exchange_type: string;
  instructions: string;
  price: number;
  payment_method: string;
  observations?: string;
  photo_required: boolean;
  documents?: Record<string, { url: string; uploaded_at: string }>;
  commercial_id?: string;
  users?: { name: string };
  created_at?: string;
  updated_at?: string;
  loading_time_start?: string;
  loading_time_end?: string;
  delivery_time_start?: string;
  delivery_time_end?: string;
  custom_vehicle_type?: string;
  tailgate?: boolean;
  purchase_price?: number;
  selling_price?: number;
  margin?: number;
  margin_rate?: number;
  order_number?: string;
}

// Add SlipNumberConfig type
export interface SlipNumberConfig {
  id: string;
  prefix: string;
  current_number: number;
  type: 'transport' | 'freight';
  created_at?: string;
  updated_at?: string;
}

// Add DeliveryStatus type
export interface DeliveryStatus {
  id: string;
  status: SlipStatus;
  client: string;
  freightNumber?: string;
  vehicle: string;
  loadingDate: string;
  loadingPostalCode: string;
  deliveryDate: string;
  deliveryPostalCode: string;
  kilometres: number;
  priceBeforeTax: number;
  pricePerKm: number;
}

// Add FreightStatus type
export interface FreightStatus {
  id: string;
  status: SlipStatus;
  date: string;
  client: string;
  subcontractor: string;
  loadingDate: string;
  loadingPostalCode: string;
  deliveryDate: string;
  deliveryPostalCode: string;
  purchasePrice: number;
  sellingPrice: number;
  margin: number;
  marginRate: number;
}