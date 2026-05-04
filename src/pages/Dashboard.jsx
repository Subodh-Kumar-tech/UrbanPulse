import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Plus, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FadeIn, StaggerItem, StaggerChildren, ScaleHover } from '@/components/ui/Animations';
import { useStore } from '@/lib/Store';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const CATEGORIES = [
  "All", "Roads", "Parks", "Water", "Sanitation", 
  "Lighting", "Traffic", "Public Safety", "Environment", 
  "Healthcare", "Education", "Drainage", "Others"
];

// Smart progress calculator — unique % per issue based on multiple factors
const getProgress = (c) => {
  if (c.status === 'Resolved') return 100;
  if (c.status === 'Pending') return 0;

  // Base: 25% for being In Progress
  let progress = 25;

  // Priority boost: Critical issues are acted on faster
  const priorityBoost = { Critical: 30, High: 20, Medium: 12, Low: 6 };
  progress += priorityBoost[c.priority] || 12;

  // Time elapsed boost: older in-progress = more work done
  if (c.createdAt) {
    const daysOld = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    progress += Math.min(Math.floor(daysOld * 5), 20); // max +20 from time
  }

  // Community upvotes = more attention = faster action
  progress += Math.min((c.upvotes?.length || 0) * 3, 12); // max +12

  // Admin has left a note = work is actively tracked
  if (c.adminNote) progress += 5;

  // Comments = community engagement
  progress += Math.min((c.comments?.length || 0) * 2, 8); // max +8

  return Math.min(progress, 92); // Never show 100% unless truly Resolved
};

export default function Dashboard() {
  const { complaints } = useStore();
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = complaints.filter(c => 
    (filter === "All" || c.category === filter) &&
    (statusFilter === "All" || c.status === statusFilter) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: complaints.length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  const chartData = CATEGORIES.slice(1).map(cat => ({
    name: cat,
    value: complaints.filter(c => c.category === cat).length
  })).filter(d => d.value > 0);

  const statusData = [
    { name: 'Pending', value: complaints.filter(c => c.status === 'Pending').length, color: '#ef4444' },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length, color: '#eab308' },
    { name: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length, color: '#22c55e' }
  ];

  const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#ec4899', '#8b5cf6'];


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header & Stats */}
      <FadeIn className="mb-10">
        <h1 className="text-4xl font-heading font-bold mb-2">Community Dashboard</h1>
        <p className="text-muted-foreground">Track and monitor issues across the city in real-time.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <motion.div 
             whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
             onClick={() => setStatusFilter("All")}
             className={`glass-card p-6 border-l-4 border-l-primary relative overflow-hidden cursor-pointer transition-shadow hover:shadow-lg ${statusFilter === "All" ? "ring-2 ring-primary bg-primary/5" : ""}`}
          >
             <div className="absolute top-0 right-0 p-4 opacity-10"><Filter size={48} /></div>
             <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">Total Reports</p>
             <h3 className="text-4xl font-heading font-bold">{stats.total}</h3>
          </motion.div>
          <motion.div 
             whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
             onClick={() => setStatusFilter("In Progress")}
             className={`glass-card p-6 border-l-4 border-l-yellow-500 relative overflow-hidden cursor-pointer transition-shadow hover:shadow-lg ${statusFilter === "In Progress" ? "ring-2 ring-yellow-500 bg-yellow-500/5" : ""}`}
          >
             <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={48} /></div>
             <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">In Progress</p>
             <h3 className="text-4xl font-heading font-bold text-yellow-600">{stats.inProgress}</h3>
          </motion.div>
          <motion.div 
             whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
             onClick={() => setStatusFilter("Resolved")}
             className={`glass-card p-6 border-l-4 border-l-green-500 relative overflow-hidden cursor-pointer transition-shadow hover:shadow-lg ${statusFilter === "Resolved" ? "ring-2 ring-green-500 bg-green-500/5" : ""}`}
          >
             <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 size={48} /></div>
             <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">Resolved</p>
             <h3 className="text-4xl font-heading font-bold text-green-600">{stats.resolved}</h3>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <div className="glass-card p-6">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Issues by Category</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card p-6">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Status Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Controls */}
      <FadeIn delay={0.1} className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-secondary/30 p-6 rounded-[2rem] border border-secondary">
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar items-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">Filter:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                filter === cat 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                  : "bg-background text-slate-600 hover:bg-white hover:shadow-md"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
          <Input 
            placeholder="Search report title or ID..." 
            className="pl-11 h-12 rounded-2xl bg-background border-none shadow-sm focus:shadow-md transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </FadeIn>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((complaint) => (
            <motion.div
              layout
              key={complaint._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ScaleHover className="h-full">
                <div className="glass-card flex flex-col h-full overflow-hidden border">
                  <div className="h-48 relative overflow-hidden group">
                    <img 
                      src={complaint.img} 
                      alt={complaint.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge 
                      className="absolute top-3 right-3 shadow-sm backdrop-blur-md"
                      variant={
                        complaint.status === 'Resolved' ? 'success' : 
                        complaint.status === 'In Progress' ? 'warning' : 'pending'
                      }
                    >
                      {complaint.status}
                    </Badge>
                  </div>
                   <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">{complaint.category}</span>
                       <span className="text-xs text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" /> {complaint.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{complaint.title}</h3>

                    {/* Priority Badge */}
                    {complaint.priority && (
                      <div className="mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          complaint.priority === 'Critical' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                          complaint.priority === 'High'     ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' :
                          complaint.priority === 'Medium'   ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' :
                                                              'bg-green-500/10 text-green-700 border-green-500/30'
                        }`}>
                          {complaint.priority === 'Critical' ? '🔴' : complaint.priority === 'High' ? '🟠' : complaint.priority === 'Medium' ? '🟡' : '🟢'} {complaint.priority} Priority
                        </span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{getProgress(complaint)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            complaint.status === 'Resolved' ? 'bg-green-500' :
                            complaint.status === 'In Progress' ? 'bg-yellow-500' : 'bg-muted-foreground/30'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgress(complaint)}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t flex justify-between items-center">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {complaint.location || "Downtown"}
                      </div>
                      <Link to={`/issue/${complaint._id}`}>
                        <Button variant="link" className="px-0">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </ScaleHover>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-heading font-semibold mb-2">No Reports Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
        </motion.div>
      )}

      {/* Floating Action Button */}
      <Link to="/report">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-primary to-blue-500 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white z-50 hover:shadow-primary/50 transition-shadow"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </Link>
    </div>
  );
}
