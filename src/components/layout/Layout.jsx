import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/Store';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Bell, Globe, MessageCircle, Phone, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import AIChatBot from './AIChatBot';

export default function Layout() {
  const { user, logout, notifications, markNotificationRead } = useStore();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b glass">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 mr-12 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              UP
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl tracking-tight leading-none">UrbanPulse</span>
              <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mt-0.5">Civic Portal</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-6 flex-1 justify-center">
            {[
              { to: "/", label: t.home },
              { to: "/dashboard", label: t.dashboard },
              { to: "/petitions", label: "Petitions", icon: "📢" },
              { to: "/map", label: t.cityMap, icon: "🗺️" },
              { to: "/leaderboard", label: t.leaderboard, icon: "🏆" },
              { to: "/activity", label: t.activity, icon: "⚡" },
              { to: "/report", label: t.report }
            ].map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="text-[11px] xl:text-sm font-semibold text-slate-600 hover:text-primary transition-all flex items-center gap-1.5 relative group py-2 whitespace-nowrap"
              >
                {link.icon && <span className="text-sm xl:text-base group-hover:scale-125 transition-transform">{link.icon}</span>}
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-bold text-primary hover:text-primary/80 px-3 py-1 rounded-full bg-primary/10 transition-all">Admin</Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 pl-6 border-l">
              {/* Language Toggle */}
              <button 
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-xs font-bold transition-all border border-border shadow-sm active:scale-95"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                {lang === 'en' ? 'हिन्दी' : 'EN'}
              </button>

              {user ? (
                <div className="flex items-center gap-4">
                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2.5 rounded-xl hover:bg-secondary transition-all"
                    >
                      <Bell className="w-5 h-5 text-slate-600" />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-80 glass border rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
                        >
                          <div className="px-5 py-4 border-b bg-primary/5 flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-slate-900">Notifications</span>
                              {unreadCount > 0 && <span className="text-[10px] text-primary font-bold">{unreadCount} New Alerts</span>}
                            </div>
                            {unreadCount > 0 && (
                              <button 
                                onClick={() => {
                                  notifications.filter(n => !n.read).forEach(n => markNotificationRead(n._id));
                                }}
                                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                          <div className="max-h-80 overflow-y-auto scrollbar-hide">
                            {(!notifications || notifications.length === 0) ? (
                              <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                  <Bell className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">All caught up!</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">No new notifications</p>
                              </div>
                            ) : (
                              [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(notif => (
                                <div 
                                  key={notif._id} 
                                  className={`px-5 py-4 border-b hover:bg-primary/5 cursor-pointer transition-colors relative group ${notif.read ? 'opacity-60' : 'bg-white'}`}
                                  onClick={() => {
                                    if (!notif.read) markNotificationRead(notif._id);
                                    if (notif.complaintId) {
                                      navigate(`/issue/${notif.complaintId}`);
                                      setShowNotifications(false);
                                    }
                                  }}
                                >
                                  {!notif.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>}
                                  <p className={`text-sm mb-1 leading-tight ${notif.read ? 'font-medium' : 'font-bold text-slate-900'}`}>{notif.message}</p>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                      {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {!notif.read && <span className="text-[9px] font-black text-primary uppercase opacity-0 group-hover:opacity-100 transition-opacity">New</span>}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="p-3 bg-slate-50 border-t text-center">
                             <button className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-[0.2em]">View All Activity</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-3 p-1 pr-4 rounded-full bg-slate-50 hover:bg-slate-100 transition-all border border-border group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:rotate-12 transition-transform">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col items-start hidden xl:flex">
                        <span className="text-xs font-black text-slate-900 leading-none">
                          {user.name}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Verified Citizen
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-3 z-50 origin-top-right"
                        >
                          <div className="px-4 py-2 border-b mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account</p>
                            <p className="text-sm font-bold truncate">{user.email}</p>
                          </div>
                          {[
                            { label: 'My Dashboard', to: '/my-dashboard' },
                            { label: 'Submit Report', to: '/report' },
                            { label: 'Settings', to: '/settings' }
                          ].map(item => (
                            <Link 
                              key={item.label}
                              to={item.to}
                              className="block px-4 py-2 text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              {item.label}
                            </Link>
                          ))}
                          <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors mt-2 border-t pt-3"
                          >
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="rounded-full px-6 font-bold">Sign In</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-all"
            >
              <div className="w-6 h-5 flex flex-col justify-between items-end">
                <span className={`h-0.5 bg-slate-900 transition-all rounded-full ${isMobileMenuOpen ? 'w-6 translate-y-2 -rotate-45' : 'w-6'}`}></span>
                <span className={`h-0.5 bg-slate-900 transition-all rounded-full ${isMobileMenuOpen ? 'opacity-0' : 'w-4'}`}></span>
                <span className={`h-0.5 bg-slate-900 transition-all rounded-full ${isMobileMenuOpen ? 'w-6 -translate-y-2.5 rotate-45' : 'w-5'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[60] bg-background lg:hidden p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-heading font-black text-2xl tracking-tighter italic text-primary">UrbanPulse</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
              <nav className="flex flex-col gap-6">
                {[
                  { to: "/", label: t.home, icon: "🏠" },
                  { to: "/dashboard", label: t.dashboard, icon: "📊" },
                  { to: "/petitions", label: "Petitions", icon: "📢" },
                  { to: "/map", label: t.cityMap, icon: "🗺️" },
                  { to: "/report", label: t.report, icon: "✍️" },
                  { to: "/leaderboard", label: t.leaderboard, icon: "🏆" }
                ].map((link, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={link.to}
                  >
                    <Link 
                      to={link.to} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl font-bold flex items-center gap-4 hover:text-primary transition-colors"
                    >
                      <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl shadow-sm">{link.icon}</span>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto pt-8 border-t space-y-4">
                {!user ? (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full h-14 text-lg font-bold rounded-2xl">Sign In to Continue</Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-2xl text-red-500 border-red-200" onClick={handleLogout}>Sign Out</Button>
                )}
                <div className="flex justify-center gap-4">
                   <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="p-4 rounded-2xl bg-secondary font-bold flex items-center gap-2">
                     <Globe className="w-5 h-5 text-primary" />
                     {lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>


      {/* WhatsApp Quick Link */}
      <a 
        href={`https://wa.me/919798878794?text=${encodeURIComponent('🚨 UrbanPulse Civic Report\n\nHello! I would like to report a civic issue in my area through the UrbanPulse portal. Please assist.\n\n📍 Location: [Please describe your location]\n📋 Issue Type: [e.g. Pothole / Streetlight / Water Supply]\n📝 Details: [Describe the issue]\n\nThank you!')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform active:scale-95 group"
      >
        <Phone className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-background border px-3 py-1.5 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          Report via WhatsApp
        </span>
      </a>

      {/* AI Assistant Chatbot */}
      <AIChatBot />

      {/* Main Content */}
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center font-bold shadow-lg">UP</div>
                <span className="font-heading font-black text-2xl tracking-tighter italic">UrbanPulse</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The premier community-driven civic platform. Transforming public infrastructure through transparency and citizen participation.
              </p>
              <div className="flex gap-4">
                <a href="#!" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-400 transition-colors cursor-pointer group"><Twitter className="w-4 h-4 text-slate-300 group-hover:text-white" /></a>
                <a href="#!" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer group"><Facebook className="w-4 h-4 text-slate-300 group-hover:text-white" /></a>
                <a href="#!" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-500 transition-colors cursor-pointer group"><Instagram className="w-4 h-4 text-slate-300 group-hover:text-white" /></a>
                <a href="#!" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer group"><Linkedin className="w-4 h-4 text-slate-300 group-hover:text-white" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home Page</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Public Dashboard</Link></li>
                <li><Link to="/map" className="hover:text-white transition-colors">Interactive City Map</Link></li>
                <li><Link to="/petitions" className="hover:text-white transition-colors">Community Petitions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><a href="#!" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#!" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#!" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#!" className="hover:text-white transition-colors">Contact Authorities</a></li>
              </ul>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <h4 className="font-bold text-lg mb-4">Official Portal</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Recognized by the Urban Development & Housing Department.
              </p>
              <div className="w-full h-12 bg-white/10 rounded-xl flex items-center justify-center gap-2 border border-white/20">
                <span className="text-xs font-bold tracking-widest uppercase">Verified System</span>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} UrbanPulse Platform. {t.empowering}
            </p>
            <div className="flex gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <span className="hover:text-white cursor-pointer transition-colors">Status</span>
              <span className="hover:text-white cursor-pointer transition-colors">Security</span>
              <span className="hover:text-white cursor-pointer transition-colors">API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
