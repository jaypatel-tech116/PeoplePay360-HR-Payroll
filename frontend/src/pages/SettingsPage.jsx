import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Bell,
  Link as LinkIcon,
  ShieldCheck,
  Save
} from 'lucide-react';
import './SettingsPage.css';
import AlertBanner from '../components/AlertBanner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [success, setSuccess] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess('Settings saved successfully.');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="breadcrumbs">
          <span>System Administration</span>
          <span>/</span>
          <span>Settings</span>
        </div>
        <div className="page-title-wrapper">
          <div>
            <h1 className="page-title">Global Settings</h1>
            <p className="page-subtitle">Manage company profile, localizations, and system integrations.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {success && <AlertBanner type="success" message={success} />}

      <div className="settings-layout mt-6">
        {/* Left Sidebar Menu */}
        <div className="settings-sidebar">
          <div className="card">
            <div className="settings-menu">
              <button 
                className={`settings-menu-item ${activeTab === 'company' ? 'active' : ''}`}
                onClick={() => setActiveTab('company')}
              >
                <Building2 size={18} />
                <span>Company Profile</span>
              </button>
              <button 
                className={`settings-menu-item ${activeTab === 'localization' ? 'active' : ''}`}
                onClick={() => setActiveTab('localization')}
              >
                <Globe size={18} />
                <span>Localization</span>
              </button>
              <button 
                className={`settings-menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} />
                <span>Notifications</span>
              </button>
              <button 
                className={`settings-menu-item ${activeTab === 'integrations' ? 'active' : ''}`}
                onClick={() => setActiveTab('integrations')}
              >
                <LinkIcon size={18} />
                <span>Integrations</span>
              </button>
              <button 
                className={`settings-menu-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <ShieldCheck size={18} />
                <span>Security</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="settings-content">
          {activeTab === 'company' && (
            <div className="card animate-fade-in">
              <div className="card-header border-b">
                <h3 className="card-title">Company Profile</h3>
                <p className="text-muted text-sm mt-1">Update your company details and branding.</p>
              </div>
              <div className="card-body">
                <form className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input type="text" className="form-input" defaultValue="PeoplePay360 Inc." />
                  </div>
                  
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Registration Number</label>
                      <input type="text" className="form-input" defaultValue="CIN-U72900MH2026PTC" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tax ID (PAN/EIN)</label>
                      <input type="text" className="form-input" defaultValue="ABCDE1234F" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Headquarters Address</label>
                    <textarea className="form-textarea" rows="3" defaultValue="123 Tech Park, Silicon Valley, CA 94025" />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Contact Email</label>
                      <input type="email" className="form-input" defaultValue="hr@peoplepay360.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" className="form-input" defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                  
                  <div className="form-group mt-4 border-t pt-4">
                    <label className="form-label">Company Logo</label>
                    <div className="logo-upload-wrapper">
                      <div className="logo-preview">PP</div>
                      <div>
                        <button type="button" className="btn btn-outline btn-sm">Upload New Logo</button>
                        <p className="text-muted text-xs mt-2">Recommended size: 256x256px. Formats: PNG, JPG.</p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="card animate-fade-in">
              <div className="card-header border-b">
                <h3 className="card-title">Localization</h3>
                <p className="text-muted text-sm mt-1">Configure timezone, currency and date formats.</p>
              </div>
              <div className="card-body">
                <form className="settings-form">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Default Currency</label>
                      <select className="form-select" defaultValue="INR">
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Timezone</label>
                      <select className="form-select" defaultValue="Asia/Kolkata">
                        <option value="Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                        <option value="America/New_York">(GMT-04:00) Eastern Time</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Date Format</label>
                      <select className="form-select" defaultValue="DD/MM/YYYY">
                        <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 31/12/2026)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 12/31/2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-12-31)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Work Week Starts On</label>
                      <select className="form-select" defaultValue="Monday">
                        <option value="Monday">Monday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {(activeTab === 'notifications' || activeTab === 'integrations' || activeTab === 'security') && (
            <div className="card animate-fade-in flex-center" style={{ minHeight: '400px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {activeTab === 'notifications' && <Bell size={48} />}
                  {activeTab === 'integrations' && <LinkIcon size={48} />}
                  {activeTab === 'security' && <ShieldCheck size={48} />}
                </div>
                <h3 className="text-main" style={{ marginBottom: '8px' }}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
                </h3>
                <p className="text-muted text-sm">This section is currently under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
