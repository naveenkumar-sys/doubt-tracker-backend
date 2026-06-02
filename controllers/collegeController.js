import College from "../models/collegeModel.js";

//create a college 
const createCollege = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    // Check if a college with the same name or code already exists by trimming and converting to uppercase for code with $or operator is used to check for either condition 
    // It checks either the name matches or the code matches in the database if either condition is true it will return the existing college otherwise it will proceed to create a new college
    const existingCollege = await College.findOne({
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() },
      ],
    });

    if (existingCollege) {
      return res.status(409).json({
        success: false,
        message: "College name or code already exists",
      });
    }

    const college = await College.create({
      name,
      code,
    });

    return res.status(201).json({
      success: true,
      message: "College created successfully",
      data: {
        college,
      },
    });
  } catch (error) {
    // Pass the error to the error handling middleware to handle it in a centralized way and return an appropriate response to the client
    //It return certain or particulr message to client for easy debugging and understanding of the error
    next(error);
  }
};

//get all colleges
const getColleges = async (req, res, next) => {
  try {
    // Find all colleges and sort them by creation date in descending order (newest first)
    const colleges = await College.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        colleges,
      },
    });
  } catch (error) {
    // Pass the error to the error handling middleware to handle it in a centralized way and return an appropriate response to the client
    next(error);
  }
};

//get college by id
const getCollegeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const findCollege = await College.findById(id);

    if (!findCollege) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        college: findCollege,
      },
    });
  } catch (error) {
    // Pass the error to the error handling middleware to handle it in a centralized way and return an appropriate response to the client
    next(error);
  }
};

//updating the college status (active/inactive) by id
const updateCollegeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const findCollege = await College.findById(id);

    if (!findCollege) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // checking id already exist by id and req.params.id is used to get the id from the request parameters and compare it with the id in the database if it matches then it will update the isActive status of the college otherwise it will return a 404 error if the college is not found
    const college = await College.findByIdAndUpdate(
      id,
      { isActive: req.body.isActive },
      { new: true, runValidators: true }
    );

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "College status updated successfully",
      data: {
        college,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  createCollege,
  getCollegeById,
  getColleges,
  updateCollegeStatus,
};
