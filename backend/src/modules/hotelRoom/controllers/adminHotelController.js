const Hotel = require('../models/Hotel');

// @desc    Get all hotels with search & pagination
// @route   GET /api/admin/hotels
exports.getAllHotels = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { destination: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } }
            ];
        }

        if (status && ['active', 'inactive'].includes(status)) {
            query.status = status;
        }

        const total = await Hotel.countDocuments(query);
        const hotels = await Hotel.find(query)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({
            hotels,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error('Get All Hotels Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get single hotel by ID
// @route   GET /api/admin/hotels/:id
exports.getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.json(hotel);
    } catch (err) {
        console.error('Get Hotel Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Create a new hotel
// @route   POST /api/admin/hotels
exports.createHotel = async (req, res) => {
    try {
        const { name, destination, description, address, city, country, phone, email, starRating, priceRange, amenities, images, status } = req.body;

        const hotel = await Hotel.create({
            name,
            destination,
            description,
            address,
            city,
            country,
            phone,
            email,
            starRating,
            priceRange,
            amenities: amenities || [],
            images: images || [],
            status: status || 'active'
        });

        res.status(201).json(hotel);
    } catch (err) {
        console.error('Create Hotel Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update hotel details
// @route   PUT /api/admin/hotels/:id
exports.updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            hotel[key] = updates[key];
        });

        const updatedHotel = await hotel.save();
        res.json(updatedHotel);
    } catch (err) {
        console.error('Update Hotel Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Delete a hotel
// @route   DELETE /api/admin/hotels/:id
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        await Hotel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hotel deleted successfully' });
    } catch (err) {
        console.error('Delete Hotel Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Toggle hotel status (active/inactive)
// @route   PUT /api/admin/hotels/:id/status
exports.updateHotelStatus = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        hotel.status = hotel.status === 'active' ? 'inactive' : 'active';
        await hotel.save();

        res.json({ message: `Hotel ${hotel.status === 'active' ? 'activated' : 'deactivated'}`, hotel });
    } catch (err) {
        console.error('Update Status Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Upload/add images to hotel
// @route   POST /api/admin/hotels/:id/images
exports.uploadHotelImages = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        const { images } = req.body; // Array of image URLs
        if (!images || !Array.isArray(images)) {
            return res.status(400).json({ message: 'Please provide an array of image URLs' });
        }

        hotel.images = [...hotel.images, ...images];
        await hotel.save();

        res.json({ message: 'Images added successfully', hotel });
    } catch (err) {
        console.error('Upload Images Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
