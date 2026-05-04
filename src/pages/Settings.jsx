import { useState } from 'react';
import { useStore } from '@/lib/Store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FadeIn } from '@/components/ui/Animations';
import { User, Bell, Shield, Key } from 'lucide-react';

export default function Settings() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <FadeIn>
        <h1 className="text-3xl font-heading font-black mb-2">Account Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your profile, preferences, and security settings.</p>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 space-y-2">
            {[
              { id: 'profile', label: 'Profile Information', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security & Password', icon: Shield },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-secondary text-slate-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex-1 glass-card p-8 min-h-[400px]">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Profile Information</h2>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <Button variant="outline" className="mb-2">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                    <Input defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <Input defaultValue={user?.email} disabled />
                    <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                  </div>
                </div>
                
                <Button className="mt-6">Save Changes</Button>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
                <p className="text-sm text-muted-foreground">Choose what updates you want to receive.</p>
                
                <div className="space-y-4 mt-6">
                  {[
                    { title: 'Status Updates', desc: 'When your reported issue status changes.' },
                    { title: 'Comments & Replies', desc: 'When an official replies to your report.' },
                    { title: 'Community Alerts', desc: 'Important civic announcements in your area.' }
                  ].map(item => (
                    <div key={item.title} className="flex items-center justify-between p-4 border rounded-xl bg-secondary/30">
                      <div>
                        <p className="font-bold text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Security Settings</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Current Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button className="mt-4 gap-2"><Key className="w-4 h-4" /> Update Password</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
