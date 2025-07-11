require("dotenv").config();
const { User, validateUser } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  console.log("Registration attempt for:", req.body.email); 

  try {
 
    const { error } = validateUser(req.body);
    if (error) {
      console.log("Validation failed:", error.details);
      return res.status(400).json({
        status: "error",
        message: error.details.map((d) => d.message).join(", "),
      });
    }
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      console.log("User already exists:", req.body.email);
      return res.status(409).json({
        status: "error",
        message: "Email already registered",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
    });

    const savedUser = await user.save();
    console.log("Registration successful for:", savedUser.email);
    return res.status(201).json({
      status: "success",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    let errorMessage = "Internal Server Error";
    let statusCode = 500;

    if (error.name === "ValidationError") {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes("duplicate key")) {
      errorMessage = "Email already registered";
      statusCode = 409;
    }

    return res.status(statusCode).json({
      status: "error",
      message: errorMessage,
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};
const login = async (req, res) => {
  try {
    // 1. validateUser required fields
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // 3. Verify password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // 5. Generate token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET, // Remove the fallback
      { expiresIn: "7d" }
    );

    // 6. Successful response
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.stack); // Log full stack trace

    // Specific error handling
    let statusCode = 500;
    let message = "Internal Server Error";

    if (error.name === "MongoError") {
      message = "Database error occurred";
    }

    return res.status(statusCode).json({
      status: "error",
      message,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

module.exports = { register, login };
