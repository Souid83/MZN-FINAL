import React, { useState, useRef } from 'react';
import { Plus, Search, FileDown, Upload, Pencil, X, Trash2, Phone, Mail } from 'lucide-react';
import { useFournisseurs, useCreateFournisseur, useUpdateFournisseur } from '../hooks/useFournisseurs';
import { useCountries } from '../hooks/useCountries';
import CountrySelector from '../components/CountrySelector';
import CreateCountryModal from '../components/CreateCountryModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import FournisseurDetailsModal from '../components/FournisseurDetailsModal';
import type { Fournisseur, CreateFournisseurPayload } from '../types';
import { deleteFournisseurs } from '../services/fournisseurs';
import { parseFournisseursExcel } from '../utils/excel-import';

const FournisseurForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  submitLabel = 'Créer',
  loading = false 
}: { 
  onSubmit: (data: CreateFournisseurPayload) => void;
  onCancel: () => void;
  initialData?: Fournisseur | null;
  submitLabel?: string;
  loading?: boolean;
}) => {
  const [showCreateCountry, setShowCreateCountry] = useState(false);
  const { data: countries, create: createCountry } = useCountries();
  const [selectedCountryId, setSelectedCountryId] = useState(initialData?.country_id || '');
  const [emails, setEmails] = useState<string[]>(initialData?.emails || []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const fournisseurData: CreateFournisseurPayload = {
      nom: formData.get('nom') as string,
      contact_nom: formData.get('contact_nom') as string,
      email: formData.get('email') as string,
      emails: emails,
      telephone: formData.get('telephone') as string,
      services_offerts: (formData.get('services_offerts') as string).split(',').map(s => s.trim()),
      zones_couvertes: (formData.get('zones_couvertes') as string).split(',').map(z => z.trim()),
      conditions_paiement: formData.get('conditions_paiement') as string,
      siret: formData.get('siret') as string,
      numero_tva: formData.get('numero_tva') as string,
      country_id: selectedCountryId || undefined
    };

    onSubmit(fournisseurData);
  };

  const handleCreateCountry = async (name: string, code: string) => {
    try {
      const newCountry = await createCountry(name, code);
      setSelectedCountryId(newCountry.id);
      setShowCreateCountry(false);
    } catch (error) {
      console.error('Error creating country:', error);
    }
  };

  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{initialData ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <CountrySelector
                countries={countries}
                selectedCountryId={selectedCountryId}
                onSelect={setSelectedCountryId}
                onCreateCountry={() => setShowCreateCountry(true)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                name="nom"
                required
                defaultValue={initialData?.nom}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <input
                type="text"
                name="contact_nom"
                defaultValue={initialData?.contact_nom}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email principal</label>
              <input
                type="email"
                name="email"
                defaultValue={initialData?.email}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Emails supplémentaires</label>
                <button
                  type="button"
                  onClick={addEmail}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Ajouter un email
                </button>
              </div>
              <div className="space-y-2">
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Email supplémentaire"
                    />
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                defaultValue={initialData?.telephone}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SIRET</label>
              <input
                type="text"
                name="siret"
                defaultValue={initialData?.siret}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="123 456 789 00012"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">N° TVA intracommunautaire</label>
              <input
                type="text"
                name="numero_tva"
                defaultValue={initialData?.numero_tva}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="FR12345678900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Services offerts (séparés par des virgules)</label>
              <textarea
                name="services_offerts"
                rows={3}
                defaultValue={initialData?.services_offerts?.join(', ')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Transport routier, Transport frigorifique, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Zones couvertes (séparées par des virgules)</label>
              <textarea
                name="zones_couvertes"
                rows={3}
                defaultValue={initialData?.zones_couvertes?.join(', ')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Île-de-France, Normandie, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Conditions de paiement</label>
              <input
                type="text"
                name="conditions_paiement"
                defaultValue={initialData?.conditions_paiement}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="30 jours fin de mois"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : submitLabel}
            </button>
          </div>
        </form>
      </div>

      {showCreateCountry && (
        <CreateCountryModal
          onClose={() => setShowCreateCountry(false)}
          onSubmit={handleCreateCountry}
        />
      )}
    </div>
  );
};

const Fournisseurs = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFournisseurs, setSelectedFournisseurs] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<Fournisseur | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: fournisseurs, loading, error, refresh } = useFournisseurs();
  const { create, loading: creating } = useCreateFournisseur();
  const { update, loading: updating } = useUpdateFournisseur();

  const filteredFournisseurs = fournisseurs.filter(fournisseur =>
    fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFournisseurs(new Set(filteredFournisseurs.map(f => f.id)));
    } else {
      setSelectedFournisseurs(new Set());
    }
  };

  const handleSelectFournisseur = (fournisseurId: string) => {
    const newSelected = new Set(selectedFournisseurs);
    if (selectedFournisseurs.has(fournisseurId)) {
      newSelected.delete(fournisseurId);
    } else {
      newSelected.add(fournisseurId);
    }
    setSelectedFournisseurs(newSelected);
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteFournisseurs(Array.from(selectedFournisseurs));
      setShowDeleteConfirmation(false);
      setSelectedFournisseurs(new Set());
      refresh();
    } catch (err) {
      console.error('Error deleting suppliers:', err);
    }
  };

  const handleCreate = async (fournisseurData: CreateFournisseurPayload) => {
    try {
      await create(fournisseurData);
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error('Error creating fournisseur:', err);
    }
  };

  const handleUpdate = async (fournisseurData: CreateFournisseurPayload) => {
    if (!editingFournisseur) return;
    try {
      await update(editingFournisseur.id, fournisseurData);
      setEditingFournisseur(null);
      refresh();
    } catch (err) {
      console.error('Error updating fournisseur:', err);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      const fournisseurs = await parseFournisseursExcel(file);
      
      // Create each fournisseur
      for (const fournisseur of fournisseurs) {
        await create(fournisseur);
      }
      
      refresh();
      e.target.value = '';
    } catch (err) {
      console.error('Error importing Excel:', err);
      setImportError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const downloadSampleExcel = () => {
    const link = document.createElement('a');
    link.href = '/sample_fournisseurs.xlsx';
    link.download = 'sample_fournisseurs.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="w-full p-8">Chargement...</div>;
  if (error) return <div className="w-full p-8 text-red-600">Erreur: {error.message}</div>;

  return (
    <div className="w-full p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Fournisseurs</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Nouveau fournisseur
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={downloadSampleExcel}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200"
          >
            <FileDown size={20} />
            📄 Télécharger un modèle Excel
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200"
          >
            <Upload size={20} />
            📥 Importer Excel
          </button>
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            disabled={selectedFournisseurs.size === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              selectedFournisseurs.size > 0
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Trash2 size={20} />
            Supprimer ({selectedFournisseurs.size})
          </button>
        </div>
      </div>

      {importError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <pre className="whitespace-pre-wrap font-mono text-sm">{importError}</pre>
        </div>
      )}

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Rechercher un fournisseur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      {(showForm || editingFournisseur) && (
        <FournisseurForm
          onSubmit={editingFournisseur ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingFournisseur(null);
          }}
          initialData={editingFournisseur}
          submitLabel={editingFournisseur ? 'Modifier' : 'Créer'}
          loading={creating || updating}
        />
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          onConfirm={handleDeleteSelected}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}

      {showDetailsModal && (
        <FournisseurDetailsModal
          fournisseur={showDetailsModal}
          onClose={() => setShowDetailsModal(null)}
        />
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedFournisseurs.size === filteredFournisseurs.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFournisseurs.map((fournisseur) => (
              <tr key={fournisseur.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedFournisseurs.has(fournisseur.id)}
                    onChange={() => handleSelectFournisseur(fournisseur.id)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setEditingFournisseur(fournisseur)}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => setShowDetailsModal(fournisseur)}
                    >
                      {fournisseur.nom}
                    </span>
                    <button
                      onClick={() => setShowDetailsModal(fournisseur)}
                      className={`${
                        fournisseur.telephone ? 'text-blue-600' : 'text-gray-400'
                      } hover:text-blue-800`}
                    >
                      <Phone size={16} />
                    </button>
                    <button
                      
                      onClick={() => setShowDetailsModal(fournisseur)}
                      className={`${
                        fournisseur.email ? 'text-blue-600' : 'text-gray-400'
                      } hover:text-blue-800`}
                    >
                      <Mail size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{fournisseur.contact_nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fournisseur.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fournisseur.telephone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{fournisseur.services_offerts?.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fournisseurs;