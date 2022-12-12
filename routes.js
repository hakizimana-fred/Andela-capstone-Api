const express = require("express");
const { authorize,auth }  = require('./utils/authorize')
const {
  getPosts,
  savePost,
  getSinglePost,
  updatePost,
  deletePost,
  signupUser,
  loginUser,
  getComments,
  postComment,
} = require("./controllers");

const router = express.Router();
// User routes

router.post('/user/signup', signupUser)
router.post('/user/login', loginUser)

// Post routes
router.get("/posts", auth, getPosts);
router.post("/posts", auth, authorize, savePost);
router.get("/posts/:id", getSinglePost);
router.patch("/posts/:id", auth, authorize, updatePost);
router.delete("/posts/:id", auth, authorize, deletePost);

// comments routes
router.get('/post/comments/:blogId', auth, getComments)
router.post('/post/comments/:blogId', auth, postComment)

module.exports = router;
