import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ReportsSection from './components/ReportsSection';
import UsersSection from './components/UsersSection';
import PostsSection from './components/PostsSection';
import StatsCard from './components/StatsCard';
import ActionModal from './components/ActionModal';
import '../../index.css'

function Dashboard() {
  const [data, setData] = useState({
    reports: [],
    users: [],
    posts: [],
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      totalPosts: 0,
      reportedPosts: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [showActionModal, setShowActionModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, usersRes, postsRes] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/admin/users'),
          api.get('/posts')
        ]);

        const activeUsers = usersRes.data.filter(u => !u.isSuspended).length;
        const suspendedUsers = usersRes.data.filter(u => u.isSuspended).length;

        setData({
          reports: reportsRes.data,
          users: usersRes.data,
          posts: postsRes.data,
          stats: {
            totalUsers: usersRes.data.length,
            activeUsers,
            suspendedUsers,
            totalPosts: postsRes.data.length,
            reportedPosts: reportsRes.data.length
          }
        });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
        setLoading(false);
        if (err.response?.status === 403) {
          navigate('/');
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handleAction = async (type, targetId, reason, durationDays) => {
    try {
      let response;
      switch (type) {
        case 'delete_post':
          await api.delete(`/admin/posts/${targetId}`, { data: { reason } });
          setData(prev => ({
            ...prev,
            posts: prev.posts.filter(post => post._id !== targetId),
            reports: prev.reports.filter(report => report.post?._id !== targetId),
            stats: {
              ...prev.stats,
              totalPosts: prev.stats.totalPosts - 1,
              reportedPosts: prev.reports.filter(r => r.post?._id !== targetId).length
            }
          }));
          break;
        case 'block_user':
          // Note: The backend 'block_user' endpoint only adds to blockedUsers, it does not set isSuspended.
          // If you intend 'block_user' to also suspend, you'll need to modify the backend.
          response = await api.post(`/admin/block/${targetId}`, { reason });
          // Assuming a blocked user is also considered 'suspended' in the frontend display logic here
          // You might need to refine this if 'block' and 'suspend' are distinct states in UI.
          setData(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user._id === targetId ? { ...user, isSuspended: true } : user
            ),
            stats: {
              ...prev.stats,
              activeUsers: prev.stats.activeUsers - 1,
              suspendedUsers: prev.stats.suspendedUsers + 1
            }
          }));
          break;
        case 'suspend_user':
          response = await api.post(`/admin/suspend/${targetId}`, { reason, durationDays });
          setData(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user._id === targetId ? {
                ...user,
                isSuspended: true,
                suspendedUntil: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
              } : user
            ),
            stats: {
              ...prev.stats,
              activeUsers: prev.stats.activeUsers - 1,
              suspendedUsers: prev.stats.suspendedUsers + 1
            }
          }));
          break;
        case 'unsuspend_user': // Added: New case for unsuspend_user
          response = await api.post(`/admin/unsuspend/${targetId}`, { reason }); // Pass reason to backend
          setData(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user._id === targetId ? {
                ...user,
                isSuspended: false,
                suspendedUntil: null // Set to null after unsuspension
              } : user
            ),
            stats: {
              ...prev.stats,
              activeUsers: prev.stats.activeUsers + 1, // Increment active users
              suspendedUsers: prev.stats.suspendedUsers - 1 // Decrement suspended users
            }
          }));
          break;
        case 'resolve_report':
          const report = data.reports.find(r => r._id === targetId);
          await api.post(`/admin/reports/${targetId}/resolve`, { reason });
          if (report?.post?._id) {
            setData(prev => ({
              ...prev,
              posts: prev.posts.filter(post => post._id !== report.post._id),
              reports: prev.reports.filter(r => r._id !== targetId),
              stats: {
                ...prev.stats,
                totalPosts: prev.posts.filter(p => p._id !== report.post._id).length,
                reportedPosts: prev.reports.filter(r => r._id !== targetId).length
              }
            }));
          } else {
            setData(prev => ({
              ...prev,
              reports: prev.reports.filter(r => r._id !== targetId),
              stats: {
                ...prev.stats,
                reportedPosts: prev.reports.filter(r => r._id !== targetId).length
              }
            }));
          }
          break;
        case 'dismiss_report':
          await api.post(`/admin/reports/${targetId}/dismiss`, { reason });
          setData(prev => ({
            ...prev,
            reports: prev.reports.filter(r => r._id !== targetId),
            stats: {
              ...prev.stats,
              reportedPosts: prev.reports.filter(r => r._id !== targetId).length
            }
          }));
          break;
        default:
          break;
      }
      setShowActionModal(null);
    } catch (err) {
      setError(err.response?.data?.message || `Error performing ${type}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen background">
      {/* Header */}
      <header className="background shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-theme">Bloggera Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-theme">
              Welcome, Admin
            </span>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={data.stats.totalUsers}
            icon="👥"
            trend="up"
            change="5% from last week"
          />
          <StatsCard
            title="Active Users"
            value={data.stats.activeUsers}
            icon="✅"
            trend="up"
            change="2% from last week"
          />
          <StatsCard
            title="Suspended Users"
            value={data.stats.suspendedUsers}
            icon="⛔"
            trend="down"
            change="10% from last week"
          />
          <StatsCard
            title="Total Posts"
            value={data.stats.totalPosts}
            icon="📝"
            trend="up"
            change="15% from last week"
          />
          <StatsCard
            title="Reported Posts"
            value={data.stats.reportedPosts}
            icon="⚠️"
            trend="down"
            change="8% from last week"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('reports')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-theme hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              Reports ({data.reports.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-theme hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              Users ({data.users.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-theme hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              Posts ({data.posts.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="background rounded-lg shadow overflow-hidden">
          {activeTab === 'reports' && (
            <ReportsSection
              reports={data.reports}
              posts={data.posts}
              onActionClick={setShowActionModal}
            />
          )}
          {activeTab === 'users' && (
            <UsersSection
              users={data.users}
              onActionClick={setShowActionModal}
            />
          )}
          {activeTab === 'posts' && (
            <PostsSection
              posts={data.posts}
              onActionClick={setShowActionModal}
            />
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <ActionModal
          type={showActionModal.type}
          targetId={showActionModal.targetId}
          onClose={() => setShowActionModal(null)}
          onConfirm={handleAction}
        />
      )}
    </div>
  );
}

export default Dashboard;