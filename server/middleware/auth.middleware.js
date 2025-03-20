import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    // get token
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token)
      return res
        .status(401)
        .json({ message: "No access token found. Access denied." });

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user
    const user = await User.findById(decoded.userId).select('-password')
    if(!user)
        return res.status(401).json({message: 'Token is not valid.'})

    req.user = user
    
    next()
  } catch (error) {
    console.log(error);
    res.status(401).json({message: 'Invalid token.'})
  }
};

