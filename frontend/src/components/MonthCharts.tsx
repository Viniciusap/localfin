import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Transaction } from '../types/Transaction';
import { formatCurrency } from '../lib/format';
import { Card } from './ui/Card';

interface Props {
  transactions: Transaction[];
  isDark: boolean;
}

const INCOME_COLOR  = '#10b981';
const OUTCOME_COLOR = '#f43f5e';

export function MonthCharts({ transactions, isDark }: Props) {
  const axisColor    = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', fontSize: 12 }
    : { fontSize: 12 };

  const donutData = useMemo(() => {
    const c = transactions.filter(t => t.status === 'confirmed');
    const income  = c.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const outcome = c.filter(t => t.type === 'outcome').reduce((s, t) => s + t.amount, 0);
    if (income === 0 && outcome === 0) return [];
    return [
      { name: 'Entradas', value: income },
      { name: 'Saídas',   value: outcome },
    ];
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, { income: number; outcome: number }> = {};
    for (const tx of transactions.filter(t => t.status === 'confirmed')) {
      if (!map[tx.category]) map[tx.category] = { income: 0, outcome: 0 };
      map[tx.category][tx.type] += tx.amount;
    }
    return Object.entries(map)
      .map(([name, v]) => ({ name, income: v.income, outcome: v.outcome, total: v.income + v.outcome }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions]);

  if (transactions.filter(t => t.status === 'confirmed').length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Distribuição</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
              <Cell fill={INCOME_COLOR} />
              <Cell fill={OUTCOME_COLOR} />
            </Pie>
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: axisColor, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Top Categorias</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 12 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 11, fill: axisColor }} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
            <Bar dataKey="income"  name="Entradas" fill={INCOME_COLOR}  radius={[0, 4, 4, 0]} />
            <Bar dataKey="outcome" name="Saídas"   fill={OUTCOME_COLOR} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
