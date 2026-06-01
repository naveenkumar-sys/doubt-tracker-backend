// import mongoose from "mongoose";

// const activityLogSchema = new mongoose.Schema(
//   {
//     collegeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "College",
//       index: true,
//     },
//     departmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Department",
//       index: true,
//     },
//     actorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       index: true,
//     },
//     action: {
//       type: String,
//       required: true,
//       trim: true,
//       index: true,
//     },
//     entityType: {
//       type: String,
//       required: true,
//       enum: ["college", "user", "department", "subject", "doubt", "answer", "notification", "report"],
//       index: true,
//     },
//     entityId: {
//       type: mongoose.Schema.Types.ObjectId,
//       index: true,
//     },
//     metadata: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {},
//     },
//   },
//   { timestamps: true }
// );

// activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

// const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

// export default ActivityLog;
