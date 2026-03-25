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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            👤 My Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            View and edit your personal details
          </p>
        </div>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 cursor-pointer"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 cursor-pointer"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Gradient banner */}
          <div className="h-32 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-pink-600/30 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
          </div>

          <div className="px-6 lg:px-8 pb-8 -mt-16">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Big Avatar */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl lg:text-5xl font-bold shadow-2xl shadow-purple-500/30 border-4 border-[#12121a] ring-2 ring-purple-500/20">
                  {initials}
                </div>
                {!editing && (
                  <div className="mt-4 text-center lg:text-left">
                    <h2 className="text-xl font-bold text-white">{name || 'Your Name'}</h2>
                    {role && (
                      <span className="inline-block mt-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-medium border border-purple-500/20">
                        {role}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Details (editable) */}
              <div className="flex-1 space-y-5 pt-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-gray-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <UserCircle className="w-3.5 h-3.5" />
                    Full Name
                  </Label>
                  {editing ? (
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-base"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-white text-base font-medium pl-1">{name || '—'}</p>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label className="text-gray-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Cake className="w-3.5 h-3.5" />
                    Age
                  </Label>
                  {editing ? (
                    <Input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                      placeholder="Enter your age"
                      min="1"
                      max="150"
                    />
                  ) : (
                    <p className="text-white text-base font-medium pl-1">{age || '—'}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label className="text-gray-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5" />
                    Family Role
                  </Label>
                  {editing ? (
                    <select
                      className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="" className="bg-[#12121a]">Select role</option>
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r} className="bg-[#12121a]">{r}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white text-base font-medium pl-1">{role || '—'}</p>
                  )}
                </div>

                {/* Email (read-only — tied to auth) */}
                <div className="space-y-2">
                  <Label className="text-gray-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </Label>
                  <p className="text-gray-300 text-base pl-1">{email || '—'}</p>
                  {editing && (
                    <p className="text-gray-600 text-xs pl-1">Email is linked to your account and cannot be changed here.</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-gray-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Phone className="w-3.5 h-3.5" />
                    Phone Number
                  </Label>
                  {editing ? (
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-white text-base font-medium pl-1">{phone || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
