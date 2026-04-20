import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Activity, MapPin, Building2, AlertCircle } from 'lucide-react';

const MetricCard = ({ title, value, icon, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ color: color, background: `${color}20`, padding: '8px', borderRadius: '8px' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{title}</div>
      <div style={{ fontSize: '16px', fontWeight: '600' }}>{value}</div>
    </div>
  </div>
);

const ZoneDetails = ({ zoneData, loading }) => {
  if (loading) {
    return <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading insights...</div>;
  }

  if (!zoneData) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
        <MapPin size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: 'var(--text-secondary)' }}>Select a zone on the map to view detailed growth analytics.</h3>
      </div>
    );
  }

  const { name, type, scores, raw_metrics, infrastructure_projects } = zoneData;

  const chartData = [
    { year: '3 Yrs Ago', price: raw_metrics.historical_price_3yr_ago.toFixed(0) },
    { year: '1 Yr Ago', price: raw_metrics.historical_price_1yr_ago.toFixed(0) },
    { year: 'Current', price: raw_metrics.current_price_per_sqft.toFixed(0) }
  ];

  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--growth-high)';
    if (score >= 40) return 'var(--growth-med)';
    return 'var(--growth-low)';
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ height: '100%', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="heading-gradient" style={{ fontSize: '24px', margin: '0 0 4px 0' }}>{name}</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{type} Zone</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: getScoreColor(scores.growth_velocity_score) }}>
              {scores.growth_velocity_score}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>GROWTH VELOCITY</div>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <MetricCard title="Price / sqft" value={`₹${raw_metrics.current_price_per_sqft.toFixed(0)}`} icon={<TrendingUp size={20} />} color="var(--success)" />
        <MetricCard title="Absorption Rate" value={`${raw_metrics.absorption_rate.toFixed(1)}%`} icon={<Activity size={20} />} color="var(--accent-primary)" />
      </div>

      {/* Component Scores */}
      <div>
        <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>Score Breakdown</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Infrastructure Potential', val: scores.infrastructure_score },
            { label: 'Market Demand', val: scores.market_demand_score },
            { label: 'Price Momentum', val: scores.price_trend_score }
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '120px', fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
              <div style={{ flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${s.val}%`, height: '100%', background: getScoreColor(s.val) }}></div>
              </div>
              <div style={{ width: '30px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '200px', width: '100%' }}>
        <h4 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Price Appreciation Trend</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} domain={['auto', 'auto']} tickFormatter={(val) => `₹${val}`} />
            <Tooltip 
              contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Line type="monotone" dataKey="price" stroke="var(--accent-primary)" strokeWidth={3} dot={{r: 4, fill: 'var(--accent-primary)'}} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Infrastructure Projects */}
      <div>
        <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={16} /> Upcoming Infrastructure
        </h4>
        {infrastructure_projects.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={14} /> No major projects announced
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {infrastructure_projects.map((p, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{p.name}</span>
                  <span style={{ fontSize: '11px', color: p.status === 'Completed' ? 'var(--success)' : 'var(--warning)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                    {p.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>{p.type}</span>
                  <span>Est. {p.expected_completion_year}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ZoneDetails;
