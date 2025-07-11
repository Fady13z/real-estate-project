const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "moderator"], required: true },
});

// Add index for better performance
userSchema.index({ email: 1 }, { unique: true });

// Add method to check if password was changed after token issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Create and export the model
const User = mongoose.model("User", userSchema);

// Export the validation function
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity({
      min: 6,
      max: 30,
      lowerCase: 1,
      numeric: 1,
      symbol: 0,
      requirementCount: 4,
    }).required(),
    role: Joi.string().valid("employee", "moderator").required(),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { User, validateUser };