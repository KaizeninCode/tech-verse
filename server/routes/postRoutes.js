import e from "express";
import {Post} from "../models/Post.js";
import cloudinary from "../lib/cloudinary.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = e.Router();

// create
router.post("/create", protectRoute, async (req, res) => {
  try {
    const { caption, image } = req.body;

    // all fields must be provided
    if (!caption || !image)
      return res.status(400).json({ message: "All fields are required." });

    // upload image to cloudinary and save it to the db
    const response = await cloudinary.uploader.upload(image);
    const imgUrl = response.secure_url;

    const post = new Post({ caption, image: imgUrl, user: req.user._id });

    await post.save();

    res.status(201).json(post);
  } catch (error) {
    console.log(error);
  } finally {
    res.status(500).json({ message: "Internal server error." });
  }
});

// get all posts. Add pagination with infinite scrolling
router.get("/", protectRoute, async (req, res) => {
  try {
    const query = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (query - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 }) // sort in descending order (newest first)
      .skip(skip)
      .limit(limit)
      .populate("user", "username, profileImage");

    // total number of posts
    const totalPosts = await Post.countDocuments();

    res.send({
      posts,
      totalPosts,
      currentPage: query,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error) {
    console.log(error);
  } finally {
    res.status(500).json({ message: "Internal server error." });
  }
});

// get all posts belonging to the authenticated/logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (error) {
    console.log(error);
  } finally {
    res.status(500).json({ message: "Internal server error." });
  }
});

// update a post
router.patch("/:id", protectRoute, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found." });

    // check if post belongs to the user
    if (post.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized." });

    const { caption, image } = req.body;

    if (!caption || !image)
      return res.status(400).json({ message: "All fields are required." });

    // upload image to cloudinary and save it to the db
    const response = await cloudinary.uploader.upload(image);

    const imgUrl = response.secure_url;

    const updatedPost = new Post({
      caption,
      image: imgUrl,
      user: req.user._id,
    });

    updatedPost.save();

    res.status(201).json({ message: "Post updated successfully." });
  } catch (error) {
    console.log(error);
  } finally {
    res.status(500).json({ message: "Internal server error." });
  }
});

// delete a post
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    // check if post belongs to the user
    if (post.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized." });

    // delete post
    await post.deleteOne();

    // delete image from cloudinary as well
    if (post.image && post.image.includes("cloudinary")) {
      try {
        const publicId = post.image.split("/").pop().split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log(error);
      } finally {
        res.status(500).json({ message: "Internal server error." });
      }
    }

    res.status(200).json({ message: "Post deleted successfully." });

    // filter deleted post
    const posts = await Post.find().sort({ createdAt: -1 });
    const filteredPosts = await posts.filter((id) => id === post.id);
    res.send(filteredPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
