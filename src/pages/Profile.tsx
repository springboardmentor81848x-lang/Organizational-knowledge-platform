import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Award,
  BrainCircuit,
  Camera,
  Save,
  KeyRound,
  ShieldCheck,
  Lock,
  MapPin,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  UserCheck,
  Hash,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Toast, ToastMessage } from '../components/Toast';

// Pre-defined avatar presets for convenient visual selection
const AVATAR_PRESETS = [
  { id: 'default', label: 'Default Vector', url: '/default-avatar.svg' },
  { id: 'preset1', label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256' },
  { id: 'preset2', label: 'Engineer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256' },
  { id: 'preset3', label: 'Manager', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256' },
  { id: 'preset4', label: 'Analyst', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256' },
];

export const Profile: React.FC = () => {
  const { user, login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Backup state for "Cancel" restore
  const [originalFields, setOriginalFields] = useState<any>(null);

  // Custom avatar picker mode
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me');
      if (meRes.data.success && meRes.data.user) {
        const u = meRes.data.user;
        const empId = u.employee?.id;

        let fullEmpData: any = null;
        if (empId) {
          const empRes = await api.get(`/employees/${empId}`);
          if (empRes.data.success) {
            fullEmpData = empRes.data.data;
          }
        }

        const emp = fullEmpData || u.employee;
        
        const initialFirstName = emp?.first_name || u.email?.split('@')[0] || '';
        const initialLastName = emp?.last_name || '';
        const initialEmail = u.email || emp?.email || '';
        const initialPhone = emp?.phone || '';
        const initialLocation = emp?.location || '';
        const initialPhotoUrl = emp?.photo_url || '/default-avatar.svg';

        setProfileData({ ...u, fullEmp: fullEmpData });
        
        setFirstName(initialFirstName);
        setLastName(initialLastName);
        setEmail(initialEmail);
        setPhone(initialPhone);
        setLocation(initialLocation);
        setPhotoUrl(initialPhotoUrl);
        setNewPassword('');

        setOriginalFields({
          firstName: initialFirstName,
          lastName: initialLastName,
          email: initialEmail,
          phone: initialPhone,
          location: initialLocation,
          photoUrl: initialPhotoUrl,
        });
      }
    } catch (err) {
      addToast('error', 'Profile Sync Error', 'Failed to retrieve profile records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleCancel = () => {
    if (originalFields) {
      setFirstName(originalFields.firstName);
      setLastName(originalFields.lastName);
      setEmail(originalFields.email);
      setPhone(originalFields.phone);
      setLocation(originalFields.location);
      setPhotoUrl(originalFields.photoUrl);
      setNewPassword('');
      addToast('info', 'Changes Discarded', 'Restored profile details to current database values.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('error', 'File Too Large', 'Please select an image file under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          addToast('success', 'Photo Loaded', 'Profile photo preview updated. Click "Update Profile" to save.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!firstName.trim()) {
      addToast('error', 'Validation Error', 'First name is required.');
      return;
    }
    if (!lastName.trim()) {
      addToast('error', 'Validation Error', 'Last name is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      addToast('error', 'Validation Error', 'Please enter a valid email address format.');
      return;
    }

    if (phone.trim()) {
      const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        addToast('error', 'Validation Error', 'Please enter a valid phone number format (e.g. +91 9876543210).');
        return;
      }
    }

    if (newPassword && newPassword.trim().length < 6) {
      addToast('error', 'Validation Error', 'New password must be at least 6 characters long.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.put('/auth/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        photoUrl: photoUrl.trim(),
        password: newPassword.trim() || undefined,
      });

      if (res.data.success) {
        addToast('success', 'Profile Updated Successfully', 'Your changes have been saved to the database.');
        setNewPassword('');

        // Sync with AuthContext to update Header & Sidebar immediately
        if (res.data.token && res.data.user) {
          login(res.data.token, res.data.user);
        }

        fetchMyProfile();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile records in database.';
      addToast('error', 'Update Failed', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Fetching profile details from database...</p>
      </div>
    );
  }

  const emp = profileData?.fullEmp || profileData?.employee;
  const rawRole = user?.role || 'Employee';

  // Determine Reporting Manager
  const dept = emp?.department;
  let reportingManagerName = 'Department Head / HR Administrator';
  if (dept && dept.head_name) {
    reportingManagerName = `${dept.head_name} (Department Head)`;
  } else if (emp?.department_id === 1) {
    reportingManagerName = 'Marcus Aurelius (Engineering Dept Head)';
  } else if (emp?.department_id === 2) {
    reportingManagerName = 'Sarah Chen (Data Science Lead)';
  } else if (emp?.department_id === 3) {
    reportingManagerName = 'David Kumar (Security Lead)';
  } else if (emp?.department_id === 5) {
    reportingManagerName = 'Jessica Taylor (HR Specialist)';
  }

  return (
    <div className="space-y-6 text-xs max-w-5xl mx-auto pb-12">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Profile Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-0"></div>

        <div className="relative group shrink-0">
          <img
            src={photoUrl || '/default-avatar.svg'}
            alt="User Avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.svg';
            }}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md bg-slate-50"
          />
          <button
            type="button"
            onClick={() => setShowAvatarPicker(prev => !prev)}
            className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
            title="Change Profile Photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2.5 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {firstName} {lastName}
              </h1>
              <p className="text-emerald-700 font-bold text-xs mt-0.5 flex items-center gap-1.5 justify-center md:justify-start">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>{emp?.designation || 'Staff Member'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 justify-center md:justify-end">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>{rawRole}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                Active Status
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-slate-600 text-[11px] font-medium border-t border-slate-100">
            <div className="flex items-center gap-2 justify-center sm:justify-start truncate">
              <Hash className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>ID: <strong>EMP-{String(emp?.id || user?.id || 1).padStart(3, '0')}</strong></span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start truncate">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{emp?.department?.name || dept?.name || 'Software Engineering'}</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{email || user?.email}</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{location || 'Chennai, India'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selection Drawer / Modal Panel */}
      {showAvatarPicker && (
        <div className="bg-slate-50 border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-3 transition-all animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Select or Upload Profile Picture
            </h3>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            {AVATAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setPhotoUrl(preset.url);
                  addToast('info', 'Avatar Selected', `Selected ${preset.label} preview.`);
                }}
                className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  photoUrl === preset.url
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <img src={preset.url} alt={preset.label} className="w-12 h-12 rounded-xl object-cover" />
                <span className="text-[10px] font-bold text-slate-700">{preset.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Or enter custom image URL</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="w-full sm:w-auto shrink-0 pt-4 sm:pt-0">
              <label className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>Upload Local File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Form Card */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Editable Personal Information */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Editable Personal Details
            </h2>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Editable by You
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Email Address / Gmail <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  placeholder="alex.morgan@okgip.org"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Changing your email updates your account sign-in email.</p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Mobile Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  placeholder="+91 9876543210 or +1-800-555-0199"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Supports country codes (e.g. +91 or +1).</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Location / Office Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  placeholder="Chennai, India"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Read-Only Professional Information */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              Professional & System Assignment (Read-Only)
            </h2>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              System Locked
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            To update system roles, department designations, or reporting structure, please contact your System Admin or HR Specialist.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 relative">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Employee ID</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">EMP-{String(emp?.id || user?.id || 1).padStart(3, '0')}</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 relative">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Department</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs truncate">{emp?.department?.name || dept?.name || 'Software Engineering'}</span>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 relative">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Designation Title</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs truncate">{emp?.designation || 'Senior Developer'}</span>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 relative">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">System Role</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 text-xs">{rawRole}</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 relative">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Reporting Manager</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs truncate">{reportingManagerName}</span>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 relative">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Date of Joining</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{emp?.join_date ? new Date(emp.join_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '10 Jun 2023'}</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Security & Password */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            Security & Account Password
          </h2>

          <div>
            <label className="block text-slate-700 font-bold mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-11 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
                placeholder="Leave blank to keep your current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters if changing password.</p>
          </div>
        </div>

        {/* Section 4: Form Actions (Cancel & Save) */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Profile...' : 'Update Profile'}</span>
          </button>
        </div>
      </form>

      {/* Competencies & Skill Assessments Summary */}
      {emp && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-4 h-4 text-emerald-600" />
              Verified Competencies & Skills
            </h2>

            <div className="space-y-3">
              {!emp.skills || emp.skills.length === 0 ? (
                <p className="text-slate-400 text-center py-4 font-medium">No verified skill ratings recorded yet.</p>
              ) : (
                emp.skills.map((item: any) => (
                  <div key={item.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{item.skill?.name || item.skill_name || 'Skill'}</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                        Level {item.current_proficiency} / 5
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${(item.current_proficiency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <BrainCircuit className="w-4 h-4 text-amber-600" />
              Target Learning & Gap Analysis
            </h2>

            <div className="space-y-3">
              {!emp.gaps || emp.gaps.length === 0 ? (
                <div className="text-center py-6 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-slate-900 font-bold">All Competency Standards Met!</p>
                  <p className="text-slate-500 text-[11px]">No active knowledge deficits assigned.</p>
                </div>
              ) : (
                emp.gaps.map((gap: any) => (
                  <div key={gap.id} className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{gap.skill_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        Gap: -{gap.gap_score}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Required Level: <strong className="text-slate-900">{gap.required_proficiency}</strong> | Current: <strong className="text-slate-900">{gap.current_proficiency}</strong>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
