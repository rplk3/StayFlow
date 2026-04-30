const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// @desc    Get all rooms (optionally filter by hotel)
// @route   GET /api/admin/rooms
exports.getAllRooms = async (req, res) => {
    try {
        const { hotelId, status, search, page = 1, limit = 20 } = req.query;
        let query = {};

        if (hotelId) query.hotelId = hotelId;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { roomNumber: { $regex: search, $options: 'i' } },
                { roomType: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Room.countDocuments(query);
        const rooms = await Room.find(query)
            .populate('hotelId', 'name destination')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({
            rooms,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error('Get All Rooms Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get single room
// @route   GET /api/admin/rooms/:id
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hotelId', 'name destination');
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        console.error('Get Room Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Create a new room
// @route   POST /api/admin/rooms
exports.createRoom = async (req, res) => {
    try {
        const { hotelId, roomNumber, roomType, capacity, floor, description, amenities, images, totalRooms, basePrice, status } = req.body;

        // Verify hotel exists
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        const room = await Room.create({
            hotelId, roomNumber, roomType, capacity, floor, description,
            amenities: amenities || [],
            images: images || [],
            totalRooms, basePrice,
            status: status || 'available'
        });

        const populated = await Room.findById(room._id).populate('hotelId', 'name destination');
        res.status(201).json(populated);
    } catch (err) {
        console.error('Create Room Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update room
// @route   PUT /api/admin/rooms/:id
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            room[key] = updates[key];
        });

        await room.save();
        const populated = await Room.findById(room._id).populate('hotelId', 'name destination');
        res.json(populated);
    } catch (err) {
        console.error('Update Room Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Delete room
// @route   DELETE /api/admin/rooms/:id
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        console.error('Delete Room Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update room status (available/occupied/maintenance/unavailable)
// @route   PUT /api/admin/rooms/:id/status
exports.updateRoomStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['available', 'occupied', 'maintenance', 'unavailable'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be: available, occupied, maintenance, or unavailable' });
        }

        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        room.status = status;
        await room.save();

        const populated = await Room.findById(room._id).populate('hotelId', 'name destination');
        res.json({ message: `Room marked as ${status}`, room: populated });
    } catch (err) {
        console.error('Update Room Status Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get hotels list for dropdown
// @route   GET /api/admin/rooms/hotels-list
exports.getHotelsList = async (req, res) => {
    try {
        const hotels = await Hotel.find({ status: 'active' }).select('_id name destination').sort({ name: 1 });
        res.json(hotels);
    } catch (err) {
        console.error('Get Hotels List Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
