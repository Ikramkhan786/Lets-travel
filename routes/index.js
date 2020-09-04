var express = require('express');
var router = express.Router();

// require controller

const hotelController = require('../controllers/hotelController');
const userController = require('../controllers/userController');

const asyncErrorHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};


/* GET home page. */
router.get('/', asyncErrorHandler(hotelController.homePageFilters));

router.get('/all', asyncErrorHandler(hotelController.listAllHotels));
router.get('/all/:hotel', asyncErrorHandler(hotelController.hotelDetail));
router.get('/countries', asyncErrorHandler(hotelController.listAllCountries));
router.get('/countries/:country', asyncErrorHandler(hotelController.hotelsByCountry));
router.post('/results', asyncErrorHandler(hotelController.searchResults));

//User Routes

// @desc user Sign up form
router.get('/sign-up', userController.signUpGet);
router.post('/sign-up',  
  userController.signUpPost, 
  userController.loginPost);

// @desc user login page
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);
//router.get('/login/:data', userController.loginGet);
//router.post('/login/:data', userController.loginPostData);

// @desc logout from the account
router.get('/logout', userController.logout);

// @desc order confirmation page
router.get('/my-account', asyncErrorHandler(userController.myAccount));

router.get('/order-placed/:data', asyncErrorHandler(
  userController.orderPlaced )
);

// Booking confirmation page
router.get('/confirmation/:data', asyncErrorHandler(userController.bookingConfirmation));


// @desc Cancle bookings
//router.get('/cancel-order/:id', userController.cancelOrder);

// Admin routes

router.get('/admin', userController.isAdmin, hotelController.adminPage);
router.get('/admin/*', userController.isAdmin);

router.get('/admin/orders', asyncErrorHandler(userController.allOrders));

router.get('/admin/add', hotelController.createHotelGet);
router.post('/admin/add', 
  hotelController.upload, 
  hotelController.pushToCloudinary,
  asyncErrorHandler(hotelController.createHotelPost)
);

router.get('/admin/edit-remove', asyncErrorHandler(hotelController.editRemoveGet));
router.post('/admin/edit-remove', asyncErrorHandler(hotelController.editRemovePost));

router.get('/admin/:hotelId/update', asyncErrorHandler(hotelController.updateHotelGet));
router.post('/admin/:hotelId/update', 
  hotelController.upload, 
  hotelController.pushToCloudinary, 
  asyncErrorHandler(hotelController.updateHotelPost)
);

router.get('/admin/:hotelId/delete', asyncErrorHandler(hotelController.deleteHotelGet));
router.post('/admin/:hotelId/delete', asyncErrorHandler(hotelController.deleteHotelPost));

module.exports = router;
