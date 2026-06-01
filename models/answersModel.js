import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
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
    doubtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doubt",
      required: true,
      index: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 10000,
    },
    attachments: [
      {
        fileName: {
          type: String,
          trim: true,
        },
        fileUrl: {
          type: String,
          trim: true,
        },
        fileType: {
          type: String,
          trim: true,
        },
      },
    ],
    isAccepted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

answerSchema.index({ content: "text" });

const Answer = mongoose.model("Answer", answerSchema);

export default Answer;
