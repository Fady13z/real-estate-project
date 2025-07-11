const { required } = require("joi");
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    unitType: {
      type: String,
      required: [true, "Unit type is required"],
      enum: ["فيلا", "شقة", "بيت"],
    },
    area: {
      type: Number,
      required: [true, "Area size is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    phoneNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    ContractImage: {
      type: String,
      trim: true
    },
    anotherInfo: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    features: [String],
    status: {
      type: String,
      enum: ["متوفر", "مستأجر", "مباع", "تحت الصيانة"],
      default: "متوفر",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexing for better performance on search queries
propertySchema.index({ address: 'text', unitType: 1, status: 1, price: 1 });

// Add pre-save hook to format data
propertySchema.pre('save', function(next) {
  // Format phone number if needed
  if (this.phoneNumber) {
    this.phoneNumber = this.phoneNumber.replace(/\D/g, '');
  }
  next();
});

// Static method for searching properties
propertySchema.statics.searchProperties = async function(query) {
  return this.find({
    $text: { $search: query },
    status: 'متوفر'
  }).sort({ price: 1 });
};

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;