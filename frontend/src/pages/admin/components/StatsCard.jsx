import '../../../index.css'

export default function StatsCard({ title, value, icon, trend, change }) {
  const trendColors = {
    up: 'text-green-500 dark:text-green-400',
    down: 'text-red-500 dark:text-red-400',
    neutral: 'text-theme'
  };

  return (
    <div className="background rounded-lg shadow p-6 border border-card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-theme">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-theme">{value}</p>
          <p className="mt-1 text-xs text-theme">{change}</p>
        </div>
        <div className={`p-3 rounded-full bg-icon text-theme text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}