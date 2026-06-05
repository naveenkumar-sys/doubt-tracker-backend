import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    hodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // getting college id from frontend to maintain the relationship between college and department, this allows us to easily query departments by college and enforce unique department codes within the same college.
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive"],
      index: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure that department codes are unique within the same college, this prevents duplicate department codes in the same college while allowing the same code to be used in different colleges.
departmentSchema.index({ collegeId: 1, code: 1 }, { unique: true });

const Department = mongoose.model("Department", departmentSchema);

export default Department;
