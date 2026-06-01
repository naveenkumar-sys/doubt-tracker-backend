import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    weekStart: {
      type: Date,
      required: true,
      index: true,
    },
    weekEnd: {
      type: Date,
      required: true,
      index: true,
    },
    metricsSnapshot: {
      totalDoubts: {
        type: Number,
        default: 0,
      },
      newDoubts: {
        type: Number,
        default: 0,
      },
      resolvedDoubts: {
        type: Number,
        default: 0,
      },
      pendingDoubts: {
        type: Number,
        default: 0,
      },
      averageResolutionHours: {
        type: Number,
        default: 0,
      },
      subjectWiseStats: [
        {
          subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
          },
          totalDoubts: {
            type: Number,
            default: 0,
          },
          resolvedDoubts: {
            type: Number,
            default: 0,
          },
        },
      ],
      facultyWiseStats: [
        {
          facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          assignedDoubts: {
            type: Number,
            default: 0,
          },
          answeredDoubts: {
            type: Number,
            default: 0,
          },
          resolvedDoubts: {
            type: Number,
            default: 0,
          },
          averageFirstResponseHours: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    aiSummary: {
      type: String,
      trim: true,
    },
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      index: true,
    },
    emailError: {
      type: String,
      trim: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

reportSchema.index({ collegeId: 1, departmentId: 1, weekStart: 1, weekEnd: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);

export default Report;
