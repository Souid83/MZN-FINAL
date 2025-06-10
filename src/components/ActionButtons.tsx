import React from 'react';
import { Pencil, Send, FileText, Upload, Folder, Trash2, Download } from 'lucide-react';
import type { TransportSlip, FreightSlip } from '../types';

interface ActionButtonsProps {
  slip: TransportSlip | FreightSlip;
  onEdit: () => void;
  onEmail: () => void;
  onUpload: () => void;
  onView: () => void;
  onDownload: () => void;
  onDownloadBPA?: () => void;
  onDownloadBonDeCommande?: () => void;
  onDelete?: () => void;
  documentCount?: number;
  showBPA?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  slip,
  onEdit,
  onEmail,
  onUpload,
  onView,
  onDownload,
  onDownloadBPA,
  onDownloadBonDeCommande,
  onDelete,
  documentCount = 0,
  showBPA = false
}) => {
  return (
    <div className="flex items-center justify-end space-x-2">
      <div className="group relative">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
          title="Modifier"
        >
          <Pencil size={18} />
        </button>
        <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Modifier le bordereau
        </span>
      </div>

      <div className="group relative">
        <button
          onClick={onEmail}
          className="p-1.5 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
          title="Envoyer"
        >
          <Send size={18} />
        </button>
        <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Envoyer par email
        </span>
      </div>

      <div className="group relative">
        <button
          onClick={onUpload}
          className="p-1.5 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
          title="Importer"
        >
          <Upload size={18} />
        </button>
        <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Importer un document
        </span>
      </div>

      <div className="group relative">
        <button
          onClick={onView}
          className="p-1.5 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 flex items-center"
          title="Consulter"
        >
          <Folder size={18} />
          {documentCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-100 text-blue-800 text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {documentCount}
            </span>
          )}
        </button>
        <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {documentCount > 0 ? `Consulter documents joints (${documentCount})` : 'Aucun document joint'}
        </span>
      </div>

      <div className="group relative">
        <button
          onClick={onDownload}
          className="p-1.5 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
          title="Télécharger"
        >
          <FileText size={18} />
        </button>
        <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Télécharger le bordereau
        </span>
      </div>

      {showBPA && onDownloadBPA && (
        <div className="group relative">
          <button
            onClick={onDownloadBPA}
            className="p-1.5 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
            title="Télécharger BPA"
          >
            <Download size={18} />
          </button>
          <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            Télécharger le BPA
          </span>
        </div>
      )}

      {showBPA && onDownloadBonDeCommande && (
        <div className="group relative">
          <button
            onClick={onDownloadBonDeCommande}
            className="p-1.5 text-purple-600 hover:text-purple-800 rounded-full hover:bg-purple-50"
            title="Télécharger Bon de Commande"
          >
            <Download size={18} />
          </button>
          <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            Télécharger le Bon de Commande
          </span>
        </div>
      )}

      {onDelete && (
        <div className="group relative">
          <button
            onClick={onDelete}
            className="p-1.5 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
          <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            Supprimer le bordereau
          </span>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;