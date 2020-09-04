const Hotel = require('../models/hotel');
const cloudinary = require('cloudinary');
const multer  = require('multer');
const storage = multer.diskStorage({});
const upload = multer({ storage });

exports.homePage = (req, res) => {
  res.render('index', { title: "Lets Travel!" });
};

exports.adminPage = (req, res) => {
  res.render('admin', { title: "Admin" });
};

exports.createHotelGet = (req, res) => {
  res.render('add_hotel', { title: 'Add New Hotel' });
};

exports.upload = upload.single('image');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

exports.pushToCloudinary = (req, res, next) => {
  if(req.file) {
  cloudinary.v2.uploader.upload(req.file.path)
  .then((result)=> {
    req.body.image = result.public_id;
    next(); 
  })
  .catch(() => {
    req.flash('error', 'Sorry there was a problem uploading your image, please try again...');
    res.redirect('/admin/add');
  })
} else {
  next(); 
}
};

const formatText = str => {
  return str.replace(/\w\S*/g, (newString) => {
      return newString.charAt(0).toUpperCase() + newString.substr(1).toLowerCase();
  });
}

exports.createHotelPost = async (req, res) => {
    req.body.country = formatText(req.body.country);
    const hotel = new Hotel(req.body)
    // res.json(hotel)
    await hotel.save();
    req.flash('success', `${hotel.hotel_name} created successfully!`);
    res.redirect(`/all/${hotel._id}`);
}

exports.listAllHotels = async (req, res, next) => {
  const allHotels = await Hotel.find( { available: { $eq: true } }) 
  res.render('all_hotels', { title: 'All Hotels', allHotels});
}

exports.listAllCountries = async (req, res) => {
  const allCountries = await Hotel.distinct('country');
  res.render('all_countries', { title: 'Browse by country:', allCountries });
};

exports.hotelsByCountry = async (req, res) => {
  const countryParam = req.params.country;
  const countryList = await Hotel.find( {country: countryParam} );
  res.render('hotels_by_country', { title: `Browse by country: ${countryParam}`, countryList });
}

exports.homePageFilters = async (req, res) => {
  const hotels = Hotel.aggregate([  
    { $match: { available: true } },
    { $sample: { size: 9 } }
  ]);
  const countries = Hotel.aggregate([
    { $group: { _id: '$country' }},  
    { $sample: { size: 9 } }
  ]);
  const [filteredCountries, filteredHotels] = await Promise.all([countries, hotels])
  res.render('index', { filteredCountries, filteredHotels });
};

exports.hotelDetail = async(req, res) => {
  const hotelParam = req.params.hotel;
  const hotelData = await Hotel.find( {_id: hotelParam} );
  res.render('hotel_detail', { title: "Lets Travel!", hotelData });
}

exports.searchResults = async(req, res) => {
  const searchQuery = req.body; 
  const parsedStars = parseInt(searchQuery.stars) || 1
  const parsedSort = parseInt(searchQuery.sort) || 1
  const searchData = await Hotel.aggregate([
    { $match: { $text: { $search: `\"${searchQuery.destination}\"` } } },
    { $match: { available: true, 
                star_rating: { $gte: parsedStars } 
              }},
    { $sort: { cost_per_night: parsedSort }}
  ]);
  res.render('search_results', { title: "Search results", searchQuery, searchData });
}

exports.editRemoveGet = (req, res) => {
  res.render('edit_remove', { title: 'Search for hotel to edit or remove'});
};

exports.editRemovePost = async (req, res) => {
  const hotelId = req.body.hotel_id || null;
  const hotelName = req.body.hotel_name || null;

  const hotelData = await Hotel.find( { $or: [ { _id: hotelId }, { hotel_name: hotelName } ] } ).collation({
    locale : 'en',
    strength : 2
  });

  if(hotelData.length > 0) {
    res.render('hotel_detail', { title: 'Add / Remove hotel', hotelData });
    return
  } else {
    req.flash('info', 'No matches were found...');
    res.redirect('/admin/edit-remove')
  }
};

exports.updateHotelGet = async (req, res) => {
  const hotel = await Hotel.findOne( {_id: req.params.hotelId} );
  res.render('add_hotel', { title: 'Update hotel', hotel});
};

exports.updateHotelPost = async (req, res) => {
  const hotelId = req.params.hotelId;
  req.body.country = formatText(req.body.country);
  
  const hotel = await Hotel.findByIdAndUpdate( hotelId, req.body, {new:true} );
  req.flash('success', `${hotel.hotel_name} updated successfully!`);
  res.redirect(`/all/${hotelId}`)
};

exports.deleteHotelGet = async (req, res) => {
  const hotelId = req.params.hotelId
  const hotel = await Hotel.findOne( {_id: hotelId} );
  res.render('add_hotel', { title: 'Delete hotel', hotel});
};

exports.deleteHotelPost = async (req, res) => {
  const hotelId = req.params.hotelId
  const hotel = await Hotel.findByIdAndRemove( {_id: hotelId} );
  req.flash('info', `Hotel ID: ${hotelId} has been deleted`);
  res.redirect('/')
};


