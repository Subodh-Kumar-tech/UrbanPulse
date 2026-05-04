import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Shield, Flame, Award } from 'lucide-react';
import { FadeIn } from '@/components/ui/Animations';
import { useStore } from '@/lib/Store';

const BADGES = [
  { min: 100, icon: Shield, label: 'City Guardian', color: 'text-purple-500' },
  { min: 60, icon: Flame, label: 'Active Reporter', color: 'text-orange-500' },
  { min: 30, icon: Star, label: 'Verified Reporter', color: 'text-yellow-500' },
  { min: 0, icon: Award, label: 'Contributor', color: 'text-blue-500' },
];

const getBadge = (points) => BADGES.find(b => points >= b.min) || BADGES[BADGES.length - 1];

const RANK_STYLES = [
  'from-yellow-400 to-amber-500',   // 1st
  'from-slate-300 to-slate-400',    // 2nd
  'from-amber-600 to-amber-700',    // 3rd
];

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

export default function Leaderboard() {
  const { complaints, user } = useStore();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
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
    const sorted = Object.values(userMap)
      .map(u => ({ ...u, points: u.reports * 10 + u.upvotesReceived * 2 + u.resolvedCount * 20 + u.comments * 1 }))
      .sort((a, b) => b.points - a.points);
    setLeaders(sorted);
  }, [complaints]);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <FadeIn className="mb-8 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 mb-4 shadow-lg shadow-yellow-400/30">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-heading font-bold mb-2">Citizen Leaderboard</h1>
        <p className="text-muted-foreground">Top civic reporters making a difference in the city.</p>
      </FadeIn>

      {/* Points Key */}
      <FadeIn delay={0.1} className="glass-card p-4 mb-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs text-muted-foreground">
        {[['📝 Report', '10 pts'], ['✅ Resolved', '20 pts'], ['👍 Upvote received', '2 pts'], ['💬 Comment', '1 pt']].map(([label, pts]) => (
          <div key={label} className="flex flex-col gap-1">
            <span>{label}</span>
            <span className="font-bold text-foreground text-base">{pts}</span>
          </div>
        ))}
      </FadeIn>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <FadeIn delay={0.2} className="flex items-end justify-center gap-4 mb-10">
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((leader, i) => {
            const isFirst = leader === top3[0];
            const rank = isFirst ? 1 : leader === top3[1] ? 2 : 3;
            const badge = getBadge(leader.points);
            const BadgeIcon = badge.icon;
            const isCurrentUser = user?.name === leader.name;
            return (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`flex flex-col items-center ${isFirst ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}
              >
                {isFirst && <div className="text-3xl mb-2">👑</div>}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${RANK_STYLES[rank - 1]} flex items-center justify-center text-white text-xl font-bold shadow-xl mb-2 ${isCurrentUser ? 'ring-4 ring-primary ring-offset-2' : ''}`}>
                  {getInitials(leader.name)}
                </div>
                <div className="text-sm font-bold text-center max-w-[80px] truncate">{leader.name}</div>
                <div className={`text-xs font-semibold ${badge.color} flex items-center gap-1`}><BadgeIcon className="w-3 h-3" />{badge.label}</div>
                <div className="mt-2 text-lg font-bold text-primary">{leader.points} pts</div>
                <div className={`mt-1 w-full rounded-t-lg ${isFirst ? 'h-20' : rank === 2 ? 'h-12' : 'h-8'} bg-gradient-to-t ${RANK_STYLES[rank - 1]} opacity-20`} />
              </motion.div>
            );
          })}
        </FadeIn>
      )}

      {/* Full List */}
      <FadeIn delay={0.3} className="space-y-3">
        {leaders.map((leader, idx) => {
          const badge = getBadge(leader.points);
          const BadgeIcon = badge.icon;
          const isCurrentUser = user?.name === leader.name;
          return (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card p-4 flex items-center gap-4 ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                  idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                  idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                  'bg-secondary text-muted-foreground'}`}
              >
                {idx + 1}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {getInitials(leader.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{leader.name}</span>
                  {isCurrentUser && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">You</span>}
                </div>
                <div className={`text-xs flex items-center gap-1 ${badge.color}`}><BadgeIcon className="w-3 h-3" />{badge.label}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-primary">{leader.points} pts</div>
                <div className="text-xs text-muted-foreground">{leader.reports} reports · {leader.resolvedCount} resolved</div>
              </div>
              {/* Mini progress bar */}
              <div className="hidden md:block w-24">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((leader.points / (leaders[0]?.points || 1)) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: idx * 0.05 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </FadeIn>
    </div>
  );
}
