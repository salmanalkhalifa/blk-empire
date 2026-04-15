'use client';

import { useEffect, useState } from 'react';

type Settings = {
  isprivate: boolean;
  isanonymous: boolean;
  hidestatistics: boolean;
  hideachievements: boolean;
  hidebadges: boolean;
  hidepartners: boolean;
  hideactivity: boolean;
  notificationsenabled: boolean;
  notificationsound: boolean;
  showdidyouknow: boolean;
  genderdisplay: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      setSettings(data.settings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Failed');

      setMessage('Settings saved successfully');
    } catch (err) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: keyof Settings) {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  }

  if (loading) {
    return (
      <div className="p-6 text-white">Loading settings...</div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 text-red-500">Failed to load settings</div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold text-[#c9a84c] mb-6">
        Settings
      </h1>

      <div className="space-y-6">

        {/* Privacy */}
        <div className="bg-[#1a1a2e] border border-[#2a2a4e] p-4 rounded-xl">
          <h2 className="text-[#c9a84c] font-semibold mb-3">Privacy</h2>

          {renderToggle('Private Profile', settings.isprivate, () => toggle('isprivate'))}
          {renderToggle('Anonymous Mode', settings.isanonymous, () => toggle('isanonymous'))}
          {renderToggle('Hide Statistics', settings.hidestatistics, () => toggle('hidestatistics'))}
          {renderToggle('Hide Achievements', settings.hideachievements, () => toggle('hideachievements'))}
          {renderToggle('Hide Badges', settings.hidebadges, () => toggle('hidebadges'))}
          {renderToggle('Hide Partners', settings.hidepartners, () => toggle('hidepartners'))}
          {renderToggle('Hide Activity', settings.hideactivity, () => toggle('hideactivity'))}
        </div>

        {/* Notifications */}
        <div className="bg-[#1a1a2e] border border-[#2a2a4e] p-4 rounded-xl">
          <h2 className="text-[#c9a84c] font-semibold mb-3">Notifications</h2>

          {renderToggle('Enable Notifications', settings.notificationsenabled, () => toggle('notificationsenabled'))}
          {renderToggle('Notification Sound', settings.notificationsound, () => toggle('notificationsound'))}
        </div>

        {/* Display */}
        <div className="bg-[#1a1a2e] border border-[#2a2a4e] p-4 rounded-xl">
          <h2 className="text-[#c9a84c] font-semibold mb-3">Display</h2>

          {renderToggle('Show Tips ("Did You Know")', settings.showdidyouknow, () => toggle('showdidyouknow'))}

          <div className="mt-4">
            <label className="block text-sm text-[#8888aa] mb-1">
              Gender Display
            </label>
            <select
              value={settings.genderdisplay}
              onChange={(e) =>
                setSettings({ ...settings, genderdisplay: e.target.value })
              }
              className="w-full p-2 bg-[#0d0d1a] border border-[#2a2a4e] rounded text-white"
            >
              <option value="auto">Auto</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-[#c9a84c] hover:bg-[#f0d080] text-black px-6 py-2 rounded font-semibold"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          {message && (
            <span className="text-sm text-[#44ff88]">{message}</span>
          )}
        </div>

      </div>
    </div>
  );
}

function renderToggle(label: string, value: boolean, onChange: () => void) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#2a2a4e] last:border-none">
      <span className="text-sm">{label}</span>
      <button
        onClick={onChange}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
          value ? 'bg-[#44ff88]' : 'bg-[#444]'
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
            value ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );
}