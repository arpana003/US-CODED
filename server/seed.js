/**
 * Seed Script
 * Creates sample data: 3 projects, 5 members, 15 tasks
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const TeamMember = require('./models/TeamMember');
const Task = require('./models/Task');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Project.deleteMany();
    await TeamMember.deleteMany();
    await Task.deleteMany();
    console.log('🗑️  Cleared existing data');

    // ── Seed Team Members ─────────────────────────────────────────
    const members = await TeamMember.insertMany([
      { name: 'Alice Chen', email: 'alice@digitaltwin.dev', role: 'Project Manager' },
      { name: 'Bob Martinez', email: 'bob@digitaltwin.dev', role: 'Backend Developer' },
      { name: 'Carol White', email: 'carol@digitaltwin.dev', role: 'Frontend Developer' },
      { name: 'David Kim', email: 'david@digitaltwin.dev', role: 'DevOps Engineer' },
      { name: 'Eva Patel', email: 'eva@digitaltwin.dev', role: 'UI/UX Designer' },
    ]);
    console.log(`👥 Created ${members.length} team members`);

    const [alice, bob, carol, david, eva] = members;
    const now = new Date();

    // ── Seed Projects ─────────────────────────────────────────────
    const projects = await Project.insertMany([
      {
        name: 'E-Commerce Platform Rebuild',
        description: 'Complete redesign and rebuild of the existing e-commerce platform with modern stack, improved performance, and better UX.',
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        deadline: new Date(now.getFullYear(), now.getMonth() + 1, 30),
        status: 'Active',
        progress: 0,
        team: [alice._id, bob._id, carol._id, eva._id],
        color: '#6366f1',
      },
      {
        name: 'Internal Analytics Dashboard',
        description: 'Build a real-time analytics dashboard for internal business metrics and KPI tracking.',
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        deadline: new Date(now.getFullYear(), now.getMonth() + 2, 15),
        status: 'Active',
        progress: 0,
        team: [alice._id, carol._id, david._id],
        color: '#0ea5e9',
      },
      {
        name: 'Mobile App MVP',
        description: 'Develop a minimum viable product for the mobile application targeting iOS and Android platforms.',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        deadline: new Date(now.getFullYear(), now.getMonth() + 3, 1),
        status: 'Planning',
        progress: 0,
        team: [alice._id, bob._id, eva._id, david._id],
        color: '#f59e0b',
      },
    ]);
    console.log(`📁 Created ${projects.length} projects`);

    const [ecomm, analytics, mobile] = projects;

    // Update team member project references
    await TeamMember.updateMany({ _id: { $in: [alice._id, bob._id, carol._id, eva._id] } }, { $addToSet: { projects: ecomm._id } });
    await TeamMember.updateMany({ _id: { $in: [alice._id, carol._id, david._id] } }, { $addToSet: { projects: analytics._id } });
    await TeamMember.updateMany({ _id: { $in: [alice._id, bob._id, eva._id, david._id] } }, { $addToSet: { projects: mobile._id } });

    // ── Seed Tasks ────────────────────────────────────────────────
    const past = (days) => new Date(now.getTime() - days * 86400000);
    const future = (days) => new Date(now.getTime() + days * 86400000);

    await Task.insertMany([
      // ─ E-Commerce Platform (5 tasks)
      {
        title: 'Set up project repository and CI/CD pipeline',
        description: 'Initialize Git repo, configure GitHub Actions for automated testing and deployment.',
        project: ecomm._id,
        assignedTo: david._id,
        deadline: past(10),
        status: 'Done',
        priority: 'High',
        issueNotes: '',
      },
      {
        title: 'Design system & component library',
        description: 'Create reusable UI components: buttons, inputs, cards, modals following the new brand guidelines.',
        project: ecomm._id,
        assignedTo: eva._id,
        deadline: past(5),
        status: 'Done',
        priority: 'High',
        issueNotes: '',
      },
      {
        title: 'Product catalog API development',
        description: 'RESTful API for product listing, filtering, searching, and pagination.',
        project: ecomm._id,
        assignedTo: bob._id,
        deadline: future(3),
        status: 'In Progress',
        priority: 'High',
        issueNotes: 'Performance issue with search indexing on large datasets — evaluating Elasticsearch vs MongoDB Atlas Search.',
      },
      {
        title: 'Shopping cart & checkout flow',
        description: 'Implement cart management, checkout wizard, and payment gateway integration.',
        project: ecomm._id,
        assignedTo: carol._id,
        deadline: future(10),
        status: 'In Progress',
        priority: 'Critical',
        issueNotes: '',
      },
      {
        title: 'User authentication & authorization',
        description: 'JWT-based auth, OAuth2 (Google, GitHub), role-based access control.',
        project: ecomm._id,
        assignedTo: bob._id,
        deadline: past(2),
        status: 'To Do',
        priority: 'Critical',
        issueNotes: 'Blocked: Awaiting security review approval from compliance team.',
      },

      // ─ Analytics Dashboard (5 tasks)
      {
        title: 'Data pipeline architecture design',
        description: 'Design the ETL pipeline for ingesting and processing business metrics from multiple sources.',
        project: analytics._id,
        assignedTo: alice._id,
        deadline: past(7),
        status: 'Done',
        priority: 'High',
        issueNotes: '',
      },
      {
        title: 'Real-time data ingestion service',
        description: 'WebSocket-based service for streaming live metrics to the dashboard.',
        project: analytics._id,
        assignedTo: david._id,
        deadline: future(5),
        status: 'In Progress',
        priority: 'High',
        issueNotes: '',
      },
      {
        title: 'KPI visualization components',
        description: 'Build chart components for revenue, user growth, conversion rates, and churn.',
        project: analytics._id,
        assignedTo: carol._id,
        deadline: future(8),
        status: 'In Progress',
        priority: 'Medium',
        issueNotes: '',
      },
      {
        title: 'Dashboard filters and date range selector',
        description: 'Implement global filter controls: date picker, segment selectors, comparison mode.',
        project: analytics._id,
        assignedTo: carol._id,
        deadline: future(14),
        status: 'To Do',
        priority: 'Medium',
        issueNotes: '',
      },
      {
        title: 'Export to PDF/CSV feature',
        description: 'Allow users to export dashboard data and charts to PDF or CSV format.',
        project: analytics._id,
        assignedTo: david._id,
        deadline: past(1),
        status: 'To Do',
        priority: 'Low',
        issueNotes: 'Deprioritized — deadline may need to be pushed based on core feature completion.',
      },

      // ─ Mobile App MVP (5 tasks)
      {
        title: 'Technical architecture & stack selection',
        description: 'Evaluate React Native vs Flutter, decide on state management, offline strategy.',
        project: mobile._id,
        assignedTo: alice._id,
        deadline: future(2),
        status: 'Done',
        priority: 'Critical',
        issueNotes: '',
      },
      {
        title: 'User onboarding flow design',
        description: 'Wireframes and interactive prototypes for the onboarding experience.',
        project: mobile._id,
        assignedTo: eva._id,
        deadline: future(7),
        status: 'In Progress',
        priority: 'High',
        issueNotes: '',
      },
      {
        title: 'Core navigation structure',
        description: 'Implement tab navigation, stack navigation, and deep linking support.',
        project: mobile._id,
        assignedTo: bob._id,
        deadline: future(12),
        status: 'To Do',
        priority: 'High',
        issueNotes: '',
      },
      {
        title: 'Push notifications setup',
        description: 'Configure FCM for Android and APNs for iOS, implement notification preferences.',
        project: mobile._id,
        assignedTo: david._id,
        deadline: future(20),
        status: 'To Do',
        priority: 'Medium',
        issueNotes: '',
      },
      {
        title: 'Offline data sync mechanism',
        description: 'Implement local storage with conflict resolution for offline-first functionality.',
        project: mobile._id,
        assignedTo: bob._id,
        deadline: future(25),
        status: 'To Do',
        priority: 'Medium',
        issueNotes: '',
      },
    ]);
    console.log('✅ Created 15 tasks');

    // Recalculate project progress
    for (const proj of [ecomm, analytics, mobile]) {
      const p = await Project.findById(proj._id);
      await p.recalculateProgress();
    }
    console.log('📊 Recalculated project progress');

    // Show final progress
    const finalProjects = await Project.find({}, 'name progress status');
    finalProjects.forEach((p) => {
      console.log(`   ${p.name}: ${p.progress}% (${p.status})`);
    });

    console.log('\n🎉 Seed complete! Database is populated.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
