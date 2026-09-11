import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Shield, ChevronDown, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserAvatar = () => {
  const { user, activeRole, switchRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const roles = [
    { id: 'employee', label: 'Employee View', color: 'text-blue-500' },
    { id: 'manager', label: 'Manager View', color: 'text-indigo-500' },
    { id: 'admin', label: 'HR / Admin View', color: 'text-rose-500' },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/30"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
            {user.name}
          </div>
          <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 capitalize mt-0.5">
            {activeRole} Portal
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
          {/* User Details */}
          <div className="p-3.5 bg-slate-50/50 dark:bg-slate-800/50">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {user.jobTitle}
            </span>
          </div>

          {/* Quick Role Switcher */}
          <div className="p-2">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Switch Perspective
            </div>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  switchRole(r.id);
                  setIsOpen(false);
                  navigate(`/${r.id}/dashboard`);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeRole === r.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shield className={`w-3.5 h-3.5 ${r.color}`} />
                  <span>{r.label}</span>
                </div>
                {activeRole === r.id && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="p-2">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
