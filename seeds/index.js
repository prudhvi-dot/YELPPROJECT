const mongoose = require('mongoose');
const dotenv = require('dotenv'); 
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campgroundSchema');
dotenv.config(); 
const connectDb = async ()=>{
    try{
       await mongoose.connect(process.env.MONGO_URL) ;
       console.log('Database connected')
    }catch(err){
        console.log(err)
        console.log('Error connecting database')
    }
    
}
connectDb();

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 350; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.round(Math.random()*20)+10;
        const camp = new Campground({
            author:'66acbf275b6493da45c8197f',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:"unparalleled escape into nature. Whether you're seeking a serene weekend getaway or an adventurous family vacation, our campground provides the perfect setting for relaxation and exploration.",
            price:price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                }
            ]
            
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})