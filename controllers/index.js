const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Joi = require("joi");
const argon2 = require("argon2");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const generateTokens = require("../utils/generateToken");
const UserToken = require("../models/UserToken");
const jwt = require('jsonwebtoken');
const Message = require('../models/Message')
const { 
  dbHistogram 
} = require("../utils/serverMetrics");


// Joi validation
const postSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().min(4).required(),
  content: Joi.string().min(5).required(),
  imgUrl: Joi.string().min(5).required(),
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


const messageSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  message: Joi.string().required(),
  user: Joi.string().required(),
});


// User Controller
const signupUser = async (req, res) => {
  const metricsLabel = {
    operation: 'signupUser'
  }
  const timer = dbHistogram.startTimer()
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
    timer({...metricsLabel, success: "true"})

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
    timer({...metricsLabel, success: false})
    return res.status(400).json({ err: err.message })
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

      return res.status(200).json({
        success: true,
        user: {
          accessToken, 
          refreshToken
        },
      });
    } else {
      return res.status(400).json({success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};


// Post controller
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json({success: true, posts});
  } catch (err) {
    return res.send(400).json({success: false, message:err.message });
  }
};


const savePost = async (req, res) => {
   const metricsLabel = {
    operation: 'savePost'
  }
  const timer = dbHistogram.startTimer()
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
      imgUrl: req.body.imgUrl
    });

    await post.save();
    console.log('just post', post)
    timer({...metricsLabel, success: "true"})

    res.status(200).json(post);
  } catch (err) {
    timer({...metricsLabel, success: "false"})
    return res.status(400).json({err: err.message});
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


// update post controller
const updatePost = async (req, res) => {
  try {
    const { error, value } = postSchema.validate(req.body);

    if (error) {
      return res.status(200).json({err: error.details})
    }
    //if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message: 'Invalid ID'})

    const post = await Post.findOne({ _id: req.params.id });

    if (req.body.title) {
      post.title = req.body.title;
    }

    if (req.body.content) {
      post.content = req.body.content;
    }

    if (req.body.imgUrl) {
      post.imgUrl = req.body.imgUrl
    }

    await post.save();
    return res.status(200).json({success: true, post});
  } catch(err) {
    res.status(400).json({success: false, err: err.message})
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
    const metricsLabel = {
    operation: 'postComment'
  }
  const timer = dbHistogram.startTimer()
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
      timer({...metricsLabel, success: "true"})
      return res.status(201).json(comment);
    } else {
      return res.status(200).json({ message: "Something went wrong" });
    }
  } catch (err) {
      timer({...metricsLabel, success: "false"})
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
    const user = req.user;
    const post = await Like.findOne({post: req.params.blogId})
    //if no post
    if (!post) {
        const newLikedPost = new Like({
          user, 
          post: req.params.blogId
        })
        newLikedPost.likeCount += 1
        await newLikedPost.save()
        return res.status(200).json({success: true, doc: newLikedPost})
    }else if (post) {
        // check post and if user already like do a dislike
        if (post.user == user) {
           const doc = await Like.findOneAndUpdate(
          { _id: post._id },
          { $set: { likeCount: (post.likeCount -= 1), user: post.user = null } },
          { new: true }
        );
          await doc.save();
          return res.status(200).json({success: true, doc})
       }else {
          const doc = await Like.findOneAndUpdate(
          { _id: post._id },
          { $set: { likeCount: (post.likeCount += 1), user: post.user = user } },
          { new: true }
        );
          await doc.save();
          return res.status(200).json({success: true, doc}) 
       }
    }
    
  } catch (err) {
    return res.status(400).json({success: false, message: err.message})
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


// this controller derives access token from fresh token
const createAccessToken = async (req, res) => {
  const refreshToken = req.body.token
  if (!refreshToken) return res.status(400).json({success: false, message: "refresh token must be provided"})
   try {
     const token = await UserToken.findOne({token: refreshToken})
      if (!token) return res.status(403).json({err: false, message: "Refresh token not found in DB"})
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH)
      const accessToken = jwt.sign({
        id: payload.id,
        email: payload.email
      }, process.env.JWT_SECRET, { expiresIn: '15m'})
      return res.status(200).json({success: true, accessToken})
   }catch(err) {
    return res.status(400).json({err: err.message})
   }
}


// create message controller
const createMessage = async (req, res) => {
  const body = {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    user: req.user
  }

   const { error, value } = messageSchema.validate(body);

    if (error) {
      return res.send(error.details);
    }

  const { name, email, message} = req.body
  try {
    const newMessage = new Message({
      name,
      email,
      message,
      user: req.user
    })
    const savedMessage = await newMessage.save()
    return res.status(200).json(savedMessage)
  }catch(e) {
    return res.status(400).json({err: e.message})
  }
}


// get saved message controller
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({})
    return res.status(200).json(messages)

  }catch(e) {
    return res.status(400).json({err: e.message})
  }
}


// Fetch all users
const fetchUsers = async (req, res) => {
  try {
    const users = await User.find({})
    if (users.length > 0) return res.status(200).json({success: true, usersCount: users.length})
  }catch(err){
    return res.status(400).json({success: false, error: err.message})
  }
}


// Fetch all users
const fetchPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
    if (posts.length > 0) return res.status(200).json({success: true, postCount: posts.length})
  }catch(err){
    return res.status(400).json({success: false, error: err.message})
  }
}

const fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find({})
    if (messages.length > 0) return res.status(200).json({success: true, messageCount: messages.length})
  }catch(err){
    return res.status(400).json({success: false, error: err.message})
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


  createAccessToken,


  createMessage,


  getMessages,


  fetchPosts, 


  fetchUsers,

  fetchMessages

};
