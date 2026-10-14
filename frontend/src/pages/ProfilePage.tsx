import React, { useState } from 'react';
import { SideNav } from '../components/SideNav';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { getStoredToken } from '../services/api';
import '../styles/dashboard.css';

const PREVIOUS_THERAPY_LABELS: Record<string, string> = {
  none: 'Never attended before',
  some: 'A few sessions in the past',
  extensive: 'Extensive therapy experience',
  prefer_not_to_say: 'Prefer not to say',
  '': 'Not specified'
};

const UNDER_CARE_LABELS: Record<string, string> = {
  yes: 'Currently under care',
  no: 'Not currently',
  previously: 'Previously, but not now',
  prefer_not_to_say: 'Prefer not to say',
  '': 'Not specified'
};

export const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile, refreshUser } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isUpdatingLang, setIsUpdatingLang] = useState(false);

  // Form edit states initialized with user profile
  const [editName, setEditName] = useState(user?.name || '');
  const [editPreferredName, setEditPreferredName] = useState(user?.profile?.preferredName || '');
  const [editPhone, setEditPhone] = useState(user?.profile?.phone || '');
  const [editEmergencyContact, setEditEmergencyContact] = useState(user?.profile?.emergencyContact || '');
  const [editPreviousTherapy, setEditPreviousTherapy] = useState(user?.profile?.previousTherapyExperience || '');
  const [editUnderCare, setEditUnderCare] = useState(user?.profile?.underProfessionalCare || '');
  const [editHearAboutUs, setEditHearAboutUs] = useState(user?.profile?.howDidYouHearAboutUs || '');
  const [editGender, setEditGender] = useState(user?.profile?.gender || '');
  const [editDob, setEditDob] = useState(
    user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : ''
  );

  const displayName = user?.profile?.preferredName || user?.name || 'User';
  const email = user?.email || 'N/A';
  const phone = user?.profile?.phone || 'Not provided';
  const emergencyContact = user?.profile?.emergencyContact || 'Not provided';
  const previousTherapy = user?.profile?.previousTherapyExperience || '';
  const underProfessionalCare = user?.profile?.underProfessionalCare || '';
  const howDidYouHear = user?.profile?.howDidYouHearAboutUs || 'Not specified';
  const gender = user?.profile?.gender || 'Not specified';
  const dob = user?.profile?.dateOfBirth
    ? new Date(user.profile.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not specified';

  const startEditing = () => {
    setEditName(user?.name || '');
    setEditPreferredName(user?.profile?.preferredName || '');
    setEditPhone(user?.profile?.phone || '');
    setEditEmergencyContact(user?.profile?.emergencyContact || '');
    setEditPreviousTherapy(user?.profile?.previousTherapyExperience || '');
    setEditUnderCare(user?.profile?.underProfessionalCare || '');
    setEditHearAboutUs(user?.profile?.howDidYouHearAboutUs || '');
    setEditGender(user?.profile?.gender || '');
    setEditDob(user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '');
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    const payload: any = {
      name: editName.trim(),
      profile: {
        preferredName: editPreferredName.trim(),
        phone: editPhone.trim(),
        emergencyContact: editEmergencyContact.trim(),
        previousTherapyExperience: editPreviousTherapy,
        underProfessionalCare: editUnderCare,
        howDidYouHearAboutUs: editHearAboutUs.trim(),
        gender: editGender
      }
    };

    if (editDob) {
      payload.profile.dateOfBirth = editDob;
    }

    const res = await updateProfile(payload);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setIsEditing(false);
      await refreshUser();
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setSaveError(res.error || 'Failed to update profile.');
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as any;
    setLanguage(newLang);
    if (user) {
      setIsUpdatingLang(true);
      await updateProfile({ profile: { preferredLanguage: newLang } });
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
          Authorization: `Bearer ${token}`
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

      <main className="dashboard-main profile-page-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--sage)', textTransform: 'uppercase' }}>
                Account & Settings
              </span>
            </div>
            <h1 className="dashboard-greeting" style={{ fontSize: '2.25rem', marginBottom: '0.35rem' }}>
              Personal Profile
            </h1>
            <p className="dashboard-subtext">View and manage your health background, contact information, and security preferences.</p>
          </div>

          {!isEditing && (
            <Button
              variant="primary"
              size="md"
              onClick={startEditing}
              icon={<Icon name="Edit3" size={16} color="#FFFFFF" />}
              style={{
                boxShadow: '0 4px 14px rgba(11, 68, 61, 0.2)',
                padding: '0.65rem 1.4rem',
                fontWeight: 600,
                fontSize: '0.92rem'
              }}
            >
              Edit Profile Details
            </Button>
          )}
        </div>

        {saveSuccess && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'rgba(49, 95, 80, 0.08)',
              border: '1px solid var(--green)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              fontWeight: 500,
              fontSize: '0.95rem'
            }}
          >
            <Icon name="CheckCircle" size={20} color="var(--green)" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {saveError && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'rgba(235, 87, 87, 0.08)',
              border: '1px solid #eb5757',
              borderRadius: 'var(--radius-md)',
              color: '#d32f2f',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              fontWeight: 500,
              fontSize: '0.95rem'
            }}
          >
            <Icon name="AlertCircle" size={20} color="#d32f2f" />
            <span>{saveError}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Profile Header Card */}
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, var(--green), var(--sage), var(--peach))'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--green), var(--green-dark))',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(49, 95, 80, 0.25)'
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)' }}>{displayName}</h2>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--soft-green)',
                      color: 'var(--green)',
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--sage-light)'
                    }}
                  >
                    Patient Member
                  </span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {email} • Joined Triora
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', minWidth: '180px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: 'var(--sage)',
                      letterSpacing: '0.08em',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    disabled={isUpdatingLang}
                    style={{
                      width: '100%',
                      padding: '0.55rem 2rem 0.55rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--line)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      backgroundColor: 'var(--paper)',
                      appearance: 'none',
                      cursor: 'pointer',
                      opacity: isUpdatingLang ? 0.7 : 1
                    }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.native} ({l.name})
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="ChevronDown"
                    size={14}
                    color="var(--muted)"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      bottom: '0.75rem',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Mode View */}
          {isEditing ? (
            <div
              style={{
                backgroundColor: 'var(--white)',
                border: '2px solid var(--green)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)' }}>Edit Personal Details</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Update your contact information, care history, and preferences.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleSaveProfile}>
                {/* Basic Info */}
                <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', marginBottom: '1rem' }}>
                  Basic Information
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="editName">Full Legal Name</label>
                    <input
                      id="editName"
                      type="text"
                      className="form-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="editPreferredName">Preferred Name</label>
                    <input
                      id="editPreferredName"
                      type="text"
                      className="form-input"
                      value={editPreferredName}
                      onChange={(e) => setEditPreferredName(e.target.value)}
                      placeholder="What should Triora call you?"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="editDob">Date of Birth</label>
                    <input
                      id="editDob"
                      type="date"
                      className="form-input"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="editGender">Gender</label>
                    <select
                      id="editGender"
                      className="form-input"
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Contact & Emergency */}
                <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', marginBottom: '1rem' }}>
                  Contact & Emergency Information
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="editPhone">Phone Number</label>
                    <input
                      id="editPhone"
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 000-0000"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="editEmergencyContact">Emergency Contact</label>
                    <input
                      id="editEmergencyContact"
                      type="text"
                      className="form-input"
                      placeholder="Name & contact phone number"
                      value={editEmergencyContact}
                      onChange={(e) => setEditEmergencyContact(e.target.value)}
                    />
                  </div>
                </div>

                {/* Care History & Source */}
                <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', marginBottom: '1rem' }}>
                  Care Experience & Discovery
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="editPreviousTherapy">Previous Therapy Experience</label>
                    <select
                      id="editPreviousTherapy"
                      className="form-input"
                      value={editPreviousTherapy}
                      onChange={(e) => setEditPreviousTherapy(e.target.value)}
                    >
                      <option value="">Select experience</option>
                      <option value="none">Never attended before</option>
                      <option value="some">A few sessions in the past</option>
                      <option value="extensive">Extensive therapy experience</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="editUnderCare">Currently Under Professional Care</label>
                    <select
                      id="editUnderCare"
                      className="form-input"
                      value={editUnderCare}
                      onChange={(e) => setEditUnderCare(e.target.value)}
                    >
                      <option value="">Select status</option>
                      <option value="yes">Currently under care</option>
                      <option value="no">Not currently</option>
                      <option value="previously">Previously, but not now</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                    <label className="form-label" htmlFor="editHearAboutUs">How Did You Hear About Us?</label>
                    <select
                      id="editHearAboutUs"
                      className="form-input"
                      value={editHearAboutUs}
                      onChange={(e) => setEditHearAboutUs(e.target.value)}
                    >
                      <option value="">Select an option</option>
                      <option value="Doctor or Therapist Recommendation">Doctor or Therapist Recommendation</option>
                      <option value="Friend or Family">Friend or Family</option>
                      <option value="Social Media (Instagram, Twitter, etc.)">Social Media (Instagram, Twitter, etc.)</option>
                      <option value="Search Engine (Google, Bing)">Search Engine (Google, Bing)</option>
                      <option value="Mental Health Forum / Community">Mental Health Forum / Community</option>
                      <option value="Article or News">Article or News</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSaving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* Attractive Display Mode */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {/* Card 1: Contact & Emergency Information */}
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--line)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--soft-green)',
                      color: 'var(--green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon name="PhoneCall" size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>Contact & Safety</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Phone and safety contacts</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                      Phone Number
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="Phone" size={15} color="var(--muted)" />
                      <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)' }}>{phone}</span>
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                      Emergency Contact
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="ShieldAlert" size={15} color="var(--muted)" />
                      <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)' }}>{emergencyContact}</span>
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                      Account Email
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="Mail" size={15} color="var(--muted)" />
                      <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)' }}>{email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Care History & Clinical Context */}
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--line)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(230, 180, 134, 0.2)',
                      color: '#b36a28',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon name="Activity" size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>Care & Clinical Context</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Therapy history and referral</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                      Previous Therapy Experience
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="FileHeart" size={15} color="var(--muted)" />
                      <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)' }}>
                        {PREVIOUS_THERAPY_LABELS[previousTherapy] || previousTherapy || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                      Under Professional Care
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="Stethoscope" size={15} color="var(--muted)" />
                      <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)' }}>
                        {UNDER_CARE_LABELS[underProfessionalCare] || underProfessionalCare || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                      How Did You Hear About Us?
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="Compass" size={15} color="var(--muted)" />
                      <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)' }}>{howDidYouHear}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Demographics & Personal Attributes */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--line)', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--soft-green)',
                      color: 'var(--green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon name="UserCheck" size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>Demographics & Personal Profile</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Age, gender, and personal identifiers</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                      Date of Birth
                    </p>
                    <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)' }}>{dob}</span>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                      Gender
                    </p>
                    <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)', textTransform: 'capitalize' }}>{gender}</span>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                      Preferred Name
                    </p>
                    <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)' }}>{displayName}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div
            style={{
              backgroundColor: 'rgba(235, 87, 87, 0.04)',
              border: '1px solid rgba(235, 87, 87, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 2rem'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--peach)', marginBottom: '0.75rem' }}>
              Danger Zone
            </h3>

            {deleteConfirm ? (
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--peach)',
                  boxShadow: '0 4px 12px rgba(235, 87, 87, 0.1)'
                }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
                  Are you absolutely sure?
                </h4>
                <p style={{ color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.5, fontSize: '0.9rem' }}>
                  This action cannot be undone. This will permanently delete your account, wipe all your conversation history, and remove your personal data from our servers.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button
                    variant="primary"
                    size="md"
                    style={{ backgroundColor: 'var(--peach)' }}
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                  </Button>
                  <Button variant="outline" size="md" onClick={() => setDeleteConfirm(false)} disabled={isDeleting}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <p style={{ color: 'var(--muted)', margin: 0, maxWidth: '450px', lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Once you delete your account, there is no going back. All personal data and session transcripts will be permanently purged.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ color: 'var(--peach)', borderColor: 'var(--peach)' }}
                  onClick={() => setDeleteConfirm(true)}
                >
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
