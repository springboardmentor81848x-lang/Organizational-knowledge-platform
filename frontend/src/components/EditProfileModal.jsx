import React, { useState, useRef, useEffect } from 'react'
import api from '../services/api.js'

// ── Icon inline (avoid import chain issues) ──────────────────────────────────
import Icon from './Icon.jsx'

// ── Toast notification ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium transition-all fade-in ${
      type === 'success'
        ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-200 backdrop-blur-xl'
        : 'bg-rose-900/90 border-rose-500/40 text-rose-200 backdrop-blur-xl'
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
        type === 'success' ? 'bg-emerald-500/30' : 'bg-rose-500/30'
      }`}>
        <Icon name={type === 'success' ? 'check-circle' : 'alert-triangle'} className="w-3.5 h-3.5" />
      </div>
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

// ── Validation ───────────────────────────────────────────────────────────────
function validate(form, imageFile) {
  const errors = {}
  if (!form.fullName?.trim()) errors.fullName = 'Full name is required.'
  if (!form.email?.trim()) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.'
  if (imageFile) {
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(imageFile.type))
      errors.image = 'Only JPG, JPEG, or PNG images are allowed.'
    else if (imageFile.size > 5 * 1024 * 1024)
      errors.image = 'Image must be smaller than 5 MB.'
  }
  return errors
}

// ── Field component ──────────────────────────────────────────────────────────
function Field({ label, id, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-300 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><Icon name="alert-triangle" className="w-3 h-3" />{error}</p>}
    </div>
  )
}

const API_BASE = ''

// ── Main EditProfileModal ─────────────────────────────────────────────────────
export default function EditProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    company: '',
    role: '',
    experience: '',
    education: '',
    bio: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  // Load profile when modal opens
  useEffect(() => {
    if (!isOpen) return
    setImageFile(null)
    setImagePreview(null)
    setErrors({})
    setLoadingProfile(true)

    api.getProfile()
      .then(profile => {
        setForm({
          fullName: profile.fullName || profile.name || currentUser?.name || '',
          email: profile.email || currentUser?.email || '',
          company: profile.company || 'Northwind Labs',
          role: profile.role || profile.roleTitle || currentUser?.title || '',
          experience: profile.experience || '',
          education: profile.education || '',
          bio: profile.bio || currentUser?.bio || '',
        })
        if (profile.profileImage) {
          setCurrentImage(profile.profileImage.startsWith('http') ? profile.profileImage : `${API_BASE}${profile.profileImage}`)
        }
      })
      .catch(() => {
        // Fallback to currentUser prop
        setForm({
          fullName: currentUser?.name || '',
          email: currentUser?.email || '',
          company: 'Northwind Labs',
          role: currentUser?.title || '',
          experience: '',
          education: '',
          bio: currentUser?.bio || '',
        })
      })
      .finally(() => setLoadingProfile(false))
  }, [isOpen])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  function handleImageSelect(file) {
    if (!file) return
    const validationErrors = validate(form, file)
    if (validationErrors.image) {
      setErrors(prev => ({ ...prev, image: validationErrors.image }))
      return
    }
    setErrors(prev => ({ ...prev, image: undefined }))
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageSelect(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    const validationErrors = validate(form, imageFile)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const updated = await api.updateProfile(form, imageFile)
      setToast({ message: 'Profile updated successfully.', type: 'success' })
      onProfileUpdated(updated)
      setTimeout(onClose, 1500)
    } catch (err) {
      setToast({ message: err.message || 'Profile update failed. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const avatarSrc = imagePreview || currentImage
  const initials = form.fullName
    ? form.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (currentUser?.initials || '?')

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1000] modal-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0F1420] border border-white/10 shadow-2xl fade-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 sticky top-0 bg-[#0F1420] z-10">
            <div>
              <h2 className="font-display text-lg font-bold text-white">Edit Profile</h2>
              <p className="text-slate-400 text-xs mt-0.5">Update your personal information</p>
            </div>
            <button
              id="edit-profile-close"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {loadingProfile ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400/20 flex items-center justify-center animate-pulse">
                  <Icon name="user" className="w-5 h-5 text-lime-300" />
                </div>
                <span className="text-slate-400 text-sm">Loading profile…</span>
              </div>
            </div>
          ) : (
            <form id="edit-profile-form" onSubmit={handleSave} className="p-6 space-y-6">

              {/* Profile Image Upload */}
              <div>
                <label className="text-xs font-medium text-slate-300 mb-3 block">Profile Picture</label>
                <div className="flex items-start gap-5">
                  {/* Avatar preview */}
                  <div className="flex-shrink-0">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-lime-400/30"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-[#0B0F1A] font-display font-bold text-2xl">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Drop zone */}
                  <div
                    ref={dropRef}
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-white/15 hover:border-lime-400/40 rounded-2xl p-4 cursor-pointer transition-colors group text-center"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="profile-image-input"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={e => handleImageSelect(e.target.files?.[0])}
                    />
                    <Icon name="user-plus" className="w-6 h-6 text-slate-500 group-hover:text-lime-300 mx-auto mb-2 transition-colors" />
                    <p className="text-slate-400 text-xs">
                      <span className="text-lime-300 font-medium">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-slate-600 text-[10px] mt-1">JPG, JPEG, PNG · max 5 MB</p>
                    {imageFile && (
                      <p className="text-lime-300 text-xs mt-2 font-medium">✓ {imageFile.name}</p>
                    )}
                  </div>
                </div>
                {errors.image && (
                  <p className="text-rose-400 text-xs mt-2 flex items-center gap-1">
                    <Icon name="alert-triangle" className="w-3 h-3" />{errors.image}
                  </p>
                )}
              </div>

              {/* Two-column grid for most fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *" id="ep-fullName" error={errors.fullName}>
                  <div className="relative">
                    <Icon name="user" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="ep-fullName"
                      name="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${errors.fullName ? 'border-rose-500/50' : 'border-white/10 focus:border-lime-400/50'}`}
                    />
                  </div>
                </Field>

                <Field label="Email Address *" id="ep-email" error={errors.email}>
                  <div className="relative">
                    <Icon name="mail" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="ep-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@company.io"
                      className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${errors.email ? 'border-rose-500/50' : 'border-white/10 focus:border-lime-400/50'}`}
                    />
                  </div>
                </Field>

                <Field label="Company" id="ep-company">
                  <div className="relative">
                    <Icon name="briefcase" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="ep-company"
                      name="company"
                      type="text"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Northwind Labs"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                    />
                  </div>
                </Field>

                {(!currentUser?.systemRole || currentUser.systemRole === 'EMPLOYEE' || currentUser.systemRole === 'employee') ? (
                  <Field label="Job Title / Role" id="ep-role">
                    <div className="relative">
                      <Icon name="badge-check" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="ep-role"
                        name="role"
                        type="text"
                        value={form.role}
                        onChange={handleChange}
                        placeholder="e.g. Java Developer"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
                      />
                    </div>
                  </Field>
                ) : (
                  <Field label="Role Title (System Role)" id="ep-role">
                    <div className="relative">
                      <Icon name="shield-check" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="ep-role"
                        name="role"
                        type="text"
                        value={form.role || currentUser?.title || currentUser?.role || 'Platform Role'}
                        disabled
                        className="w-full bg-white/5 border border-white/5 opacity-70 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 cursor-not-allowed"
                      />
                    </div>
                  </Field>
                )}
              </div>

              <Field label="Experience" id="ep-experience">
                <div className="relative">
                  <Icon name="history" className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <textarea
                    id="ep-experience"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. Senior Product Engineer · Northwind Labs · 2023 – Present"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all resize-none"
                  />
                </div>
              </Field>

              <Field label="Education" id="ep-education">
                <div className="relative">
                  <Icon name="graduation-cap" className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <textarea
                    id="ep-education"
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    placeholder="e.g. B.S. Computer Science · State University · 2019"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all resize-none"
                  />
                </div>
              </Field>

              <Field label="Bio (optional)" id="ep-bio">
                <textarea
                  id="ep-bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell your team a little about yourself…"
                  rows={3}
                  maxLength={300}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all resize-none"
                />
                <div className="text-right text-[10px] text-slate-600 mt-0.5">{form.bio.length}/300</div>
              </Field>

              {/* Read-only info */}
              <div className="rounded-2xl bg-white/3 border border-white/8 p-4 space-y-2">
                <p className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Icon name="shield-check" className="w-3.5 h-3.5 text-emerald-400" />
                  Read-only fields
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Verification</div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                      <Icon name="check-circle" className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Achievements</div>
                    <span className="text-xs text-slate-400">Managed by system</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                <button
                  type="button"
                  id="edit-profile-cancel"
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-xl py-3 text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="edit-profile-save"
                  disabled={saving}
                  className="flex-1 bg-lime-400 hover:bg-lime-300 disabled:opacity-60 disabled:cursor-not-allowed text-[#0B0F1A] font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(166,226,46,0.4)]"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <Icon name="check-circle" className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

export { Toast }
