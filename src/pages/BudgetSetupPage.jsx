import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  CalendarRange,
  DollarSign,
  Home,
  ShoppingCart,
  Plus,
  Trash2,
  PiggyBank,
  Save,
  Check
} from 'lucide-react';

export default function BudgetSetupPage() {
  const { user } = useAuth();
  const { family, members, settings } = useFamily();
  const navigate = useNavigate();

  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthDisplay = format(new Date(), 'MMMM yyyy');
  const currency = settings?.currency || 'INR';
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;

  const [loading, setLoading] = useState(false);
  const [existingBudgetId, setExistingBudgetId] = useState(null);
  const [month, setMonth] = useState(currentMonth);

  // Income
  const [totalIncome, setTotalIncome] = useState('');
  const [contributions, setContributions] = useState({});

  // Fixed Expenses
  const [fixedExpenses, setFixedExpenses] = useState([
    { name: 'Rent', amount: '', dueDate: '5', paid: false },
  ]);

  // Category Budgets
  const [categoryBudgets, setCategoryBudgets] = useState([
    { name: 'Groceries', amount: '' },
    { name: 'Bills', amount: '' },
    { name: 'Transport', amount: '' },
    { name: 'Miscellaneous', amount: '' },
  ]);

  // Savings Goals
  const [savingsGoals, setSavingsGoals] = useState([
    { name: 'Emergency Fund', target: '', allocated: '' },
  ]);

  // Initialize contribution fields for each member
  useEffect(() => {
    if (members.length > 0) {
      const initial = {};
      members.forEach(m => { initial[m.id] = contributions[m.id] || ''; });
      setContributions(initial);
    }
  }, [members]);

  // Load existing budget if any
  useEffect(() => {
    const loadExisting = async () => {
      if (!family) return;
      const { data } = await supabase
        .from('budgets')
        .select('*')
        .eq('family_id', family.family_id)
        .eq('type', 'household')
        .eq('month', month)
        .single();

      if (data) {
        setExistingBudgetId(data.id);
        setTotalIncome(data.income?.total?.toString() || '');
        if (data.income?.contributions) {
          setContributions(
            Object.fromEntries(
              Object.entries(data.income.contributions).map(([k, v]) => [k, v.toString()])
            )
          );
        }
        if (data.fixed_expenses) {
          setFixedExpenses(
            Object.entries(data.fixed_expenses).map(([name, val]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              amount: val.amount?.toString() || '',
              dueDate: val.dueDate?.toString() || '',
              paid: val.paid || false
            }))
          );
        }
        if (data.category_budgets) {
          setCategoryBudgets(
            Object.entries(data.category_budgets).map(([name, amount]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              amount: amount.toString()
            }))
          );
        }
        if (data.savings_goals) {
          setSavingsGoals(
            Object.entries(data.savings_goals).map(([name, val]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              target: val.target?.toString() || '',
              allocated: val.allocated?.toString() || ''
            }))
          );
        }
      }
    };
    loadExisting();
  }, [family, month]);

  // Calculations
  const totalFixedExp = fixedExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const totalCategoryBudget = categoryBudgets.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const totalSavingsAllocated = savingsGoals.reduce((s, g) => s + (parseFloat(g.allocated) || 0), 0);
  const totalAllocated = totalFixedExp + totalCategoryBudget + totalSavingsAllocated;
  const buffer = (parseFloat(totalIncome) || 0) - totalAllocated;

  const handleSave = async () => {
    if (!family) return;
    setLoading(true);

    try {
      const budgetId = existingBudgetId || `household_${month.replace('-', '_')}_${family.family_id.slice(0, 10)}`;

      const budgetData = {
        id: budgetId,
        type: 'household',
        family_id: family.family_id,
        user_id: null,
        month,
        income: {
          total: parseFloat(totalIncome) || 0,
          contributions: Object.fromEntries(
            Object.entries(contributions).map(([k, v]) => [k, parseFloat(v) || 0])
          )
        },
        fixed_expenses: Object.fromEntries(
          fixedExpenses.map(e => [
            e.name.toLowerCase().replace(/\s+/g, '_'),
            { amount: parseFloat(e.amount) || 0, dueDate: parseInt(e.dueDate) || 1, paid: e.paid }
          ])
        ),
        category_budgets: Object.fromEntries(
          categoryBudgets.map(c => [c.name.toLowerCase().replace(/\s+/g, '_'), parseFloat(c.amount) || 0])
        ),
        savings_goals: Object.fromEntries(
          savingsGoals.map(g => [
            g.name.toLowerCase().replace(/\s+/g, '_'),
            { target: parseFloat(g.target) || 0, allocated: parseFloat(g.allocated) || 0 }
          ])
        ),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('budgets')
        .upsert(budgetData, { onConflict: 'id' });

      if (error) throw error;

      toast.success('Budget saved!', { description: `Budget for ${currentMonthDisplay} has been saved.` });
      navigate('/');
    } catch (err) {
      toast.error('Failed to save budget', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Dynamic list helpers
  const addFixedExpense = () => setFixedExpenses([...fixedExpenses, { name: '', amount: '', dueDate: '', paid: false }]);
  const removeFixedExpense = (i) => setFixedExpenses(fixedExpenses.filter((_, idx) => idx !== i));
  const updateFixedExpense = (i, field, value) => {
    const updated = [...fixedExpenses];
    updated[i][field] = value;
    setFixedExpenses(updated);
  };

  const addCategory = () => setCategoryBudgets([...categoryBudgets, { name: '', amount: '' }]);
  const removeCategory = (i) => setCategoryBudgets(categoryBudgets.filter((_, idx) => idx !== i));
  const updateCategory = (i, field, value) => {
    const updated = [...categoryBudgets];
    updated[i][field] = value;
    setCategoryBudgets(updated);
  };

  const addSavingsGoal = () => setSavingsGoals([...savingsGoals, { name: '', target: '', allocated: '' }]);
  const removeSavingsGoal = (i) => setSavingsGoals(savingsGoals.filter((_, idx) => idx !== i));
  const updateSavingsGoal = (i, field, value) => {
    const updated = [...savingsGoals];
    updated[i][field] = value;
    setSavingsGoals(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <CalendarRange className="w-7 h-7 text-purple-400" />
            Monthly Budget Setup
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure your household budget for {currentMonthDisplay}
          </p>
        </div>
        <Input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-auto bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Income Section */}
      <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Income
          </CardTitle>
          <CardDescription className="text-gray-400">
            Total household income and member contributions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Total Income ({currencySymbol})</Label>
            <Input
              type="number"
              placeholder="150000"
              className="bg-white/5 border-white/10 text-white text-lg font-semibold"
              value={totalIncome}
              onChange={(e) => setTotalIncome(e.target.value)}
            />
          </div>
          <Separator className="bg-white/5" />
          <p className="text-gray-400 text-sm font-medium">Member Contributions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map(m => (
              <div key={m.id} className="space-y-1">
                <Label className="text-gray-400 text-xs">{m.name}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="bg-white/5 border-white/10 text-white"
                  value={contributions[m.id] || ''}
                  onChange={(e) => setContributions({ ...contributions, [m.id]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fixed Expenses */}
      <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-400" />
            Fixed Expenses
          </CardTitle>
          <CardDescription className="text-gray-400">
            Recurring monthly expenses like rent, utilities, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {fixedExpenses.map((exp, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                placeholder="Name"
                className="flex-1 bg-white/5 border-white/10 text-white"
                value={exp.name}
                onChange={(e) => updateFixedExpense(i, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Amount"
                className="w-28 bg-white/5 border-white/10 text-white"
                value={exp.amount}
                onChange={(e) => updateFixedExpense(i, 'amount', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Due"
                className="w-20 bg-white/5 border-white/10 text-white"
                value={exp.dueDate}
                onChange={(e) => updateFixedExpense(i, 'dueDate', e.target.value)}
                min="1"
                max="31"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFixedExpense(i)}
                className="text-gray-500 hover:text-red-400 flex-shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={addFixedExpense}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fixed Expense
          </Button>
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            Category Budgets
          </CardTitle>
          <CardDescription className="text-gray-400">
            Allocate budgets for variable spending categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryBudgets.map((cat, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                placeholder="Category name"
                className="flex-1 bg-white/5 border-white/10 text-white"
                value={cat.name}
                onChange={(e) => updateCategory(i, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Amount"
                className="w-32 bg-white/5 border-white/10 text-white"
                value={cat.amount}
                onChange={(e) => updateCategory(i, 'amount', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCategory(i)}
                className="text-gray-500 hover:text-red-400 flex-shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={addCategory}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </CardContent>
      </Card>

      {/* Savings Goals */}
      <Card className="bg-[#12121a]/80 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-amber-400" />
            Savings Goals
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set savings targets and monthly allocations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {savingsGoals.map((goal, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                placeholder="Goal name"
                className="flex-1 bg-white/5 border-white/10 text-white"
                value={goal.name}
                onChange={(e) => updateSavingsGoal(i, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Target"
                className="w-28 bg-white/5 border-white/10 text-white"
                value={goal.target}
                onChange={(e) => updateSavingsGoal(i, 'target', e.target.value)}
              />
              <Input
                type="number"
                placeholder="This month"
                className="w-28 bg-white/5 border-white/10 text-white"
                value={goal.allocated}
                onChange={(e) => updateSavingsGoal(i, 'allocated', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSavingsGoal(i)}
                className="text-gray-500 hover:text-red-400 flex-shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={addSavingsGoal}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Savings Goal
          </Button>
        </CardContent>
      </Card>

      {/* Summary & Save */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-purple-400" />
            Budget Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Income</p>
              <p className="text-white text-lg font-bold">{currencySymbol}{(parseFloat(totalIncome) || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Fixed Expenses</p>
              <p className="text-white text-lg font-bold">{currencySymbol}{totalFixedExp.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Categories</p>
              <p className="text-white text-lg font-bold">{currencySymbol}{totalCategoryBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Buffer / Savings</p>
              <p className={`text-lg font-bold ${buffer >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {buffer >= 0 ? '+' : ''}{currencySymbol}{buffer.toLocaleString()}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-purple-500/25 h-12 text-base cursor-pointer"
          >
            {loading ? 'Saving...' : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Budget
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
