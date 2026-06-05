import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import College from '../models/collegeModel.js';
import Department from '../models/departmentModel.js';
// Create a new user
//This is for creating new user using role based user creation, for creating user we need to provide the role, collegeId and departmentId in body
// here admin only create hod and hod will create student and faculty so that we are checking the role of the user who is creating the new user if he is not admin or hod then he cannot create the user
export const createUser = async (req, res, next) => {
    try {
        // Use 'let' for collegeId and departmentId so we can safely overwrite them
        let { name, email, password, role, collegeId, departmentId, semester } = req.body;
        const loggedInUser = req.user; // This comes from your authenticate middleware this user is whether admin or hod 

        // ==========================================
        // RULE 1: If an ADMIN is creating a user
        // ==========================================
        if (loggedInUser.role === 'admin') {
            // Admins are only supposed to create HODs here if incoming req role is not hod so admin did not create the user right so throwing error 
            if (role !== 'hod') {
                return res.status(403).json({ success: false, message: "Admins can only create HOD accounts." });
            }
            // They MUST provide the college and department the HOD will belong to
            if (!collegeId || !departmentId) {
                return res.status(400).json({ success: false, message: "collegeId and departmentId are required." });
            }

            const department = await Department.findOne({ _id: departmentId, collegeId, isActive: true });
            const college = await College.findOne({ _id: collegeId, isActive: true });

            if (!college || !department) {
                return res.status(404).json({ success: false, message: "Active college or department not found." });
            }
        }

        // ==========================================
        // RULE 2: If an HOD is creating a user
        // ==========================================
        //logged in user or the user which is responsible for creating faculty adn student is hod
        // If loggedIn role is hod and req role are not student and faculty then it will throw error
        if (loggedInUser.role === 'hod') {
            // HODs can only create students and faculty
            if (role !== 'student' && role !== 'faculty') {
                return res.status(403).json({ success: false, message: "HODs can only create students and faculty." });
            }
            // We ignore whatever collegeId/departmentId the HOD sent in the body.
            // We force the new user to belong to the SAME college and department as the HOD!
            collegeId = loggedInUser.collegeId;
            departmentId = loggedInUser.departmentId;

            if (role === 'student' && !semester) {
                return res.status(400).json({ success: false, message: "Semester is required for student accounts." });
            }
        }

        // ==========================================
        // FINALLY: Create the user in the database
        // ==========================================
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        //If admin  create hod means department and college id are from req.body
        //If hod create student and faculty means department and college id are from loggedInUser
        const user = await User.create({ 
            name, 
            email: normalizedEmail, 
            password: hashedPassword, 
            role, 
            collegeId, 
            departmentId,
            semester: role === 'student' ? semester : undefined,
        });

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user: safeUser },
        });
    } catch (error) {
        next(error);
    }
};


//update user status
export const updateUserStatus = async(req,res,next)=>{
    try {
        const {id}=req.params;
        const {isActive}=req.body;
        const user=await User.findByIdAndUpdate(id,{isActive},{new:true});
        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }
        return res.status(200).json({success:true,message:"User status updated successfully",data:{user}});
    } catch (error) {
        next(error);
        
    }
}
