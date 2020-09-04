const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    hotel_name: {
      type: String, 
      required: 'Hotel name is required', 
      max: 32, 
      trim: true
    },
    hotel_description: {
      type: String,
      required: 'Hotel description is required',
      trim: true
    },
    image: String,
    star_rating: {
      type: Number, 
      required: 'Hotel star rating is required', 
      max: 5
    },
    country: {
      type: String,
      required: 'Country is required',
      trim: true
    },
    cost_per_night: {
      type: Number,
      required: 'Cost per night is required',
    },
    available: {
      type: Boolean,
      required: 'Availability is required',
    }
  });

  hotelSchema.index({
    hotel_name: 'text',
    country: 'text'
  })

//Export model
module.exports = mongoose.model('Hotel', hotelSchema);