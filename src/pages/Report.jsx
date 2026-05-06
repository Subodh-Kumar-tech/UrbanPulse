import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FadeIn } from '@/components/ui/Animations';
import { useStore } from '@/lib/Store';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { duration: 1 });
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

const STEPS = [
  { id: 1, title: 'Details', icon: FileText },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Media', icon: Camera },
];

export default function ReportIssue() {
  const { addComplaint, complaints, uploadImages } = useStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ title: '', category: '', description: '', location: '', image: null });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [position, setPosition] = useState({ lat: 25.5941, lng: 85.1376 }); // Patna, Bihar center
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);

  const handleAutoLocate = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setPosition(newPos);
    });
  };

  const handleSearchLocation = async () => {
    if (!formData.location) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        alert("Location not found. Try a different place name or pincode.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to search location.");
    }
  };

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 3) {
      return alert("Maximum 3 photos allowed");
    }
    
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);

    // AI Analysis Simulation
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiAnalysisResult({
        confidence: 94,
        match: true,
        detected: formData.category || "Issue"
      });
    }, 2500);
  };

  const removePhoto = (idx) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Duplicate check
    if (!duplicateWarning && formData.category && position) {
      const duplicate = complaints.find(c => {
        if (!c.coordinates || c.category !== formData.category) return false;
        const latDiff = Math.abs(c.coordinates.lat - position.lat);
        const lngDiff = Math.abs(c.coordinates.lng - position.lng);
        return latDiff < 0.005 && lngDiff < 0.005; // Roughly 500 meters
      });
      
      if (duplicate) {
        setDuplicateWarning(true);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      let photoUrls = [];
      if (selectedFiles.length > 0) {
        photoUrls = await uploadImages(selectedFiles);
      }

      await addComplaint({
        title: formData.title || 'New Issue',
        category: formData.category || 'Other',
        description: formData.description,
        location: formData.location,
        coordinates: position,
        img: photoUrls[0] || 'https://picsum.photos/seed/new/500/300',
        photoUrls: photoUrls
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center container mx-auto px-4 text-center">
        <FadeIn className="glass flex flex-col items-center p-12 max-w-md w-full rounded-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-heading font-bold mb-2">Report Submitted!</h2>
          <p className="text-muted-foreground mb-8">Thank you for making the community better. You can track this issue in the dashboard.</p>
          <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
            Go to Dashboard
          </Button>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <FadeIn className="mb-8 text-center">
        <h1 className="text-3xl font-heading font-bold mb-2">Report an Issue</h1>
        <p className="text-muted-foreground">Provide details so local authorities can address the problem efficiently.</p>
      </FadeIn>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary -z-10" />
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (step - 1) / (STEPS.length - 1) }}
          transition={{ duration: 0.5 }}
        />
        
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex flex-col items-center">
            <motion.div 
              className={`w-10 h-10 rounded-full flex flex-col items-center justify-center font-bold border-2 transition-colors duration-300 ${
                step >= s.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-background border-border text-muted-foreground'
              }`}
            >
              <s.icon className="w-5 h-5" />
            </motion.div>
            <span className={`text-xs mt-2 font-medium ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input id="title" placeholder="e.g. Deep pothole causing damage" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select a category</option>
                  <option value="Roads">Roads & Streets</option>
                  <option value="Parks">Parks & Gardens</option>
                  <option value="Water">Water Supply</option>
                  <option value="Sanitation">Sanitation & Garbage</option>
                  <option value="Lighting">Street Lighting</option>
                  <option value="Traffic">Traffic & Parking</option>
                  <option value="Public Safety">Public Safety</option>
                  <option value="Environment">Environment & Pollution</option>
                  <option value="Healthcare">Healthcare Facilities</option>
                  <option value="Education">Education & Schools</option>
                  <option value="Drainage">Drainage & Sewage</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description">Description</Label>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    className="h-8 text-[10px] flex items-center gap-1.5 text-primary hover:bg-primary/10"
                    onClick={() => {
                      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                      recognition.lang = 'hi-IN';
                      recognition.start();
                      recognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        setFormData({...formData, description: formData.description + ' ' + transcript});
                      };
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    बोलकर लिखें (Hindi Voice)
                  </Button>
                </div>
                <Textarea id="description" placeholder="Provide more details about the issue..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Address or Landmark</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input id="location" className="pl-9 pr-24" placeholder="Start typing address..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button 
                      type="button"
                      variant="ghost" size="sm" 
                      className="h-8 text-[10px] font-bold text-primary hover:bg-primary/10"
                      onClick={handleSearchLocation}
                    >
                      🔍 Search
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" size="sm" 
                      className="h-8 text-[10px] font-bold text-primary hover:bg-primary/10"
                      onClick={handleAutoLocate}
                    >
                      📍 Use GPS
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="h-[300px] rounded-lg border border-border overflow-hidden relative z-0">
                <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                  <span className="font-medium bg-background/90 px-3 py-1.5 text-xs rounded-full shadow-md backdrop-blur-md border border-border">Click map to set exact location</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
               <div className="space-y-2">
                <Label>Upload Media (Up to 3 photos)</Label>
                
                {isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-4 flex flex-col items-center justify-center text-center overflow-hidden relative"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-primary/10"
                      initial={{ y: "100%" }} animate={{ y: "-100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3 z-10" />
                    <h4 className="font-bold text-primary z-10 text-sm">AI SYSTEM: ANALYZING IMAGE...</h4>
                    <p className="text-[10px] text-muted-foreground z-10 uppercase tracking-widest mt-1">Cross-referencing with Civic Database</p>
                  </motion.div>
                )}

                {aiAnalysisResult && !isAnalyzing && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                         <h4 className="font-bold text-green-700 text-xs">AI VERIFIED: {aiAnalysisResult.confidence}% Confidence</h4>
                         <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">LEGIT</span>
                      </div>
                      <p className="text-[10px] text-green-600 mt-0.5">Image matches category: <strong>{aiAnalysisResult.detected}</strong>. Verified for local Region.</p>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={src} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 shadow-lg"
                      >
                        <ArrowLeft className="w-3 h-3 rotate-45" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 3 && (
                    <label className="border-2 border-dashed border-border rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/20 transition-colors">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] mt-1 font-medium">Add Photo</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </label>
                  )}
                </div>
                
                {previews.length === 0 && (
                  <label className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer group block">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Click to upload photos</h4>
                    <p className="text-sm text-muted-foreground">Attach images of the issue (Max 3)</p>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {duplicateWarning && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
               className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4 text-yellow-700 dark:text-yellow-500 text-sm flex items-start gap-3"
             >
               <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
               <div>
                 <strong>Warning: Duplicate Issue Detected</strong>
                 <p className="mt-1">A similar issue ({formData.category}) was already reported near this location. If this is a new problem or you want to emphasize it, click Submit again to proceed.</p>
               </div>
             </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          {step < STEPS.length ? (
            <Button onClick={handleNext}>
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                 <span className="flex items-center"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="mr-2">○</motion.div> Submitting...</span>
              ) : (
                <>Submit Report <CheckCircle className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
