import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  authorId: { type: String, default: '' },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  by: { type: String, default: 'System' },
  at: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    // Admin instructions visible to the assigned employee
    instructions: {
      type: String,
      trim: true,
      default: ''
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    // References TeamMember (for backward compat with existing data)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember',
      default: null
    },
    deadline: {
      type: Date,
      required: [true, 'Task deadline is required']
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Under Review', 'Completed', 'Blocked', 'Done'],
      default: 'To Do'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    issueNotes: {
      type: String,
      trim: true,
      default: ''
    },
    // Note added by employee when marking as completed
    completionNote: {
      type: String,
      trim: true,
      default: ''
    },
    // Thread of comments from both admin and employee
    comments: [commentSchema],
    // Audit trail of status changes
    activityLog: [activitySchema],
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Task', taskSchema);
