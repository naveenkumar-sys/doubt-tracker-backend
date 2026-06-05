import User from '../models/UserModel.js';

// List active faculty users for the logged-in HOD's college+department with status
export const getFacultyForHod = async (req, res, next) => {
    try {

        const loggedInUser = req.user; // This comes from your authenticate middleware this user is whether admin or hod

        if (loggedInUser.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admins cannot access this endpoint. This is only for HODs to view their department's faculty.",
            });
        }

        // For HOD, we fetch faculty only from their own college and department
        const faculty = await User.find({
            role: 'faculty',
            collegeId: loggedInUser.collegeId,
            departmentId: loggedInUser.departmentId,
        });

        return res.status(200).json({
            success: true,
            data: { faculty },
        });
    } catch (error) {
        next(error);
    }
};


//update faculty status
const updateFacultyStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const faculty = await User.findOne({ _id: id, role: 'faculty' });

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found",
            });
        }

        // Only allow updating faculty within the same department and college as the logged-in HOD
        if (faculty.collegeId.toString() !== req.user.collegeId.toString() ||
            faculty.departmentId.toString() !== req.user.departmentId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update faculty outside your department",
            });
        }

        faculty.isActive = isActive;
        await faculty.save();

        return res.status(200).json({
            success: true,
            data: { faculty },
            message: "Faculty status updated successfully",
        });
    } catch (error) {
        next(error);
    }
};

export { updateFacultyStatus };

