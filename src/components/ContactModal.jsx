import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, Phone, Globe, Fingerprint, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API_URL from '../config/api';
import ForgotPasswordModal from './ForgotPasswordModal';
import {
  isBiometricAvailable,
  getBiometricCredential,
  registerBiometric,
  verifyBiometric,
  clearBiometric,
} from '../services/webauthnService';

function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'dev_' + crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

export default function ContactModal({ onClose, onSuccess, initialMode = 'login' }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phoneNumber: '', preferredLanguage: 'en' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [lastLoginData, setLastLoginData] = useState(null);

  useEffect(() => {
    isBiometricAvailable().then(available => {
      setBiometricAvailable(available);
      if (available) setBiometricRegistered(!!getBiometricCredential());
    });
  }, []);

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '', phoneNumber: '', preferredLanguage: 'en' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError(t('auth.passwordMismatch'));
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber || undefined,
            preferredLanguage: formData.preferredLanguage,
            deviceId: getDeviceId()
          })
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.token);
          onSuccess(data.user);
        } else {
          setError(data.message || t('messages.signupError'));
        }
      } else {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            deviceId: getDeviceId()
          })
        });
        const data = await response.json();

        if (data.success) {
          localStorage.setItem('token', data.token);
          if (rememberMe) localStorage.setItem('rememberMe', 'true');
          if (biometricAvailable && !biometricRegistered) {
            setLastLoginData(data);
            setShowBiometricPrompt(true);
          } else {
            onSuccess(data.user);
          }
        } else if (data.deviceLimitReached) {
          setError(t('auth.deviceLimitReached', { max: data.maxDevices, plural: data.maxDevices > 1 ? 's' : '' }));
          return;
        } else {
          setError(data.message || t('auth.invalidCredentials'));
        }
      }
    } catch (err) {
      setError(t('messages.networkError'));
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre Completo</label>
            <div className="relative">
              {/* <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-tertiary" /> */}
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                placeholder="555-123-4567"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefono / Whastapp</label>
            <div className="relative">
              {/* <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-tertiary" /> */}
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
            <label className="block text-sm font-medium mb-2">Mensaje</label>
            <div className="relative">
              {/* <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-tertiary" /> */}
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
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
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

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
