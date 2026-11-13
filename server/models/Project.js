import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    deadline: {
      type: Date,
      required: [true, 'Project deadline is required']
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'Completed', 'On Hold'],
      default: 'Planning'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeamMember'
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Project', projectSchema);
