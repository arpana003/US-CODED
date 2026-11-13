import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project.js';
import TeamMember from '../models/TeamMember.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { recalculateProjectProgress, buildProjectDigitalTwin } from '../services/digitalTwin.js';

dotenv.config();

const seedDatabase = async (exitOnComplete = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_twin_pm';
      console.log(`[Seed] Connecting to MongoDB at ${uri}...`);

      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log('[Seed] Connected to database.');
      } catch (err) {
        console.warn(`[Seed] Direct connect failed (${err.message}). Starting in-memory fallback...`);
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
        console.log('[Seed] Connected to in-memory database at', mongod.getUri());
      }
    } else {
      console.log('[Seed] Using existing active database connection.');
    }

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      Project.deleteMany({}),
      TeamMember.deleteMany({}),
      Task.deleteMany({}),
      User.deleteMany({})
    ]);

    // 0. Seed Demo Users (admin + employee accounts)
    console.log('[Seed] Creating admin and employee demo accounts...');
    await User.create([
      {
        name: 'Abhra Purkait',
        email: 'abhra@uscoded.io',
        password: 'Admin@12345',
        role: 'admin',
        designation: 'Lead Systems Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Abhra Purkait',
        email: 'admin@uscoded.io',
        password: 'Admin@12345',
        role: 'admin',
        designation: 'Lead Systems Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    ]);

    // 1. Seed Team Members (5 members)
    console.log('[Seed] Creating 5 team members...');
    const membersData = [
      { name: 'Abhra Purkait', email: 'abhra.purkait@twinpm.io', role: 'Lead Systems Architect' },
      { name: 'Priya Sharma', email: 'priya.sharma@twinpm.io', role: 'Frontend Engineering Lead' },
      { name: 'David Chen', email: 'david.chen@twinpm.io', role: 'DevOps & Cloud Specialist' },
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@twinpm.io', role: 'Full Stack Engineer' },
      { name: 'Marcus Vance', email: 'marcus.vance@twinpm.io', role: 'QA & Test Automation Lead' }
    ];

    const members = await TeamMember.insertMany(membersData);
    const [abhra, priya, david, sarah, marcus] = members;

    // Create linked employee User accounts for Priya and David
    await User.create([
      {
        name: 'Priya Sharma',
        email: 'priya@uscoded.io',
        password: 'Emp@12345',
        role: 'employee',
        designation: 'Frontend Engineering Lead',
        teamMemberId: priya._id,
      },
      {
        name: 'David Chen',
        email: 'david@uscoded.io',
        password: 'Emp@12345',
        role: 'employee',
        designation: 'DevOps & Cloud Specialist',
        teamMemberId: david._id,
      }
    ]);

    // 2. Seed Projects (3 projects)
    console.log('[Seed] Creating 3 projects...');
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    const project1 = new Project({
      name: 'Autonomous Drone Navigation System',
      description: 'Developing computer vision obstacle avoidance, flight telemetry, and real-time sensor fusion.',
      startDate: new Date(now.getTime() - 25 * dayMs),
      deadline: new Date(now.getTime() + 40 * dayMs),
      status: 'Active',
      team: [abhra._id, priya._id, sarah._id, marcus._id]
    });

    const project2 = new Project({
      name: 'Smart Energy Grid Hub',
      description: 'Real-time municipal IoT power distribution telemetry and automated dynamic load-balancing.',
      startDate: new Date(now.getTime() - 20 * dayMs),
      deadline: new Date(now.getTime() + 6 * dayMs),
      status: 'Active',
      team: [abhra._id, david._id, sarah._id, priya._id]
    });

    const project3 = new Project({
      name: 'E-Commerce Mobile Experience Redesign',
      description: 'Design system overhaul, cart microfrontend modernization, and checkout funnel speed tuning.',
      startDate: new Date(now.getTime() - 5 * dayMs),
      deadline: new Date(now.getTime() + 50 * dayMs),
      status: 'Planning',
      team: [priya._id, sarah._id, david._id, marcus._id]
    });

    const [savedP1, savedP2, savedP3] = await Promise.all([
      project1.save(),
      project2.save(),
      project3.save()
    ]);

    // Update members' projects array
    await TeamMember.findByIdAndUpdate(abhra._id, { $addToSet: { projects: [savedP1._id, savedP2._id] } });
    await TeamMember.findByIdAndUpdate(priya._id, { $addToSet: { projects: [savedP1._id, savedP2._id, savedP3._id] } });
    await TeamMember.findByIdAndUpdate(david._id, { $addToSet: { projects: [savedP2._id, savedP3._id] } });
    await TeamMember.findByIdAndUpdate(sarah._id, { $addToSet: { projects: [savedP1._id, savedP2._id, savedP3._id] } });
    await TeamMember.findByIdAndUpdate(marcus._id, { $addToSet: { projects: [savedP1._id, savedP3._id] } });

    // 3. Seed Tasks (15 tasks)
    console.log('[Seed] Creating 15 tasks across projects...');
    const tasksData = [
      // Project 1 (6 tasks)
      {
        title: 'Sensor fusion ROS2 driver integration',
        description: 'Implement IMU and optical flow kalman filter in ROS2 node.',
        project: savedP1._id,
        assignedTo: abhra._id,
        deadline: new Date(now.getTime() - 15 * dayMs),
        status: 'Done',
        priority: 'High',
        issueNotes: ''
      },
      {
        title: 'LiDAR SLAM point-cloud filtering',
        description: 'Voxel grid downsampling and obstacle distance extraction.',
        project: savedP1._id,
        assignedTo: sarah._id,
        deadline: new Date(now.getTime() - 8 * dayMs),
        status: 'Done',
        priority: 'Medium',
        issueNotes: ''
      },
      {
        title: 'Obstacle detection boundary unit tests',
        description: 'Automated synthetic bounding-box penetration suite.',
        project: savedP1._id,
        assignedTo: marcus._id,
        deadline: new Date(now.getTime() + 8 * dayMs),
        status: 'In Progress',
        priority: 'Medium',
        issueNotes: ''
      },
      {
        title: 'Ground station WebSockets telemetry UI',
        description: 'Live pitch/roll/altitude dashboard widget.',
        instructions: 'Please integrate the binary payload parser from the drone team and ensure the roll/pitch attitude gauge runs at 60 FPS without frame drops on lower-spec field laptops.',
        project: savedP1._id,
        assignedTo: priya._id,
        deadline: new Date(now.getTime() + 12 * dayMs),
        status: 'In Progress',
        priority: 'High',
        issueNotes: 'Intermittent packet loss on 5.8GHz video transmitter feed under load.',
        comments: [
          {
            author: 'Abhra Purkait',
            authorId: 'admin',
            text: 'Attitude HUD graphics need to conform to MIL-STD-1787B symbology if possible.',
            createdAt: new Date(now.getTime() - 2 * dayMs),
          }
        ],
        activityLog: [
          { action: 'Task assigned to Priya Sharma', by: 'abhra purkait', at: new Date(now.getTime() - 5 * dayMs) },
          { action: 'Status changed to In Progress', by: 'Priya Sharma', at: new Date(now.getTime() - 3 * dayMs) }
        ]
      },
      {
        title: 'Edge TPU inference pipeline optimization',
        description: 'Quantize YOLOv8 nano model for low-latency neural processing.',
        instructions: 'Focus on INT8 post-training quantization. The inference latency must stay below 15ms per frame on the Coral USB accelerator.',
        project: savedP1._id,
        assignedTo: david._id,
        deadline: new Date(now.getTime() + 25 * dayMs),
        status: 'To Do',
        priority: 'High',
        issueNotes: ''
      },
      {
        title: 'Field test battery endurance validation',
        description: 'Outdoor waypoint navigation in 15kt headwind conditions.',
        project: savedP1._id,
        assignedTo: marcus._id,
        deadline: new Date(now.getTime() + 35 * dayMs),
        status: 'To Do',
        priority: 'Low',
        issueNotes: ''
      },

      // Project 2 (5 tasks - tight schedule with overdue items)
      {
        title: 'IoT smart meter MQTT ingestion microservice',
        description: 'Handle 50k packets/sec from smart meter mesh gateways.',
        project: savedP2._id,
        assignedTo: david._id,
        deadline: new Date(now.getTime() - 12 * dayMs),
        status: 'Done',
        priority: 'High',
        issueNotes: ''
      },
      {
        title: 'Substation load balancer failover protocol',
        description: 'Automated relay routing when phase delta exceeds tolerance.',
        project: savedP2._id,
        assignedTo: abhra._id,
        deadline: new Date(now.getTime() - 4 * dayMs),
        status: 'Done',
        priority: 'Urgent',
        issueNotes: ''
      },
      {
        title: 'Dynamic grid load surge alerts',
        description: 'Push notification dispatch when peak demand approaches 92% capacity.',
        project: savedP2._id,
        assignedTo: sarah._id,
        deadline: new Date(now.getTime() - 2 * dayMs), // Overdue!
        status: 'In Progress',
        priority: 'High',
        issueNotes: 'Awaiting API access credentials for regional utility grid partner.'
      },
      {
        title: 'Historical consumption time-series aggregation',
        description: 'Hourly rollup cache for municipal utility billing portal.',
        project: savedP2._id,
        assignedTo: david._id,
        deadline: new Date(now.getTime() - 3 * dayMs), // Overdue!
        status: 'To Do',
        priority: 'Urgent',
        issueNotes: 'High memory utilization during bulk replay on staging DB.'
      },
      {
        title: 'Grid operations dashboard live heatmaps',
        description: 'Geo-spatial thermal map overlay for power lines and transformers.',
        project: savedP2._id,
        assignedTo: priya._id,
        deadline: new Date(now.getTime() + 4 * dayMs),
        status: 'To Do',
        priority: 'Medium',
        issueNotes: ''
      },

      // Project 3 (4 tasks - early stage)
      {
        title: 'Mobile checkout flow UX wireframes and user testing',
        description: 'Figma prototypes tested with 12 consumer participants.',
        project: savedP3._id,
        assignedTo: priya._id,
        deadline: new Date(now.getTime() - 2 * dayMs),
        status: 'Done',
        priority: 'Medium',
        issueNotes: ''
      },
      {
        title: 'Micro-frontend cart state architecture',
        description: 'Cross-tab synchronized cart drawer using BroadcastChannel.',
        project: savedP3._id,
        assignedTo: sarah._id,
        deadline: new Date(now.getTime() + 18 * dayMs),
        status: 'To Do',
        priority: 'Medium',
        issueNotes: ''
      },
      {
        title: 'Stripe payment intent webhook idempotency tests',
        description: 'Prevent double charge under flaky 3G mobile connections.',
        project: savedP3._id,
        assignedTo: david._id,
        deadline: new Date(now.getTime() + 28 * dayMs),
        status: 'To Do',
        priority: 'High',
        issueNotes: ''
      },
      {
        title: 'Accessibility audit WCAG 2.1 AA compliance',
        description: 'VoiceOver and TalkBack navigation walkthrough for all flows.',
        project: savedP3._id,
        assignedTo: marcus._id,
        deadline: new Date(now.getTime() + 42 * dayMs),
        status: 'To Do',
        priority: 'Low',
        issueNotes: 'Screen reader announced duplicate elements in payment drawer.'
      }
    ];

    await Task.insertMany(tasksData);

    // Auto-calculate progress % for each project from tasks
    console.log('[Seed] Auto-calculating project progress % from tasks...');
    await Promise.all([
      recalculateProjectProgress(savedP1._id),
      recalculateProjectProgress(savedP2._id),
      recalculateProjectProgress(savedP3._id)
    ]);

    // Inspect digital twins
    console.log('[Seed] Verifying Digital Twin models...');
    const twin1 = await buildProjectDigitalTwin(savedP1._id);
    const twin2 = await buildProjectDigitalTwin(savedP2._id);
    const twin3 = await buildProjectDigitalTwin(savedP3._id);

    console.log(`✓ Twin 1 [${savedP1.name}]: Progress ${twin1.computedMetrics.progressPercent}%, Health: ${twin1.health.status}`);
    console.log(`✓ Twin 2 [${savedP2.name}]: Progress ${twin2.computedMetrics.progressPercent}%, Health: ${twin2.health.status}`);
    console.log(`✓ Twin 3 [${savedP3.name}]: Progress ${twin3.computedMetrics.progressPercent}%, Health: ${twin3.health.status}`);

    console.log('\n[Seed] Database seeded successfully! 3 projects, 5 members, 15 tasks.');
    if (exitOnComplete) {
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seed Error]:', err);
    if (exitOnComplete) {
      process.exit(1);
    }
    throw err;
  }
};

export { seedDatabase };

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase(true);
}

