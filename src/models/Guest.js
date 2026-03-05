import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const guestSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        phone: { type: String, default: '' },
        roomNumber: { type: String, default: '' },
    },
    { timestamps: true },
);

// Hash password before saving
guestSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare plain password to hashed
guestSchema.methods.matchPassword = async function (entered) {
    return bcrypt.compare(entered, this.password);
};

export default mongoose.model('Guest', guestSchema);
