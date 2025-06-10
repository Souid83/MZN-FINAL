import React, { useState, useEffect } from 'react';
import { Save, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface EmailSettings {
  email: string;
  signature: string;
  template: string;
}

interface SmtpSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure: 'tls' | 'ssl';
}

export default function EmailSettings() {
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    email: '',
    signature: 'Cordialement,\nMZN Transport',
    template: `Bonjour,\n\nVeuillez trouver ci-joint le bordereau de transport.\n\n{signature}`
  });

  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: 'tls'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load email settings from localStorage
    const savedEmailSettings = localStorage.getItem('emailSettings');
    if (savedEmailSettings) {
      setEmailSettings(JSON.parse(savedEmailSettings));
    }

    // Load SMTP settings from Supabase
    loadSmtpSettings();
  }, []);

  const loadSmtpSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('config')
        .eq('type', 'smtp')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.config) {
        setSmtpSettings(data.config);
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      toast.error('Erreur lors du chargement des paramètres SMTP');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
    toast.success('Paramètres email enregistrés');
  };

  const handleSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'smtp',
          config: smtpSettings
        }, {
          onConflict: 'type'
        });

      if (error) throw error;
      toast.success('Configuration SMTP enregistrée');
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const testSmtpConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: smtpSettings
      });

      if (error) {
        throw new Error(error.message || 'Erreur lors du test SMTP');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('Connexion SMTP réussie');
    } catch (error) {
      console.error('SMTP test error:', error);
      toast.error(error.message || 'Erreur de connexion SMTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 ml-64">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Mail className="w-8 h-8" />
          Configuration Email
        </h1>

        <div className="space-y-6">
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Configuration des emails</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={emailSettings.email}
                    onChange={(e) => setEmailSettings({ ...emailSettings, email: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Signature
                  </label>
                  <textarea
                    value={emailSettings.signature}
                    onChange={(e) => setEmailSettings({ ...emailSettings, signature: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Votre signature..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cette signature sera automatiquement ajoutée à vos emails.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle d'email pour l'envoi de bordereau
                  </label>
                  <textarea
                    value={emailSettings.template}
                    onChange={(e) => setEmailSettings({ ...emailSettings, template: e.target.value })}
                    rows={8}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Modèle d'email..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Utilisez {'{signature}'} pour insérer votre signature.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save size={20} className="mr-2" />
                  Enregistrer
                </button>
              </div>
            </div>
          </form>

          <form onSubmit={handleSmtpSubmit} className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Configuration SMTP</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hôte SMTP
                  </label>
                  <input
                    type="text"
                    value={smtpSettings.smtp_host}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="smtp.example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={smtpSettings.smtp_port}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_port: parseInt(e.target.value) })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="587"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email expéditeur
                  </label>
                  <input
                    type="email"
                    value={smtpSettings.smtp_user}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_user: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="noreply@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={smtpSettings.smtp_pass}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_pass: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sécurité
                  </label>
                  <select
                    value={smtpSettings.smtp_secure}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_secure: e.target.value as 'tls' | 'ssl' })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={20} className="mr-2" />
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={testSmtpConnection}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Tester la connexion
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}