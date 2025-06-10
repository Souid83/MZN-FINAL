import React, { useState, useEffect } from 'react';
import { X, Send, Plus, Bot, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendEmail } from '../services/email';
import { generatePDF } from '../services/slips';
import AIEmailAssistant from './AIEmailAssistant';
import type { TransportSlip, FreightSlip } from '../types';

interface EmailModalProps {
  slip: TransportSlip | FreightSlip;
  type: 'transport' | 'freight';
  onClose: () => void;
  clientEmail?: string;
}

export default function EmailModal({ slip, type, onClose, clientEmail }: EmailModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMode, setAIMode] = useState<'generate' | 'improve'>('generate');

  useEffect(() => {
    if (clientEmail) {
      setEmailList([clientEmail]);
    }

    setSubject(type === 'transport' 
      ? `Bordereau de transport - ${slip.client?.nom || 'Client'} - ${slip.number}`
      : `Confirmation d'affrètement - ${slip.client?.nom || 'Client'} - ${slip.number}`
    );

    // Load default email template from settings
    const savedSettings = localStorage.getItem('emailSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const body = settings.template
        .replace('{signature}', settings.signature)
        .replace('{client}', slip.client?.nom || 'Client')
        .replace('{number}', slip.number);
      setEmailBody(body);
    } else {
      setEmailBody(`Bonjour,\n\nVeuillez trouver ci-joint le bordereau ${type === 'transport' ? 'de transport' : "d'affrètement"}.\n\nCordialement,\nMZN Transport`);
    }
  }, [slip, type, clientEmail]);

  const handleAddEmail = () => {
    if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      if (!emailList.includes(emailInput)) {
        setEmailList([...emailList, emailInput]);
      }
      setEmailInput('');
    } else {
      toast.error('Adresse email invalide');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSend = async () => {
    if (emailList.length === 0) {
      toast.error('Veuillez ajouter au moins un destinataire');
      return;
    }

    try {
      setSending(true);

      const pdfBlob = await generatePDF(slip, type);
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(pdfBlob);
      });

      const additionalFilesPromises = additionalFiles.map(async (file) => {
        return new Promise<{name: string, content: string, contentType: string}>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve({
              name: file.name,
              content: base64.split(',')[1],
              contentType: file.type
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const additionalFilesBase64 = await Promise.all(additionalFilesPromises);

      const attachments = [
        {
          filename: `bordereau_${slip.number}.pdf`,
          content: pdfBase64,
          contentType: 'application/pdf'
        },
        ...additionalFilesBase64.map(file => ({
          filename: file.name,
          content: file.content,
          contentType: file.contentType
        }))
      ];

      await sendEmail({
        to: emailList.join(', '),
        subject,
        body: emailBody,
        attachments
      });

      toast.success('Email envoyé avec succès');
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSending(false);
    }
  };

  const handleGeneratedText = (text: string) => {
    setEmailBody(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Envoyer le bordereau</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              À l'attention de
            </label>
            <div className="text-sm text-gray-600 mb-2">
              {type === 'transport' 
                ? slip.client?.nom 
                : `${slip.client?.nom} (via ${slip.fournisseur?.nom})`}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destinataires
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {emailList.map((email, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => setEmailList(emails => emails.filter(e => e !== email))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ajouter une adresse email"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objet
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAIMode('generate');
                    setShowAIAssistant(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                >
                  <Bot size={16} />
                  Assistant IA
                </button>
                {emailBody && (
                  <button
                    onClick={() => {
                      setAIMode('improve');
                      setShowAIAssistant(true);
                    }}
                    className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"
                  >
                    <Bot size={16} />
                    Améliorer
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={6}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pièces jointes
            </label>
            <div className="p-3 bg-gray-50 rounded-md mb-2">
              <div className="text-sm">
                <span className="font-medium">Document principal : </span>
                Bordereau {type === 'transport' ? 'de transport' : "d'affrètement"} {slip.number}
              </div>
            </div>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files) {
                  setAdditionalFiles([...additionalFiles, ...Array.from(e.target.files)]);
                }
              }}
              multiple
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {additionalFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {additionalFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAdditionalFiles(files => files.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || emailList.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={20} />
              {sending ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </div>
        </div>

        {showAIAssistant && (
          <AIEmailAssistant
            onClose={() => setShowAIAssistant(false)}
            onGenerate={handleGeneratedText}
            clientName={slip.client?.nom || 'Client'}
            documentType={type}
            documentNumber={slip.number}
            currentText={aiMode === 'improve' ? emailBody : undefined}
            mode={aiMode}
          />
        )}
      </div>
    </div>
  );
}