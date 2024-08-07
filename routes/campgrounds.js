const express = require('express');
const router= express.Router();
const catchAsync = require('../util/catchAsync')
const {isLoggedIn,validateCampground,isAuthor} = require('../middleware.js');
const campgrounds = require('../controllers/campgrounds.js');
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({storage})



router.get('/',catchAsync(campgrounds.index))
router.post('/',isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createNew))



router.get('/new',isLoggedIn,campgrounds.newForm)

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.editForm))

router.get('/:id',catchAsync(campgrounds.showCamp))
router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.editCamp))

router.delete('/:id',isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCamp))

module.exports = router;