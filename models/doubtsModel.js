import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 180,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    topic: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "in_progress", "resolved", "closed", "revision_requested"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
    assignedFacultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    similarDoubtIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doubt",
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    firstAnsweredAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    resubmitReason: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    resubmitCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);
//for text search on title, description, tags, and topic
doubtSchema.index({ title: "text", description: "text", tags: "text", topic: "text" });
//compound index for efficient querying by college, department, subject, status, and creation date
doubtSchema.index({ collegeId: 1, departmentId: 1, subjectId: 1, status: 1, createdAt: -1 });
//compound index for efficient querying by assigned faculty, status, and creation date
doubtSchema.index({ assignedFacultyId: 1, status: 1, createdAt: -1 });

const Doubt = mongoose.model("Doubt", doubtSchema);

export default Doubt;
