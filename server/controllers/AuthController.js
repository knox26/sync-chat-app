import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password are required");
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      email,
      password: hashedPassword,
    });
    await user.save();
    const token = createToken(user.email, user.id);

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,

        profileSetUp: user.profileSetUp,
      },
      jwtToken: token,
    });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password are required");
    }
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return res.status(404).send("Email is incorrect");
    }

    const auth = await bcrypt.compare(password, user.password);

    if (!auth) {
      return res.status(404).send("Password is incorrect");
    }

    const token = createToken(user.email, user.id);

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetUp: user.profileSetUp,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
      jwtToken: token,
    });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).send("User with given id not found");
    }

    return res.status(201).json({
      id: userData.id,
      email: userData.email,
      profileSetUp: userData.profileSetUp,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;

    if (!firstName || !lastName || !color) {
      return res
        .status(400)
        .send("First Name, Last Name and Color are required");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetUp: true,
      },
      { new: true, runValidators: true }
    );

    return res.status(201).json({
      id: userData.id,
      email: userData.email,
      profileSetUp: userData.profileSetUp,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

export const addProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("Image is required");
    }

    const date = Date.now();
    let fileName = "uploads/profiles/" + date + "-" + req.file.originalname;
    renameSync(req.file.path, fileName);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );

    return res.status(201).json({
      image: updatedUser.image,
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.image) {
      unlinkSync(user.image);
      user.image = null;
      await user.save();
    }

    return res.status(201).send("Image removed successfully");
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const logOut = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return res.status(201).send("Logged out successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
