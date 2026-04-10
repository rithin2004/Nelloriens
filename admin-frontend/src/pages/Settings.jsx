import { useState } from 'react'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full shrink-0
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
          ${checked ? 'bg-indigo-600' : 'bg-slate-200'}
        `}
      >
        <span
          className={`
            inline-block w-4 h-4 bg-white rounded-full shadow-sm
            transform transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
      />
    </div>
  )
}

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    company: 'Acme Corp',
    timezone: 'UTC+0',
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    newUser: true,
    orderUpdates: false,
    weeklyReport: true,
    securityAlerts: true,
  })

  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'billing', label: 'Billing' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Home</span><span>/</span>
        <span className="text-slate-900 font-medium">Settings</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Profile Information" subtitle="Update your account profile details." />

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <Avatar name={profile.name} size="xl" />
              <div>
                <Button variant="secondary" size="sm">Change photo</Button>
                <p className="text-xs text-slate-500 mt-1.5">JPG, PNG or GIF · Max 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                value={profile.name}
                onChange={v => setProfile(p => ({ ...p, name: v }))}
              />
              <InputField
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={v => setProfile(p => ({ ...p, email: v }))}
              />
              <InputField
                label="Company"
                value={profile.company}
                onChange={v => setProfile(p => ({ ...p, company: v }))}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-white"
                >
                  <option>UTC+0</option>
                  <option>UTC-5 (EST)</option>
                  <option>UTC-8 (PST)</option>
                  <option>UTC+1 (CET)</option>
                  <option>UTC+5:30 (IST)</option>
                  <option>UTC+9 (JST)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button>Save changes</Button>
              <Button variant="secondary">Cancel</Button>
            </div>
          </Card>

          {/* Danger zone */}
          <Card className="border-red-200">
            <CardHeader title="Danger Zone" subtitle="Irreversible and destructive actions." />
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div>
                <p className="text-sm font-medium text-red-800">Delete Account</p>
                <p className="text-sm text-red-600 mt-0.5">Permanently delete your account and all data.</p>
              </div>
              <Button variant="danger" size="sm">Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader title="Notification Preferences" subtitle="Choose what you want to be notified about." />
          <div className="divide-y divide-slate-100">
            <Toggle
              checked={notifications.emailAlerts}
              onChange={v => setNotifications(p => ({ ...p, emailAlerts: v }))}
              label="Email Alerts"
              description="Receive email notifications for important events."
            />
            <Toggle
              checked={notifications.newUser}
              onChange={v => setNotifications(p => ({ ...p, newUser: v }))}
              label="New User Registrations"
              description="Get notified when a new user signs up."
            />
            <Toggle
              checked={notifications.orderUpdates}
              onChange={v => setNotifications(p => ({ ...p, orderUpdates: v }))}
              label="Order Updates"
              description="Receive updates on order status changes."
            />
            <Toggle
              checked={notifications.weeklyReport}
              onChange={v => setNotifications(p => ({ ...p, weeklyReport: v }))}
              label="Weekly Summary Report"
              description="A weekly digest of your dashboard activity."
            />
            <Toggle
              checked={notifications.securityAlerts}
              onChange={v => setNotifications(p => ({ ...p, securityAlerts: v }))}
              label="Security Alerts"
              description="Alerts for unusual sign-in activity or security events."
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Button>Save preferences</Button>
          </div>
        </Card>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Change Password" />
            <div className="space-y-4">
              <InputField label="Current Password" type="password" value="" onChange={() => {}} placeholder="••••••••" />
              <InputField label="New Password" type="password" value="" onChange={() => {}} placeholder="••••••••" />
              <InputField label="Confirm New Password" type="password" value="" onChange={() => {}} placeholder="••••••••" />
            </div>
            <div className="mt-4">
              <Button>Update password</Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account." />
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Authenticator App</p>
                  <p className="text-xs text-slate-500">Not configured</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">Enable</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Billing tab */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Current Plan" />
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div>
                <p className="text-base font-bold text-indigo-900">Pro Plan</p>
                <p className="text-sm text-indigo-600 mt-0.5">$99/month · Renews Apr 8, 2027</p>
              </div>
              <Button variant="secondary" size="sm">Upgrade</Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Payment Method" />
            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl">
              <div className="w-10 h-7 bg-slate-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">•••• •••• •••• 4242</p>
                <p className="text-xs text-slate-500">Expires 12/28</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto">Change</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
