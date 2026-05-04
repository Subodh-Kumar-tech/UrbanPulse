import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/Store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FadeIn, ScaleHover } from '@/components/ui/Animations';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  const { login, signup } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        const res = await login(formData.email, formData.password);
        if (res.success) {
           // Fetch the updated user state to check roles
           // The login function in Store already sets the user
           const loggedInUser = res.user || {}; 
           
           if (loggedInUser.role === 'admin') {
             navigate('/admin');
           } else {
             navigate('/my-dashboard');
           }
        } else {
          setError(res.message || 'Invalid credentials.');
        }
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          return setError('All fields are required.');
        }
        const res = await signup(formData.name, formData.email, formData.password);
        if (res.success) {
          navigate('/my-dashboard');
        } else {
          setError(res.message || 'Signup failed.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center container mx-auto px-4">
      <FadeIn className="w-full max-w-md">
        <div className="glass-card overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border/50">
            <button
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-4">
                 <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-heading font-black tracking-tight">{isLogin ? 'Official Portal Login' : 'Register for Civic Portal'}</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                Authorized Access Only • Urban Development Dept
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input 
                      placeholder="Full Name" 
                      className="pl-10" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input 
                  type="email"
                  placeholder="name@example.com" 
                  className="pl-10" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="pl-10" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              {error && <p className="text-destructive text-sm text-center">{error}</p>}

              <ScaleHover>
                <Button className="w-full mt-6 group shadow-lg" type="submit">
                  {isLogin ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </ScaleHover>
            </form>
          </div>
        </div>

      </FadeIn>
    </div>
  );
}
