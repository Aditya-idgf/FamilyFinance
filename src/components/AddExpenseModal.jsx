import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const DEFAULT_CATEGORIES = [
  'groceries', 'bills', 'transport', 'rent', 'maid',
  'education', 'health', 'entertainment', 'miscellaneous'
];

export default function AddExpenseModal({ open, onOpenChange, budgetId, categories, onExpenseAdded }) {
  const { user } = useAuth();
  const { family, members } = useFamily();
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const availableCategories = categories?.length > 0 ? categories : DEFAULT_CATEGORIES;

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setPaidBy('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('expenses').insert({
        type: 'household',
        family_id: family?.family_id,
        budget_id: budgetId || null,
        amount: parseFloat(amount),
        category,
        date,
        note,
        added_by: user.id,
        paid_by: paidBy || user.id,
      });

      if (error) throw error;

      toast.success('Expense added successfully!', {
        description: `₹${parseFloat(amount).toLocaleString()} for ${category}`
      });
      resetForm();
      onOpenChange(false);
      onExpenseAdded?.();
    } catch (err) {
      toast.error('Failed to add expense', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add Household Expense</DialogTitle>
          <DialogDescription className="text-gray-400">
            Record a new expense for your family budget
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-gray-300">Amount (₹)</Label>
            <Input
              type="number"
              placeholder="0.00"
              className="bg-white/5 border-white/10 text-white text-lg font-semibold placeholder:text-gray-600"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Category</Label>
            <select
              className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select category</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#12121a]">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Paid By</Label>
            <select
              className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              <option value="" className="bg-[#12121a]">Current user (default)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#12121a]">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Date</Label>
            <Input
              type="date"
              className="bg-white/5 border-white/10 text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Note</Label>
            <Input
              type="text"
              placeholder="e.g., Weekly groceries"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white cursor-pointer"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
