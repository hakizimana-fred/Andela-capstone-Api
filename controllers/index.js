const Post = require("../models/Post");
const User = require('../models/User')
const Joi = require("joi");
const argon2 = require('argon2');
const generateToken = require("../utils/generateToken");

// Joi validation
const postSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().min(5).required(),
});

// User Controller
const signupUser = async (req, res) => {
   try{ 
     // find if User exists
     const user = await User.findOne({email: req.body.email})
     if (user) return res.status(400).json({message: "User already exists"})
     // find if User does not exist and create new user
     const newUser = new User({
      name: req.body.name,
      email: req.body.email,
     })
     const hashedPassword = await argon2.hash(req.body.password)
     newUser.password = hashedPassword
     const savedUser = await newUser.save()
     const token = generateToken(savedUser)

     return res.status(200).json({
       user: {
        ...savedUser,
        token
       }
     })

   }catch(err) {
    return res.status(400).json({err: err.message})
   }
}

const loginUser = async (req, res) => {
   try{ 
     // find if User exists and password is valid
     const user = await User.findOne({email: req.body.email})
     const isValidPassword = await argon2.verify(user.password, req.body.password)

     if (user && isValidPassword) {
        const token = generateToken(user)
        return res.status(200).json({
          user: {
            ...user,
            token
          }
        })
     }else {
      return res.status(400).json({message: "Invalid credentials"})
     }
    
   }catch(err) {
      return res.status(400).json({message: "Invalid credentials"})
   }
}





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
    });
    await post.save();
    res.send(post);
  } catch (err) {
    res.send(err.message);
  }
};

const getSinglePost = async (req, res) => {
  try {
    try {
      const post = await Post.findOne({ _id: req.params.id });
      res.send(post);
    } catch {
      res.status(404);
      res.send({ error: "Post doesn't exist!" });
    }
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { error, value } = postSchema.validate(req.body);

    if (error) {
      console.log(error);
      return res.send(error.details);
    }

    const post = await Post.findOne({ _id: req.params.id });

    if (req.body.title) {
      post.title = req.body.title;
    }

    if (req.body.content) {
      post.content = req.body.content;
    }

    await post.save();
    res.send(post);
  } catch {
    res.status(404);
    res.send({ error: "Post doesn't exist!" });
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch {
    res.status(404);
    res.send({ error: "Post doesn't exist!" });
  }
};

// post Comment

const postComment = async (req, res) => {
  try {

  }catch(err) {}
}


const getComments = async (req, res) => {
  try {

  }catch(err) {}
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
  getComments
};
