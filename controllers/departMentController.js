import Department from "../models/departmentModel.js";



const createDepartment = async (req, res, next) => {
  try {
    const { name, code, collegeId } = req.body;
    // Check if a department with the same name or code already exists in the same college by trimming and converting to uppercase for code with $or operator is used to check for either condition
    // It checks either the name matches or the code matches in the database for the same college if either condition is true it will return the existing department otherwise it will proceed to create a new department
    const existingDepartment = await Department.findOne({
      collegeId,
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() },
      ],
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department name or code already exists in this college",
      });
    }

    const department = await Department.create({
      name,
      code,
      collegeId,
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: {
        department,
      },
    });
  } catch (error) {
    // Pass the error to the error handling middleware to handle it in a centralized way and return an appropriate response to the client
    //It return certain or particulr message to client for easy debugging and understanding of the error
    next(error);
  }
};

//get all departments
const getDepartments = async (req, res, next) => {
  try {
    // Find all departments and sort them by creation date in descending order (newest first)
    const departments = await Department.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        departments,
      },
    });
  } catch (error) {
    // Pass the error to the error handling middleware to handle it in a centralized way and return an appropriate response to the client
    next(error);
  }
};

//get department by id
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        department,
      },
    });
  } catch (error) {
    // Pass the error to the error handling middleware to handle it in a centralized way and return an appropriate response to the client
    next(error);
  }
};

//update department status
const updateDepartmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    department.isActive = isActive;
    await department.save();

    return res.status(200).json({
      success: true,
      message: "Department status updated successfully",
      data: {
        department,
      },
    });
  } catch (error) {
    // Pass the error to the error handling middleware to handle it in a centralized way and return an appropriate response to the client
    next(error);
  }
};

export {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartmentStatus,
};