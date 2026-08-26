import React, { useEffect, useState } from 'react';
import { Users, Plus, MessageSquare, X, Send, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface GroupSummary {
  id: number;
  group_code: string;
  name: string;
  description: string;
  skill_id: number | null;
  skill_name: string | null;
  member_count: number;
  post_count: number;
  is_member: boolean;
  created_at: string;
}

interface GroupPost {
  id: number;
  content: string;
  employee_name: string;
  avatar_url: string | null;
  created_at: string;
}

interface GroupMember {
  id: number;
  employee_id: number;
  employee_name: string;
  designation: string;
  avatar_url: string | null;
  role: string;
}

interface GroupDetail extends GroupSummary {
  members: GroupMember[];
  posts: GroupPost[];
}

export const CommunityGroups: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/community-groups');
      if (res.data.success) {
        setGroups(res.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load community groups:', err);
      setError('Could not load community groups right now.');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const openGroup = async (id: number) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/community-groups/${id}`);
      if (res.data.success) {
        setSelectedGroup(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load group:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleJoin = async (id: number) => {
    try {
      await api.post(`/community-groups/${id}/join`);
      await fetchGroups();
      if (selectedGroup?.id === id) await openGroup(id);
    } catch (err) {
      console.error('Failed to join group:', err);
    }
  };

  const handleLeave = async (id: number) => {
    try {
      await api.post(`/community-groups/${id}/leave`);
      await fetchGroups();
      if (selectedGroup?.id === id) await openGroup(id);
    } catch (err) {
      console.error('Failed to leave group:', err);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      setCreating(true);
      await api.post('/community-groups', { name: newGroupName.trim(), description: newGroupDescription.trim() });
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      await fetchGroups();
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setCreating(false);
    }
  };

  const handlePost = async () => {
    if (!postContent.trim() || !selectedGroup) return;
    try {
      setPosting(true);
      await api.post(`/community-groups/${selectedGroup.id}/posts`, { content: postContent.trim() });
      setPostContent('');
      await openGroup(selectedGroup.id);
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-xs font-semibold">
        <span className="w-4 h-4 border-2 border-[#0A7A74]/30 border-t-[#0A7A74] rounded-full animate-spin mr-2" />
        Loading community groups...
      </div>
    );
  }

  // ---- Detail view ----
  if (selectedGroup) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 text-xs">
        <button
          onClick={() => setSelectedGroup(null)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-[#0A7A74] font-bold text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Communities
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">{selectedGroup.name}</h2>
              <p className="text-slate-500 mt-1">{selectedGroup.description || 'No description yet.'}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-semibold">
                <span>{selectedGroup.member_count} members</span>
                <span>•</span>
                <span>{selectedGroup.post_count} posts</span>
                {selectedGroup.skill_name && (
                  <>
                    <span>•</span>
                    <span className="text-[#0A7A74]">{selectedGroup.skill_name}</span>
                  </>
                )}
              </div>
            </div>
            {selectedGroup.is_member ? (
              <button
                onClick={() => handleLeave(selectedGroup.id)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs shrink-0"
              >
                Leave Group
              </button>
            ) : (
              <button
                onClick={() => handleJoin(selectedGroup.id)}
                className="px-3 py-1.5 bg-[#0A7A74] hover:bg-[#08635e] text-white font-bold rounded-xl text-xs shrink-0"
              >
                Join Group
              </button>
            )}
          </div>
        </div>

        {selectedGroup.is_member && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share something with the group..."
                className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-medium focus:outline-none focus:border-[#0A7A74]"
                onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              />
              <button
                onClick={handlePost}
                disabled={posting || !postContent.trim()}
                className="px-4 h-10 bg-[#0A7A74] hover:bg-[#08635e] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {selectedGroup.posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
              No posts yet — be the first to share something with this group.
            </div>
          ) : (
            selectedGroup.posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#E6F7F5] text-[#0A7A74] flex items-center justify-center font-bold shrink-0">
                    {post.avatar_url ? (
                      <img src={post.avatar_url} alt={post.employee_name} className="w-full h-full object-cover" />
                    ) : (
                      (post.employee_name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{post.employee_name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{post.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ---- List view ----
  return (
    <div className="max-w-6xl mx-auto space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900">Community of Practice Groups</h1>
          <p className="text-slate-500 mt-0.5">Informal, skill-focused peer knowledge-sharing — separate from formal mentorship and scheduled sessions.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 h-9 bg-[#0A7A74] hover:bg-[#08635e] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> New Group
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">{error}</div>
      )}

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          No community groups yet. Start one around a skill you'd like to grow together.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => openGroup(group.id)}
              className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0A7A74]/40 transition-all p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-900">{group.name}</h3>
                {group.is_member && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[10px] shrink-0">
                    Joined
                  </span>
                )}
              </div>
              <p className="text-slate-500 mt-1 line-clamp-2">{group.description || 'No description yet.'}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {group.member_count}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {group.post_count}</span>
                {group.skill_name && <span className="text-[#0A7A74] ml-auto">{group.skill_name}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-black text-slate-900 mb-3">Start a Community Group</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Cloud & DevOps Practitioners"
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3.5 font-medium focus:outline-none focus:border-[#0A7A74]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="What's this group about?"
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium focus:outline-none focus:border-[#0A7A74] resize-none"
                />
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={creating || !newGroupName.trim()}
                className="w-full h-10 bg-[#0A7A74] hover:bg-[#08635e] text-white font-bold rounded-xl disabled:opacity-40"
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
