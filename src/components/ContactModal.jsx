import { useState, useEffect, useRef } from 'react';
import { X, Upload, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Phone, Globe, Fingerprint, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API_URL from '../config/api';

export default function ContactModal({ onClose, onSuccess, initialMode = 'login' }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', subject: '', message: ''});
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const attachmentRef = useRef(null);
  const [attachmentList, setAttachmentList] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!privacyPolicy) {
      setError('Debes aceptar la política de privacidad para enviar el formulario.');
      return;
    }

    try {
      setLoading(true);
      // const response = await fetch(`${API_URL}/contact`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Send form data with attachments using FormData
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('phoneNumber', formData.phoneNumber);
      formPayload.append('subject', formData.subject);
      formPayload.append('message', formData.message);
      attachmentList.forEach((file, idx) => {
        formPayload.append(`attachment_${idx}`, file);
      });
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el formulario');
      }

      // Clear form
      setFormData({ name: '', email: '', phoneNumber: '', subject: '', message: ''});
      setAttachmentList([]);

      // Nofity success
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    // const files = Array.from(e.dataTransfer.files).filter(f => 
    //   f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|flac|m4a)$/i)
    // );
    //setAttachmentList(prev => [...prev, ...files]);
    console.log('Dropped files:', files);
    setAttachmentList([files[0]]);
  };

  const handleAttachmentSelect = (e) => {
    const files = Array.from(e.target.files);
    // setAttachmentList(prev => [...prev, ...files]);
    setAttachmentList([files[0]]);
  };

  const removeAttachment = (index) => {
    setAttachmentList(prev => prev.filter((_, i) => i !== index));
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

        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-500">
            <CheckCircle size={20} />
            <span>Formulario enviado con éxito. Te responderemos lo antes posible.</span>
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
            <label className="block text-sm font-medium mb-2">Asunto</label>
            <div className="relative">
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full pl-2 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent"
                placeholder="Asunto del mensaje"
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

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => attachmentRef.current?.click()}
            className={`mb-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging ? 'border-accent bg-accent/10' : 'border-white/20 hover:border-accent/50 hover:bg-white/5'
            }`}
          >
            <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-accent' : 'text-brand-text-tertiary'}`} />
            <p className="text-sm font-medium text-white mb-1">
              {isDragging ? t('tracks.dropHere') : t('tracks.clickOrDrag')}
            </p>
            <input
              ref={attachmentRef}
              type="file"
              multiple
              onChange={handleAttachmentSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {attachmentList.length > 0 && (
            <div className="mb-4 space-y-2">
              {/* <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">{t('tracks.filesSelected', { count: attachmentList.length })}</p>
                <button
                  type="button"
                  onClick={() => setAttachmentList([])}
                  className="text-xs text-brand-text-tertiary hover:text-red-400 transition-colors"
                >
                  {t('tracks.clearAll')}
                </button>
              </div> */}
              <div className="max-h-40 overflow-y-auto space-y-2">
                {attachmentList.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs text-white flex-1 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-brand-text-tertiary hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}



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
          
          {success && 
          <div  className="text-sm text-brand-text-tertiary text-justify bg-white/5 p-2 border border-dashed rounded border-white/10">
            Te responderemos lo antes posible. Si tienes alguna duda, puedes escribirnos a <a href="mailto:contacto.tododjs@gmail.com">contacto.tododjs@gmail.com</a>, <a href="mailto:support@tododjs.com">support@tododjs.com</a> o por Instagram: <a href="https://www.instagram.com/todo_djs" target="_blank" rel="noopener noreferrer">@todo_djs</a>
          </div>
          }

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
