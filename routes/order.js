const router = require("express").Router();
const {authenticateToken} = require("./userAuth");
const Book = require("../models/book");
const Order = require("../models/order");
const User = require("../models/user");

//Place Order
router.post("/place-order", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers; 
        const { order } = req.body; 

        for (const orderData of order) {
            const newOrder = new Order({ user: id, book: orderData._id });
            const orderDataFromDB = await newOrder.save();

            await User.findByIdAndUpdate(id, {
                $push: { orders: orderDataFromDB._id },
            });
        }

        await User.findByIdAndUpdate(id, {
            $set: { cart: [] }, 
        });

        return res.json({
            status: "Success",
            message: "Order Placed Successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

//Get order history of particular user
router.get("/get-order-history", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;

        if (!id) {
            return res.status(400).json({ status: "Error", message: "User ID is required" });
        }

        const userData = await User.findById(id).populate({
            path: "orders",
            populate: { 
                path: "book", 
                select: "title desc price" // Limit the fields fetched from the book collection
            }
        });

        if (!userData) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        const ordersData = [...userData.orders].reverse();

        return res.json({
            status: "Success",
            data: ordersData
        });
    } catch (error) {
        res.status(500).json({ status: "Error", message: "An error occurred", error: error.message });
    }
});

//Get all orders -- Admin
router.get("/get-all-orders", authenticateToken, async(req,res)=>{
    try {
        const userData = await Order.find()
        .populate({
            path:"book",
        })
        .populate({
            path:"user",
        })
        .sort({createdAt: -1});
        return res.json({
            status: "Success",
            data:userData
        });

    } catch (error) {
        res.status(500).json({message:"An error occured",error:error.message});
    }
});

//Update order -- Admin
router.put("/update-status/:id", authenticateToken, async(req,res)=>{
    try{
        const {id} = req.params;
        await Order.findByIdAndUpdate(id, {status:req.body.status});
        return res.json({
            status: "Success",
            message: "Status Updated Successfully"
        });
    } catch(error){
        res.status(500).json({message:"An error occured",error:error.message});
    }
});

module.exports = router;