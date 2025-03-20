import e from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = e.Router();

const generateToken = async (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // check if all fields have been provided
    if (!email || !username || !password)
      return res.status(400).json({ message: "All fields are required." });

    // password length
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters long." });

    // username length
    if (username.length < 3)
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters long." });

    // check for duplicates
    const existingUser = await User.findOne({email});

    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    // check for duplicate usernames
    const existingUsername = await User.findOne({username});

    if (existingUsername)
      return res.status(400).json({ message: "Username already exists." });

    // get random avatar
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // hash password
    const hashedPwd = await bcrypt.hash(password, 12);

    // add to db
    const user = User({ username, email, password: hashedPwd, profileImage });

    await user.save();

    // generate token and send it back to the client
    const token = generateToken(user._id);

    res
      .status(201)
      .json({
        token,
        user: { id: user._id, username: user.username, email: user.email, profileImage: user.profileImage },
      });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const {email, password} = req.body

    // check all fields have been provided
    if (!email || !password) 
        return res.status(400).json({message: 'All fields must be provided.'})

    // check if user exists
    const user = await User.findOne({email})
    if (!user)
        return res.status(404).json({message: 'Invald credentials.'}) 

    // compare passwords
    const correctPwd = await bcrypt.compare(password, user.password)
    if (!correctPwd)
        return res.status(400).json({message: 'Invalid credentials.'})

    // generate token
    const token = await generateToken(user._id)

    // send response
    res.status(200).json({
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage
        }
    })
  } catch (error) {
    console.log("Error logging in: ", error);
  }
});

export default router;
