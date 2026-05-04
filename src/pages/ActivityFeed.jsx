import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MessageSquare, ThumbsUp, CheckCircle2, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '@/components/ui/Animations';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/Store';

const EVENT_META = {
  reported:  { icon: FileText,      color: 'text-blue-500',   bg: 'bg-blue-500/10',   label: 'reported a new issue' },
  status:    { icon: CheckCircle2,  color: 'text-green-500',  bg: 'bg-green-500/10',  label: 'status updated' },
  comment:   { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'commented on' },
  upvote:    { icon: ThumbsUp,      color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'upvoted' },
  escalated: { icon: AlertCircle,   color: 'text-red-500',    bg: 'bg-red-500/10',    label: 'escalated' },
};

const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const getInitials = (name) => (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function ActivityFeed() {
  const { complaints } = useStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const buildEvents = () => {
    setLoading(true);
    const evs = [];
    complaints.forEach(c => {
      evs.push({ type: 'reported', user: c.user, title: c.title, id: c._id, date: c.createdAt, category: c.category });
      if (c.status !== 'Pending') {
        evs.push({ type: 'status', user: 'Admin', title: c.title, id: c._id, date: c.createdAt, status: c.status });
      }
      (c.comments || []).forEach(cm => {
        evs.push({ type: 'comment', user: cm.user, title: c.title, id: c._id, date: cm.date });
      });
    });
    evs.sort((a, b) => new Date(b.date) - new Date(a.date));
    setEvents(evs.slice(0, 40));
    setLastUpdated(new Date());
    setTimeout(() => setLoading(false), 400);
  };

  useEffect(() => { buildEvents(); }, [complaints]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <FadeIn className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Community Activity
          </h1>
          <p className="text-muted-foreground">Live stream of everything happening across the city.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={buildEvents}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </FadeIn>

      <FadeIn delay={0.1} className="text-xs text-muted-foreground mb-4">
        Last updated: {lastUpdated.toLocaleTimeString()} · {events.length} events
      </FadeIn>

      <div className="space-y-3">
        <AnimatePresence>
          {events.map((ev, idx) => {
            const meta = EVENT_META[ev.type] || EVENT_META.reported;
            const Icon = meta.icon;
            return (
              <motion.div
                key={`${ev.type}-${ev.id}-${idx}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="glass-card p-4 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {getInitials(ev.user)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{ev.user}</span>
                    <span className="text-xs text-muted-foreground">{meta.label}</span>
                    <Link to={`/issue/${ev.id}`} className="text-sm font-medium text-primary hover:underline truncate max-w-[200px]">
                      "{ev.title}"
                    </Link>
                  </div>
                  {ev.type === 'status' && ev.status && (
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ev.status === 'Resolved' ? 'bg-green-500/10 text-green-600' :
                        ev.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-700' :
                        'bg-secondary text-muted-foreground'
                      }`}>→ {ev.status}</span>
                    </div>
                  )}
                  {ev.category && ev.type === 'reported' && (
                    <span className="text-xs text-muted-foreground mt-0.5 block">{ev.category}</span>
                  )}
                </div>

                {/* Icon + Time */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className={`p-1.5 rounded-lg ${meta.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(ev.date)}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="text-center py-20 text-muted-foreground glass-card rounded-2xl">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No activity yet. Be the first to report an issue!</p>
          </div>
        )}
      </div>
    </div>
  );
}
