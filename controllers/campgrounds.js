const Campground = require('../models/campgroundSchema');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const{cloudinary} = require('../cloudinary')

module.exports.index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    try {
        const totalCampgrounds = await Campground.countDocuments();
        const totalPages = Math.ceil(totalCampgrounds / limit);

        // Fetch paginated campgrounds for the list view
        const campgrounds = await Campground.find({}).skip(skip).limit(limit);
        
        // Fetch all campgrounds for the map
        const allCampgrounds = await Campground.find({});

        res.render('campgrounds/AllCamps', {
            campgrounds,
            allCampgrounds, // Pass all campgrounds to the view for the map
            totalPages,
            currentPage: page
        });
    } catch (err) {
        req.flash('error', 'Something went wrong');
        res.redirect('/');
    }
}



module.exports.newForm = (req,res)=>{
    res.render('campgrounds/newcamp');
}

module.exports.createNew = async (req, res) => { 
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry; 
    campground.images = req.files.map(f=>({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'successfully added a new campground');
    res.redirect(`/campgrounds/${campground.id}`);
}

module.exports.editForm = async(req,res)=>{
    const{id} = req.params
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Campground not found'); 
        return res.redirect('/campgrounds/')
    } 
    res.render('campgrounds/edit',{campground});
}

module.exports.showCamp = async(req,res)=>{
    const{id} = req.params;
    const campground = await Campground.findById(id).populate({path:'reviews',populate:{path:'author'}}).populate('author');
    if(!campground){
        req.flash('error', 'Campground not found'); 
        return res.redirect('/campgrounds/')
    } 
    res.render("campgrounds/show",{campground});
}

module.exports.editCamp = async(req,res)=>{
    try {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
        const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
        campground.geometry = geoData.features[0].geometry;

        if (!campground) {
            req.flash('error', 'Campground not found');
            return res.redirect('/campgrounds');
        }

        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.images.push(...imgs);
        await campground.save();

        if (req.body.deleteImages) {
            for(let filename of req.body.deleteImages){
               await cloudinary.uploader.destroy(filename);
            }
            await Campground.updateOne(
                { _id: id },
                { $pull: { images: { filename: { $in: req.body.deleteImages } } } }
            );
        }

        req.flash('success', 'Successfully updated campground');
        res.redirect(`/campgrounds/${id}`);
    } catch (err) {
        req.flash('error', 'Something went wrong');
        res.redirect('/campgrounds');
    }
}

module.exports.deleteCamp = async(req,res)=>{
    const{id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted the campground')
    res.redirect('/campgrounds')
}