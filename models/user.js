const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define a schema
const userSchema = new mongoose.Schema(
    {
        username: String,
        fullname: String,
        email: String,
        password: String,
    },
    {
        timestamps: true,
    },
);

userSchema.pre("save", async function (next) {
    try {
        // Hash the password only if it is modified or is new
        if (this.isModified("password") || this.isNew) {
            const hashedPassword = await bcrypt.hash(this.password, 10); // 10 is the number of salt rounds

            // Replace the plaintext password with the hashed one
            this.password = hashedPassword;
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Method to validate the password
userSchema.methods.passwordValid = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        return false;
    }
};

// Create a model
const User = mongoose.model("User", userSchema);
module.exports = User;
