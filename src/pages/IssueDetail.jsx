import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, Clock, MapPin, ThumbsUp, Send, Share2, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStore } from '@/lib/Store';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function IssueDetail() {
  const { id } = useParams();
  const { user, upvoteComplaint, addComment, complaints } = useStore();
  const [issue, setIssue] = useState(null);
  const [commentText, setCommentText] = useState("");

  const [copied, setCopied] = useState(false);

  // Load from local store first, but in a real app would fetch from API explicitly
  useEffect(() => {
    const found = complaints.find(c => c._id === id);
    if (found) setIssue(found);
  }, [id, complaints]);

  if (!issue) {
    return <div className="p-10 text-center">Loading Issue...</div>;
  }

  const handleUpvote = async () => {
    if (!user) return alert("Please log in to upvote.");
    await upvoteComplaint(id, user._id || user.id);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to comment.");
    if (!commentText.trim()) return;
    await addComment(id, user.name, commentText);
    setCommentText("");
  };


  const shareUrl = window.location.href;
  const shareText = encodeURIComponent(`🚨 Civic Issue: "${issue?.title}" — Report it on UrbanPulse!`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasUpvoted = user && issue.upvotes?.includes(user._id || user.id);
  // Default coordinates (e.g., center of the city) if none provided
  const position = issue.coordinates?.lat ? [issue.coordinates.lat, issue.coordinates.lng] : [25.5941, 85.1376];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden h-[400px]">
            <img src={issue.img} alt={issue.title} className="w-full h-full object-cover" />
          </div>

          {/* Interactive Map */}
          <div className="glass-card p-6">
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" /> Location
            </h3>
            <div className="h-[300px] rounded-lg overflow-hidden border">
              <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>{issue.location || "Reported Location"}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="mt-3 text-muted-foreground">{issue.location}</p>
          </div>
        </div>

        {/* Right Column: Details & Interaction */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tracking ID</span>
              <Badge variant="outline" className="font-mono text-xs">{issue.trackingId || "PENDING-GEN"}</Badge>
            </div>
            <div className="flex justify-between items-start mb-4">
              <Badge variant={
                issue.status === 'Resolved' ? 'success' : 
                issue.status === 'In Progress' ? 'warning' : 
                'default'
              }>
                {issue.status}
              </Badge>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {issue.date}
              </div>
            </div>
            <h1 className="text-2xl font-heading font-bold mb-4">{issue.title}</h1>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {issue.description}
            </p>

            {/* Tracking Timeline */}
            <div className="mt-8 pt-8 border-t border-border">
              <h4 className="text-sm font-bold mb-6 flex items-center">
                <Check className="w-4 h-4 mr-2 text-primary" /> Tracking History
              </h4>
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
                {(issue.statusHistory || [
                  { status: 'Pending', note: 'Issue reported and awaiting review.', timestamp: issue.createdAt || issue.date }
                ]).map((step, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={cn(
                      "absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-background z-10",
                      i === 0 ? "bg-primary" : "bg-muted"
                    )} />
                    <div className="text-xs font-bold mb-1">{step.status}</div>
                    <div className="text-xs text-muted-foreground mb-1">{step.note}</div>
                    <div className="text-[10px] text-muted-foreground opacity-60">
                      {new Date(step.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-border mt-8">
              <div className="text-sm text-muted-foreground">
                Reported by: <span className="font-semibold text-foreground">{issue.user}</span>
              </div>
              <Button 
                variant={hasUpvoted ? "default" : "outline"}
                className={`gap-2 ${hasUpvoted ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={handleUpvote}
              >
                <ThumbsUp className="w-4 h-4" /> 
                {issue.upvotes?.length || 0}
              </Button>
            </div>

            {/* Social Sharing */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Share2 className="w-3.5 h-3.5" /> Share this Issue</p>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/919798878794?text=${encodeURIComponent(`🚨 UrbanPulse Civic Report\n\n📋 Issue: "${issue?.title}"\n📍 Location: ${issue?.location || 'See link'}\n🔖 Status: ${issue?.status || 'Pending'}\n\n🔗 View full report: ${shareUrl}\n\nReported via UrbanPulse Civic Portal`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 text-xs font-semibold transition-colors border border-green-500/20"
                >
                  📱 WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 text-xs font-semibold transition-colors border border-blue-500/20"
                >
                  🐦 Twitter
                </a>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold transition-colors border border-border"
                >
                  {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass-card p-6 flex flex-col h-[400px]">
            <h3 className="font-heading font-semibold text-lg mb-4">Community Discussion</h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {(!issue.comments || issue.comments.length === 0) ? (
                <p className="text-muted-foreground text-sm text-center mt-10">No comments yet. Be the first to discuss!</p>
              ) : (
                issue.comments.map((comment, i) => (
                  <div key={i} className="bg-secondary/30 p-3 rounded-lg text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{new Date(comment.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-foreground/80">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Input 
                placeholder="Add a comment..." 
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                disabled={!user}
              />
              <Button type="submit" disabled={!user || !commentText.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
            {!user && <p className="text-xs text-muted-foreground mt-2 text-center">Log in to comment</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
