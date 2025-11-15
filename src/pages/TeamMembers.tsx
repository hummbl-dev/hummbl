/**
 * Team Members - Collaboration & Access Management
 * 
 * T2 (Composition): Team collaboration through shared workspace
 * Sixth page of 8-page pilot (Week 2, Day 6)
 * 
 * @module pages/TeamMembers
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { telemetry } from '../services/telemetry-enhanced';
import { getUsers, getUserStats, getInvites, createInvite, updateUser, deleteUser, type User, type UserStats, type Invite } from '../services/api';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Crown,
  User as UserIcon,
  MoreVertical,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Ban,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

type RoleFilter = 'all' | 'owner' | 'admin' | 'member' | 'viewer';
type StatusFilter = 'all' | 'active' | 'invited' | 'suspended';

export default function TeamMembers() {
  const [members, setMembers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    owners: 0,
    admins: 0,
    members: 0,
    viewers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Track page view
  useEffect(() => {
    telemetry.pageView('team-members', { roleFilter, statusFilter });
  }, [roleFilter, statusFilter]);

  // Load team data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, statsResponse, invitesResponse] = await Promise.all([
        getUsers(),
        getUserStats(),
        getInvites(),
      ]);

      setMembers(usersResponse.users);
      setStats(statsResponse.stats);
      setInvites(invitesResponse.invites);
    } catch (err) {
      console.error('Failed to load team data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle role change
  const handleEditRole = async (newRole: string) => {
    if (!selectedMember) return;

    try {
      setActionLoading(true);
      await updateUser(selectedMember.id, { role: newRole });
      await loadData(); // Reload data
      setShowEditModal(false);
      setSelectedMember(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle suspend/activate
  const handleToggleStatus = async (member: User) => {
    const newStatus = member.status === 'active' ? 'suspended' : 'active';
    
    try {
      setActionLoading(true);
      await updateUser(member.id, { status: newStatus });
      await loadData(); // Reload data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedMember) return;

    try {
      setActionLoading(true);
      await deleteUser(selectedMember.id);
      await loadData(); // Reload data
      setShowDeleteModal(false);
      setSelectedMember(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-8 w-8 animate-pulse text-primary-600 mx-auto mb-2" />
          <p className="text-gray-900">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if it's an auth error
    const isAuthError = error.includes('permission') || error.includes('Unauthorized') || error.includes('403');
    
    if (isAuthError) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-black dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900">Team Collaboration (Preview Mode)</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              Team collaboration features require authentication. This demo shows what you'll be able to do:
            </p>
            
            <div className="bg-white rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Available Features:</h3>
              <ul className="space-y-2 text-sm text-gray-900">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                  <span><strong>Invite team members</strong> via email with role-based access</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                  <span><strong>Manage permissions</strong> with Owner, Admin, Member, and Viewer roles</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                  <span><strong>Share workflows</strong> and collaborate on complex projects</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                  <span><strong>Track activity</strong> with audit logs and team statistics</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                <strong>Note:</strong> Authentication is available but not enforced in this demo. 
                To enable team features, configure authentication in Settings → API Keys.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/settings'}
                className="btn-primary"
              >
                Configure Authentication
              </button>
              <button
                onClick={() => window.location.href = '/workflows'}
                className="btn-secondary"
              >
                Back to Workflows
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-black dark:text-white mx-auto mb-2" />
          <p className="text-black dark:text-white font-medium">Failed to load team members</p>
          <p className="text-gray-900 text-sm mt-1">{error}</p>
          <button
            onClick={loadData}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-900 mt-1">Manage team access and collaboration</p>
        </div>

        {/* Invite Button */}
        <button
          onClick={() => {
            setShowInviteModal(true);
            telemetry.track({ component: 'team-members', action: 'click_invite' });
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} />
        <StatCard
          label="Active"
          value={stats.activeUsers}
          icon={<CheckCircle className="h-5 w-5" />}
          color="text-black dark:text-white"
        />
        <StatCard
          label="Pending Invites"
          value={invites.length}
          icon={<Clock className="h-5 w-5" />}
          color="text-black dark:text-white"
        />
        <StatCard
          label="Admins"
          value={stats.owners + stats.admins}
          icon={<Shield className="h-5 w-5" />}
          color="text-black dark:text-white"
        />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            aria-label="Select role filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>

          {/* Status Filter */}
          <select
            aria-label="Select status filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-900">No team members found</p>
            <p className="text-sm text-gray-800 mt-1">Try adjusting your filters or invite new members</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Member</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Activity</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Stats</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMembers.map((member) => (
                  <MemberRow 
                    key={member.id} 
                    member={member}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    setSelectedMember={setSelectedMember}
                    setShowEditModal={setShowEditModal}
                    setShowDeleteModal={setShowDeleteModal}
                    handleToggleStatus={handleToggleStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvite={async (email, role) => {
            try {
              await createInvite({ email, role });
              telemetry.track({
                component: 'team-members',
                action: 'send_invite',
                properties: { role },
              });
              await loadData(); // Reload data
              setShowInviteModal(false);
            } catch (err) {
              console.error('Failed to send invite:', err);
              alert('Failed to send invitation. Please try again.');
            }
          }}
        />
      )}

      {/* Permissions Guide */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PermissionCard
            role="Owner"
            icon={<Crown className="h-5 w-5 text-black dark:text-white" />}
            permissions={['Full access', 'Billing', 'Delete workspace']}
          />
          <PermissionCard
            role="Admin"
            icon={<Shield className="h-5 w-5 text-black dark:text-white" />}
            permissions={['Manage members', 'All workflows', 'Settings']}
          />
          <PermissionCard
            role="Member"
            icon={<UserIcon className="h-5 w-5 text-black dark:text-white" />}
            permissions={['Create workflows', 'Run workflows', 'View analytics']}
          />
          <PermissionCard
            role="Viewer"
            icon={<UserIcon className="h-5 w-5 text-gray-900" />}
            permissions={['View workflows', 'View results', 'Read-only']}
          />
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Role</h3>
            <p className="text-sm text-gray-900 mb-4">
              Change role for {selectedMember.name} ({selectedMember.email})
            </p>
            <div className="space-y-2 mb-6">
              {['owner', 'admin', 'member', 'viewer'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleEditRole(role)}
                  disabled={actionLoading}
                  className={`w-full px-4 py-2 text-left rounded-lg border transition-colors ${
                    selectedMember.role === role
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium capitalize">{role}</div>
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMember(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-black dark:text-white" />
              <h3 className="text-lg font-semibold text-gray-900">Remove User</h3>
            </div>
            <p className="text-sm text-gray-900 mb-6">
              Are you sure you want to remove {selectedMember.name} ({selectedMember.email})? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMember(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Removing...' : 'Remove User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color = 'text-gray-700',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-900">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-2 bg-gray-50 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

// Member Row Component
function MemberRow({ 
  member,
  openMenuId,
  setOpenMenuId,
  setSelectedMember,
  setShowEditModal,
  setShowDeleteModal,
  handleToggleStatus,
}: { 
  member: User;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  setSelectedMember: (member: User) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  handleToggleStatus: (member: User) => void;
}) {
  const roleConfig = {
    owner: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-100', icon: <Crown className="h-4 w-4" /> },
    admin: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-100', icon: <Shield className="h-4 w-4" /> },
    member: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-100', icon: <UserIcon className="h-4 w-4" /> },
    viewer: { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-900 dark:text-gray-200', icon: <UserIcon className="h-4 w-4" /> },
  };

  const statusConfig = {
    active: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-200', icon: <CheckCircle className="h-4 w-4" /> },
    invited: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-200', icon: <Clock className="h-4 w-4" /> },
    suspended: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-200', icon: <XCircle className="h-4 w-4" /> },
  };

  const roleStyle = roleConfig[member.role as keyof typeof roleConfig] || roleConfig.member;
  const statusStyle = statusConfig[member.status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <tr className="hover:bg-gray-50">
      {/* Member */}
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
            {member.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{member.name}</p>
            <p className="text-sm text-gray-800">{member.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="p-4">
        <span
          className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}
        >
          {roleStyle.icon}
          <span className="capitalize">{member.role}</span>
        </span>
      </td>

      {/* Status */}
      <td className="p-4">
        <span
          className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.icon}
          <span className="capitalize">{member.status}</span>
        </span>
      </td>

      {/* Activity */}
      <td className="p-4">
        <div className="text-sm">
          {member.status === 'invited' ? (
            <span className="text-gray-800">Pending</span>
          ) : (
            <>
              <p className="text-gray-900">Joined {member.joinedAt ? formatDate(member.joinedAt) : 'Unknown'}</p>
              {member.lastActiveAt && (
                <p className="text-gray-800">Active {formatTimestamp(member.lastActiveAt)}</p>
              )}
            </>
          )}
        </div>
      </td>

      {/* Stats */}
      <td className="p-4">
        <div className="text-sm">
          <p className="text-gray-900">{member.workflowsCreated} workflows</p>
          <p className="text-gray-800">{member.executionsRun} executions</p>
        </div>
      </td>

      {/* Actions */}
      <td className="p-4 text-right relative">
        <button
          aria-label="Member actions menu"
          onClick={(e) => {
            e.stopPropagation();
            telemetry.track({
              component: 'team-members',
              action: 'click_member_menu',
              properties: { memberId: member.id },
            });
            setOpenMenuId(openMenuId === member.id ? null : member.id);
          }}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-gray-900" />
        </button>

        {/* Dropdown Menu */}
        {openMenuId === member.id && (
          <div className="absolute right-0 top-12 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMember(member);
                setShowEditModal(true);
                setOpenMenuId(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Role</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(member);
                setOpenMenuId(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <Ban className="h-4 w-4" />
              <span>{member.status === 'active' ? 'Suspend' : 'Activate'}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMember(member);
                setShowDeleteModal(true);
                setOpenMenuId(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-black dark:text-white hover:bg-gray-50 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove</span>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// Invite Modal Component
function InviteModal({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (email: string, role: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Invite Team Member</h3>
          <button onClick={onClose} aria-label="Close invite modal" className="text-gray-700 hover:text-gray-900">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              aria-label="Select role for invite"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="viewer">Viewer - Read-only access</option>
              <option value="member">Member - Create & run workflows</option>
              <option value="admin">Admin - Manage team & settings</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => onInvite(email, role)}
              disabled={!email}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Permission Card Component
function PermissionCard({
  role,
  icon,
  permissions,
}: {
  role: string;
  icon: React.ReactNode;
  permissions: string[];
}) {
  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        {icon}
        <h4 className="font-medium text-gray-900">{role}</h4>
      </div>
      <ul className="space-y-1">
        {permissions.map((perm, index) => (
          <li key={index} className="text-sm text-gray-900 flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-black dark:text-white" />
            <span>{perm}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Format date helper
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Format timestamp helper
function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}
