import React from 'react'
import {
  LayoutDashboard, Layers, Search, Sparkles, GraduationCap, ClipboardCheck,
  UserCircle, Bell, Users, LayoutGrid, BarChart3, ShieldCheck, ScrollText,
  Settings, Menu, Moon, Sun, LogOut, ChevronsUpDown, BrainCircuit, ArrowRight,
  Play, Mail, Lock, Gauge, Target, BadgeCheck, TrendingUp, TrendingDown,
  BookOpen, MessageSquare, CheckCircle2, Award, ExternalLink, PlayCircle,
  Briefcase, Trophy, Medal, AlertTriangle, Flame, Download, FileText,
  FileSpreadsheet, Coins, Server, Activity, UserCheck, UserPlus,
  MoreHorizontal, History, Square, Calendar, Pencil, Plus,
  SlidersHorizontal, Circle, Cloud, Shield, Database, Palette, User, Check,
  Eye, EyeOff
} from 'lucide-react'

const MAP = {
  'layout-dashboard': LayoutDashboard, 'layers': Layers, 'search': Search,
  'sparkles': Sparkles, 'graduation-cap': GraduationCap, 'clipboard-check': ClipboardCheck,
  'user-circle': UserCircle, 'bell': Bell, 'users': Users, 'grid': LayoutGrid,
  'bar-chart': BarChart3, 'shield-check': ShieldCheck, 'scroll-text': ScrollText,
  'settings': Settings, 'menu': Menu, 'moon': Moon, 'sun': Sun, 'log-out': LogOut,
  'chevrons-up-down': ChevronsUpDown, 'brain-circuit': BrainCircuit, 'arrow-right': ArrowRight,
  'play': Play, 'mail': Mail, 'lock': Lock, 'gauge': Gauge, 'target': Target,
  'badge-check': BadgeCheck, 'trending-up': TrendingUp, 'trending-down': TrendingDown,
  'book-open': BookOpen, 'message-square': MessageSquare, 'check-circle': CheckCircle2,
  'award': Award, 'external-link': ExternalLink, 'play-circle': PlayCircle,
  'briefcase': Briefcase, 'trophy': Trophy, 'medal': Medal, 'alert-triangle': AlertTriangle,
  'flame': Flame, 'download': Download, 'file-text': FileText, 'file-spreadsheet': FileSpreadsheet,
  'coins': Coins, 'server': Server, 'activity': Activity, 'user-check': UserCheck,
  'user-plus': UserPlus, 'more-horizontal': MoreHorizontal, 'history': History,
  'square': Square, 'calendar': Calendar, 'pencil': Pencil, 'plus': Plus,
  'sliders': SlidersHorizontal, 'circle': Circle, 'cloud': Cloud, 'shield': Shield,
  'database': Database, 'palette': Palette, 'user': User, 'check': Check,
  'eye': Eye, 'eye-off': EyeOff
}

export default function Icon({ name, className }) {
  const Cmp = MAP[name] || Circle
  return <Cmp className={className} strokeWidth={2} />
}
