import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, Clock } from 'lucide-react';
import type { Client, Contact, AccountingContact } from '../types';
import { supabase } from '../lib/supabase';

interface ContactsModalProps {
  clientId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const ContactsModal: React.FC<ContactsModalProps> = ({
  clientId,
  onClose,
  onUpdate
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accountingContact, setAccountingContact] = useState<AccountingContact>({
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  });

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          client_contacts(*),
          client_accounting_contacts(*),
          countries(name, flag_url)
        `)
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      setClient(clientData);
      setContacts(clientData.client_contacts || []);
      if (clientData.client_accounting_contacts?.[0]) {
        setAccountingContact(clientData.client_accounting_contacts[0]);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    const newContact: Contact = {
      client_id: clientId,
      service: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: ''
    };

    try {
      const { data, error } = await supabase
        .from('client_contacts')
        .insert([newContact])
        .select()
        .single();

      if (error) throw error;

      setContacts([...contacts, data]);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const updateContact = async (index: number, updatedContact: Contact) => {
    try {
      const { error } = await supabase
        .from('client_contacts')
        .update(updatedContact)
        .eq('id', updatedContact.id);

      if (error) throw error;

      const newContacts = [...contacts];
      newContacts[index] = updatedContact;
      setContacts(newContacts);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const updateAccountingContact = async (updatedContact: AccountingContact) => {
    try {
      if (accountingContact.id) {
        const { error } = await supabase
          .from('client_accounting_contacts')
          .update(updatedContact)
          .eq('id', accountingContact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('client_accounting_contacts')
          .insert([{ ...updatedContact, client_id: clientId }]);

        if (error) throw error;
      }

      setAccountingContact(updatedContact);
      onUpdate();
    } catch (error) {
      console.error('Error updating accounting contact:', error);
    }
  };

  const removeContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('client_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setContacts(contacts.filter(c => c.id !== contactId));
      onUpdate();
    } catch (error) {
      console.error('Error removing contact:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="text-center">Client non trouvé</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{client.nom || 'Non renseigné'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Informations générales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Mail size={16} className="mr-2" />
                  {client.email || 'Non renseigné'}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Phone size={16} className="mr-2" />
                  {client.telephone || 'Non renseigné'}
                </div>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin size={16} className="mr-2" />
                  {client.adresse_facturation || 'Non renseigné'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2" />
                  {client.preference_facturation || 'Non renseigné'}
                </div>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contacts entreprise</h3>
              <button
                onClick={addContact}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Ajouter un contact
              </button>
            </div>
            {contacts.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Aucun contact enregistré
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div key={contact.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Service</label>
                        <input
                          type="text"
                          value={contact.service}
                          onChange={(e) => updateContact(index, { ...contact, service: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                          type="text"
                          value={contact.nom}
                          onChange={(e) => updateContact(index, { ...contact, nom: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prénom</label>
                        <input
                          type="text"
                          value={contact.prenom}
                          onChange={(e) => updateContact(index, { ...contact, prenom: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={contact.email || ''}
                          onChange={(e) => updateContact(index, { ...contact, email: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                        <input
                          type="tel"
                          value={contact.telephone || ''}
                          onChange={(e) => updateContact(index, { ...contact, telephone: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => contact.id && removeContact(contact.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact comptabilité */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact comptabilité</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={accountingContact.nom}
                    onChange={(e) => updateAccountingContact({ ...accountingContact, nom: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    value={accountingContact.prenom}
                    onChange={(e) => updateAccountingContact({ ...accountingContact, prenom: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={accountingContact.email || ''}
                    onChange={(e) => updateAccountingContact({ ...accountingContact, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="tel"
                    value={accountingContact.telephone || ''}
                    onChange={(e) => updateAccountingContact({ ...accountingContact, telephone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsModal;