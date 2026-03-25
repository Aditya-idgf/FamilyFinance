import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AddExpenseModal from '@/components/AddExpenseModal';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  Receipt,
  Trash2,
  CalendarDays,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { family, members, settings } = useFamily();
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const currency = settings?.currency || 'INR';
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;

  const fetchData = useCallback(async () => {
    if (!family) { setLoading(false); return; }
    setLoading(true);

    try {
      // Fetch current month household budget
      const { data: budgetData } = await supabase
        .from('budgets')
        .select('*')
        .eq('family_id', family.family_id)
        .eq('type', 'household')
        .eq('month', currentMonth)
        .single();

      if (budgetData) setBudget(budgetData);

      // Fetch recent household expenses
      const { data: expenseData } = await supabase
        .from('expenses')
        .select('*')
        .eq('family_id', family.family_id)
        .eq('type', 'household')
        .order('created_at', { ascending: false })
        .limit(20);

      setExpenses(expenseData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [family, currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Delete expense handler
  const handleDeleteExpense = async (expenseId) => {
    setDeletingId(expenseId);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Permission denied or expense not found.');
      }

      // Optimistically remove from local state — no full page reload
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));

      toast.success('Expense deleted', {
        description: 'The expense has been removed successfully.'
      });
    } catch (err) {
      toast.error('Failed to delete expense', { description: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate stats
  const totalIncome = budget?.income?.total || 0;
  const totalCategoryBudget = budget?.category_budgets
    ? Object.values(budget.category_budgets).reduce((s, v) => s + v, 0)
    : 0;
  const totalFixedExpenses = budget?.fixed_expenses
    ? Object.values(budget.fixed_expenses).reduce((s, v) => s + (v.amount || 0), 0)
    : 0;
  const totalAllocated = totalCategoryBudget + totalFixedExpenses;
  const totalSpent = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const remaining = totalAllocated - totalSpent;
  const spentPercent = totalAllocated > 0 ? Math.min((totalSpent / totalAllocated) * 100, 100) : 0;

  const getMemberName = (uid) => {
    const member = members.find(m => m.id === uid);
    return member?.name || 'Unknown';
  };

  const categories = budget?.category_budgets ? Object.keys(budget.category_budgets) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            🏠 Household Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {format(new Date(), 'MMMM yyyy')} • {family?.name || 'Your Family'}
          </p>
        </div>
        {/* Objective 4: Date + Family Name display in top-right */}
        <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">
              {format(new Date(), 'EEEE, dd MMMM yyyy')}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <p className="text-gray-400 text-xs font-medium">
                {family?.name || 'Your Family'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm hover:border-purple-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Income</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {currencySymbol}{totalIncome.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm hover:border-purple-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Spent</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {currencySymbol}{totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm hover:border-purple-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Remaining</p>
                <p className={`text-2xl font-bold mt-1 ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currencySymbol}{Math.abs(remaining).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm hover:border-purple-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Savings</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {currencySymbol}{Math.max(totalIncome - totalAllocated, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-purple-400" />
            Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budget ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {currencySymbol}{totalSpent.toLocaleString()} spent of {currencySymbol}{totalAllocated.toLocaleString()}
                </span>
                <span className={`font-medium ${spentPercent > 80 ? 'text-red-400' : spentPercent > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {spentPercent.toFixed(1)}%
                </span>
              </div>
              <Progress value={spentPercent} className="h-3 bg-white/5" />
              {spentPercent > 80 && (
                <p className="text-red-400 text-xs font-medium">
                  ⚠️ You've used over 80% of your budget this month
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No budget set up for this month yet.</p>
              <Button
                variant="link"
                className="text-purple-400 mt-2 cursor-pointer"
                onClick={() => window.location.href = '/budget-setup'}
              >
                Set up monthly budget →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-400" />
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {expense.note || expense.category}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {getMemberName(expense.paid_by)} • {expense.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="bg-white/5 text-gray-300 text-xs border-0">
                      {expense.category}
                    </Badge>
                    <span className="text-white font-semibold text-sm">
                      {currencySymbol}{parseFloat(expense.amount).toLocaleString()}
                    </span>
                    {/* Objective 1: Delete expense button */}
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      disabled={deletingId === expense.id}
                      className="ml-1 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer disabled:opacity-50"
                      title="Delete expense"
                    >
                      {deletingId === expense.id ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No expenses recorded yet</p>
              <p className="text-gray-600 text-sm mt-1">
                Click the "+" button to start tracking
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Objective 2: Floating Add Expense button (bottom-right) */}
      <button
        onClick={() => setExpenseModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-purple-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
        title="Add Expense"
      >
        <Plus className="w-7 h-7" />
      </button>

      <AddExpenseModal
        open={expenseModalOpen}
        onOpenChange={setExpenseModalOpen}
        budgetId={budget?.id}
        categories={categories}
        onExpenseAdded={fetchData}
      />
    </div>
  );
}
