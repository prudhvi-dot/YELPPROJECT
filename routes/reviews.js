const express = require('express');
const router= express.Router({mergeParams:true});
const catchAsync = require('../util/catchAsync.js')
const ExpressError = require('../util/ExpressError.js');
const reviews = require('../controllers/reviews.js')
const{validateReview,isLoggedIn,isReviewAuthor} = require('../middleware.js')



router.post('/',isLoggedIn,validateReview,catchAsync(reviews.addReview))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))




module.exports = router;