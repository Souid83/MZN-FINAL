import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import SlipForm from '../components/SlipForm';
import SlipStatusSelect from '../components/SlipStatusSelect';
import EmailModal from '../components/EmailModal';
import DocumentUploaderModal from '../components/DocumentUploaderModal';
import DocumentViewerModal from '../components/DocumentViewerModal';
import ActionButtons from '../components/ActionButtons';
import TableHeader from '../components/TableHeader';
import { createTransportSlip, getAllTransportSlips, generatePDF } from '../services/slips';
import type { TransportSlip } from '../types';

const Transport = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slips, setSlips] = useState<TransportSlip[]>([]);
  const [loadingSlips, setLoadingSlips] = useState(true);
  const [editingSlip, setEditingSlip] = useState<TransportSlip | null>(null);
  const [emailSlip, setEmailSlip] = useState<TransportSlip | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState<TransportSlip | null>(null);
  const [viewingDocuments, setViewingDocuments] = useState<TransportSlip | null>(null);

  useEffect(() => {
    fetchSlips();
  }, []);

  const fetchSlips = async () => {
    try {
      const data = await getAllTransportSlips();
      setSlips(data);
    } catch (error) {
      console.error('Error fetching transport slips:', error);
      toast.error('Erreur lors du chargement des bordereaux');
    } finally {
      setLoadingSlips(false);
    }
  };

  const handleCreate = async (formData: any) => {
    setLoading(true);
    try {
      // Clean and validate the data before sending
      const cleanedData = {
        ...formData,
        // Ensure UUID fields are either valid UUIDs or null
        client_id: formData.client_id || null,
        vehicule_id: formData.vehicule_id || null,
        // Ensure numeric fields are properly typed
        volume: formData.volume ? Number(formData.volume) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        price: Number(formData.price),
        kilometers: formData.kilometers ? Number(formData.kilometers) : null,
        // Ensure boolean fields are properly typed
        photo_required: Boolean(formData.photo_required),
        // Ensure string fields are trimmed
        loading_address: formData.loading_address?.trim(),
        delivery_address: formData.delivery_address?.trim(),
        loading_contact: formData.loading_contact?.trim(),
        delivery_contact: formData.delivery_contact?.trim(),
        goods_description: formData.goods_description?.trim(),
        vehicle_type: formData.vehicle_type?.trim(),
        exchange_type: formData.exchange_type?.trim(),
        instructions: formData.instructions?.trim(),
        payment_method: formData.payment_method?.trim(),
        observations: formData.observations?.trim(),
        order_number: formData.order_number?.trim() || null
      };

      await createTransportSlip(cleanedData);
      setShowForm(false);
      fetchSlips();
      toast.success('Bordereau créé avec succès');
    } catch (error) {
      console.error('Error creating transport slip:', error);
      toast.error('Erreur lors de la création du bordereau');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingSlip) return;
    
    try {
      // TODO: Implement update logic
      setEditingSlip(null);
      fetchSlips();
      toast.success('Bordereau mis à jour avec succès');
    } catch (error) {
      console.error('Error updating slip:', error);
      toast.error('Erreur lors de la mise à jour du bordereau');
    }
  };

  const handleDownload = async (slip: TransportSlip) => {
    try {
      const pdfBlob = await generatePDF(slip, 'transport');
      
      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob);
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const clientName = slip.client?.nom || 'Client';
      const slipNumber = slip.number;
      const currentDate = format(new Date(), 'dd-MM-yyyy', { locale: fr });
      const filename = `${clientName} - ${slipNumber} - ${currentDate}.pdf`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Bordereau téléchargé avec succès');
    } catch (error) {
      console.error('Error downloading slip:', error);
      toast.error('Erreur lors du téléchargement du bordereau');
    }
  };

  const getDocumentCount = (slip: TransportSlip) => {
    return slip.documents ? Object.keys(slip.documents).length : 0;
  };

  if (loadingSlips) {
    return (
      <div className="w-full p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Transport</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Créer un bordereau
        </button>
      </div>

      {showForm && (
        <SlipForm
          type="transport"
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}

      {editingSlip && (
        <SlipForm
          type="transport"
          onSubmit={handleUpdate}
          onCancel={() => setEditingSlip(null)}
          initialData={editingSlip}
        />
      )}

      {emailSlip && (
        <EmailModal
          slip={emailSlip}
          type="transport"
          onClose={() => setEmailSlip(null)}
          clientEmail={emailSlip.client?.email}
        />
      )}

      {uploadingSlip && (
        <DocumentUploaderModal
          slipId={uploadingSlip.id}
          slipType="transport"
          onClose={() => setUploadingSlip(null)}
          onUploadComplete={fetchSlips}
        />
      )}

      {viewingDocuments && (
        <DocumentViewerModal
          slipId={viewingDocuments.id}
          slipType="transport"
          onClose={() => setViewingDocuments(null)}
          onDocumentDeleted={fetchSlips}
        />
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader>Statut</TableHeader>
              <TableHeader>Numéro</TableHeader>
              <TableHeader>Client</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Chauffeur</TableHeader>
              <TableHeader>Véhicule</TableHeader>
              <TableHeader>Prix HT</TableHeader>
              <TableHeader>Prix/km</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {slips.map((slip) => (
              <tr key={slip.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SlipStatusSelect
                    id={slip.id}
                    status={slip.status}
                    type="transport"
                    onUpdate={fetchSlips}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {slip.order_number ? `${slip.number} / ${slip.order_number}` : slip.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {slip.client?.nom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(slip.delivery_date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  John Doe {/* TODO: Add driver assignment */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {slip.vehicle_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {slip.price} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {slip.kilometers && slip.kilometers > 0 
                    ? `${(slip.price / slip.kilometers).toFixed(2)} €` 
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionButtons
                    slip={slip}
                    onEdit={() => setEditingSlip(slip)}
                    onEmail={() => setEmailSlip(slip)}
                    onUpload={() => setUploadingSlip(slip)}
                    onView={() => setViewingDocuments(slip)}
                    onDownload={() => handleDownload(slip)}
                    documentCount={getDocumentCount(slip)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transport;