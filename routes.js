const express = require("express");
const {
  getPosts,
  savePost,
  getSinglePost,
  updatePost,
  deletePost,
  signupUser,
  loginUser,
} = require("./controllers");

const router = express.Router();
// User routes

router.post('/user/signup', signupUser)
router.post('/user/login', loginUser)


// Post routes
router.get("/posts", getPosts);
router.post("/posts", savePost);
router.get("/posts/:id", getSinglePost);
router.patch("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);

module.exports = router;
