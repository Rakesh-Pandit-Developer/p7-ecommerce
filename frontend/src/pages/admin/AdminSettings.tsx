import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';

interface Setting {
  key: string;
  value: string;
  category: string;
  description?: string;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      const settingsData = response.data.data;
      setSettings(settingsData);
      
      const dataObj: Record<string, string> = {};
      settingsData.forEach((s: Setting) => {
        dataObj[s.key] = s.value;
      });
      setFormData(dataObj);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', { settings: formData });
      toast.success('Settings updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, Setting[]>);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <div key={category} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {category.replace('_', ' ')} Settings
            </h2>
            <div className="space-y-4">
              {categorySettings.map((setting) => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  {setting.description && (
                    <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
                  )}
                  <input
                    type="text"
                    value={formData[setting.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [setting.key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
