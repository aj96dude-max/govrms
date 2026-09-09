import { Truck, Wrench, Ticket, FileText, UserCog, Megaphone, Landmark, ShieldAlert, ShoppingCart, Users, Briefcase, Mail, FileBarChart, Settings } from 'lucide-react';

export const NAVIGATION_MODULES = [
  { id: 'fleet', name: 'Fleet Management System', icon: Truck, path: '/portal/fleet' },
  { id: 'engineering', name: 'Engineering Division', icon: Wrench, path: '/portal/engineering' },
  { id: 'ticket', name: 'Ticket Management System', icon: Ticket, path: '/portal/dashboard' },
  { id: 'contract', name: 'Contract Management System', icon: FileText, path: '/portal/contract' },
  { id: 'admin', name: 'Administration Division', icon: UserCog, path: '/portal/admin' },
  { id: 'marketing', name: 'Strategic Marketing Division', icon: Megaphone, path: '/portal/marketing' },
  { id: 'bank', name: 'Bank Services Division', icon: Landmark, path: '/portal/bank' },
  { id: 'security', name: 'Security Management', icon: ShieldAlert, path: '/portal/security' },
  { id: 'procurement', name: 'Procurement Management', icon: ShoppingCart, path: '/portal/procurement' },
  { id: 'users', name: 'User Management', icon: Users, path: '/portal/users' },
  { id: 'outsource', name: 'Outsource Management', icon: Briefcase, path: '/portal/outsource' },
  { id: 'mail', name: 'Mail Management System', icon: Mail, path: '/portal/mail' },
  { id: 'audit', name: 'Audit Report', icon: FileBarChart, path: '/portal/audit' },
  { id: 'setup', name: 'Setup', icon: Settings, path: '/portal/setup' },
];
