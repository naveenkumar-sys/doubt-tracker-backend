// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema(
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
//     recipientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },
//     type: {
//       type: String,
//       enum: [
//         "new_doubt",
//         "answer_added",
//         "doubt_resolved",
//         "clarification_requested",
//         "report_ready",
//         "doubt_assigned",
//       ],
//       required: true,
//       index: true,
//     },
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 160,
//     },
//     message: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 1000,
//     },
//     relatedEntityType: {
//       type: String,
//       enum: ["college", "department", "doubt", "answer", "report", "subject", "user"],
//     },
//     relatedEntityId: {
//       type: mongoose.Schema.Types.ObjectId,
//     },
//     isRead: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },
//     readAt: {
//       type: Date,
//     },
//   },
//   { timestamps: true }
// );

// notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

// const Notification = mongoose.model("Notification", notificationSchema);

// export default Notification;
