const router = require("express").Router();
const User = require("../models/user");
const {authenticateToken} = require("./userAuth");

//Add book to favourite
router.put("/add-book-to-favourite", authenticateToken, async(req,res)=>{
    try {
        const {bookid, id} = req.headers;
        const userData = await User.findById(id);
        const isBookFavourite = userData.favourites.includes(bookid);
        if(isBookFavourite)
        {
            return res.status(200).json({message: "Book is already in favourites"});
        }
        await User.findByIdAndUpdate(id, {$push: {favourites: bookid}});
        return res.status(200).json({message:"Book added to favourites"})
    } catch (error) {
        res.status(500).json({message:"Internal server error",error:error.message});
    }
});


//Delete from favourites
router.put("/remove-book-from-favourite", authenticateToken, async (req, res) => {
    try {
      const { bookid, id } = req.headers;  // Getting bookid and user id from headers
      const userData = await User.findById(id);  // Fetch user data from database
  
      const isBookFavourite = userData.favourites.includes(bookid);  // Check if the book is in the favourites
  
      if (isBookFavourite) {
        // Use `$pull` to remove the book from the favourites list
        await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } });
        return res.status(200).json({ message: "Book removed from favourites" });
      } else {
        // Book is not in favourites
        return res.status(404).json({ message: "Book not found in favourites" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });
  
//Get favourite books of particular user
router.get("/get-favourite-books", authenticateToken, async(req,res)=>{
    try {
    const {id} = req.headers;
    const userData = await User.findById(id).populate("favourites");
    const favouriteBooks = userData.favourites;
    return res.json({
        status:"Success",
        data:favouriteBooks
    })
    } catch (error) {
        res.status(500).json({message:"Internal server error",error:error.message});
    }
});

module.exports = router;