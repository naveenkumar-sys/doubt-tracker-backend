import Subject from "../models/subjectsModel.js";
import User from "../models/UserModel.js";

// Create a new subject
// Only HOD can create subjects - collegeId and departmentId are auto-assigned from their session
const createSubject = async (req, res, next) => {
    try {
        const { name, code, semester } = req.body;
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
        const newSubject = await Subject.create({ name, code, semester, collegeId, departmentId });

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
        const { semester } = req.query;

        const loggedInUser = req.user;

        if (loggedInUser.role !== "admin" && loggedInUser.departmentId.toString() !== departmentId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view subjects outside your department",
            });
        }

        const filter = { departmentId };

        if (loggedInUser.role !== "admin") {
            filter.collegeId = loggedInUser.collegeId;
        }

        if (semester) {
            filter.semester = parseInt(semester);
        }

        if (["student", "faculty"].includes(loggedInUser.role)) {
            filter.isActive = true;
        }

        const subjects = await Subject.find(filter).sort({ createdAt: -1 });

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

        if (req.user.departmentId.toString() !== subject.departmentId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update subjects outside your department",
            });
        }

        const updatedSubject = await Subject.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Subject status updated successfully",
            data: {
                subject: updatedSubject,
            },
        });
    } catch (error) {
        next(error);
    }
};

const assignFacultyToSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { facultyId } = req.body;
        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        if (req.user.departmentId.toString() !== subject.departmentId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to assign faculty to this subject" });
        }

        const faculty = await User.findOne({
            _id: facultyId,
            role: "faculty",
            collegeId: req.user.collegeId,
            departmentId: req.user.departmentId,
            isActive: true,
        });

        if (!faculty) {
            return res.status(404).json({ success: false, message: "Active faculty not found in your department" });
        }

        if (!subject.facultyIds.some((idValue) => idValue.toString() === faculty._id.toString())) {
            subject.facultyIds.push(faculty._id);
        }

        if (!faculty.subjectIds.some((idValue) => idValue.toString() === subject._id.toString())) {
            faculty.subjectIds.push(subject._id);
        }

        await subject.save();
        await faculty.save();

        return res.status(200).json({
            success: true,
            message: "Faculty assigned to subject successfully",
            data: { subject },
        });
    } catch (error) {
        next(error);
    }
};

export { assignFacultyToSubject, createSubject, getSubjectsByDepartment, updateSubjectStatus };
