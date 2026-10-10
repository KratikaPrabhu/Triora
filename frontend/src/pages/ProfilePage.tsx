import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { getStoredToken } from '../services/api';
import '../styles/dashboard.css';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateOnboarding } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isUpdatingLang, setIsUpdatingLang] = useState(false);

  const displayName = user?.profile?.preferredName || user?.name || 'User';
  const email = user?.email || 'N/A';
  const gender = user?.profile?.gender || 'Not specified';
  const dob = user?.profile?.dateOfBirth 
    ? new Date(user.profile.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Not specified';

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as any;
    setLanguage(newLang);
    if (user) {
      setIsUpdatingLang(true);
      await updateOnboarding({ preferredLanguage: newLang });
      setIsUpdatingLang(false);
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
        setDeleteConfirm(false);
      }
    } catch (err) {
      alert('Network error. Failed to delete account.');
      setIsDeleting(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <SideNav />

      <main className="dashboard-main" style={{ padding: '2rem 3rem' }}>
        <div className="dashboard-header-top" style={{ marginBottom: '1.5rem' }}>
          <h1 className="dashboard-greeting" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Account Settings
          </h1>
          <p className="dashboard-subtext">Manage your personal profile, language preferences, and security.</p>
        </div>

        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Profile Card */}
          <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--green)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>{displayName}</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Patient Account</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Email Address</p>
                <p style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>{email}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Date of Birth</p>
                <p style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>{dob}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Gender</p>
                <p style={{ fontSize: '1.05rem', color: 'var(--ink)', textTransform: 'capitalize' }}>{gender}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Language</p>
                <div style={{ position: 'relative', maxWidth: '300px' }}>
                  <select 
                    value={language}  
                    onChange={handleLanguageChange}
                    disabled={isUpdatingLang}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', fontSize: '0.9rem', color: 'var(--ink)', backgroundColor: 'var(--paper)', appearance: 'none', cursor: 'pointer', opacity: isUpdatingLang ? 0.7 : 1 }}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.native} ({l.name})</option>
                    ))}
                  </select>
                  <Icon name="ChevronDown" size={16} color="var(--muted)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ backgroundColor: 'rgba(235, 87, 87, 0.04)', border: '1px solid rgba(235, 87, 87, 0.2)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--peach)', marginBottom: '0.75rem' }}>Danger Zone</h3>
            
            {deleteConfirm ? (
              <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--peach)', boxShadow: '0 4px 12px rgba(235, 87, 87, 0.1)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>Are you absolutely sure?</h4>
                <p style={{ color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.5, fontSize: '0.9rem' }}>
                  This action cannot be undone. This will permanently delete your account, wipe all your conversation history, and remove your personal data from our servers.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button variant="primary" size="md" style={{ backgroundColor: 'var(--peach)' }} onClick={handleDeleteAccount} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                  </Button>
                  <Button variant="outline" size="md" onClick={() => setDeleteConfirm(false)} disabled={isDeleting}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ color: 'var(--muted)', margin: 0, maxWidth: '400px', lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="outline" size="sm" style={{ color: 'var(--peach)', borderColor: 'var(--peach)' }} onClick={() => setDeleteConfirm(true)}>
                  Delete Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
