import { useBooks } from '../context/BookContext';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS = {
  READ: '#4ade80',
  CURRENTLY_READING: '#fbbf24',
  TO_READ: '#60a5fa',
  DNF: '#f87171',
};
const STATUS_LABELS = {
  READ: 'Read',
  CURRENTLY_READING: 'Currently Reading',
  TO_READ: 'To Read',
  DNF: "Didn't Complete",
};

const GENRE_COLORS = ['#f5b942','#60a5fa','#4ade80','#f87171','#a78bfa','#34d399','#fb923c','#e879f9'];

const tooltipStyle = {
  backgroundColor: '#1a1f38',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#e8eaf0',
};

export default function Analytics() {
  const { books } = useBooks();
  const currentYear = new Date().getFullYear();

  // Genre distribution
  const genreMap = {};
  books.forEach(b => {
    if (b.genre) genreMap[b.genre] = (genreMap[b.genre] || 0) + 1;
  });
  const genreData = Object.entries(genreMap).map(([name, value]) => ({ name, value }));

  // Books read per month
  const monthData = MONTHS.map((m, i) => ({
    month: m,
    books: books.filter(b =>
      b.status === 'READ' && b.finishedAt &&
      new Date(b.finishedAt).getFullYear() === currentYear &&
      new Date(b.finishedAt).getMonth() === i
    ).length,
  }));

  // Status breakdown for radial chart
  const statusData = ['READ','CURRENTLY_READING','TO_READ','DNF'].map(s => ({
    name: STATUS_LABELS[s],
    value: books.filter(b => b.status === s).length,
    fill: STATUS_COLORS[s],
  })).filter(d => d.value > 0);

  if (books.length === 0) {
    return (
      <div className="fade-in">
        <div className="page-header"><h1>Analytics</h1></div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No data yet</h3>
          <p>Add some books to see your reading analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Your reading insights at a glance</p>
      </div>

      <div className="charts-grid">
        {/* Genre Distribution */}
        <div className="chart-card">
          <h3>Genre Distribution</h3>
          {genreData.length === 0 ? (
            <p className="text-muted text-sm">No genre data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={genreData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                  paddingAngle={3} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {genreData.map((_, i) => <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Books Read Per Month */}
        <div className="chart-card">
          <h3>Books Finished — {currentYear}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#7a7f9a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7a7f9a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(245,185,66,0.06)' }} />
              <Bar dataKey="books" fill="#f5b942" radius={[4,4,0,0]} label={{ position: 'top', fill: '#7a7f9a', fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="chart-card">
          <h3>Reading Status Breakdown</h3>
          {statusData.length === 0 ? (
            <p className="text-muted text-sm">No status data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart cx="50%" cy="50%" innerRadius={30} outerRadius={120}
                data={statusData} startAngle={180} endAngle={-180}
              >
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#0d0f1a', fontSize: 11, fontWeight: 700 }}
                  background={{ fill: 'rgba(255,255,255,0.04)' }}
                  dataKey="value"
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12, color: '#7a7f9a' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
