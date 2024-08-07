const Review = require('../models/review.js');
const Campground = require('../models/campgroundSchema.js');

module.exports.addReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = await Review.create(req.body.review);
    review.author = req.user._id;
    await review.save();
    campground.reviews.push(review);
    await campground.save();
    req.flash('success','Successfully added new a review')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async(req,res)=>{
    const{id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted the review');
    res.redirect(`/campgrounds/${id}`);
}