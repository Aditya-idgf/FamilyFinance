import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Save,
  UserCircle,
  Mail,
  Phone,
  Cake,
  Shield,
  Pencil
} from 'lucide-react';

const ROLE_OPTIONS = [
  'Father', 'Mother', 'Son', 'Daughter',
  'Grandfather', 'Grandmother', 'Uncle', 'Aunt',
  'Brother', 'Sister', 'Other'
];

export default function ProfilePage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setAge(userProfile.age?.toString() || '');
      setRole(userProfile.role || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          age: age ? parseInt(age) : null,
          role: role || null,
          phone: phone || '',
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setEditing(false);
      refreshProfile?.();
    } catch (err) {
      toast.error('Failed to update profile', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (userProfile) {
      setName(userProfile.name || '');
      setAge(userProfile.age?.toString() || '');
      setRole(userProfile.role || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
    }
  };

  // Generate initials for avatar
  const initials = name
    ? name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="max-w-4xl mx-auto md:p-4 space-y-6 relative">
      {/* Ambient background glows for premium feel */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none" style={{ animationDuration: '6s', animationDelay: '1s' }} />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10 px-4 md:px-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            My Profile
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-2 font-medium">
            Manage your personal settings and details
          </p>
        </div>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            className="group bg-white/5 border border-white/10 hover:bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer rounded-xl h-11 px-6 shadow-lg shadow-black/20"
          >
            <Pencil className="w-4 h-4 mr-2 text-purple-400 group-hover:text-purple-300 transition-colors" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer rounded-xl h-11 px-6 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] cursor-pointer rounded-xl h-11 px-6 transition-all duration-300 hover:scale-105 border border-white/10"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className="relative z-10 bg-[#12121a]/60 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden mt-6">
        <CardContent className="p-0">
          {/* Animated Gradient Banner */}
          <div className="h-40 bg-gradient-to-br from-purple-800/40 via-indigo-900/40 to-[#12121a]/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-40 mix-blend-overlay" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#12121a]/60" />
          </div>

          <div className="px-6 lg:px-10 pb-10 -mt-20">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-[2rem] bg-gradient-to-br from-gray-800 to-[#12121a] flex items-center justify-center text-white text-4xl lg:text-5xl font-extrabold shadow-2xl border border-white/10 ring-4 ring-[#12121a] transform transition-transform duration-300 group-hover:scale-[1.02]">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    {initials}
                  </span>
                </div>
              </div>
              
              {!editing && (
                <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2">{name || 'Your Name'}</h2>
                  {role && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-300 text-sm font-semibold border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-colors hover:bg-purple-500/20">
                      <Shield className="w-3.5 h-3.5" />
                      {role}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

            {/* Form Section */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 lg:gap-x-12 ${editing ? 'pt-4' : ''}`}>
              
              {/* Name Field */}
              <div className="group bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl border border-white/[0.05] transition-colors duration-300">
                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  <div className="p-1.5 rounded-md bg-white/5 text-gray-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                    <UserCircle className="w-4 h-4" />
                  </div>
                  Full Name
                </Label>
                {editing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#12121a]/80 border-white/10 text-white placeholder:text-gray-600 focus:bg-white/5 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 rounded-xl transition-all h-12 px-4 shadow-inner"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-white text-lg font-medium pl-1">{name || '—'}</p>
                )}
              </div>

              {/* Role Field */}
              <div className="group bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl border border-white/[0.05] transition-colors duration-300">
                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  <div className="p-1.5 rounded-md bg-white/5 text-gray-400 group-hover:text-pink-400 group-hover:bg-pink-500/10 transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  Family Role
                </Label>
                {editing ? (
                  <div className="relative">
                    <select
                      className="w-full h-12 appearance-none rounded-xl border border-white/10 bg-[#12121a]/80 px-4 text-base text-white focus:bg-white/5 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="" className="bg-[#12121a]">Select role</option>
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r} className="bg-[#12121a] py-2">{r}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                ) : (
                  <p className="text-white text-lg font-medium pl-1">{role || '—'}</p>
                )}
              </div>

              {/* Age Field */}
              <div className="group bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl border border-white/[0.05] transition-colors duration-300">
                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  <div className="p-1.5 rounded-md bg-white/5 text-gray-400 group-hover:text-yellow-400 group-hover:bg-yellow-500/10 transition-colors">
                    <Cake className="w-4 h-4" />
                  </div>
                  Age
                </Label>
                {editing ? (
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-[#12121a]/80 border-white/10 text-white placeholder:text-gray-600 focus:bg-white/5 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 rounded-xl transition-all h-12 px-4 shadow-inner"
                    placeholder="Enter your age"
                    min="1"
                    max="150"
                  />
                ) : (
                  <p className="text-white text-lg font-medium pl-1">{age || '—'}</p>
                )}
              </div>

              {/* Email Field (Always Read-only) */}
              <div className="group bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl border border-white/[0.05] transition-colors duration-300">
                <Label className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-white/5 text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    Email Address
                  </div>
                  {editing && <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded uppercase">Locked</span>}
                </Label>
                <div className="flex flex-col">
                  <p className="text-gray-300 text-lg pl-1 font-mono tracking-tight">{email || '—'}</p>
                  {editing && (
                    <p className="text-xs text-purple-400/60 mt-2 pl-1 italic">Tied to your account login.</p>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div className="group bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl border border-white/[0.05] transition-colors duration-300 md:col-span-2">
                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  <div className="p-1.5 rounded-md bg-white/5 text-gray-400 group-hover:text-green-400 group-hover:bg-green-500/10 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  Phone Number
                </Label>
                {editing ? (
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#12121a]/80 border-white/10 text-white placeholder:text-gray-600 focus:bg-white/5 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 rounded-xl transition-all h-12 px-4 shadow-inner"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-white text-lg font-medium pl-1 tracking-wide">{phone || '—'}</p>
                )}
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
