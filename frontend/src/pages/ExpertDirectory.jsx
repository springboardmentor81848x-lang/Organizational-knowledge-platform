import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  Search,
  Users,
  Award,
  Building2,
  Filter,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  UserCheck,
  RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const levelNames = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Competent',
  4: 'Advanced',
  5: 'Expert',
};

const levelBadgeStyles = {
  1: 'bg-red-50 text-red-700 border-red-200',
  2: 'bg-orange-50 text-orange-700 border-orange-200',
  3: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  4: 'bg-blue-50 text-blue-700 border-blue-200',
  5: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const departmentColors = {
  'IT': 'bg-purple-50 text-purple-700 border-purple-200',
  'Engineering': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Data Analytics': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Quality Assurance': 'bg-teal-50 text-teal-700 border-teal-200',
  'Security': 'bg-rose-50 text-rose-700 border-rose-200',
  'UI/UX Design': 'bg-pink-50 text-pink-700 border-pink-200',
  'HR': 'bg-amber-50 text-amber-700 border-amber-200',
  'Management': 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function ExpertDirectory() {
  const [experts, setExperts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [minProficiency, setMinProficiency] = useState(0);
  const [viewMode, setViewMode] = useState('table');

  const [selectedExpert, setSelectedExpert] = useState(null);
  const [mentorshipGoal, setMentorshipGoal] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [activeTab, setActiveTab] = useState('directory');
  const [myMentorships, setMyMentorships] = useState([]);
  const [mentorshipLoading, setMentorshipLoading] = useState(false);

  const employeeId = localStorage.getItem('employeeId') || '';
  const currentRole = localStorage.getItem('role') || localStorage.getItem('userRole') || 'EMPLOYEE';

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  };

  const fetchExperts = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('query', searchQuery.trim());
      if (selectedDept) params.append('department', selectedDept);
      if (minProficiency > 0) params.append('minProficiency', String(minProficiency));
      if (employeeId) params.append('currentEmployeeId', employeeId);

      const response = await axios.get(
        `${API_BASE_URL}/expert-directory/search?${params.toString()}`,
        getHeaders()
      );

      setExperts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching experts:', err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to load experts directory. Please check backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [deptRes, skillRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/expert-directory/departments`, getHeaders()).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/expert-directory/skills`, getHeaders()).catch(() => ({ data: [] })),
      ]);

      if (Array.isArray(deptRes.data)) setDepartments(deptRes.data);
      if (Array.isArray(skillRes.data)) setSkillsList(skillRes.data);
    } catch (e) {
      console.error('Error fetching metadata:', e);
    }
  };

  const fetchMyMentorships = async () => {
    if (!employeeId) return;
    try {
      setMentorshipLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/mentorships/employee/${employeeId}`,
        getHeaders()
      );
      setMyMentorships(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      console.error('Error fetching mentorships:', e);
    } finally {
      setMentorshipLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
    fetchExperts();
    fetchMyMentorships();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExperts();
  };

  const handleQuickSkillClick = (skillName) => {
    setSearchQuery(skillName);
    setTimeout(() => {
      const params = new URLSearchParams();
      params.append('query', skillName);
      if (selectedDept) params.append('department', selectedDept);
      if (minProficiency > 0) params.append('minProficiency', String(minProficiency));
      axios.get(`${API_BASE_URL}/expert-directory/search?${params.toString()}`, getHeaders())
        .then(res => setExperts(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error(err));
    }, 50);
  };

  const openMentorshipModal = (expert) => {
    setSelectedExpert(expert);
    setMentorshipGoal(
      `Hello ${expert.firstName}, I noticed your expertise in ${expert.skillName} (${expert.proficiency}) and would appreciate your peer mentorship to strengthen my knowledge.`
    );
    setError('');
    setSuccessMessage('');
  };

  const closeMentorshipModal = () => {
    if (submittingRequest) return;
    setSelectedExpert(null);
    setMentorshipGoal('');
  };

  const handleSendMentorshipRequest = async () => {
    if (!selectedExpert || !employeeId) {
      setError('Please ensure you are logged in.');
      return;
    }

    if (!mentorshipGoal.trim()) {
      setError('Please provide a goal/reason for your mentorship request.');
      return;
    }

    if (
      String(selectedExpert.employeeId) === String(employeeId) ||
      String(selectedExpert.employeeDbId) === String(localStorage.getItem('userId'))
    ) {
      setError('You cannot request peer mentorship from yourself.');
      return;
    }

    try {
      setSubmittingRequest(true);
      setError('');

      const params = new URLSearchParams();
      params.append('menteeIdentifier', employeeId);
      params.append('mentorIdentifier', selectedExpert.employeeId);
      params.append('skillId', String(selectedExpert.skillId));
      params.append('goal', mentorshipGoal.trim());

      await axios.post(
        `${API_BASE_URL}/mentorships?${params.toString()}`,
        null,
        getHeaders()
      );

      setSuccessMessage(
        `Mentorship request sent successfully to ${selectedExpert.fullName} for ${selectedExpert.skillName}!`
      );
      setSelectedExpert(null);
      setMentorshipGoal('');
      fetchMyMentorships();
    } catch (err) {
      console.error('Error sending mentorship request:', err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to send mentorship request. Please try again.'
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  const stats = useMemo(() => {
    const totalExperts = new Set(experts.map((e) => e.employeeId)).size;
    const totalSkills = new Set(experts.map((e) => e.skillName)).size;
    const topDepartments = new Set(experts.map((e) => e.department)).size;
    return {
      expertCount: totalExperts,
      skillCount: totalSkills,
      deptCount: topDepartments,
      listingCount: experts.length,
    };
  }, [experts]);

  const quickSkills = useMemo(() => {
    return skillsList.slice(0, 8).map((s) => s.skillName).filter(Boolean);
  }, [skillsList]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar role={currentRole} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Module 3 – Expert Directory" />

        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-6 md:p-8 text-white shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-semibold backdrop-blur-sm border border-white/20">
                  <Sparkles size={14} className="text-yellow-300" />
                  Module 3: Internal Expert Search & Peer Mentorship
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Internal Expert Directory
                </h1>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                  Search for internal experts across skills, proficiency levels, and departments.
                  Connect for peer-to-peer (Employee-to-Employee) knowledge sharing and mentorship.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/15">
                <div className="text-center px-3 py-2">
                  <div className="text-2xl font-black text-white">{stats.expertCount}</div>
                  <div className="text-[11px] text-blue-200 font-medium uppercase tracking-wider">Experts</div>
                </div>
                <div className="text-center px-3 py-2">
                  <div className="text-2xl font-black text-white">{stats.skillCount}</div>
                  <div className="text-[11px] text-blue-200 font-medium uppercase tracking-wider">Skills</div>
                </div>
                <div className="text-center px-3 py-2">
                  <div className="text-2xl font-black text-white">{stats.deptCount}</div>
                  <div className="text-[11px] text-blue-200 font-medium uppercase tracking-wider">Depts</div>
                </div>
                <div className="text-center px-3 py-2">
                  <div className="text-2xl font-black text-white">{myMentorships.length}</div>
                  <div className="text-[11px] text-blue-200 font-medium uppercase tracking-wider">My Links</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {successMessage && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
              <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700 p-1">
                <X size={18} />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600 shrink-0" size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 p-1">
                <X size={18} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'directory'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  Browse Expert Directory
                </span>
              </button>
              <button
                onClick={() => setActiveTab('my-mentorships')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'my-mentorships'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserCheck size={16} />
                  My Peer Mentorships ({myMentorships.length})
                </span>
              </button>
            </div>

            {activeTab === 'directory' && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-md transition ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ListIcon size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid Card View"
                  className={`p-1.5 rounded-md transition ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            )}
          </div>

          {activeTab === 'directory' && (
            <>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search by skill (e.g. Java, SQL, React), expert name, department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setTimeout(fetchExperts, 0);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="w-full md:w-48">
                    <select
                      value={selectedDept}
                      onChange={(e) => {
                        setSelectedDept(e.target.value);
                        setTimeout(fetchExperts, 0);
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept, i) => (
                        <option key={i} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-44">
                    <select
                      value={minProficiency}
                      onChange={(e) => {
                        setMinProficiency(Number(e.target.value));
                        setTimeout(fetchExperts, 0);
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value={0}>All Proficiencies</option>
                      <option value={5}>Expert (Level 5)</option>
                      <option value={4}>Advanced & Above (4+)</option>
                      <option value={3}>Competent & Above (3+)</option>
                      <option value={2}>Intermediate & Above (2+)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Search size={16} />
                    )}
                    <span>Search</span>
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Filter size={12} /> Popular Searches:
                  </span>
                  {quickSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleQuickSkillClick(skill)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition border ${
                        searchQuery.toLowerCase() === skill.toLowerCase()
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-slate-200/80'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}

                  {(searchQuery || selectedDept || minProficiency > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDept('');
                        setMinProficiency(0);
                        setTimeout(fetchExperts, 0);
                      }}
                      className="ml-auto text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>Search Results</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {experts.length} {experts.length === 1 ? 'Expert Found' : 'Experts Found'}
                    </span>
                  </h2>
                  <button
                    onClick={fetchExperts}
                    disabled={loading}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                    <RefreshCw className="mx-auto text-blue-600 animate-spin mb-3" size={32} />
                    <p className="text-sm text-slate-600 font-medium">Searching expert directory...</p>
                  </div>
                ) : experts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
                    <Users className="mx-auto text-slate-400 mb-3" size={40} />
                    <h3 className="text-base font-semibold text-slate-700">No internal experts found</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                      Try searching with different keywords (e.g. "Java", "React", "SQL") or resetting your department and proficiency filters.
                    </p>
                  </div>
                ) : viewMode === 'table' ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th scope="col" className="px-6 py-4">Expert</th>
                            <th scope="col" className="px-6 py-4">Skill</th>
                            <th scope="col" className="px-6 py-4">Proficiency</th>
                            <th scope="col" className="px-6 py-4">Department</th>
                            <th scope="col" className="px-6 py-4 text-right">Emp-to-Emp Mentorship</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {experts.map((expert, index) => {
                            const badgeStyle = levelBadgeStyles[expert.proficiencyLevel] || levelBadgeStyles[1];
                            const deptBadgeStyle = departmentColors[expert.department] || 'bg-slate-100 text-slate-700 border-slate-200';
                            const isSelf = String(expert.employeeId) === String(employeeId);

                            return (
                              <tr
                                key={expert.id ? `${expert.id}-${index}` : index}
                                className="hover:bg-slate-50/80 transition-colors group"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm text-sm shrink-0">
                                      {expert.firstName?.charAt(0) || ''}
                                      {expert.lastName?.charAt(0) || ''}
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 flex items-center gap-2">
                                        <span>{expert.fullName || expert.firstName || 'Employee'}</span>
                                        {isSelf && (
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                            You
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        <span>{expert.designation || 'Specialist'}</span>
                                        <span>•</span>
                                        <span className="font-mono text-[11px] text-slate-400">{expert.employeeId}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-semibold text-slate-900">
                                    {expert.skillName}
                                  </div>
                                  {expert.skillCategory && (
                                    <div className="text-xs text-slate-400">
                                      {expert.skillCategory}
                                    </div>
                                  )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}
                                  >
                                    <Award size={13} />
                                    <span>{expert.proficiency || levelNames[expert.proficiencyLevel] || 'Expert'}</span>
                                    <span className="text-[10px] opacity-75 font-mono">(L{expert.proficiencyLevel})</span>
                                  </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${deptBadgeStyle}`}
                                  >
                                    <Building2 size={12} />
                                    <span>{expert.department || 'Engineering'}</span>
                                  </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  {isSelf ? (
                                    <span className="text-xs text-slate-400 italic px-3 py-1.5 bg-slate-100 rounded-lg">
                                      Current Profile
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => openMentorshipModal(expert)}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-semibold transition-all shadow-sm"
                                    >
                                      <Send size={12} />
                                      <span>Request Mentorship</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {experts.map((expert, index) => {
                      const badgeStyle = levelBadgeStyles[expert.proficiencyLevel] || levelBadgeStyles[1];
                      const isSelf = String(expert.employeeId) === String(employeeId);

                      return (
                        <div
                          key={expert.id ? `${expert.id}-${index}` : index}
                          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-sm shrink-0">
                                {expert.firstName?.charAt(0) || ''}
                                {expert.lastName?.charAt(0) || ''}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-base leading-tight flex items-center gap-1.5">
                                  <span>{expert.fullName || expert.firstName}</span>
                                  {isSelf && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                      You
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">{expert.designation || 'Internal Expert'}</p>
                                <p className="text-[11px] text-slate-400 font-mono">{expert.employeeId}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                              <Award size={12} />
                              {expert.proficiency}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Skill</span>
                              <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">{expert.skillName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Department</span>
                              <span className="font-medium text-slate-700 block mt-0.5 truncate">{expert.department || 'Engineering'}</span>
                            </div>
                          </div>

                          <div className="pt-1">
                            {isSelf ? (
                              <button disabled className="w-full py-2 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl">
                                Your Profile
                              </button>
                            ) : (
                              <button
                                onClick={() => openMentorshipModal(expert)}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                              >
                                <Send size={13} />
                                <span>Request Peer Mentorship</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'my-mentorships' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">My Peer Mentorship Relationships</h2>
                  <p className="text-sm text-slate-500">
                    Overview of your sent and active peer mentorships initiated through the Expert Directory.
                  </p>
                </div>
                <button
                  onClick={fetchMyMentorships}
                  disabled={mentorshipLoading}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RefreshCw size={12} className={mentorshipLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {mentorshipLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <RefreshCw className="mx-auto text-blue-600 animate-spin mb-3" size={32} />
                  <p className="text-sm text-slate-600">Loading mentorship records...</p>
                </div>
              ) : myMentorships.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
                  <UserCheck className="mx-auto text-slate-400 mb-3" size={40} />
                  <h3 className="text-base font-semibold text-slate-700">No Mentorships Yet</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    Use the Expert Directory to search for colleagues skilled in topics you want to learn, and click "Request Mentorship" to start!
                  </p>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition"
                  >
                    Search Expert Directory
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myMentorships.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                            {m.mentor?.firstName?.charAt(0) || 'M'}
                            {m.mentor?.lastName?.charAt(0) || ''}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">
                              {m.mentor?.firstName} {m.mentor?.lastName}
                            </h4>
                            <p className="text-xs text-slate-500">{m.mentor?.designation || 'Mentor'}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            m.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m.status === 'ACCEPTED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : m.status === 'REQUESTED'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Skill:</span>
                          <span className="font-semibold text-slate-800">{m.skill?.skillName || 'General'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Date:</span>
                          <span className="text-slate-600">{m.startDate || 'Recent'}</span>
                        </div>
                        {m.goal && (
                          <div className="pt-1 border-t border-slate-200/60 mt-1">
                            <span className="text-slate-400 block mb-0.5">Goal:</span>
                            <p className="text-slate-700 italic">"{m.goal}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="text-blue-600" size={20} />
                  Request Peer Mentorship
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect with internal expert for knowledge sharing & skill improvement
                </p>
              </div>
              <button
                onClick={closeMentorshipModal}
                disabled={submittingRequest}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-100 rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm shrink-0">
                {selectedExpert.firstName?.charAt(0) || ''}
                {selectedExpert.lastName?.charAt(0) || ''}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 truncate">
                    {selectedExpert.fullName}
                  </h4>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    levelBadgeStyles[selectedExpert.proficiencyLevel] || ''
                  }`}>
                    {selectedExpert.proficiency}
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate mt-0.5">
                  {selectedExpert.designation} • {selectedExpert.department}
                </p>
                <p className="text-xs font-semibold text-blue-700 mt-1">
                  Skill: {selectedExpert.skillName}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mentorship Goal / Request Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={mentorshipGoal}
                onChange={(e) => setMentorshipGoal(e.target.value)}
                placeholder="Describe what topic or skill area you want guidance in (e.g. best practices, system design, debugging, code review)..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
              />
              <p className="text-[11px] text-slate-400">
                A clear goal helps the expert understand your needs and respond faster.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeMentorshipModal}
                disabled={submittingRequest}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMentorshipRequest}
                disabled={submittingRequest || !mentorshipGoal.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submittingRequest ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
