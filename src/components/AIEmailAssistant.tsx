import React, { useState, useEffect } from 'react';
import { X, Bot, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AIEmailAssistantProps {
  onClose: () => void;
  onGenerate: (text: string) => void;
  clientName: string;
  documentType: 'transport' | 'freight';
  documentNumber: string;
  currentText?: string;
  mode?: 'generate' | 'improve';
}

export default function AIEmailAssistant({
  onClose,
  onGenerate,
  clientName,
  documentType,
  documentNumber,
  currentText,
  mode = 'generate'
}: AIEmailAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateEmail();
  }, []);

  const callAIProvider = async (provider: string, apiKey: string, prompt: string) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant qui aide à rédiger des emails professionnels en français."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content;
  };

  const generateEmail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get AI settings
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('config')
        .eq('type', 'ai')
        .single();

      if (settingsError) throw settingsError;

      let prompt;
      if (mode === 'improve') {
        prompt = `Améliore ce mail tout en gardant le même sens et le même ton professionnel:\n\n${currentText}`;
      } else {
        prompt = settings?.config?.email_prompt
          ?.replace('{client}', clientName)
          ?.replace('{type_document}', documentType === 'transport' ? 'transport' : 'affrètement')
          ?.replace('{numero_document}', documentNumber);
      }

      if (!prompt) {
        throw new Error('Le prompt n\'est pas configuré');
      }

      const apiKeys = settings?.config?.api_keys || [];
      if (apiKeys.length === 0) {
        throw new Error('Aucune clé API n\'est configurée');
      }

      // Sort API keys by priority
      const sortedKeys = [...apiKeys].sort((a, b) => a.priority - b.priority);

      // Try each API key in order until one works
      let lastError = null;
      for (const apiKey of sortedKeys) {
        try {
          const result = await callAIProvider(apiKey.provider, apiKey.key, prompt);
          if (result) {
            onGenerate(result);
            onClose();
            return;
          }
        } catch (err) {
          lastError = err;
          console.error(`Error with ${apiKey.provider}:`, err);
          continue; // Try next API key
        }
      }

      // If we get here, all API keys failed
      throw lastError || new Error('Toutes les API ont échoué');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bot className="text-blue-600" />
            Assistant IA
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <Loader size={48} className="mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Génération en cours...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}