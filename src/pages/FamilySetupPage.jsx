import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Users, ArrowRight, Copy, Check } from 'lucide-react';

export default function FamilySetupPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // If user already has a family, go to dashboard
  useEffect(() => {
    if (userProfile?.family_id) {
      navigate('/', { replace: true });
    }
  }, [userProfile, navigate]);

  // Create family state
  const [familyName, setFamilyName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Join family state
  const [familyCode, setFamilyCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Success states
  const [createdFamilyId, setCreatedFamilyId] = useState('');
  const [copied, setCopied] = useState(false);

  const mapDbError = (err, fallback) => {
    const message = err?.message || fallback;
    const normalized = message.toLowerCase();
    if (normalized.includes('row-level security') || normalized.includes('permission denied')) {
      return 'Permission denied by database policy. Please check Supabase RLS policies for profiles/families.';
    }
    if (normalized.includes('cannot coerce the result to a single json object')) {
      return 'Your profile row is missing in the profiles table. Please create the profile row or check profile-trigger setup in Supabase.';
    }
    return message;
  };

  const generateFamilyId = () => {
    const slug = familyName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20);
    const rand = Math.random().toString(36).substring(2, 8);
    return `family_${slug}_${rand}`;
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      if (!user?.id) {
        throw new Error('Your session is not ready. Please log in again.');
      }

      const trimmedFamilyName = familyName.trim();
      if (!trimmedFamilyName) {
        throw new Error('Please enter a family name.');
      }

      const familyId = generateFamilyId();
      const membersObj = {
        [user.id]: {
          role: 'admin',
          name: userProfile?.name || 'Admin',
          joinedAt: new Date().toISOString()
        }
      };

      const { error: familyError } = await supabase.from('families').insert({
        family_id: familyId,
        name: trimmedFamilyName,
        created_by: user.id,
        members: membersObj,
        settings: { currency, requireApprovalAbove: 5000, notifyOnExpense: true }
      });

      if (familyError) throw familyError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ family_id: familyId })
        .eq('id', user.id);

      if (updateError) {
        // If profile row does not exist yet, create it and retry update.
        const { error: insertProfileError } = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          name: userProfile?.name || user.user_metadata?.name || 'User',
          family_id: familyId
        });
        if (insertProfileError) throw insertProfileError;
      }

      const { data: updatedProfile, error: profileReadError } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileReadError) throw profileReadError;
      if (!updatedProfile || updatedProfile.family_id !== familyId) {
        throw new Error('Family was created but profile sync is delayed. Please refresh and try again.');
      }

      setCreatedFamilyId(familyId);
      await refreshProfile();
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setCreateError(mapDbError(err, 'Unable to create family.'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoinLoading(true);

    try {
      if (!user?.id) {
        throw new Error('Your session is not ready. Please log in again.');
      }

      const trimmed = familyCode.trim();
      if (!trimmed) {
        throw new Error('Please enter a family code.');
      }

      // Check family exists
      const { data: familyData, error: fetchErr } = await supabase
        .from('families')
        .select('*')
        .eq('family_id', trimmed)
        .single();

      if (fetchErr || !familyData) {
        setJoinError('Family not found. Check the code and try again.');
        setJoinLoading(false);
        return;
      }

      // Add user to members JSONB
      const updatedMembers = {
        ...familyData.members,
        [user.id]: {
          role: 'member',
          name: userProfile?.name || 'Member',
          joinedAt: new Date().toISOString()
        }
      };

      const { error: updateFamilyErr } = await supabase
        .from('families')
        .update({ members: updatedMembers })
        .eq('family_id', trimmed);

      if (updateFamilyErr) throw updateFamilyErr;

      const { error: updateProfileErr } = await supabase
        .from('profiles')
        .update({ family_id: trimmed })
        .eq('id', user.id);

      if (updateProfileErr) {
        const { error: insertProfileError } = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          name: userProfile?.name || user.user_metadata?.name || 'User',
          family_id: trimmed
        });
        if (insertProfileError) throw insertProfileError;
      }

      const { data: updatedProfile, error: profileReadError } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileReadError) throw profileReadError;
      if (!updatedProfile || updatedProfile.family_id !== trimmed) {
        throw new Error('Joined family, but profile sync is delayed. Please refresh and try again.');
      }

      await refreshProfile();
      navigate('/');
    } catch (err) {
      setJoinError(mapDbError(err, 'Unable to join family.'));
    } finally {
      setJoinLoading(false);
    }
  };

  const copyFamilyId = () => {
    navigator.clipboard.writeText(createdFamilyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden p-4">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-lg relative z-10 bg-[#12121a]/80 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Set Up Your Family</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Create a new family or join an existing one
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="create" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white cursor-pointer">
                Create Family
              </TabsTrigger>
              <TabsTrigger value="join" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white cursor-pointer">
                Join Family
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-6">
              {createdFamilyId ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-white font-medium">Family Created!</p>
                  <p className="text-gray-400 text-sm">Share this code with family members:</p>
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                    <code className="flex-1 text-purple-400 text-sm font-mono">{createdFamilyId}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyFamilyId}
                      className="text-gray-400 hover:text-white cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-gray-500 text-xs">Redirecting to dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleCreateFamily} className="space-y-4">
                  {createError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {createError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="familyName" className="text-gray-300">Family Name</Label>
                    <Input
                      id="familyName"
                      placeholder="e.g., Sharma Family"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                    <Input
                      id="currency"
                      placeholder="INR"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={createLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white cursor-pointer"
                  >
                    {createLoading ? 'Creating...' : 'Create Family'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="join" className="mt-6">
              <form onSubmit={handleJoinFamily} className="space-y-4">
                {joinError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {joinError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="familyCode" className="text-gray-300">Family Code</Label>
                  <Input
                    id="familyCode"
                    placeholder="e.g., family_sharma_abc123"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value)}
                    required
                  />
                  <p className="text-gray-500 text-xs">Ask your family admin for this code</p>
                </div>
                <Button
                  type="submit"
                  disabled={joinLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer"
                >
                  {joinLoading ? 'Joining...' : 'Join Family'}
                  <Users className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
