import Doubt from "../models/doubtsModel.js";
import Subject from "../models/subjectsModel.js";

// Create a new doubt (Only students)
export const createDoubt = async (req, res, next) => {
    try {
        const { title, description, subjectId, tags, topic } = req.body;
        const loggedInUser = req.user;
        const subject = await Subject.findOne({
            _id: subjectId,
            collegeId: loggedInUser.collegeId,
            departmentId: loggedInUser.departmentId,
            semester: loggedInUser.semester,
            isActive: true,
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Active subject not found for your department and semester",
            });
        }

        const newDoubt = await Doubt.create({
            title,
            description,
            studentId: loggedInUser._id,
            collegeId: loggedInUser.collegeId,
            departmentId: loggedInUser.departmentId,
            subjectId,
            semester: loggedInUser.semester,
            tags,
            topic,
            status: "pending"
        });

        return res.status(201).json({
            success: true,
            message: "Doubt submitted successfully",
            data: { doubt: newDoubt },
        });
    } catch (error) {
        next(error);
    }
};

// Get doubts with filtering, pagination and search
export const getDoubts = async (req, res, next) => {
    try {
        // Frontend calls:

        //             GET /api/doubts?status=pending&page=2&limit=10

        //             Everything after the ? is called the query string.

        //             status=pending
        //             page=2
        //             limit=10
        const { subjectId, status, search, page = 1, limit = 10 } = req.query;
        const loggedInUser = req.user;

        // Base filter: only show doubts in the user's college and department
        //creating a filters in an object  by using the logged in user's college and department id
        const filter = {};

        if (loggedInUser.role !== "admin") {
            filter.collegeId = loggedInUser.collegeId;
            filter.departmentId = loggedInUser.departmentId;
        }

        //Add subject filter if provided 
        if (subjectId) filter.subjectId = subjectId;
        //Add status filter if provided 
        if (status) filter.status = status;

        //Add search filter if provided using text search operator in mongodb and search in title and description
        if (search) {
            filter.$text = { $search: search };
        }
        // Calculate the number of documents to skip based on pagination parameters example page = 1, limit = 10, skip = 0; page = 2, limit = 10, skip = 10; page = 3, limit = 10, skip = 20 and so on 
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // if text search is enabled, sort by text score, otherwise sort by createdAt descending
        // complet flow is if search is enabled, sort by text score, otherwise sort by createdAt descending
        let sortOption = { createdAt: -1 };
        let selectOption = {};
        // if search is enabled, sort by text score, otherwise sort by createdAt descending and add text score to select options
        if (search) {
            sortOption = { score: { $meta: "textScore" } };
            selectOption = { score: { $meta: "textScore" } };
        }
        //  this is most important part of the query first retrive doubts based on filter  
        // sort by score if search is enabled otherwise sort by createdAt descending and skip the number of documents to skip based on pagination parameters 
        // then populate the studentId and subjectId and assignedFacultyId from the doubts collection based on the filter and sort and skip and limit 
        // populate is used to retrive the data from the other collections based on the references id we stored 
        // the populate function is used to retrive the data from the other collections based on the references id we stored in the doubts collection
        // we used populate to retrive the data from the other collections based on the references id we stored in the doubts collection
        // sort option is used to sort the doubts based on the text score if search is enabled otherwise sort by createdAt descending 
        // this is a very important part of the query 
        const doubts = await Doubt.find(filter, selectOption)
            .populate("studentId", "name email")
            .populate("subjectId", "name code")
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        // finding total number of doubts based on the filter 
        const total = await Doubt.countDocuments(filter);

        // return the doubts and pagination information in the response
        // pagination information is calculated based on the total number of doubts and the limit and page
        // this is a very important part of the query
        // this code is working fine
        // if search is enabled, sort by text score, otherwise sort by createdAt descending and add text score to select options
        // this is a very important part of the query
        // this code is working fine
        // if search is enabled, sort by text score, otherwise sort by createdAt descending and add text score to select options
        // this is a very important part of the query
        return res.status(200).json({
            success: true,
            data: {
                doubts,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single doubt by ID and increament view count +1 
export const getDoubtById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const loggedInUser = req.user;

        const doubtFilter = { _id: id };

        if (loggedInUser.role !== "admin") {
            doubtFilter.collegeId = loggedInUser.collegeId;
            doubtFilter.departmentId = loggedInUser.departmentId;
        }

        const doubt = await Doubt.findOneAndUpdate(
            doubtFilter,
            { $inc: { viewCount: 1 } }, // increment the view count this is for the analytics   later to displat  count 
            { new: true } // return the updated document
        )
        // .populate will check the id in the studentId reference from the doubts collection and retrive the data from the student collection
        // same for the subjectId and assignedFacultyId
        .populate("studentId", "name email")  // it retrives the data from the studentId reference  
        .populate("subjectId", "name code")  // it retrives the data from the subjectId reference  
        .populate("assignedFacultyId", "name email");  // it retrives the data from the assignedFacultyId reference  

        if (!doubt) {
            return res.status(404).json({ success: false, message: "Doubt not found" });
        }

        return res.status(200).json({
            success: true,
            data: { doubt },
        });
    } catch (error) {
        next(error);
    }
};

// Update doubt status
export const updateDoubtStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const loggedInUser = req.user;

        if (!loggedInUser) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const findDoubt = await Doubt.findById(id);

        if (!findDoubt) {
            return res.status(404).json({ success: false, message: "Doubt not found" });
        }

        if (loggedInUser.role !== "admin" && findDoubt.collegeId.toString() !== loggedInUser.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this doubt" });
        }

        if (["hod", "faculty"].includes(loggedInUser.role) && findDoubt.departmentId.toString() !== loggedInUser.departmentId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update doubt outside your department" });
        }


        // Authorization check:
        // Student can only update their own doubt 
        if (loggedInUser.role === 'student' && findDoubt.studentId.toString() !== loggedInUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this doubt" });
        }

        if (loggedInUser.role === "student" && status !== "closed") {
            return res.status(403).json({ success: false, message: "Students can only close their own resolved doubts" });
        }

        if (loggedInUser.role === "student" && findDoubt.status !== "resolved") {
            return res.status(400).json({ success: false, message: "Only resolved doubts can be closed by students" });
        }

        // Faculty can only update doubts in their own department
        if (loggedInUser.role === 'faculty' && !loggedInUser.subjectIds.some((subjectIdValue) => subjectIdValue.toString() === findDoubt.subjectId.toString())) {
            return res.status(403).json({ success: false, message: "Not authorized to update doubts for this subject" });
        }

        if (loggedInUser.role === "faculty" && !["in_progress", "resolved"].includes(status)) {
            return res.status(403).json({ success: false, message: "Faculty can only mark doubts as in progress or resolved" });
        }
        // ==========================================
        // 1. Handling the Resolution Timestamp
        // ==========================================
        // We check if the incoming status the user wants to set is "resolved" or "closed"
        if (status === "resolved" || status === "closed") {
            // We check the CURRENT status in the database (findDoubt.status). 
            // If it wasn't already resolved/closed, we record the EXACT date/time it was finished.
            // This prevents overwriting the original resolvedAt date if someone updates it later!
            if (findDoubt.status !== "resolved" && findDoubt.status !== "closed") {
                findDoubt.resolvedAt = new Date();
            }
        }

        // ==========================================
        // 2. Auto-Assigning the Faculty
        // ==========================================
        // If a faculty member sets the status to "in_progress", this automatically 
        // claims the doubt for them by saving their User ID into assignedFacultyId.
        if (status === "in_progress" && loggedInUser.role === 'faculty') {
            findDoubt.assignedFacultyId = loggedInUser._id;
        }

        // ==========================================
        // 3. Saving the Document
        // ==========================================
        // Apply the new status string to the document
        findDoubt.status = status;
        
        // Officially save all these changes (status, date, assigned faculty) into the MongoDB database
        await findDoubt.save();

        // ==========================================
        // 4. Sending the Response
        // ==========================================
        // Send a successful HTTP 200 response back to the frontend
        return res.status(200).json({
            success: true,
            message: "Doubt status updated successfully",
            // We use 'doubt: findDoubt' here so the frontend receives the standard 'doubt' key 
            // rather than the variable name 'findDoubt'
            data: { doubt: findDoubt },
        });
    } catch (error) {
        next(error);
    }
};
