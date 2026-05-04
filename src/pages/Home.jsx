import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertTriangle, ShieldCheck, MapPin, Activity, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FadeIn, StaggerChildren, StaggerItem, ScaleHover } from '@/components/ui/Animations';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const HERO_IMGS = [
  "/hero/patna.png", 
  "/hero/taj.png", 
  "/hero/delhi.png",
  "https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=2000&auto=format", // Varanasi Ghat
  "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2000&auto=format", // Hawa Mahal
  "https://images.unsplash.com/photo-1542640244-7e672d6cef21?q=80&w=2000&auto=format", // Indian Village Fields
  "https://images.unsplash.com/photo-1509060455041-8608d0859424?q=80&w=2000&auto=format", // Rural Indian Life
  "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=2000&auto=format", // Heritage Market
  "https://images.unsplash.com/photo-1524492707947-54b2d9d15c1b?q=80&w=2000&auto=format", // Indian Heritage
  "https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=2000&auto=format"  // More Heritage
];

const FEATURES = (t) => [
  { icon: AlertTriangle, title: t.reportBtn, desc: "Snap a photo and report issues like potholes or garbage in seconds.", color: "text-orange-500" },
  { icon: MapPin, title: t.location, desc: "Interactive mapping automatically tags the exact coordinates of the issue.", color: "text-blue-500" },
  { icon: Activity, title: "Track Progress", desc: "Get real-time updates as local authorities resolve your community's problems.", color: "text-green-500" },
  { icon: ShieldCheck, title: "Verified Resolution", desc: "Issues are marked resolved only when verified, ensuring transparent governance.", color: "text-purple-500" }
];

const RECENT_ISSUES = [
  { title: "Severe Pothole on Main St", category: "Roads", status: "Pending", img: "/issues/pothole.png" },
  { title: "Overflowing Garbage Dump", category: "Sanitation", status: "In Progress", img: "/issues/garbage.png" },
  { title: "Broken Streetlight", category: "Infrastructure", status: "Resolved", img: "/issues/streetlight.png" }
];

function Counter({ end, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);

  return <span>{count}{suffix}</span>;
}

export default function Home() {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const [currentImg, setCurrentImg] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Preload all images for zero-lag switching
    HERO_IMGS.forEach(url => {
      const img = new Image();
      img.src = url;
    });

    const interval = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % HERO_IMGS.length);
      setIsLoaded(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: y1, opacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 z-10" />
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImg}
              src={HERO_IMGS[currentImg]} 
              alt="Indian City Infrastructure" 
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 4, ease: "easeOut" }}
              onError={() => {
                console.warn(`Failed to load hero image: ${HERO_IMGS[currentImg]}, skipping...`);
                setCurrentImg(prev => (prev + 1) % HERO_IMGS.length);
              }}
            />
          </AnimatePresence>
        </motion.div>

        <div className="container relative z-20 px-4 flex flex-col items-center text-center">
          <FadeIn>
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary-foreground backdrop-blur-md border border-white/20 mb-6 text-sm font-semibold">
              {t.empowering}
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 drop-shadow-lg tracking-tight">
              {t.heroTitle} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-primary">{t.heroSubtitle}</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-md">
              {t.heroDesc}
            </p>
          </FadeIn>
          <FadeIn delay={0.3} className="flex gap-4">
            <Link to="/report">
              <Button size="lg" className="rounded-full text-lg shadow-primary/25 shadow-xl hover:shadow-primary/40 group">
                {t.reportBtn}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="glass" className="rounded-full text-lg text-white">
                {t.viewDashboard}
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section with Shine */}
      <section className="py-16 bg-white relative z-30 border-b overflow-hidden modern-shine">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:divide-x divide-slate-100">
            {[
              { label: t.issuesResolved, value: 1250, suffix: "+", color: "text-green-600" },
              { label: t.activeCitizens, value: 8400, suffix: "", color: "text-blue-600" },
              { label: t.localAuthorities, value: 45, suffix: "", color: "text-primary" },
              { label: t.avgResolution, value: 48, suffix: "h", color: "text-orange-600" }
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1} className="text-center px-6">
                <div className={cn("text-4xl md:text-6xl font-black font-heading mb-3", stat.color)}>
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Community Voice Section (NEW POLISH) */}
      <section className="py-24 bg-slate-50 relative z-30">
        <div className="container mx-auto px-4">
           <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                 <div>
                    <h2 className="text-4xl md:text-5xl font-heading font-black mb-6 leading-tight">Digital Urban <br/>Transformation</h2>
                    <p className="text-white/80 text-lg mb-8 leading-relaxed">
                      UrbanPulse is the cornerstone of our commitment to transparent governance. We bridge the gap between citizens and authorities through real-time data and AI-powered reporting.
                    </p>
                    <div className="flex flex-wrap gap-4">
                       <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                          <span className="block text-2xl font-bold">98.4%</span>
                          <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">Accuracy Rate</span>
                       </div>
                       <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                          <span className="block text-2xl font-bold">12ms</span>
                          <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">Avg Response</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex justify-center">
                    <div className="w-64 h-64 md:w-80 md:h-80 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center animate-float">
                       <div className="text-8xl">📊</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* City Pulse Trending Issues (NEW HYPE) */}
      <section className="py-24 bg-white relative z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Live City Pulse</h2>
              <p className="text-muted-foreground">Real-time status of major community infrastructure projects.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
               <Link to="/map">
                  <Button variant="outline" className="rounded-full flex items-center gap-2">
                    <MapIcon className="w-4 h-4" /> View Live Heatmap
                  </Button>
               </Link>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Smart Street Lighting (Boring Rd)", progress: 65, category: "Electricity", trend: "+12% this week" },
              { title: "Waste Management (Patna City)", progress: 42, category: "Sanitation", trend: "High Priority" },
              { title: "Flyover Repair (Rajendra Nagar)", progress: 88, category: "Roads", trend: "Near Completion" }
            ].map((pulse, i) => (
              <FadeIn key={i} delay={i * 0.1} className="glass-card p-6 border-t-4 border-t-primary shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/5 rounded">{pulse.category}</span>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{pulse.trend}</span>
                </div>
                <h4 className="font-bold mb-4 text-slate-800">{pulse.title}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Resolution Progress</span>
                    <span>{pulse.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pulse.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-blue-500"
                    />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-30 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">How UrbanPulse Works</h2>
              <p className="text-muted-foreground text-lg">A unified ecosystem ensuring every voice is heard and every problem is addressed.</p>
            </FadeIn>
          </div>
          
          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES(t).map((feature, i) => (
              <StaggerItem key={i}>
                <ScaleHover>
                  <div className="glass-card p-6 h-full border border-border">
                    <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 shadow-sm">
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </div>
                </ScaleHover>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Recent Activity Showcase */}
      <section className="py-24 relative z-30 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Recent Activity</h2>
              <p className="text-muted-foreground">See what's happening around your community in real-time.</p>
            </FadeIn>
            <FadeIn delay={0.2} className="hidden md:block">
              <Link to="/dashboard">
                <Button variant="outline">View All</Button>
              </Link>
            </FadeIn>
          </div>

          <StaggerChildren className="grid md:grid-cols-3 gap-8">
            {RECENT_ISSUES.map((issue, i) => (
              <StaggerItem key={i}>
                <ScaleHover className="group h-full">
                  <div className="glass-card overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={issue.img} 
                        alt={issue.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-md",
                          issue.status === 'Resolved' ? 'bg-green-500/80 text-white' :
                          issue.status === 'In Progress' ? 'bg-yellow-500/80 text-white' :
                          'bg-red-500/80 text-white'
                        )}>
                          {issue.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <span className="text-sm text-primary font-medium mb-2">{issue.category}</span>
                      <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
                      <div className="mt-auto pt-4 border-t flex items-center text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>Downtown District</span>
                      </div>
                    </div>
                  </div>
                </ScaleHover>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>
    </div>
  );
}
