const Post = require("../models/Post");
const User = require("../models/User");
const Joi = require("joi");
const argon2 = require("argon2");
const generateToken = require("../utils/generateToken");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const mongoose = require("mongoose");
const generateTokens = require("../utils/generateToken");
const verifyRefreshToken = require("../utils/verifyRefreshToken");
const UserToken = require("../models/UserToken");
const jwt = require('jsonwebtoken')

// Joi validation
const postSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().min(4).required(),
  content: Joi.string().min(5).required(),
});

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5),
  role: Joi.string(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5),
});

const commentSchema = Joi.object({
  content: Joi.string().required(),
});

// User Controller
const signupUser = async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);

    if (error) {
      return res.send(error.details);
    }
    // find if User exists
    const user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: "User already exists" });
    // find if User does not exist and create new user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || "user",
    });
    const hashedPassword = await argon2.hash(req.body.password);
    newUser.password = hashedPassword;
    const savedUser = await newUser.save();

    const { accessToken, refreshToken } = await generateTokens(savedUser)

    const userResponse = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
    };

    return res.status(200).json({
      user: {
        ...userResponse,
        accessToken,
        refreshToken
      },
    });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.send(error.details);
    }

    // find if User exists and password is valid
    const user = await User.findOne({ email: req.body.email });
    const isValidPassword = await argon2.verify(
      user.password,
      req.body.password
    );

    if (user && isValidPassword) {
      const { accessToken, refreshToken } = await generateTokens(user)

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      return res.status(200).json({
        user: {
          ...userResponse,
          accessToken, 
          refreshToken
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
};

// Post controller
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts);
  } catch (err) {
    return res.send(400).json({ msg: err.message });
  }
};

const savePost = async (req, res) => {
  try {
    const { error, value } = postSchema.validate(req.body);

    if (error) {
      console.log(error);
      return res.send(error.details);
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
    });

    await post.save();
    res.send(post);
  } catch (err) {
    res.send(err.message);
  }
};

const getSinglePost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message: 'Invalid ID'})
    try {
      const post = await Post.findOne({ _id: req.params.id });
      res.status(200).json(post);
    } catch(err) {
      res.status(404).json({err: err.message})
    }
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { error, value } = postSchema.validate(req.body);

    if (error) {
      return res.status(200).json({err: error.details})
    }
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message: 'Invalid ID'})

    const post = await Post.findOne({ _id: req.params.id });

    if (req.body.title) {
      post.title = req.body.title;
    }

    if (req.body.content) {
      post.content = req.body.content;
    }

    await post.save();
    return res.status(200).json(post);
  } catch(err) {
    res.status(400).json({err: err.message})
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

// post Comment

const postComment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.blogId))
      return res.status(400).json({ message: "Invalid blog id" });
    const user = req.user;

    const blogFound = await Post.findById(req.params.blogId);
    const userFound = await User.findById(req.user);

    if (userFound && blogFound) {
      const comment = new Comment({
        user,
        post: req.params.blogId,
        content: req.body.content,
        username: userFound.name,
      });
      await comment.save();
      return res.status(201).json(comment);
    } else {
      return res.status(200).json({ message: "Something went wrong" });
    }
  } catch (err) {
    return res.status(201).json({ err: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    // have to retrive the user and blog associated to the comment
    if (!mongoose.isValidObjectId(req.params.blogId))
      return res.status(400).json({ message: "Invalid blog id" });

    const comments = await Comment.find({ post: req.params.blogId });
    if (comments.length > 0) return res.status(200).json(comments);

    return res.status(400).json({ message: "no comments found" });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

const postLike = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.blogId))
      return res.status(400).json({ message: "Invalid blog id" });
    const blogFound = await Post.findById(req.params.blogId);
    if (!blogFound) return res.status(400).json({ message: "No blog found" });
    const user = req.user;
    // check if we're not liking for the second time
    const liked = await Like.findOne({ user });
    if (liked) {
      return res.status(400).json({ message: "you cannot like twice" });
    } else {
      const newLike = new Like({
        user,
        post: req.params.blogId,
      });
      // check if likes already has a count of greather than 0
      const likedPost = await Like.findOne({ post: req.params.blogId });
      if (likedPost && likedPost.likeCount > 0) {
        // updated
        const doc = await Like.findOneAndUpdate(
          { _id: likedPost._id },
          { $set: { likeCount: (likedPost.likeCount += 1) } },
          { new: true }
        );
        await doc.save();
        return res.status(200).json(doc);
      } else {
        newLike.likeCount++;
        // save like
        await newLike.save();
        return res.status(200).json(newLike);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const getLikes = async (req, res) => {
  try {
    // have to retrive the user and blog associated to the comment
    if (!mongoose.isValidObjectId(req.params.blogId))
      return res.status(400).json({ message: "Invalid blog id" });

    const likes = await Like.find({ post: req.params.blogId });
    if (likes.length > 0) return res.status(200).json(likes);
    return res.status(400).json({ message: "no likes found" });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

const makeUserAnAdmin = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId))
      return res.status(400).json({ message: "Invalid User id" });
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: { role: "admin" } },
      { new: true }
    );
    await user.save();
    return res
      .status(200)
      .json({ message: "successfully made " + user.name + " an admin" });
  } catch (err) {
    return res.status(200).json({ err: err.messae });
  }
};

const createRefreshToken = (req, res) => {
  const refreshToken = req.body.token
   try {
     const token = UserToken.findOne({token: refreshToken})
      if (!token) return res.status(403).json({err: true, message: "Invalid token"})
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH)
      const accessToken = jwt.sign({
        id: payload.id,
        email: payload.email
      }, process.env.JWT_SECRET, { expiresIn: '15m'})
      return res.status(200).json({error: false, accessToken})
   }catch(err) {
    return res.status(400).json({err: err.message})
   }

}

module.exports = {
  signupUser,
  loginUser,
  getPosts,
  savePost,
  getSinglePost,
  updatePost,
  deletePost,
  postComment,
  getComments,
  postLike,
  getLikes,
  makeUserAnAdmin,
  createRefreshToken
};
