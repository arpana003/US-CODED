import mongoose from 'mongoose';

const aiRecommendationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    type: {
      type: String,
      enum: ['DELAY_RISK', 'WORKLOAD', 'TASK_PRIORITY', 'RISK', 'GENERAL'],
      default: 'GENERAL'
    },
    evidence: {
      type: String,
      trim: true,
      default: ''
    },
    expectedBenefit: {
      type: String,
      trim: true,
      default: ''
    },
    suggestedAction: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['New', 'Accepted', 'Dismissed', 'Applied', 'Expired'],
      default: 'New'
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date,
      default: null
    },
    respondedBy: {
      type: String,
      default: ''
    },
    auditNote: {
      type: String,
      default: ''
    },
    aiVersion: {
      type: String,
      default: '1.0'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('AIRecommendation', aiRecommendationSchema);
