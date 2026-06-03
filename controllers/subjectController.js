import Subject from "../models/subjectsModel.js";

// Create a new subject
// Only HOD can create subjects - collegeId and departmentId are auto-assigned from their session
const createSubject = async (req, res, next) => {
    try {
        const { name, code } = req.body;
        const loggedInUser = req.user; // From authenticate middleware (HOD)

        // Auto-assign collegeId and departmentId from the logged-in HOD's session
        // HOD cannot create a subject outside their own department
        const collegeId = loggedInUser.collegeId;
        const departmentId = loggedInUser.departmentId;

        // Check if subject with the same code already exists in this department
        // (the compound index on model also enforces this, but we check early for a clear error message)
        const existingSubject = await Subject.findOne({ collegeId, departmentId, code: code.trim().toUpperCase() });
        if (existingSubject) {
            return res.status(409).json({ success: false, message: "Subject with this code already exists in your department." });
        }
        // Create the subject
        const newSubject = await Subject.create({ name, code, collegeId, departmentId });

        return res.status(201).json({
            success: true,
            message: "Subject created successfully",
            data: { subject: newSubject },
        });
    } catch (error) {
        next(error);
    }
};

// Get all subjects by department
const getSubjectsByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;

        const subjects = await Subject.find({ departmentId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: { subjects },
        });
    } catch (error) {
        next(error);
    }
};

//update subject status
const updateSubjectStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        subject.isActive = isActive;
        await subject.save();

        return res.status(200).json({
            success: true,
            message: "Subject status updated successfully",
            data: {
                subject,
            },
        });
    } catch (error) {
        // Pass the error to the error handling middleware to handle it in a centralized way and return an appropriate response to the client
        next(error);
    }
};

export { createSubject, getSubjectsByDepartment, updateSubjectStatus };
