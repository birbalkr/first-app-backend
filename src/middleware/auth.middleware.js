import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
    try {
        // get token
        const token = req.headers("Authorization").reqplace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // get user from token
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found, authorization denied" });
        }
        req.user = user;
        next();
        
    } catch (error) {
        console.log("Error in authentication: ", error);
        res.status(401).json({ message: "Token is not valid" });
        
    }
};

export default protectRoute;