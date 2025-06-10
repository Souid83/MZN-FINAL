import React, { useState } from 'react';
import { Plus, Search, FileDown, Upload, Phone, Mail, Pencil } from 'lucide-react';
import ContactsModal from '../components/ContactsModal';
import { useClients } from '../hooks/useClients';
import type { Client } from '../types';

const Clients = () => {
  const [showContactsModal, setShowContactsModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: clients, loading, error, refresh } = useClients();

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="w-full p-8">Chargement...</div>;
  }

  if (error) {
    return <div className="w-full p-8 text-red-600">Erreur: {error.message}</div>;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Clients</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus size={20} />
            Nouveau client
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200">
            <FileDown size={20} />
            📄 Télécharger un modèle Excel
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200">
            <Upload size={20} />
            📥 Importer Excel
          </button>
        </div>
      </div>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Adresse</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Facturation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => setShowContactsModal(client.id)}
                    >
                      {client.nom}
                    </span>
                    <button
                      onClick={() => setShowContactsModal(client.id)}
                      className={`${
                        client.telephone ? 'text-blue-600' : 'text-gray-400'
                      } hover:text-blue-800 flex-shrink-0`}
                    >
                      <Phone size={16} />
                    </button>
                    <button
                      onClick={() => setShowContactsModal(client.id)}
                      className={`${
                        client.email ? 'text-blue-600' : 'text-gray-400'
                      } hover:text-blue-800 flex-shrink-0`}
                    >
                      <Mail size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 break-words max-w-[300px]">
                  {client.email || 'Non renseigné'}
                </td>
                <td className="px-6 py-4">
                  {client.telephone || 'Non renseigné'}
                </td>
                <td className="px-6 py-4 break-words max-w-[300px]">
                  {client.adresse_facturation || 'Non renseigné'}
                </td>
                <td className="px-6 py-4">
                  {client.preference_facturation || 'Non renseigné'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setShowContactsModal(client.id)}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showContactsModal && (
        <ContactsModal
          clientId={showContactsModal}
          onClose={() => setShowContactsModal(null)}
          onUpdate={refresh}
        />
      )}
    </div>
  );
};

export default Clients;