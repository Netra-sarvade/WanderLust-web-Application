const Listing = require("../models/listing");
const ExpressError = require('../utils/ExpressError');
const { cloudinary } = require('../cloudConfig');




module.exports.index = async (req, res)=> {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}


module.exports.showListing = async (req, res) => {
  let {id} = req.params;
 const listing = await Listing.findById(id)
 .populate({path:"reviews",
   populate:{
    path: "author",
  },
})
.populate("owner");
 if(!listing) {
  req.flash("error", "Listing you requested for does not exist!");
  return res.redirect("/listings");
 }
 console.log(listing);
 res.render("listings/show.ejs", {listing});
}


module.exports.createListing = async (req, res, next) => {
    try {
        console.log('REQ.FILE:', req.file);  // Debugging

        if (!req.file) {
            req.flash('error', '"listing.image" is required');
            return res.redirect('/listings/new');
        }

        const { listing } = req.body;

        // Attach image information
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        const newListing = new Listing(listing);
        newListing.owner = req.user._id;

        await newListing.save();

        req.flash('success', 'New listing created successfully!');
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        next(err);
    }
};




  module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
  
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  
    // Only render the edit form
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  };

  module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    // Update fields from form
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Handle new image upload
    if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


  module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", " Listing Deleted!");
    res.redirect("/listings");
  };