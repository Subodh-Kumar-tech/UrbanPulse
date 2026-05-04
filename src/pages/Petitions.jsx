import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ThumbsUp, Users, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/Animations';
import { Badge } from '@/components/ui/Badge';

const PETITIONS = [
  {
    id: 1,
    title: "New Overbridge at Rajendra Nagar",
    desc: "Persistent traffic congestion requires a new flyover to connect the railway station area to the main city bypass.",
    signatures: 842,
    goal: 1000,
    category: "Infrastructure",
    status: "Active"
  },
  {
    id: 2,
    title: "Clean River Initiative - City Ghats",
    desc: "A community-led project to install automatic trash skimmers and daily cleaning crews at all main river ghats.",
    signatures: 2150,
    goal: 5000,
    category: "Environment",
    status: "Trending"
  },
  {
    id: 3,
    title: "Smart Street Lighting in Main Road",
    desc: "Replace old sodium lamps with sensor-based LED smart lights to save energy and improve safety at night.",
    signatures: 450,
    goal: 500,
    category: "Lighting",
    status: "Near Goal"
  }
];

export default function Petitions() {
  const [signed, setSigned] = useState([]);

  const handleSign = (id) => {
    if (!signed.includes(id)) {
      setSigned([...signed, id]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-12">
        <FadeIn>
          <h1 className="text-4xl font-heading font-bold mb-4">Community Petitions</h1>
          <p className="text-muted-foreground max-w-2xl">
            Start a movement for bigger changes. Petitions with enough support are directly 
            forwarded to the appropriate government office for review.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Start Petition
          </Button>
        </FadeIn>
      </div>

      <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PETITIONS.map((p, i) => (
          <StaggerItem key={p.id}>
            <div className="glass-card flex flex-col h-full border border-border group hover:border-primary/50 transition-colors">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline">{p.category}</Badge>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">{p.status}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{p.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6">{p.desc}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-primary">{signed.includes(p.id) ? p.signatures + 1 : p.signatures} signatures</span>
                    <span className="text-muted-foreground">Goal: {p.goal}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((signed.includes(p.id) ? p.signatures + 1 : p.signatures) / p.goal) * 100, 100)}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-secondary/30 border-t flex items-center justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{Math.floor(p.signatures / 10)} shared this</span>
                </div>
                <Button 
                  size="sm" 
                  variant={signed.includes(p.id) ? "outline" : "default"}
                  onClick={() => handleSign(p.id)}
                  disabled={signed.includes(p.id)}
                  className="gap-2"
                >
                  {signed.includes(p.id) ? "Signed ✓" : "Sign Now"}
                  {!signed.includes(p.id) && <ThumbsUp className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Impact Section */}
      <FadeIn className="mt-24 p-12 glass rounded-3xl text-center bg-primary/5 border-primary/20">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-heading font-bold mb-4">Direct Impact Policy</h2>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
          Under local Civic Rules, any petition reaching its goal within 30 days is 
          guaranteed a physical review by the Department Secretary. Your voice has real power.
        </p>
        <div className="flex justify-center gap-12">
          <div>
            <div className="text-3xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Petitions Reviewed</div>
          </div>
          <div className="border-x px-12">
            <div className="text-3xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">Projects Started</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">₹2.4Cr</div>
            <div className="text-sm text-muted-foreground">Budget Allocated</div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
