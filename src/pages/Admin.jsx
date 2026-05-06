import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Clock, Trash2, Download, RotateCcw, Search, ChevronDown, BarChart2, ShieldAlert, CheckCircle2, ThumbsUp, MessageSquare, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FadeIn } from '@/components/ui/Animations';
import { useStore } from '@/lib/Store';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DEPARTMENTS = ['PWD (Roads)', 'Water Dept', 'Sanitation (Waste)', 'Traffic Police', 'Parks & Rec', 'Electricity Board'];
const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'];

const CATEGORY_COLORS = {
  Roads: '#f97316',
  Water: '#3b82f6',
  Parks: '#22c55e',
  Sanitation: '#eab308',
  Traffic: '#ef4444',
  Lighting: '#a855f7',
  'Public Safety': '#dc2626',
  Environment: '#16a34a',
  Healthcare: '#0ea5e9',
  Education: '#6366f1',
  Drainage: '#4b5563',
  Others: '#94a3b8',
};

const STATUS_COLORS = {
  Pending: '#eab308',
  'In Progress': '#3b82f6',
  Resolved: '#22c55e',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg px-4 py-2 shadow-xl text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Admin() {
  const { complaints, updateComplaintStatus, deleteComplaint, assignDepartment, user } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // RBAC: Identify if the user is a Dept Admin or Super Admin
  // In this system, user.department determines the access. 
  // If no department or "All", they are Super Admin.
  const userDept = user?.department || 'All';
  const isSuperAdmin = userDept === 'All';

  const [deptFilter, setDeptFilter] = useState(userDept);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState('issues'); // 'issues', 'depts', or 'users'
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState(null);

  useEffect(() => {
    if (activeTab === 'users' && isSuperAdmin && usersList.length === 0) {
      setLoadingUsers(true);
      api.getUsers().then(data => {
        setUsersList(data);
        setLoadingUsers(false);
      }).catch(err => {
        console.error(err);
        setLoadingUsers(false);
      });
    }
  }, [activeTab, isSuperAdmin, usersList.length]);

  const handleDeleteUser = async (e, userId, userName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete user ${userName}?`)) {
      try {
        await api.deleteUser(userId);
        setUsersList(prev => prev.filter(u => u._id !== userId));
        alert(`User ${userName} deleted successfully.`);
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  // Local state for creating new dept user
  const [newDeptUser, setNewDeptUser] = useState({ name: '', email: '', deptId: '', department: '' });

  // --- Analytics Data ---
  const categoryData = Object.entries(
    complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, fill: CATEGORY_COLORS[name] || '#6b7280' }));

  const statusData = [
    { name: 'Pending', value: complaints.filter(c => c.status === 'Pending').length },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length },
    { name: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length },
  ].filter(d => d.value > 0);

  const resolutionRate = complaints.length
    ? Math.round((complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100)
    : 0;

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    slaBreach: complaints.filter(c =>
      c.status === 'Pending' && c.createdAt &&
      (Date.now() - new Date(c.createdAt).getTime() > 48 * 60 * 60 * 1000)
    ).length,
  };

  const getDept = (c) => {
    if (c.assignedTo) return c.assignedTo;
    const map = {
      'Roads': 'PWD (Roads)',
      'Water': 'Water Dept',
      'Drainage': 'Water Dept',
      'Sanitation': 'Sanitation (Waste)',
      'Traffic': 'Traffic Police',
      'Parks': 'Parks & Rec',
      'Lighting': 'Electricity Board'
    };
    return map[c.category] || 'Unassigned';
  };

  const filtered = complaints.filter(c => {
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      (c.user || '').toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || getDept(c) === deptFilter;
    return matchesStatus && matchesSearch && matchesDept;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('UrbanPulse — Civic Issues Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    const tableRows = complaints.map(c => [
      c.title,
      c.category,
      c.status,
      c.location,
      c.user,
      c.assignedTo || 'Unassigned',
      new Date(c.createdAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Title', 'Category', 'Status', 'Location', 'User', 'Assigned To', 'Date']],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillStyle: [59, 130, 246] }
    });

    doc.save(`urbanpulse_full_report_${Date.now()}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Status', 'Location', 'User', 'Upvotes', 'Admin Note'];
    const csvContent = [
      headers.join(','),
      ...complaints.map(c =>
        [c._id, `"${c.title}"`, c.category, c.status, `"${c.location || ''}"`, c.user, c.upvotes?.length || 0, `"${c.adminNote || ''}"`].join(',')
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `urbanpulse_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearResolved = () => {
    const resolved = complaints.filter(c => c.status === 'Resolved');
    if (resolved.length === 0) return alert('No resolved issues to clear.');
    if (confirm(`Delete ${resolved.length} resolved issues permanently?`)) {
      resolved.forEach(c => deleteComplaint(c._id));
    }
  };

  const isSLABreach = (c) =>
    c.status === 'Pending' && c.createdAt &&
    (Date.now() - new Date(c.createdAt).getTime() > 48 * 60 * 60 * 1000);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <FadeIn className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            {isSuperAdmin ? 'Admin Control Panel' : `${userDept} Dashboard`}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Full oversight of city infrastructure and civic issues.' : `Managing civic duties for ${userDept}.`}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {isSuperAdmin && (
            <>
              <Button 
                variant={activeTab === 'depts' ? 'default' : 'outline'} 
                onClick={() => setActiveTab(activeTab === 'depts' ? 'issues' : 'depts')}
                className="gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> {activeTab === 'depts' ? 'Back to Issues' : 'Manage Departments'}
              </Button>
              <Button 
                variant={activeTab === 'users' ? 'default' : 'outline'} 
                onClick={() => setActiveTab(activeTab === 'users' ? 'issues' : 'users')}
                className="gap-2"
              >
                <Users className="w-4 h-4" /> {activeTab === 'users' ? 'Back to Issues' : 'Manage Users'}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={clearResolved} className="gap-2 text-muted-foreground hover:text-destructive border-destructive/30">
            <RotateCcw className="w-4 h-4" /> Clear Resolved
          </Button>
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button onClick={exportToPDF} className="gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Reports', value: stats.total, icon: BarChart2, color: 'from-primary to-blue-600', onClick: () => { setFilterStatus('All'); setActiveTab('issues'); }, active: filterStatus === 'All' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-amber-600', onClick: () => { setFilterStatus('Pending'); setActiveTab('issues'); }, active: filterStatus === 'Pending' },
          { label: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: 'from-blue-500 to-indigo-600', onClick: () => { setFilterStatus('In Progress'); setActiveTab('issues'); }, active: filterStatus === 'In Progress' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'from-green-500 to-emerald-600', onClick: () => { setFilterStatus('Resolved'); setActiveTab('issues'); }, active: filterStatus === 'Resolved' },
          { label: 'SLA Breach', value: stats.slaBreach, icon: ShieldAlert, color: 'from-red-500 to-rose-600', onClick: () => { setFilterStatus('Pending'); setActiveTab('issues'); }, active: false },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={stat.onClick}
            className={`glass-card p-4 cursor-pointer relative overflow-hidden transition-all ${stat.active ? 'ring-2 ring-primary shadow-lg' : ''}`}
          >
            <div className={`absolute -top-3 -right-3 w-14 h-14 rounded-full bg-gradient-to-br ${stat.color} opacity-10`} />
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} mb-3`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-heading font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ---- ANALYTICS CHARTS ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Bar Chart - Issues by Category */}
        <FadeIn delay={0.1} className="lg:col-span-2 glass-card p-6">
          <h3 className="font-heading font-semibold text-lg mb-1">Issues by Category</h3>
          <p className="text-xs text-muted-foreground mb-6">Total reports broken down by civic issue type</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" name="Reports" radius={[6, 6, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FadeIn>

        {/* Donut Chart - Status Distribution */}
        <FadeIn delay={0.2} className="glass-card p-6 flex flex-col">
          <h3 className="font-heading font-semibold text-lg mb-1">Status Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Current state of all city reports</p>
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12, color: 'hsl(var(--foreground))' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
              <div className="text-2xl font-bold">{resolutionRate}%</div>
              <div className="text-[10px] text-muted-foreground">Resolved</div>
            </div>
          </div>
        </FadeIn>
      </div>

      {activeTab === 'issues' ? (
        <>
          <FadeIn delay={0.3} className="flex gap-4 flex-wrap mb-6">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 z-10 pointer-events-none" />
              <Input 
                placeholder="Search issues..." 
                className="pl-9 relative z-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select 
                className={`h-10 px-3 rounded-md border text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary ${isSuperAdmin ? 'border-primary/20 bg-primary/5 text-primary font-bold' : 'bg-secondary text-muted-foreground cursor-not-allowed'}`}
                value={deptFilter}
                onChange={(e) => isSuperAdmin && setDeptFilter(e.target.value)}
                disabled={!isSuperAdmin}
              >
                {isSuperAdmin && <option value="All">Full State (Admin Overlord)</option>}
                {!isSuperAdmin && <option value={userDept}>{userDept}</option>}
                {isSuperAdmin && DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </FadeIn>

          {/* Issues List */}
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-muted-foreground glass-card rounded-2xl">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No issues match your current filter.</p>
                </motion.div>
              )}

              {filtered.map((complaint, i) => {
                const isExpanded = expandedId === complaint._id;
                const sla = isSLABreach(complaint);

                return (
                  <motion.div
                    key={complaint._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className={`glass-card overflow-hidden border ${sla ? 'border-destructive/40 bg-destructive/[0.02]' : ''}`}
                  >
                    {/* Main Row */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : complaint._id)}
                    >
                      <img
                        src={getImageUrl(complaint.img)}
                        alt={complaint.title}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-sm truncate">{complaint.title}</h3>
                          {sla && <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full animate-pulse">⚠ SLA BREACH</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[complaint.category] || '#6b7280'}15`,
                              color: CATEGORY_COLORS[complaint.category] || '#6b7280',
                              borderColor: `${CATEGORY_COLORS[complaint.category] || '#6b7280'}30`,
                            }}
                          >
                            {complaint.category}
                          </span>
                          <span>{complaint.user}</span>
                          <span className="truncate max-w-[140px]">{complaint.location}</span>
                          {complaint.assignedTo && (
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter text-[9px]">
                              📍 {complaint.assignedTo}
                            </span>
                          )}
                          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{complaint.upvotes?.length || 0}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{complaint.comments?.length || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={complaint.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => { e.stopPropagation(); updateComplaintStatus(complaint._id, e.target.value); }}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                            complaint.status === 'Resolved' ? 'bg-green-500/10 text-green-700 border-green-500/30' :
                            complaint.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' :
                            'bg-secondary text-foreground border-border'
                          }`}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <Link to={`/issue/${complaint._id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="text-xs text-primary">View</Button>
                        </Link>

                        <Button
                          size="icon" variant="ghost"
                          className="text-destructive hover:bg-destructive/10 w-8 h-8"
                          onClick={(e) => { e.stopPropagation(); deleteComplaint(complaint._id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-border bg-secondary/20"
                        >
                          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                              <p className="text-sm text-foreground/80 leading-relaxed">{complaint.description || 'No description provided.'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assign to Department</p>
                              <select
                                className={`w-full text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                value={complaint.assignedTo || ""}
                                disabled={!isSuperAdmin}
                                onChange={(e) => assignDepartment(complaint._id, e.target.value)}
                              >
                                <option value="">-- Select Department --</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {isSuperAdmin ? 'Assigning notifies the department head.' : 'Only Super Admins can re-route issues.'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Internal Admin Note <span className="text-primary">(Private)</span></p>
                              <input
                                type="text"
                                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Add a private note (auto-saves on blur)..."
                                defaultValue={complaint.adminNote || ''}
                                onBlur={(e) => {
                                  if (e.target.value !== (complaint.adminNote || '')) {
                                    updateComplaintStatus(complaint._id, { adminNote: e.target.value });
                                  }
                                }}
                              />
                              <p className="text-xs text-muted-foreground mt-1">Not visible to the public.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      ) : activeTab === 'users' ? (
        /* Manage Users Tab */
        <FadeIn className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-heading font-black">Registered Users</h2>
            <p className="text-sm text-muted-foreground">Total Users: {usersList.length}</p>
          </div>
          {loadingUsers ? (
            <div className="text-center py-10 text-muted-foreground">Loading users...</div>
          ) : (
            <div className="grid gap-4">
              {usersList.map((u, idx) => {
                const userComplaints = complaints.filter(c => c.user === u.name);
                const isExpanded = expandedUserId === u._id;
                return (
                  <motion.div 
                    key={u._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card overflow-hidden border border-border"
                  >
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-colors"
                      onClick={() => setExpandedUserId(isExpanded ? null : u._id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{u.name}</h3>
                          <p className="text-sm text-muted-foreground">{u.email} • Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold">{userComplaints.length}</p>
                          <p className="text-xs text-muted-foreground">Issues Raised</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10 w-8 h-8 rounded-full z-10 relative" 
                          onClick={(e) => handleDeleteUser(e, u._id, u.name)}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-secondary/10 border-t border-border p-4"
                        >
                          <h4 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Issues Raised by {u.name}</h4>
                          {userComplaints.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No issues raised yet.</p>
                          ) : (
                            <div className="grid gap-2">
                              {userComplaints.map(c => (
                                <Link key={c._id} to={`/issue/${c._id}`} className="block">
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[c.status] }}></span>
                                      <span className="font-medium text-sm truncate max-w-[200px]">{c.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="bg-secondary px-2 py-0.5 rounded-full">{c.category}</span>
                                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </FadeIn>
      ) : (
        /* Manage Departments Tab */
        <FadeIn className="glass-card p-8">
           <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-heading font-black mb-2">Onboard Government Agency</h2>
              <p className="text-muted-foreground text-sm mb-8">Create official credentials and unique Department IDs for civic authorities.</p>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Officer Name</label>
                       <Input placeholder="e.g. S. Kumar" value={newDeptUser.name} onChange={e => setNewDeptUser({...newDeptUser, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Official Email</label>
                       <Input placeholder="e.g. sk@pwd.gov.in" value={newDeptUser.email} onChange={e => setNewDeptUser({...newDeptUser, email: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Department ID</label>
                       <Input placeholder="e.g. DEPT-PWD-001" value={newDeptUser.deptId} onChange={e => setNewDeptUser({...newDeptUser, deptId: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assigned Agency</label>
                       <select 
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={newDeptUser.department}
                          onChange={e => setNewDeptUser({...newDeptUser, department: e.target.value})}
                       >
                          <option value="">-- Select Agency --</option>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                    </div>
                 </div>
                 <Button className="w-full mt-6 h-12 text-lg font-bold shadow-xl shadow-primary/20" onClick={() => {
                    alert(`Onboarding Successful!\nID: ${newDeptUser.deptId}\nSent credentials to ${newDeptUser.email}`);
                    setNewDeptUser({ name: '', email: '', deptId: '', department: '' });
                    setActiveTab('issues');
                 }}>
                    Initialize Official ID & Notify Agency
                 </Button>
              </div>
           </div>
        </FadeIn>
      )}
    </div>
  );
}
