import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, CheckCircle2, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FadeIn, ScaleHover, StaggerChildren, StaggerItem } from '@/components/ui/Animations';
import { useStore } from '@/lib/Store';

export default function UserDashboard() {
  const { user, complaints } = useStore();
  
  // Calculate Leaderboard data to find rank and points
  const userMap = {};
  complaints.forEach(c => {
    if (!userMap[c.user]) userMap[c.user] = { name: c.user, reports: 0, upvotesReceived: 0, resolvedCount: 0, comments: 0 };
    userMap[c.user].reports++;
    userMap[c.user].upvotesReceived += (c.upvotes || []).length;
    if (c.status === 'Resolved') userMap[c.user].resolvedCount++;
    (c.comments || []).forEach(cm => {
      if (!userMap[cm.user]) userMap[cm.user] = { name: cm.user, reports: 0, upvotesReceived: 0, resolvedCount: 0, comments: 0 };
      userMap[cm.user].comments++;
    });
  });

  const sortedLeaders = Object.values(userMap)
    .map(u => ({ ...u, points: u.reports * 10 + u.upvotesReceived * 2 + u.resolvedCount * 20 + u.comments * 1 }))
    .sort((a, b) => b.points - a.points);

  const myRank = sortedLeaders.findIndex(l => l.name === user?.name) + 1;
  const myData = sortedLeaders.find(l => l.name === user?.name) || { points: 0, reports: 0 };
  
  // Badge Logic
  const getBadge = (pts) => {
    if (pts >= 100) return { label: 'City Guardian', color: 'bg-purple-500', icon: '🛡️' };
    if (pts >= 60) return { label: 'Active Reporter', color: 'bg-orange-500', icon: '🔥' };
    if (pts >= 30) return { label: 'Verified Reporter', color: 'bg-yellow-500', icon: '⭐' };
    return { label: 'Contributor', color: 'bg-blue-500', icon: '🏅' };
  };
  const badge = getBadge(myData.points);

  // Filter complaints by the current user's name
  const myComplaints = complaints.filter(c => c.user === user?.name);

  const stats = {
    total: myComplaints.length,
    inProgress: myComplaints.filter(c => c.status === 'In Progress').length,
    resolved: myComplaints.filter(c => c.status === 'Resolved').length
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <FadeIn className="mb-8 p-8 glass-card rounded-3xl flex flex-col md:flex-row gap-8 relative overflow-hidden items-center border-none shadow-2xl bg-white/40">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <User size={150} />
        </div>
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-4xl text-white font-black shadow-xl ring-4 ring-white transition-transform hover:rotate-6">
             {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
            <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900">Welcome back, {user?.name}!</h1>
          </div>
          <p className="text-slate-500 font-medium mb-5">{user?.email} • Verified Citizen Account</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-white shadow-lg shadow-inner ${badge.color}`}>
                <span className="text-lg">{badge.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{badge.label}</span>
             </div>
             <div className="px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-2 group hover:bg-primary/10 transition-colors">
                <span className="text-xl font-black text-primary">#{myRank || '--'}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Rank</span>
             </div>
             <div className="px-4 py-2 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center gap-2 group hover:bg-indigo-500/10 transition-colors">
                <span className="text-xl font-black text-indigo-600">{myData.points}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Points</span>
             </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <FadeIn delay={0.1}>
          <div className="glass-card p-6 border-l-4 border-l-primary/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><FileText size={48} /></div>
             <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Reports Filed</p>
             <h3 className="text-4xl font-heading font-bold">{stats.total}</h3>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="glass-card p-6 border-l-4 border-l-yellow-500/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={48} /></div>
             <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">In Progress</p>
             <h3 className="text-4xl font-heading font-bold text-yellow-600 dark:text-yellow-500">{stats.inProgress}</h3>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="glass-card p-6 border-l-4 border-l-green-500/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 size={48} /></div>
             <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Resolved</p>
             <h3 className="text-4xl font-heading font-bold text-green-600 dark:text-green-500">{stats.resolved}</h3>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.4}>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-heading font-bold">Your Reports</h2>
          <Link to="/report">
            <Button size="sm">File New Report</Button>
          </Link>
        </div>

        {myComplaints.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">You haven't filed any reports yet.</h3>
            <p className="text-muted-foreground mb-6">Help keep our city running smoothly by reporting issues you see around your community.</p>
            <Link to="/report"><Button>Start Reporting</Button></Link>
          </div>
        ) : (
          <StaggerChildren className="space-y-4">
            {myComplaints.map(c => (
              <StaggerItem key={c._id}>
                <ScaleHover>
                  <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 rounded-2xl transition-all hover:bg-muted/10">
                    <img 
                      src={c.img} 
                      alt={c.title} 
                      className="w-full sm:w-32 sm:h-24 object-cover rounded-xl shadow-sm"
                    />
                    <div className="flex-1 w-full text-left">
                       <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-lg">{c.title}</h3>
                          <Badge 
                            variant={
                              c.status === 'Resolved' ? 'success' : 
                              c.status === 'In Progress' ? 'warning' : 'pending'
                            }
                          >
                            {c.status}
                          </Badge>
                       </div>
                       <div className="text-sm text-muted-foreground flex items-center mb-3">
                         <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium mr-3">{c.category}</span>
                         <Clock className="w-3 h-3 mr-1" /> {c.date}
                       </div>
                       <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                         <span className="text-xs text-muted-foreground flex items-center"><MapPin className="w-3 h-3 mr-1"/> Downtown District</span>
                         <Button variant="link" size="sm" className="h-0 py-0">Track Status</Button>
                       </div>
                    </div>
                  </div>
                </ScaleHover>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </FadeIn>
    </div>
  );
}
