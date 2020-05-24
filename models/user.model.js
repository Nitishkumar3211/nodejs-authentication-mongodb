const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    email: {
        type: String,
        required: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    dateOfBirth: {
        type: Date
    }
}, { timestamps: true });

UserSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});


// export model user with UserSchema
module.exports = mongoose.model("user", UserSchema);