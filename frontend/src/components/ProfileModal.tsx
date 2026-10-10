import React, { useState } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { getStoredToken } from '../services/api';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, logout, updateOnboarding } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const displayName = user?.profile?.preferredName || user?.name || 'User';
  const email = user?.email || 'N/A';
  const gender = user?.profile?.gender || 'Not specified';
  const dob = user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString() : 'Not specified';

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as any;
    setLanguage(newLang);
    if (user) {
      await updateOnboarding({ preferredLanguage: newLang });
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const token = getStoredToken();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const cleanUrl = baseUrl.replace(/\/+$/, '');
      const apiUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
      
      const res = await fetch(`${apiUrl}/auth/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        logout();
      } else {
        alert('Failed to delete account. Please try again later.');
        setIsDeleting(false);
      }
    } catch (err) {
      alert('Network error. Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: 'var(--white)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>User Profile</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <Icon name="X" size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</p>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{displayName}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</p>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{email}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Birth</p>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{dob}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</p>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{gender}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Language</p>
            <select 
              value={language} 
              onChange={handleLanguageChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', fontSize: '1rem', color: 'var(--ink)' }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.native} ({l.name})</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--line)', paddingTop: '1.5rem' }}>
          {deleteConfirm ? (
            <div style={{ backgroundColor: 'var(--peach)', padding: '1rem', borderRadius: 'var(--radius-sm)', color: 'var(--white)' }}>
              <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Are you sure you want to permanently delete your account? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="white" size="sm" onClick={() => setDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
                <button 
                  onClick={handleDeleteAccount} 
                  disabled={isDeleting}
                  style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="md" onClick={() => setDeleteConfirm(true)} fullWidth style={{ color: 'var(--peach)', borderColor: 'var(--peach)' }}>
              Delete Account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
