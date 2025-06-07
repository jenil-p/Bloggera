import { Link } from 'react-router-dom';

export default function ReportsSection({ reports, posts, onActionClick }) {
  if (reports.length === 0) {
    return (
      <div className="p-6 text-center text-theme">
        No reports available. Everything looks clean!
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-700">
      {reports.map(report => (
        <div key={report._id} className="p-6 transition-colors duration-150">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium red">
                  Reported
                </span>
                <span className="text-sm text-theme">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              <h3 className="mt-2 text-lg font-medium text-theme">
                {report.post?.content?.substring(0, 60) || 'Post content not available'}...
              </h3>

              <div className="mt-2 space-y-1">
                <p className="text-sm text-theme">
                  <span className="font-medium">Reason:</span> {report.reason}
                </p>
                {report.message && (
                  <p className="text-sm text-theme">
                    <span className="font-medium">Details:</span> {report.message}
                  </p>
                )}
                <p className="text-sm text-theme">
                  <span className="font-medium">Reported by:</span> {report.reportedBy?.username || 'Anonymous'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2">
              <button
                onClick={() => onActionClick({ type: 'resolve_report', targetId: report._id })}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Resolve
              </button>
              <button
                onClick={() => onActionClick({ type: 'dismiss_report', targetId: report._id })}
                className="inline-flex items-center px-3 py-1.5 border border-theme text-xs font-medium rounded text-theme bg-card hover-bg-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Dismiss
              </button>
              {report.post?._id && (
                <Link
                  to={`/post/${report.post._id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-theme text-xs font-medium rounded text-theme bg-card hover-bg-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
                >
                  View Post
                </Link>
              )}
            </div>
          </div>

          {report.post?.image && (
            <div className="mt-4">
              <img
                src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${report.post.image}`}
                alt="Reported post"
                className="h-40 rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}