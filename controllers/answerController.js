import Answer from "../models/answersModel.js";
import Doubt from "../models/doubtsModel.js";

// 1. Create a New Answer

// This function handles a faculty member submitting an answer to a doubt
export const createAnswer = async (req, res, next) => {
    try {
        //answer content , file , doubtId are from 
        //user data is from req.user
        //we need to update the doubt document
        const { doubtId, content, attachments } = req.body;
        const loggedInUser = req.user; // We expect this to be a faculty member based on our route
        // First, let's make sure the doubt actually exists in the database
        const doubt = await Doubt.findById(doubtId);
        if (!doubt) {
            return res.status(404).json({ success: false, message: "Doubt not found" });
        }

        if (
            doubt.collegeId.toString() !== loggedInUser.collegeId.toString() ||
            doubt.departmentId.toString() !== loggedInUser.departmentId.toString()
        ) {
            return res.status(403).json({ success: false, message: "Not authorized to answer this doubt" });
        }

        if (!loggedInUser.subjectIds.some((subjectId) => subjectId.toString() === doubt.subjectId.toString())) {
            return res.status(403).json({ success: false, message: "Not authorized to answer doubts for this subject" });
        }

        // Create the answer document in the database
        const newAnswer = await Answer.create({
            collegeId: doubt.collegeId,
            departmentId: doubt.departmentId,
            facultyId: loggedInUser._id,          
            doubtId: doubtId,
            content: content,
            attachments: attachments || []
        });

      
        // 2. Cross-Update the Doubt Document

        // We need to update the original doubt in a few ways:
        let doubtNeedsSaving = false;

        // If this is the VERY FIRST answer, record the exact time it was answered
        if (!doubt.firstAnsweredAt) {
            doubt.firstAnsweredAt = new Date();
            doubtNeedsSaving = true;
        }

        if (doubt.status !== "closed") {
            doubt.status = "resolved";
            doubt.assignedFacultyId = loggedInUser._id;
            doubt.resolvedAt = new Date();
            doubtNeedsSaving = true;
        }

        // Save the doubt ONLY if we made changes to it
        if (doubtNeedsSaving) {
            await doubt.save();
        }

        return res.status(201).json({
            success: true,
            message: "Answer posted successfully",
            data: { answer: newAnswer },
        });

    } catch (error) {
        next(error);
    }
};


// 3. Get All Answers for a Specific Doubt

// This function fetches all answers tied to a specific doubt ID
// for viewing the asnwer in  the doubt page by both student and faculty
export const getAnswersByDoubt = async (req, res, next) => {
    try {
        const { doubtId } = req.params;
        const loggedInUser = req.user;
        const doubt = await Doubt.findById(doubtId);

        if (!doubt) {
            return res.status(404).json({ success: false, message: "Doubt not found" });
        }

        if (loggedInUser.role !== "admin" && doubt.collegeId.toString() !== loggedInUser.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to view answers for this doubt" });
        }

        if (["hod", "faculty", "student"].includes(loggedInUser.role) && doubt.departmentId.toString() !== loggedInUser.departmentId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to view answers outside your department" });
        }

        // Find all answers where the doubtId matches.
        // We use .populate() to grab the faculty's name and email so we can display it on the frontend.
        const answers = await Answer.find({ doubtId })
            .populate("facultyId", "name email")
            .sort({ createdAt: 1 }); // Sort by oldest first (chronological order)

        return res.status(200).json({
            success: true,
            data: { answers },
        });

    } catch (error) {
        next(error);
    }
};


// 4. Accept an Answer

// Marks a specific answer as the "Accepted" correct answer, and resolves the doubt.
export const acceptAnswer = async (req, res, next) => {
    try {
        const { answerId } = req.params;
        const loggedInUser = req.user;

        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ success: false, message: "Answer not found" });
        }

        const doubt = await Doubt.findById(answer.doubtId);
        if (!doubt) {
            return res.status(404).json({ success: false, message: "Associated doubt not found" });
        }

        if (loggedInUser.role !== "admin" && doubt.collegeId.toString() !== loggedInUser.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to accept this answer" });
        }

        if (loggedInUser.role === "hod" && doubt.departmentId.toString() !== loggedInUser.departmentId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to accept answers outside your department" });
        }
        
        // Authorization: Only the student who asked the doubt (or a department HOD/Admin) should be able to accept it
        if (loggedInUser.role === 'student' && doubt.studentId.toString() !== loggedInUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the student who asked the doubt can accept an answer" });
        }

        // Mark the answer as accepted
        answer.isAccepted = true;
        await answer.save();

        // Also mark the original doubt as closed since it now has an accepted answer
        if (doubt.status !== "closed") {
            doubt.status = "closed";
            doubt.resolvedAt = new Date();
            await doubt.save();
        }

        return res.status(200).json({
            success: true,
            message: "Answer marked as accepted successfully",
            data: { answer },
        });

    } catch (error) {
        next(error);
    }
};

// This is triggered when a student reads an answer, realizes it solved their problem, and clicks an "Accept Answer" button.

// Step 1: Fetch the Answer & Doubt We look up the Answer using the ID from the URL. We then use that answer's doubtId to look up the original Doubt document.

// Step 2: Security Authorization We run a strict check: If the person clicking the button is a student, we check if their User ID matches the studentId on the Doubt document. If they didn't ask the question, they are absolutely NOT allowed to accept the answer, and we throw a 403 Forbidden error.

// Step 3: Update the Answer We flip the boolean answer.isAccepted = true and save the answer.

// Step 4: Update the Doubt Status Because the student accepted an answer, the doubt is officially resolved!

// We change the doubt's status to "resolved".
// We record the exact time in resolvedAt = new Date().
// We save the doubt.
