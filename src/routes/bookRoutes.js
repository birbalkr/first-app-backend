import express from "express";
const router = express.Router();
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";

// create a book route
router.post("/", protectRoute, async (req, res) => {
    try {

        const { title, caption, image, rating } = req.body;

        if (!title || !caption || !image || !rating) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // upload image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image)
        const imageUrl = uploadResponse.secure_url;

        //save book to database
        const newBook = new Book({
            title,
            caption,
            image: imageUrl,
            rating,
            user: req.user._id,
        });
        await newBook.save();
        res.status(201).json({ message: "Book created successfully", book: newBook });

    } catch (error) {
        console.log("Error creating book: ", error);
        res.status(500).json({ message: "Server error" });

    }
});

router.get("/", protectRoute, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 7;
        const skip = (page - 1) * limit;

        const books = await Book.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username ProfilePicture");

        const totalBooks = await Book.countDocuments();
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        })


    } catch (error) {
        console.log("Error fetching books: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 })
        .res.json(books);
    } catch (error) {
        console.log("Error fetching user's books: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // delete image from cloudinary
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting image from Cloudinary: ", deleteError);
            }
        }

        await book.deleteOne();
        res.json({ message: 'Book deleted successfully' });

    } catch (error) {
        console.log("Error deleting book: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



export default router