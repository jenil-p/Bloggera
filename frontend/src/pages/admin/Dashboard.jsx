import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ReportsSection from './components/ReportsSection.jsx'
import UsersSection from './components/UsersSection';
import PostsSection from './components/PostsSection';
import CategoriesSection from './components/CategoriesSection';
import StatsCard from './components/StatsCard.jsx';
import ActionModal from './components/ActionModal.jsx'
import '../../index.css'

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
        const [reportsRes, usersRes, postsRes, categoriesRes, suggestedCategoriesRes, userRes] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/admin/users'),
          api.get('/posts'),
          api.get('/categories'),
          api.get('/categories/suggested'),
          api.get('/auth/me'),
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

  const handleAction = async (type, target, reason, durationDays) => {
    try {
      let response;
      switch (type) {
        case 'delete_post':
          await api.delete(`/admin/posts/${target}`, { data: { reason } });
          setData(prev => ({
            ...prev,
            posts: prev.posts.filter(post => post._id !== target),
            reports: prev.reports.filter(report => report.post?._id !== target),
            stats: {
              ...prev.stats,
              totalPosts: prev.posts.filter(p => p._id !== target).length,
              reportedPosts: prev.reports.filter(r => r.post?._id !== target).length,
            },
          }));
          alert('Post deleted successfully');
          break;
        case 'delete_posts':
          const { postIds, deleteAll: deleteAllPosts } = target;
          await api.delete('/admin/posts', { data: { postIds, deleteAll: deleteAllPosts, reason } });
          setData(prev => ({
            ...prev,
            posts: deleteAllPosts ? [] : prev.posts.filter(p => !postIds.includes(p._id)),
            reports: deleteAllPosts ? [] : prev.reports.filter(r => !postIds.includes(r.post?._id)),
            stats: {
              ...prev.stats,
              totalPosts: deleteAllPosts ? 0 : prev.posts.filter(p => !postIds.includes(p._id)).length,
              reportedPosts: deleteAllPosts ? 0 : prev.reports.filter(r => !postIds.includes(r.post?._id)).length,
            },
          }));
          alert(`${deleteAllPosts ? 'All' : postIds.length} post(s) deleted successfully`);
          break;
        case 'block_user':
          await api.post(`/admin/block/${target}`, { reason });
          setData(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user._id === target ? { ...user, isBlocked: true } : user // Assuming backend updates blockedUsers
            ),
          }));
          alert('User blocked successfully');
          break;
        case 'suspend_user':
          await api.post(`/admin/suspend/${target}`, { reason, durationDays });
          setData(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user._id === target ? {
                _id: user._id,
                isSuspended: true,
                suspendedUntil: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
              } : userId
            ),
            stats: {
              ...prev.stats,
              activeUsers: prev.stats.activeUsers - 1,
              suspendedUsers: prev.stats.suspendedUsers + 1,
            },
          }));
          alert('User suspended successfully');
          break;
        case 'unsuspend_user':
          await api.post(`/admin/unsuspend/${target}`, { reason });
          setData(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user._id === target ? {
                _id: user._id,
                isSuspended: false,
                suspendedUntil: null,
              } : userId
            ),
            stats: {
              ...prev.stats,
              activeUsers: prev.stats.activeUsers + 1,
              suspendedUsers: prev.stats.suspendedUsers - 1,
            },
          }));
          alert('User unsuspended successfully');
          break;
        case 'delete_user':
          await api.delete(`/users/delete/${target}`, { data: { reason } });
          setData(prev => ({
            ...prev,
            users: prev.users.filter(user => user._id !== target),
            posts: prev.posts.filter(post => post.author_id !== target),
            reports: prev.reports.filter(report => report.reportedBy?._id !== target),
            categories: prev.categories.filter(category => category.id !== target._id),
            suggestedCategories: prev.suggestedCategories.filter(category => category.suggestedBy?._id !== target),
            stats: {
              ...prev.stats,
              totalUsers: prev.stats.totalUsers - 1,
              activeUsers: prev.users.find(u => u._id === target)?.isSuspended ? prev.stats.activeUsers : prev.stats.activeUsers - 1,
              suspendedUsers: prev.users.find(u => u._id === target)?.isSuspended ? prev.stats.suspendedUsers - 1 : prev.stats.suspendedUsers,
              totalPosts: prev.posts.filter(p => p.author_id !== target).length,
              reportedPosts: prev.reports.filter(r => r.reportedBy?._id !== target).length,
              totalCategories: prev.categories.filter(c => c.suggestedBy?._id !== target).length,
              totalSuggestedCategories: prev.suggestedCategories.filter(c => c.suggestedBy?._id !== target).length,
            },
          }));
          alert('User deleted successfully');
          break;
        case 'delete_users':
          const { userIds, deleteAll: deleteAllUsers } = target;
          await api.delete('/users/delete', { data: { userIds, deleteAll: deleteAllUsers, reason } });
          setData(prev => ({
            ...prev,
            users: deleteAllUsers
              ? prev.users.filter(u => u._id === currentUserId || u.isAdmin)
              : prev.users.filter(u => !userIds.includes(u._id)),
            posts: deleteAllUsers
              ? prev.posts.filter(p => p.author._id === currentUserId || prev.users.find(u => u._id === p.author_id)?.isAdmin)
              : prev.posts.filter(p => !userIds.includes(p.author_id)),
            reports: deleteAllUsers
              ? prev.reports.filter(r => r.reportedBy._id === currentUserId || prev.users.find(u => u._id === r.reportedBy._id)?.isAdmin)
              : prev.reports.filter(r => !userIds.includes(r.reportedBy?._id)),
            categories: deleteAllUsers
              ? prev.categories.filter(c => c.suggestedBy?._id === currentUserId || prev.users.find(u => u._id === c.suggestedBy?._id)?.isAdmin)
              : prev.categories.filter(c => !userIds.includes(c.suggestedBy?._id)),
            suggestedCategories: deleteAllUsers
              ? prev.suggestedCategories.filter(c => c.suggestedBy?._id === currentUserId || prev.users.find(u => u._id === c.suggestedBy?._id)?.isAdmin)
              : prev.suggestedCategories.filter(c => !userIds.includes(c.suggestedBy?._id)),
            stats: {
              ...prev.stats,
              totalUsers: deleteAllUsers
                ? prev.users.filter(u => u._id === currentUserId || u.isAdmin).length
                : prev.users.filter(u => !userIds.includes(u._id)).length,
              activeUsers: deleteAllUsers
                ? prev.users.filter(u => (u._id === currentUserId || u.isAdmin) && !u.isSuspended).length
                : prev.users.filter(u => !userIds.includes(u._id) && !u.isSuspended).length,
              suspendedUsers: deleteAllUsers
                ? prev.users.filter(u => (u._id === currentUserId || u.isAdmin) && u.isSuspended).length
                : prev.users.filter(u => !userIds.includes(u._id) && u.isSuspended).length,
              totalPosts: deleteAllUsers
                ? prev.posts.filter(p => p.author._id === currentUserId || prev.users.find(u => u._id === p.author_id)?.isAdmin).length
                : prev.posts.filter(p => !userIds.includes(p.author_id)).length,
              reportedPosts: deleteAllUsers
                ? prev.reports.filter(r => r.reportedBy._id === currentUserId || prev.users.find(u => u._id === r.reportedBy._id)?.isAdmin).length
                : prev.reports.filter(r => !userIds.includes(r.reportedBy?._id)).length,
              totalCategories: deleteAllUsers
                ? prev.categories.filter(c => c.suggestedBy?._id === currentUserId || prev.users.find(u => u._id === c.suggestedBy?._id)?.isAdmin).length
                : prev.categories.filter(c => !userIds.includes(c.suggestedBy?._id)).length,
              totalSuggestedCategories: deleteAllUsers
                ? prev.suggestedCategories.filter(c => c.suggestedBy?._id === currentUserId || prev.users.find(u => u._id === c.suggestedBy?._id)?.isAdmin).length
                : prev.suggestedCategories.filter(c => !userIds.includes(c.suggestedBy?._id)).length,
            },
          }));
          alert(`${deleteAllUsers ? 'All' : userIds.length} user(s) deleted successfully`);
          break;
        case 'resolve_report':
          const report = data.reports.find(r => r._id === target);
          await api.post(`/admin/reports/${target}/resolve`, { reason });
          if (report?.post?._id) {
            setData(prev => ({
              ...prev,
              posts: prev.posts.filter(post => post._id !== report.post._id),
              reports: prev.reports.filter(r => r._id !== target),
              stats: {
                ...prev.stats,
                totalPosts: prev.posts.filter(p => p._id !== report.post._id).length,
                reportedPosts: prev.reports.filter(r => r._id !== target).length,
              },
            }));
          } else {
            setData(prev => ({
              ...prev,
              reports: prev.reports.filter(r => r._id !== target),
              stats: {
                ...prev.stats,
                reportedPosts: prev.reports.filter(r => r._id !== target).length,
              },
            }));
          }
          alert('Report resolved successfully');
          break;
        case 'dismiss_report':
          await api.post(`/admin/reports/${target}/dismiss`, { reason });
          setData(prev => ({
            ...prev,
            reports: prev.reports.filter(r => r._id !== target),
            stats: {
              ...prev.stats,
              reportedPosts: prev.reports.filter(r => r._id !== target).length,
            },
          }));
          alert('Report dismissed successfully');
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
          alert('Category created successfully');
          break;
        case 'approve_category':
          response = await api.post(`/categories/approve/${target}`);
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
          alert('Category approved successfully');
          break;
        case 'reject_category':
          response = await api.post(`/categories/reject/${target}`);
          const updatedSuggestedCategoriesResReject = await api.get(`/categories/suggested`);
          setData(prev => ({
            ...prev,
            suggestedCategories: updatedSuggestedCategoriesResReject.data,
            stats: {
              ...prev.stats,
              totalSuggestedCategories: updatedSuggestedCategoriesResReject.data.length,
            },
          }));
          alert('Category rejected successfully');
          break;
        case 'delete_category':
          await api.delete(`/categories/${target}`, { data: { reason } });
          const updatedCategoriesRes = await api.get(`/categories`);
          setData(prev => ({
            ...prev,
            categories: updatedCategoriesRes.data,
            stats: {
              ...prev.stats,
              totalCategories: updatedCategoriesRes.data.length,
            },
          }));
          alert('Category deleted successfully');
          break;
        default:
          throw new Error('Invalid action type');
      }
      setShowActionModal(null);
    } catch (err) {
      setError(err.response?.data?.message || `Error performing ${type}`);
      alert(err.response?.data?.message || `Error performing ${type}`);
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
    <div className="min-h-screen max-sm:pb-14 background">
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
              currentUserId={data.users.find(u => u.isAdmin)?._id}
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
          userIds={showActionModal.userIds}
          postIds={showActionModal.postIds}
          deleteAll={showActionModal.deleteAll}
          onClose={() => setShowActionModal(null)}
          onConfirm={handleAction}
        />
      )}
    </div>
  );
}

export default Dashboard;