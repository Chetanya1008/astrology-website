import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Calendar, Sparkles, Moon, Sun, Star, Lock, LogOut, Edit2, Trash2, Save, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 🔥 REPLACE THESE WITH YOUR SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://kkjozctuulwkdnclqhwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtram96Y3R1dWx3a2RuY2xxaHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTM2NzgsImV4cCI6MjA4NTU4OTY3OH0.aacurX-b35TOycBNq0QnUMmh8aT4g3L3UQxVS-6X1Hk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', icon: '🐏', gradient: 'from-red-400 to-orange-400' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', icon: '🐂', gradient: 'from-green-400 to-emerald-400' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', icon: '👯', gradient: 'from-yellow-400 to-amber-400' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', icon: '🦀', gradient: 'from-blue-400 to-cyan-400' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', icon: '🦁', gradient: 'from-orange-400 to-yellow-400' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', icon: '👧', gradient: 'from-green-400 to-teal-400' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', icon: '⚖️', gradient: 'from-pink-400 to-rose-400' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', icon: '🦂', gradient: 'from-purple-400 to-indigo-400' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', icon: '🏹', gradient: 'from-indigo-400 to-blue-400' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', icon: '🐐', gradient: 'from-gray-400 to-slate-400' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', icon: '🌊', gradient: 'from-cyan-400 to-blue-400' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', icon: '🐟', gradient: 'from-purple-400 to-pink-400' }
];

const AstrologyWebsite = () => {
  const [view, setView] = useState('public');
  const [selectedSign, setSelectedSign] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [horoscopes, setHoroscopes] = useState({});
  const [editingSign, setEditingSign] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [storedPassword, setStoredPassword] = useState('admin123');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load horoscopes
      const { data: horoscopeData, error: horoscopeError } = await supabase
        .from('horoscopes')
        .select('*');

      if (horoscopeError) throw horoscopeError;

      const horoscopeMap = {};
      if (horoscopeData) {
        horoscopeData.forEach(item => {
          horoscopeMap[item.sign_name] = item.content;
        });
      }
      setHoroscopes(horoscopeMap);

      // Load admin password
      const { data: passwordData, error: passwordError } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_password')
        .single();

      if (passwordError && passwordError.code !== 'PGRST116') {
        console.error('Password error:', passwordError);
      }

      if (passwordData) {
        setStoredPassword(passwordData.setting_value);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (adminPassword === storedPassword) {
      setIsAuthenticated(true);
      setAdminPassword('');
      setMessage('');
    } else {
      setMessage('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('public');
    setEditingSign(null);
  };

  const handleEdit = (signName) => {
    setEditingSign(signName);
    setEditContent(horoscopes[signName] || '');
  };

  const handleSave = async () => {
    try {
      // Check if horoscope exists
      const { data: existing } = await supabase
        .from('horoscopes')
        .select('id')
        .eq('sign_name', editingSign)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('horoscopes')
          .update({ 
            content: editContent,
            updated_at: new Date().toISOString()
          })
          .eq('sign_name', editingSign);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('horoscopes')
          .insert([{ 
            sign_name: editingSign, 
            content: editContent 
          }]);

        if (error) throw error;
      }

      // Update local state
      setHoroscopes({ ...horoscopes, [editingSign]: editContent });
      setEditingSign(null);
      setEditContent('');
      setMessage('Horoscope updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setMessage('Error saving horoscope. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (signName) => {
    if (window.confirm(`Delete horoscope for ${signName}?`)) {
      try {
        const { error } = await supabase
          .from('horoscopes')
          .delete()
          .eq('sign_name', signName);

        if (error) throw error;

        const updated = { ...horoscopes };
        delete updated[signName];
        setHoroscopes(updated);
        setMessage('Horoscope deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting:', error);
        setMessage('Error deleting horoscope. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.current !== storedPassword) {
      setMessage('Current password is incorrect');
      return;
    }
    if (passwordForm.new.length < 6) {
      setMessage('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage('New passwords do not match');
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ setting_value: passwordForm.new })
        .eq('setting_key', 'admin_password');

      if (error) throw error;

      setStoredPassword(passwordForm.new);
      setMessage('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('Error changing password. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading cosmic wisdom...</p>
        </div>
      </div>
    );
  }

  if (view === 'admin' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-purple-200">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Admin Login
            </h2>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {message && (
              <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                {message}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              Login
            </button>

            <button
              onClick={() => setView('public')}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
            >
              Back to Public Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'admin' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-200">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-purple-200 flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage your daily horoscopes</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg text-sm"
                >
                  <Lock size={18} />
                  Change Password
                </button>
                <button
                  onClick={() => setView('public')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg text-sm"
                >
                  <Star size={18} />
                  View Public Site
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg text-sm"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>

            {message && (
              <div className="mb-6 text-center bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 py-3 px-4 rounded-xl">
                {message}
              </div>
            )}

            {showChangePassword && (
              <div className="mb-8 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordForm({ current: '', new: '', confirm: '' });
                      setMessage('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="New Password (min 6 characters)"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
                  />
                  <button
                    onClick={handleChangePassword}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ZODIAC_SIGNS.map((sign) => (
                <div
                  key={sign.name}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-purple-100 overflow-hidden"
                >
                  <div className={`bg-gradient-to-r ${sign.gradient} p-4 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{sign.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold">{sign.name}</h3>
                          <p className="text-sm opacity-90">{sign.dates}</p>
                        </div>
                      </div>
                      <span className="text-3xl">{sign.symbol}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {editingSign === sign.name ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder={`Enter today's horoscope for ${sign.name}...`}
                          className="w-full h-40 px-3 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all"
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingSign(null);
                              setEditContent('');
                            }}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-gray-700 text-sm min-h-[80px]">
                          {horoscopes[sign.name] || 'No horoscope set for today'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(sign.name)}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
                          >
                            <Edit2 size={16} />
                            {horoscopes[sign.name] ? 'Edit' : 'Add'}
                          </button>
                          {horoscopes[sign.name] && (
                            <button
                              onClick={() => handleDelete(sign.name)}
                              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AstroNika
              </h1>
            </div>
            <button
              onClick={() => setView('admin')}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Lock size={18} />
              Admin
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-purple-200 mb-6">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 font-medium">{getTodayDate()}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Discover Your Cosmic Journey
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Unlock the wisdom of the stars and find guidance for your day ahead
          </p>
        </div>

        {selectedSign ? (
          <div className="mb-8">
            <button
              onClick={() => setSelectedSign(null)}
              className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              ← Back to all signs
            </button>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-200">
              {(() => {
                const sign = ZODIAC_SIGNS.find(s => s.name === selectedSign);
                return (
                  <>
                    <div className={`bg-gradient-to-r ${sign.gradient} rounded-2xl p-6 mb-6 text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-6xl">{sign.icon}</span>
                          <div>
                            <h3 className="text-3xl font-bold mb-1">{sign.name}</h3>
                            <p className="text-lg opacity-90">{sign.dates}</p>
                          </div>
                        </div>
                        <span className="text-6xl">{sign.symbol}</span>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <h4 className="text-2xl font-semibold text-gray-800 mb-4">Today's Horoscope</h4>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {horoscopes[selectedSign] || 'No horoscope available for today. Check back soon!'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ZODIAC_SIGNS.map((sign) => (
              <button
                key={sign.name}
                onClick={() => setSelectedSign(sign.name)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-300 overflow-hidden group"
              >
                <div className={`bg-gradient-to-r ${sign.gradient} p-6 text-white transition-all group-hover:scale-105`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-5xl">{sign.icon}</span>
                    <span className="text-4xl">{sign.symbol}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{sign.name}</h3>
                  <p className="text-sm opacity-90">{sign.dates}</p>
                </div>
                
                <div className="p-4 text-left">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {horoscopes[sign.name] || 'Tap to read your daily horoscope'}
                  </p>
                  <div className="mt-3 text-purple-600 font-medium text-sm flex items-center gap-1">
                    Read more
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border border-purple-200">
            <div className="flex justify-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-3 rounded-full">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-cyan-400 p-3 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Your Daily Cosmic Companion
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Start each day with personalized astrological insights. Let the wisdom of the zodiac guide your journey through life's adventures.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-purple-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            ✨ Discover your destiny with the stars ✨
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © 2026 Daily Horoscope. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AstrologyWebsite;