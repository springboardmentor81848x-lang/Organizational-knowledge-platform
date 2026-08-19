import React, { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import api from '../services/api.js'

const PROFICIENCY_LABELS = {
  1: 'Beginner (1/5)',
  2: 'Basic (2/5)',
  3: 'Intermediate (3/5)',
  4: 'Advanced (4/5)',
  5: 'Expert (5/5)'
}

const STEPS = ['Professional Background', 'AI Domain Requirements & Skills', 'Finalize & Map Team']

export default function ProfileSetup({ authData, onComplete }) {
  const [step, setStep] = useState(0)

  // Derived role & domain properties from signup
  const department = authData?.department || 'Engineering'
  const teamName = authData?.teamName || authData?.team || 'Java'
  const jobTitle = authData?.roleTitle || authData?.title || (teamName ? `${teamName} Developer` : 'Software Engineer')

  // Step 0: Background & Bio
  const [company, setCompany] = useState(authData?.company || authData?.organizationName || 'Northwind Labs')
  const [bio, setBio] = useState(authData?.bio || '')
  const [degree, setDegree] = useState('')
  const [institution, setInstitution] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [experienceSummary, setExperienceSummary] = useState('')

  // Step 1: AI Domain Knowledge & Skills
  const [aiSkills, setAiSkills] = useState([])
  const [fetchingAi, setFetchingAi] = useState(false)
  const [lastFetchedDomain, setLastFetchedDomain] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [customSkillName, setCustomSkillName] = useState('')
  const [bypassSkillsWarning, setBypassSkillsWarning] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const avatarLetter = (authData?.fullName || 'U')[0].toUpperCase()

  // Fetch AI domain skill requirements for the chosen domain
  const fetchAiSuggestions = (domainToFetch) => {
    const domainQuery = domainToFetch || teamName || department || 'Java'
    setFetchingAi(true)
    api.getAiOnboardingSuggestions(domainQuery)
      .then(res => {
        if (res && Array.isArray(res.skills) && res.skills.length > 0) {
          setAiSkills(res.skills)
          setLastFetchedDomain(domainQuery)
          // Pre-populate skills with default ratings if none selected yet
          setSelectedSkills(prev => {
            if (prev.length === 0) {
              return res.skills.map(s => ({
                skillName: s.name || s.skillName || (typeof s === 'string' ? s : ''),
                proficiencyLevel: 3
              }))
            }
            return prev
          })
        }
      })
      .catch(err => {
        console.error('AI fetching failed:', err)
      })
      .finally(() => setFetchingAi(false))
  }

  // Automatically fetch AI suggestions on mount
  useEffect(() => {
    fetchAiSuggestions(teamName || department)
  }, [teamName, department])

  function toggleSkillSelection(skillName) {
    setBypassSkillsWarning(false)
    if (selectedSkills.some(s => s.skillName === skillName)) {
      setSelectedSkills(prev => prev.filter(s => s.skillName !== skillName))
    } else {
      setSelectedSkills(prev => [...prev, { skillName, proficiencyLevel: 3 }])
    }
  }

  function setSkillRating(skillName, level) {
    setSelectedSkills(prev =>
      prev.map(s => (s.skillName === skillName ? { ...s, proficiencyLevel: level } : s))
    )
  }

  function addCustomSkill() {
    if (!customSkillName.trim()) return
    const name = customSkillName.trim()
    setBypassSkillsWarning(false)
    if (!selectedSkills.some(s => s.skillName.toLowerCase() === name.toLowerCase())) {
      setSelectedSkills(prev => [...prev, { skillName: name, proficiencyLevel: 3 }])
    }
    setCustomSkillName('')
  }

  function handleNext(e) {
    e?.preventDefault()
    setError(null)

    if (step === 1) {
      const hasUnrated = selectedSkills.some(s => s.proficiencyLevel === null || s.proficiencyLevel === 0)
      if (hasUnrated) {
        setError('Please specify your current proficiency level (1-5) for all selected skills.')
        return
      }
      if (selectedSkills.length === 0 && !bypassSkillsWarning) {
        setError('Selecting at least one domain skill is recommended. Click Next again to proceed.')
        setBypassSkillsWarning(true)
        return
      }
    }

    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      handleFinish()
    }
  }

  async function handleFinish() {
    setLoading(true)
    setError(null)

    let educationText = ''
    if (degree || institution) {
      educationText = `${degree || 'Degree'} · ${institution || 'University'}${gradYear ? ` (${gradYear})` : ''}`
    }

    const payload = {
      fullName: authData?.fullName || '',
      department: department,
      departmentName: department,
      teamName: teamName,
      roleTitle: jobTitle,
      company: company,
      bio: bio,
      education: educationText,
      experience: experienceSummary,
      skills: selectedSkills,
      roleBenchmarks: aiSkills.map(s => ({
        skillName: s.name || s.skillName || (typeof s === 'string' ? s : ''),
        proficiencyLevel: s.expectedLevel || 4
      }))
    }

    try {
      let result = {}
      try {
        result = await api.updateProfile(payload)
      } catch (err) {
        console.warn('Profile update warning:', err)
      }

      setTimeout(() => {
        onComplete({
          ...authData,
          ...result,
          department: payload.departmentName,
          teamName: payload.teamName,
          roleTitle: payload.roleTitle,
          bio: payload.bio,
          education: payload.education,
          experience: payload.experience
        })
      }, 600)
    } catch (err) {
      setError(err.message || 'Failed to complete profile onboarding.')
      setLoading(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 fade-in">
          <div className="w-16 h-16 rounded-2xl bg-lime-400 flex items-center justify-center shadow-[0_0_32px_rgba(166,226,46,0.5)]">
            <Icon name="rocket" className="w-8 h-8 text-[#0B0F1A]" />
          </div>
          <div className="text-white font-display font-bold text-xl">Setting up your Intelligence Dashboard…</div>
          <div className="text-slate-400 text-sm">Saving profile, mapping domain team, and calculating skill gaps</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0B0F1A] relative overflow-hidden items-center justify-center p-4 sm:p-6">
      {/* Background blobs */}
      <div className="grad-blob w-[500px] h-[500px] bg-lime-400/20 -top-32 -left-32" />
      <div className="grad-blob w-[400px] h-[400px] bg-indigo-500/20 bottom-0 -right-20" style={{ animationDelay: '-5s' }} />

      <div className="w-full max-w-xl relative z-10 fade-in py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-lime-400 flex items-center justify-center">
              <Icon name="brain-circuit" className="w-4 h-4 text-[#0B0F1A]" />
            </div>
            <span className="font-display font-bold text-white">KnowledgeIQ</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Welcome, {authData?.fullName?.split(' ')[0]}! 🎉
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Complete your onboarding for <span className="text-lime-300 font-semibold">{department} · {teamName} Team</span>
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => (
              <div key={i} className={`flex items-center gap-1.5 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  i < step ? 'bg-lime-400 text-[#0B0F1A]' :
                  i === step ? 'bg-lime-400 text-[#0B0F1A] shadow-[0_0_12px_rgba(166,226,46,0.5)]' :
                  'bg-white/10 text-slate-500'
                }`}>
                  {i < step ? <Icon name="check" className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-[11px] hidden sm:block ${i === step ? 'text-white font-medium' : 'text-slate-500'}`}>{label}</span>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-1.5" style={{ background: i < step ? '#A6E22E' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-lime-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form card */}
        <div className="glass rounded-3xl p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <Icon name="alert-circle" className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* STEP 0: Professional Background & Education */}
          {step === 0 && (
            <form onSubmit={handleNext} className="space-y-4 fade-in">
              {/* User Avatar & Selected Domain Badges */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-lime-400 text-[#0B0F1A] flex items-center justify-center font-bold text-lg">
                    {avatarLetter}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{authData?.fullName}</div>
                    <div className="text-slate-400 text-xs">{authData?.email}</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1.5 items-end sm:items-center">
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-lime-400/20 text-lime-300 font-semibold border border-lime-400/30">
                    {department}
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-400/20 text-indigo-300 font-semibold border border-indigo-400/30">
                    {teamName} Team
                  </span>
                </div>
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="setup-company" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Organization / Company
                </label>
                <div className="relative">
                  <Icon name="building-2" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="setup-company"
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Northwind Labs"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <label htmlFor="setup-bio" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Short Bio & Technical Focus
                </label>
                <textarea
                  id="setup-bio"
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Share a brief overview of your technical focus, background, or goals..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 resize-none"
                />
              </div>

              {/* Degree / Qualification */}
              <div>
                <label htmlFor="setup-degree" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Degree / Highest Qualification
                </label>
                <div className="relative">
                  <Icon name="graduation-cap" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="setup-degree"
                    type="text"
                    value={degree}
                    onChange={e => setDegree(e.target.value)}
                    placeholder="e.g. B.S. Computer Science / B.Tech Information Technology"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                  />
                </div>
              </div>

              {/* Institution & Graduation Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="setup-inst" className="text-xs font-medium text-slate-300 mb-1.5 block">
                    University / Institution
                  </label>
                  <input
                    id="setup-inst"
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                  />
                </div>
                <div>
                  <label htmlFor="setup-year" className="text-xs font-medium text-slate-300 mb-1.5 block">
                    Graduation Year
                  </label>
                  <input
                    id="setup-year"
                    type="text"
                    value={gradYear}
                    onChange={e => setGradYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                  />
                </div>
              </div>

              {/* Work Experience Summary */}
              <div>
                <label htmlFor="setup-exp" className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Work Experience Summary
                </label>
                <textarea
                  id="setup-exp"
                  rows={2}
                  value={experienceSummary}
                  onChange={e => setExperienceSummary(e.target.value)}
                  placeholder="e.g. 3 years building backend microservices, REST APIs, and database pipelines..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_8px_24px_-6px_rgba(166,226,46,0.5)]"
              >
                Next: AI Domain Knowledge & Skills <Icon name="arrow-right" className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 1: AI Domain Knowledge & Competency Rating */}
          {step === 1 && (
            <div className="space-y-4 fade-in">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <Icon name="sparkles" className="w-4 h-4 text-lime-300" /> AI Domain Knowledge & Competency Rating
                </h3>
                <p className="text-slate-400 text-xs">
                  AI has generated the essential competency requirements for your chosen domain:{' '}
                  <span className="text-lime-300 font-semibold">{teamName} Team</span> ({department}). Rate your proficiency from 1 to 5.
                </p>
              </div>

              <div className="border border-white/5 bg-white/5 rounded-2xl p-4 space-y-4">
                {/* AI Suggested Requirements */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      AI Domain Skill Requirements ({teamName})
                    </h4>
                    <button
                      type="button"
                      onClick={() => fetchAiSuggestions(teamName)}
                      className="text-[11px] text-lime-400 hover:text-lime-300 flex items-center gap-1 transition-all"
                    >
                      <Icon name="refresh-cw" className={`w-3 h-3 ${fetchingAi ? 'animate-spin' : ''}`} />
                      Refresh with AI
                    </button>
                  </div>

                  {fetchingAi ? (
                    <div className="flex items-center gap-2 text-lime-400 text-xs py-3 font-medium">
                      <Icon name="loader-2" className="w-4 h-4 animate-spin" />
                      <span>Generating AI skill requirements for <strong className="text-white">{teamName} Team</strong>...</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {aiSkills.map(s => {
                        const skillName = typeof s === 'string' ? s : (s.name || s.skillName)
                        if (!skillName) return null
                        const isSelected = selectedSkills.some(item => item.skillName === skillName)
                        const expectedLvl = s.expectedLevel || 4
                        return (
                          <button
                            key={skillName}
                            type="button"
                            onClick={() => toggleSkillSelection(skillName)}
                            className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-lime-400/20 border-lime-400 text-lime-300 font-medium'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <Icon name={isSelected ? 'check-circle' : 'plus'} className="w-3.5 h-3.5" />
                            <span>{skillName}</span>
                            <span className="text-[10px] text-lime-400/80 font-mono">Lvl {expectedLvl}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Rating Your Proficiency */}
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2.5 uppercase tracking-wider">
                    Rate Your Current Proficiency (1 = Beginner, 5 = Expert)
                  </h4>
                  {selectedSkills.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedSkills.map(sk => (
                        <div key={sk.skillName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-white block truncate">{sk.skillName}</span>
                            <span className="text-[10px] text-lime-300 font-mono">
                              {PROFICIENCY_LABELS[sk.proficiencyLevel || 3]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {[1, 2, 3, 4, 5].map(lvl => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setSkillRating(sk.skillName, lvl)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                                  sk.proficiencyLevel === lvl
                                    ? 'bg-lime-400 text-[#0B0F1A]'
                                    : 'bg-white/10 text-slate-400 hover:bg-white/20'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => toggleSkillSelection(sk.skillName)}
                              className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 ml-1 font-medium"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs py-4 text-center">
                      No skills selected yet. Click any skill above to add to your rating profile.
                    </p>
                  )}
                </div>

                {/* Add Custom Skill */}
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Add Custom Domain Skill</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkillName}
                      onChange={e => setCustomSkillName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                      placeholder="e.g. GraphQL, Kafka, Terraform..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl px-4 py-2 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-xl px-4 py-3 text-sm transition-all flex items-center gap-2"
                >
                  <Icon name="arrow-left" className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(166,226,46,0.5)]"
                >
                  Next: Finalize & Map to Team <Icon name="arrow-right" className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Finalize, Team Mapping & Summary */}
          {step === 2 && (
            <div className="space-y-4 fade-in">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Icon name="check-circle" className="w-4 h-4 text-lime-300" /> Review & Team Alignment Summary
              </h3>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lime-400 text-[#0B0F1A] font-bold text-lg flex items-center justify-center">
                    {avatarLetter}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{authData?.fullName}</div>
                    <div className="text-slate-400 text-xs">{authData?.email}</div>
                  </div>
                </div>

                {/* Team Mapping Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-white/10 pt-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Department & Team</div>
                    <div className="text-xs text-white font-semibold mt-0.5">{department} · {teamName} Team</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Assigned Manager</div>
                    <div className="text-xs text-lime-300 font-semibold mt-0.5">Marcus King (Engineering Manager)</div>
                  </div>
                </div>

                {degree && (
                  <div className="text-xs text-slate-300 border-t border-white/10 pt-2 flex items-center gap-2">
                    <Icon name="graduation-cap" className="w-4 h-4 text-lime-400 shrink-0" />
                    <span>{degree} - {institution || 'University'} ({gradYear || 'Recent'})</span>
                  </div>
                )}

                {experienceSummary && (
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <Icon name="briefcase" className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{experienceSummary}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-2">
                  <div className="text-xs text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Configured Domain Skills ({selectedSkills.length})</span>
                    <span className="text-[10px] text-lime-300">AI Learning Path Ready</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.map(s => (
                      <span key={s.skillName} className="text-[11px] px-2.5 py-1 rounded-lg bg-lime-400/10 border border-lime-400/30 text-lime-300 font-medium">
                        {s.skillName} ({s.proficiencyLevel}/5)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-xl px-4 py-3 text-sm transition-all flex items-center gap-2"
                >
                  <Icon name="arrow-left" className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex-1 bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(166,226,46,0.5)]"
                >
                  Complete Onboarding & Enter Dashboard <Icon name="rocket" className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
