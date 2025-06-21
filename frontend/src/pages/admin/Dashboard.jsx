import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ReportsSection from './components/ReportsSection';
import UsersSection from './components/UsersSection';
import PostsSection from './components/PostsSection';
import CategoriesSection from './components/CategoriesSection';
import StatsCard from './components/StatsCard';
import ActionModal from './components/ActionModal';
import '../../index.css';

function Dashboard() {
  const [data, setData] = useState({
    reports: [],
    users: [],
    posts: [],
    categories: [],
    suggestedCategories: [],
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      totalPosts: 0,
      reportedPosts: 0,
      totalCategories: 0,
      totalSuggestedCategories: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [showActionModal, setShowActionModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, usersRes, postsRes, categoriesRes, suggestedCategoriesRes] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/admin/users'),
          api.get('/posts'),
          api.get('/categories'),
          api.get('/categories/suggested'),
        ]);

        const activeUsers = usersRes.data.filter(u => !u.isSuspended).length;
        const suspendedUsers = usersRes.data.filter(u => u.isSuspended).length;

        setData({
          reports: reportsRes.data,
          users: usersRes.data,
          posts: postsRes.data,
          categories: categoriesRes.data,
          suggestedCategories: suggestedCategoriesRes.data,
          stats: {
            totalUsers: usersRes.data.length,
            activeUsers,
            suspendedUsers,
            totalPosts: postsRes.data.length,
            reportedPosts: reportsRes.data.length,
            totalCategories: categoriesRes.data.length,
            totalSuggestedCategories: suggestedCategoriesRes.data.length,
          },
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
              reportedPosts: prev.reports.filter(r => r.post?._id !== targetId).length,
            },
          }));
          break;
        case 'block_user':
          response = await api.post(`/admin/block/${targetId}`, { reason });
          setData(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user._id === targetId ? { ...user, isSuspended: true } : user
            ),
            stats: {
              ...prev.stats,
              activeUsers: prev.stats.activeUsers - 1,
              suspendedUsers: prev.stats.suspendedUsers + 1,
            },
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
                suspendedUntil: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
              } : user
            ),
            stats: {
              ...prev.stats,
              activeUsers: prev.stats.activeUsers - 1,
              suspendedUsers: prev.stats.suspendedUsers + 1,
            },
          }));
          break;
        case 'unsuspend_user':
          response = await api.post(`/admin/unsuspend/${targetId}`, { reason });
          setData(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user._id === targetId ? {
                ...user,
                isSuspended: false,
                suspendedUntil: null,
              } : user
            ),
            stats: {
              ...prev.stats,
              activeUsers: prev.stats.activeUsers + 1,
              suspendedUsers: prev.stats.suspendedUsers - 1,
            },
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
                reportedPosts: prev.reports.filter(r => r._id !== targetId).length,
              },
            }));
          } else {
            setData(prev => ({
              ...prev,
              reports: prev.reports.filter(r => r._id !== targetId),
              stats: {
                ...prev.stats,
                reportedPosts: prev.reports.filter(r => r._id !== targetId).length,
              },
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
              reportedPosts: prev.reports.filter(r => r._id !== targetId).length,
            },
          }));
          break;
        case 'create_category':
          response = await api.post('/categories', { name: reason });
          setData(prev => ({
            ...prev,
            categories: [...prev.categories, response.data.category],
            stats: {
              ...prev.stats,
              totalCategories: prev.stats.totalCategories + 1,
            },
          }));
          break;
        case 'approve_category':
          response = await api.post(`/categories/approve/${targetId}`);
          const updatedCategoryRes = await api.get(`/categories`);
          const updatedSuggestedCategoriesRes = await api.get(`/categories/suggested`);
          setData(prev => ({
            ...prev,
            suggestedCategories: updatedSuggestedCategoriesRes.data,
            categories: updatedCategoryRes.data,
            stats: {
              ...prev.stats,
              totalCategories: updatedCategoryRes.data.length,
              totalSuggestedCategories: updatedSuggestedCategoriesRes.data.length,
            },
          }));
          break;
        case 'reject_category':
          response = await api.post(`/categories/reject/${targetId}`);
          const updatedSuggestedCategoriesResReject = await api.get(`/categories/suggested`);
          setData(prev => ({
            ...prev,
            suggestedCategories: updatedSuggestedCategoriesResReject.data,
            stats: {
              ...prev.stats,
              totalSuggestedCategories: updatedSuggestedCategoriesResReject.data.length,
            },
          }));
          break;
        case 'delete_category':
          await api.delete(`/categories/${targetId}`, { data: { reason } });
          const updatedCategoriesRes = await api.get(`/categories`);
          setData(prev => ({
            ...prev,
            categories: updatedCategoriesRes.data,
            stats: {
              ...prev.stats,
              totalCategories: updatedCategoriesRes.data.length,
            },
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
      <header className="background shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-theme">Bloggera Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-theme">Welcome, Admin</span>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
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
          <StatsCard
            title="Total Categories"
            value={data.stats.totalCategories}
            icon="🏷️"
            trend="up"
            change="New this week"
          />
          <StatsCard
            title="Suggested Categories"
            value={data.stats.totalSuggestedCategories}
            icon="💡"
            trend="up"
            change="New this week"
          />
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-100 rounded-lg text-red-700 border border-red-200">
            {error}
          </div>
        )}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('reports')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-theme hover:border-gray-300'}`}
            >
              Reports ({data.reports.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-theme hover:border-gray-300'}`}
            >
              Users ({data.users.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-theme hover:border-gray-300'}`}
            >
              Posts ({data.posts.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-theme hover:border-gray-300'}`}
            >
              Categories ({data.stats.totalCategories + data.stats.totalSuggestedCategories})
            </button>
          </nav>
        </div>
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
          {activeTab === 'categories' && (
            <CategoriesSection
              categories={data.categories}
              suggestedCategories={data.suggestedCategories}
              onActionClick={setShowActionModal}
            />
          )}
        </div>
      </div>
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