import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Subscription Name is required"],
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
    price: {
        type: Number,
        required: [true, "Subscription Price is required"],
        min: [0, "Price must be positive"],
    },
    currency: {
        type: String,
        required: [true, "Currency is required"],
        enum: ["USD", "EUR", "GBP", "INR", "JPY"], // Add more currencies as needed
        default: "USD",
    },
    frequency: {
        type: String,
        required: [true, "Billing Frequency is required"],
        enum: ["daily", "weekly", "monthly", "yearly"], // Add more frequencies as needed
    },
    category: {
        type: String,
        enum: ["Sports", "Finance", "Entertainment", "Utilities", "Food", "Health", "Education", "Other"],
        required: [true, "Subscription Category is required"],
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment Method is required"],
        // enum: ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Other"],
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active",
    },
    startDate: {
        type: Date,
        required: [true, "Start Date is required"],
        validate: {
            validator: function (v) {
                return v <= new Date();
            },
            message: "Start date cannot be in the future",
        },
    },
    renewalDate: {
        type: Date,
        // required: [true, "Renewal Date is required"], // Optional, can be auto-calculated
        validate: {
            validator: function (v) {
                return v > this.startDate;
            },
            message: "Renewal date cannot be in the past",
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true,
    },

}, { timestamps: true });

// Auto-calculate renewal date if missing
subscriptionSchema.pre('save', function (next) {

    if (!this.renewalDate) {
        const frequencyMap = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };
        this.renewalDate = new Date(this.startDate); // Default to start date if renewal date is not set
        this.renewalDate.setDate(this.renewalDate.getDate() + frequencyMap[this.frequency]);
    }

    // Auto-update status based on renewal date
    if (this.renewalDate < new Date()) {
        this.status = 'expired';
    }

    next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
