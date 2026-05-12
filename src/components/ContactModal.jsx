import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, Phone, Globe, Fingerprint, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API_URL from '../config/api';

export default function ContactModal({ onClose, onSuccess, initialMode = 'login' }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', message: ''});
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!privacyPolicy) {
      setError('Debes aceptar la política de privacidad para enviar el formulario.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el formulario');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-elevated rounded-lg max-w-md w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Formulario de Contacto
          </h2>
          <button onClick={onClose} className="text-brand-text-tertiary hover:text-white">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-500">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre Completo</label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-2 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent"
                placeholder="Juan Pérez"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
            <div className="relative">
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-2 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefono / Whastapp</label>
            <div className="relative">
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full pl-2 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent"                
                placeholder="555-123-4567"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mensaje</label>
            <div className="relative">
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full pl-2 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent"
                placeholder="Escribe tu mensaje aquí..."
                rows={5}
                required
              >  
              </textarea>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent focus:ring-accent focus:ring-offset-0"
              />
              <span className="text-sm text-brand-text-tertiary">He leído y acepto la política de privacidad</span>
            </label>
          </div>

          <div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent hover:bg-accent-hover rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>

      </div>

    </div>
  );
}
