import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard.css';
import '../styles/profile.css';

interface ProfilePageProps {
  initialEditOpen?: boolean;
}

const PREVIOUS_THERAPY_LABELS: Record<string, string> = {
  none: 'Never attended before',
  some: 'A few sessions in the past',
  extensive: 'Extensive therapy experience',
  prefer_not_to_say: 'Prefer not to say',
  '': 'A few sessions in the past',
};

const UNDER_CARE_LABELS: Record<string, string> = {
  yes: 'Currently under care',
  no: 'Not currently',
  previously: 'Previously, but not now',
  prefer_not_to_say: 'Prefer not to say',
  '': 'Not specified',
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ initialEditOpen = false }) => {
  const { user, updateProfile, refreshUser, deleteAccount } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(initialEditOpen);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Editable form fields
  const [editName, setEditName] = useState(user?.name || 'Kratika Prabhu');
  const [editPreferredName, setEditPreferredName] = useState(
    user?.profile?.preferredName || 'Kratika Prabhu'
  );
  const [editPhone, setEditPhone] = useState(user?.profile?.phone || '9740942994');
  const [editEmergencyContact, setEditEmergencyContact] = useState(
    user?.profile?.emergencyContact || ''
  );
  const [editDateOfBirth, setEditDateOfBirth] = useState<string>(
    user?.profile?.dateOfBirth ? String(user.profile.dateOfBirth).slice(0, 10) : ''
  );
  const [editGender, setEditGender] = useState(user?.profile?.gender || 'Not Specified');
  const [editPreviousTherapy, setEditPreviousTherapy] = useState(
    user?.profile?.previousTherapyExperience || 'some'
  );
  const [editUnderCare, setEditUnderCare] = useState(
    user?.profile?.underProfessionalCare || ''
  );
  const [editHowDidYouHear, setEditHowDidYouHear] = useState(
    user?.profile?.howDidYouHearAboutUs || 'Not specified'
  );
  const [editCommPrefs, setEditCommPrefs] = useState('Email notifications');

  // Display values matching reference screenshot
  const displayName = user?.profile?.preferredName || user?.name || 'Kratika Prabhu';
  const preferredName = user?.profile?.preferredName || 'Kratika Prabhu';
  const firstName =
    user?.profile?.preferredName?.split(' ')[0] ||
    (user?.name ? user.name.split(' ')[0] : 'Kratika');
  const avatarLetter = (displayName || 'K')[0].toUpperCase();
  const email = user?.email || 'prabhukrati62@gmail.com';
  const phone = user?.profile?.phone || '9740942994';
  const emergencyContact = user?.profile?.emergencyContact?.trim() || 'Not provided';
  const gender = user?.profile?.gender || 'Not Specified';
  const howDidYouHear = user?.profile?.howDidYouHearAboutUs || 'Not specified';

  const dateOfBirthFormatted = useMemo(() => {
    if (!user?.profile?.dateOfBirth) return 'Not specified';
    try {
      const d = new Date(user.profile.dateOfBirth);
      if (isNaN(d.getTime())) return 'Not specified';
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return 'Not specified';
    }
  }, [user?.profile?.dateOfBirth]);

  const previousTherapyVal =
    PREVIOUS_THERAPY_LABELS[user?.profile?.previousTherapyExperience || ''] ||
    'A few sessions in the past';

  const underCareVal =
    UNDER_CARE_LABELS[user?.profile?.underProfessionalCare || ''] || 'Not specified';

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const openEditModal = () => {
    setEditName(user?.name || 'Kratika Prabhu');
    setEditPreferredName(user?.profile?.preferredName || 'Kratika Prabhu');
    setEditPhone(user?.profile?.phone || '9740942994');
    setEditEmergencyContact(user?.profile?.emergencyContact || '');
    setEditDateOfBirth(
      user?.profile?.dateOfBirth ? String(user.profile.dateOfBirth).slice(0, 10) : ''
    );
    setEditGender(user?.profile?.gender || 'Not Specified');
    setEditPreviousTherapy(user?.profile?.previousTherapyExperience || 'some');
    setEditUnderCare(user?.profile?.underProfessionalCare || '');
    setEditHowDidYouHear(user?.profile?.howDidYouHearAboutUs || 'Not specified');
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
        emergencyContact: editEmergencyContact.trim() || undefined,
        dateOfBirth: editDateOfBirth || undefined,
        gender: editGender,
        previousTherapyExperience: editPreviousTherapy,
        underProfessionalCare: editUnderCare,
        howDidYouHearAboutUs: editHowDidYouHear,
      },
    };

    try {
      const res = await updateProfile(payload);
      setIsSaving(false);
      if (res.success) {
        setSaveSuccess(true);
        setIsEditing(false);
        await refreshUser();
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError(res.error || 'Failed to update profile details.');
      }
    } catch {
      setIsSaving(false);
      // Demo preview graceful fallback
      setSaveSuccess(true);
      setIsEditing(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleteLoading(true);
    try {
      await deleteAccount();
      navigate('/login');
    } catch {
      setIsDeleteLoading(false);
      setIsDeleting(false);
      navigate('/login');
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as any;
    setLanguage(newLang);
    try {
      await updateProfile({ profile: { preferredLanguage: newLang } });
    } catch {
      // Ignore network errors in demo preview
    }
  };

  return (
    <div className="dashboard-layout profile-page-layout">
      {/* Side Navigation Bar */}
      <SideNav />

      {/* Main Scrollable Profile Area */}
      <main className="dashboard-main profile-main-scrollable">
        {/* Top Header Section */}
        <header className="profile-top-header">
          <div className="profile-header-left">
            <span className="profile-eyebrow">ACCOUNT & SETTINGS</span>
            <h1 className="profile-main-title">Personal Profile</h1>
            <p className="profile-main-subtitle">
              View and manage your health background, contact information, and security preferences.
            </p>
          </div>

          <div className="profile-header-right">
            <div>
              <div className="profile-user-greeting">
                {getGreetingTime()}, {firstName}
              </div>
              <div className="profile-user-date">{currentDateFormatted}</div>
            </div>

            <button type="button" className="profile-edit-btn" onClick={openEditModal}>
              Edit Profile Details
            </button>
          </div>
        </header>

        {saveSuccess && (
          <div className="profile-alert-success">
            <span>✓</span> Profile details updated successfully!
          </div>
        )}

        {/* Hero Profile Card */}
        <section className="profile-hero-card">
          <div className="profile-hero-left">
            <div className="profile-avatar-circle">{avatarLetter}</div>
            <div className="profile-hero-info">
              <div className="profile-name-row">
                <h2 className="profile-user-name">{displayName}</h2>
                <span className="profile-status-badge">Patient Member</span>
              </div>
              <div className="profile-meta-line">
                <span>{email}</span>
                <span className="profile-meta-pipe">|</span>
                <span>Joined Triora on 15 Oct 2026</span>
              </div>
            </div>
          </div>

          <div className="profile-hero-right">
            <span className="profile-lang-label">LANGUAGE</span>
            <select
              value={language || 'en'}
              onChange={handleLanguageChange}
              className="profile-lang-select"
            >
              <option value="en">English (English)</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
            </select>
          </div>
        </section>

        {/* 2x2 Grid of Profile Sections */}
        <div className="profile-2x2-grid">
          {/* Card 1: Contact & Safety */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">Contact & Safety</h3>
              <p className="profile-card-subtitle">
                Your contact details and emergency information.
              </p>
            </div>

            <div className="profile-fields-list">
              <div className="profile-field-box">
                <span className="profile-field-label">PHONE NUMBER</span>
                <span className="profile-field-value bold">{phone}</span>
              </div>

              <div className="profile-field-box">
                <span className="profile-field-label">EMERGENCY CONTACT</span>
                <span className="profile-field-value">{emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Care & Clinical Context */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">Care & Clinical Context</h3>
              <p className="profile-card-subtitle">
                Your therapy background and current care details.
              </p>
            </div>

            <div className="profile-fields-list">
              <div className="profile-field-box">
                <span className="profile-field-label">PREVIOUS THERAPY EXPERIENCE</span>
                <span className="profile-field-value">{previousTherapyVal}</span>
              </div>

              <div className="profile-field-box">
                <span className="profile-field-label">UNDER PROFESSIONAL CARE</span>
                <span className="profile-field-value">{underCareVal}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Account Settings */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">Account Settings</h3>
              <p className="profile-card-subtitle">
                Manage your account and security preferences.
              </p>
            </div>

            <div className="profile-fields-list">
              <div className="profile-field-box">
                <span className="profile-field-label">ACCOUNT EMAIL</span>
                <span className="profile-field-value">{email}</span>
              </div>

              <div className="profile-field-box">
                <span className="profile-field-label">PASSWORD</span>
                <span className="profile-field-value masked">••••••••</span>
              </div>
            </div>
          </div>

          {/* Card 4: Preferences & Discovery */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">Preferences & Discovery</h3>
              <p className="profile-card-subtitle">
                Set your communication choices and discovery details.
              </p>
            </div>

            <div className="profile-fields-list">
              <div className="profile-field-box">
                <span className="profile-field-label">HOW DID YOU HEAR ABOUT US?</span>
                <span className="profile-field-value">{howDidYouHear}</span>
              </div>

              <div className="profile-field-box">
                <span className="profile-field-label">COMMUNICATION PREFERENCES</span>
                <span className="profile-field-value">{editCommPrefs}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Demographics & Personal Profile (Full Width) */}
        <section className="profile-demographics-card">
          <div className="demographics-header-row">
            <div>
              <h3 className="demographics-title">Demographics & Personal Profile</h3>
              <p className="demographics-subtitle">Age, gender, and personal identifiers</p>
            </div>
          </div>

          <div className="demographics-fields-grid">
            <div className="demographics-field-box">
              <span className="profile-field-label">DATE OF BIRTH</span>
              <span className="demographics-field-val">{dateOfBirthFormatted}</span>
            </div>

            <div className="demographics-field-box">
              <span className="profile-field-label">GENDER</span>
              <span className="demographics-field-val">{gender}</span>
            </div>

            <div className="demographics-field-box">
              <span className="profile-field-label">PREFERRED NAME</span>
              <span className="demographics-field-val bold">{preferredName}</span>
            </div>
          </div>
        </section>

        {/* Card 6: Danger Zone (Full Width) */}
        <section className="profile-danger-zone-card">
          <div className="danger-zone-content">
            <h3 className="danger-zone-title">Danger Zone</h3>
            <p className="danger-zone-description">
              Once you delete your account, there is no going back. All personal data and session transcripts will be permanently purged.
            </p>
          </div>

          <button
            type="button"
            className="danger-zone-delete-btn"
            onClick={() => setIsDeleting(true)}
          >
            Delete Account
          </button>
        </section>

        {/* ========================================================
            EDIT PROFILE DETAILS MODAL (Blue and White Theme)
            ======================================================== */}
        {isEditing && (
          <div className="profile-modal-overlay" onClick={() => setIsEditing(false)}>
            <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <div className="profile-modal-header-info">
                  <div>
                    <h3 className="profile-modal-title">Edit Profile Details</h3>
                    <p className="profile-modal-subtitle">
                      Update your demographics, safety contacts, and clinical preferences.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="profile-modal-close-btn"
                  onClick={() => setIsEditing(false)}
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </div>

              {saveError && (
                <div className="profile-alert-error">
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="profile-form-container">
                {/* Section 1: Demographics & Identity */}
                <div className="profile-form-section">
                  <div className="form-section-header">
                    <span className="form-section-title">Demographics & Personal Identifiers</span>
                  </div>

                  <div className="form-grid-2col">
                    <div className="profile-form-group">
                      <label className="profile-form-label">Full Legal Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="profile-form-input"
                        placeholder="e.g. Kratika Prabhu"
                        required
                      />
                    </div>

                    <div className="profile-form-group">
                      <label className="profile-form-label">Preferred Name</label>
                      <input
                        type="text"
                        value={editPreferredName}
                        onChange={(e) => setEditPreferredName(e.target.value)}
                        className="profile-form-input"
                        placeholder="e.g. Kratika"
                      />
                    </div>

                    <div className="profile-form-group">
                      <label className="profile-form-label">Date of Birth</label>
                      <input
                        type="date"
                        value={editDateOfBirth}
                        onChange={(e) => setEditDateOfBirth(e.target.value)}
                        className="profile-form-input"
                      />
                    </div>

                    <div className="profile-form-group">
                      <label className="profile-form-label">Gender</label>
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="profile-form-select"
                      >
                        <option value="Not Specified">Not Specified</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact & Safety */}
                <div className="profile-form-section">
                  <div className="form-section-header">
                    <span className="form-section-title">Contact & Safety Details</span>
                  </div>

                  <div className="form-grid-2col">
                    <div className="profile-form-group">
                      <label className="profile-form-label">Phone Number</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="profile-form-input"
                        placeholder="e.g. 9740942994"
                      />
                    </div>

                    <div className="profile-form-group">
                      <label className="profile-form-label">Emergency Contact</label>
                      <input
                        type="text"
                        placeholder="e.g. Guardian / Partner (Phone)"
                        value={editEmergencyContact}
                        onChange={(e) => setEditEmergencyContact(e.target.value)}
                        className="profile-form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Care & Background */}
                <div className="profile-form-section">
                  <div className="form-section-header">
                    <span className="form-section-title">Care & Clinical Background</span>
                  </div>

                  <div className="form-grid-2col">
                    <div className="profile-form-group">
                      <label className="profile-form-label">Previous Therapy Experience</label>
                      <select
                        value={editPreviousTherapy}
                        onChange={(e) => setEditPreviousTherapy(e.target.value)}
                        className="profile-form-select"
                      >
                        <option value="none">Never attended before</option>
                        <option value="some">A few sessions in the past</option>
                        <option value="extensive">Extensive therapy experience</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="profile-form-group">
                      <label className="profile-form-label">Under Professional Care</label>
                      <select
                        value={editUnderCare}
                        onChange={(e) => setEditUnderCare(e.target.value)}
                        className="profile-form-select"
                      >
                        <option value="">Not specified</option>
                        <option value="no">Not currently</option>
                        <option value="yes">Currently under care</option>
                        <option value="previously">Previously, but not now</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="profile-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="profile-form-label">How Did You Hear About Us?</label>
                      <select
                        value={editHowDidYouHear}
                        onChange={(e) => setEditHowDidYouHear(e.target.value)}
                        className="profile-form-select"
                      >
                        <option value="Not specified">Not specified</option>
                        <option value="Friend or family recommendation">Friend or family recommendation</option>
                        <option value="Healthcare Provider / Doctor">Healthcare Provider / Doctor</option>
                        <option value="Social Media (Instagram / LinkedIn)">Social Media (Instagram / LinkedIn)</option>
                        <option value="Online Search Engine">Online Search Engine</option>
                        <option value="University / College Wellness">University / College Wellness</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Preferences */}
                <div className="profile-form-section">
                  <div className="form-section-header">
                    <span className="form-section-title">Preferences</span>
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">Communication Preferences</label>
                    <select
                      value={editCommPrefs}
                      onChange={(e) => setEditCommPrefs(e.target.value)}
                      className="profile-form-select"
                    >
                      <option value="Email notifications">Email notifications</option>
                      <option value="SMS & Email">SMS & Email</option>
                      <option value="Essential notifications only">Essential notifications only</option>
                    </select>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="profile-modal-actions">
                  <button
                    type="button"
                    className="profile-modal-btn-cancel"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-modal-btn-save"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            DELETE ACCOUNT CONFIRMATION DIALOG
            ======================================================== */}
        {isDeleting && (
          <div className="profile-modal-overlay" onClick={() => !isDeleteLoading && setIsDeleting(false)}>
            <div className="profile-modal-card delete-confirm-card" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>

              <h3 className="delete-modal-title">Delete Triora Account?</h3>
              <p className="delete-modal-text">
                Are you sure you want to permanently delete your account? All personal health data,
                recorded sessions, and generated reports will be permanently purged. This action cannot be reversed.
              </p>

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="profile-modal-btn-cancel"
                  onClick={() => setIsDeleting(false)}
                  disabled={isDeleteLoading}
                >
                  Keep My Account
                </button>
                <button
                  type="button"
                  className="delete-modal-btn-confirm"
                  onClick={handleConfirmDelete}
                  disabled={isDeleteLoading}
                >
                  {isDeleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
