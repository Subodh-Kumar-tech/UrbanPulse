const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Complaint = require('./models/Complaint');

const sampleComplaints = [
  {
    title: 'Severe Pothole on Fraser Road',
    category: 'Roads',
    description: 'A deep pothole approximately 2 feet wide has formed near the Fraser Road intersection. Multiple vehicles have suffered tire damage this week. Immediate patching required.',
    location: 'Fraser Road, Patna',
    status: 'Pending',
    priority: 'High',
    user: 'Rahul Sharma',
    date: '2 days ago',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/pothole,road?lock=1',
    upvotes: ['user1', 'user2', 'user3'],
    coordinates: { lat: 25.6111, lng: 85.1384 }
  },
  {
    title: 'Broken Streetlight in Boring Road',
    category: 'Lighting',
    description: 'The streetlight at Boring Road Crossing has been completely dead for 5 nights. The area is pitch dark and two minor vehicle accidents have already been reported this week.',
    location: 'Boring Road, Patna',
    status: 'In Progress',
    priority: 'High',
    user: 'Priya Patel',
    date: '3 days ago',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/streetlight,night?lock=2',
    upvotes: ['user1'],
    coordinates: { lat: 25.6166, lng: 85.1167 }
  },
  {
    title: 'Water Main Burst — Gandhi Maidan Area',
    category: 'Water',
    description: 'A major water main has burst near Gandhi Maidan Gate 4. The road is flooded, traffic is completely blocked, and nearby businesses are affected.',
    location: 'Gandhi Maidan, Patna',
    status: 'Resolved',
    priority: 'Critical',
    user: 'Arjun Mehta',
    date: '5 days ago',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/flood,water?lock=3',
    upvotes: ['user1', 'user2'],
    coordinates: { lat: 25.6200, lng: 85.1430 }
  },
  {
    title: 'Overflowing Garbage at Eco Park Entrance',
    category: 'Sanitation',
    description: 'All garbage bins near the Eco Park (Rajdhani Vatika) entrance are overflowing. Waste is spilling onto the footpath creating a severe health hazard.',
    location: 'Eco Park, Patna',
    status: 'Pending',
    priority: 'Medium',
    user: 'Ankit Kumar',
    date: '1 day ago',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/garbage,trash?lock=4',
    upvotes: [],
    coordinates: { lat: 25.6030, lng: 85.1120 }
  },
  {
    title: 'Illegal Parking Blocking PMCH Emergency Exit',
    category: 'Traffic',
    description: 'Multiple cars are parked illegally blocking the emergency exit lane of PMCH. Ambulances are unable to pass freely — an urgent life-safety issue.',
    location: 'PMCH, Ashok Rajpath, Patna',
    status: 'In Progress',
    priority: 'Critical',
    user: 'Dr. Neha Verma',
    date: '6 hours ago',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/traffic,parking?lock=5',
    upvotes: ['user1', 'user2', 'user3', 'user4'],
    coordinates: { lat: 25.6210, lng: 85.1550 }
  },
  {
    title: 'Damaged Fence at Patna Zoo',
    category: 'Parks',
    description: 'The boundary fence at Sanjay Gandhi Biological Park is damaged. Stray animals are entering the botanical area. Urgent repairs needed.',
    location: 'Sanjay Gandhi Biological Park, Patna',
    status: 'Resolved',
    priority: 'High',
    user: 'Anita Desai',
    date: '1 week ago',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/zoo,park?lock=6',
    upvotes: ['user1', 'user2'],
    coordinates: { lat: 25.5980, lng: 85.0940 }
  },
  {
    title: 'Clogged Drain in Maurya Lok Complex',
    category: 'Sanitation',
    description: 'The main storm drain in Maurya Lok Complex is completely blocked. Every time it rains, the entire plaza floods within minutes.',
    location: 'Maurya Lok, Patna',
    status: 'Pending',
    priority: 'Medium',
    user: 'Vijay Kumar',
    date: '4 days ago',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/drain,flood?lock=7',
    upvotes: ['user1'],
    coordinates: { lat: 25.6140, lng: 85.1370 }
  },
  {
    title: 'Live Electrical Wires in Patliputra Industrial Area',
    category: 'Lighting',
    description: 'A utility pole near Patliputra Industrial Area Gate 2 has live electrical wires hanging loose. Extreme electrocution hazard.',
    location: 'Patliputra Industrial Area, Patna',
    status: 'In Progress',
    priority: 'Critical',
    user: 'Suresh Babu',
    date: '12 hours ago',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/electricity,wire?lock=8',
    upvotes: ['user1', 'user2', 'user3'],
    coordinates: { lat: 25.6290, lng: 85.1010 }
  },
  {
    title: 'Unmarked Speed Breaker at Patna University',
    category: 'Roads',
    description: 'A newly built speed breaker near the University main gate has no reflective paint. Night-time visibility is zero.',
    location: 'Patna University Campus',
    status: 'Pending',
    priority: 'High',
    user: 'Prof. Ramesh Singh',
    date: '2 days ago',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/road,highway?lock=9',
    upvotes: ['user1', 'user2'],
    coordinates: { lat: 25.6210, lng: 85.1710 }
  },
  {
    title: 'Vandalism at Golghar Heritage Site',
    category: 'Other',
    description: 'The historic boundary wall near Golghar has been defaced with spray paint. A protected heritage site requiring restoration.',
    location: 'Golghar Area, Patna',
    status: 'Resolved',
    priority: 'Low',
    user: 'Kavya Reddy',
    date: '3 days ago',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    img: 'https://loremflickr.com/500/300/graffiti,wall?lock=10',
    upvotes: [],
    coordinates: { lat: 25.6215, lng: 85.1390 }
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urbanpulse');
    console.log('Connected to MongoDB for seeding (Bihar Edition)...');
    
    await Complaint.deleteMany({});
    console.log('Cleared old complaints.');
    
    await Complaint.insertMany(sampleComplaints);
    console.log('Successfully seeded 10 Bihar-centric complaints!');
    
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDB();
