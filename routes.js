const express = require("express");
const { authorize, auth } = require("./utils/authorize");

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
  postLike,
  getLikes,
  makeUserAnAdmin,
  createAccessToken,
  createMessage,
  getMessages
} = require("./controllers");

const router = express.Router();

/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     summary: User signup
 *     tags:
 *      - Auth
 *     requestBody:
 *       description: please Fill the required fields
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - name
 *              - email
 *              - password
 *            properties:
 *              name:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              role:
 *                default: user
 *     responses:
 *       '200':
 *         description: Successfully Signup in
 */
router.post("/user/signup", signupUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User signin
 *     tags:
 *      - Auth
 *     requestBody:
 *       description: please fill all required fields
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: hakifred20@gmail.com
 *              password:
 *                type: string
 *                default: 123456
 *     responses:
 *       '200':
 *         description: Successfully Logged in
 */
router.post("/user/login", loginUser);

/**
 * @swagger
 * /api/user/make-admin/{userId}:
 *   post:
 *     summary: Make an Admin
 *     parameters:
 *      - name: userId
 *        in: path
 *        required: true
 *     tags:
 *      - Auth
 *     responses:
 *       '200':
 *         description: successfully made a user an admin
 */
router.post("/user/make-admin/:userId", auth, authorize, makeUserAnAdmin);

/**
 * @swagger
 * '/api/posts':
 *  get:
 *     tags:
 *     - Posts
 *     summary: Get all Posts
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  title:
 *                    type: string
 *                  content:
 *                    type: string
 *                  author:
 *                    type: string
 *       400:
 *         description: Bad request
 */
router.get("/posts", auth, getPosts);

/**
 * @swagger
 * '/api/posts':
 *  post:
 *     tags:
 *     - Posts
 *     summary: Create a Post
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - title
 *              - content
 *              - author
 *            properties:
 *              title:
 *                type: string
 *                default: Sample Post
 *              content:
 *                type: string
 *                default: New Post
 *              author:
 *                type: string
 *                default: Fred
 *     responses:
 *      200:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 */

router.post("/posts", auth, authorize, savePost);
/**
 * @swagger
 * /api/posts/{blogId}:
 *    get:
 *      tags:
 *        - Posts
 *      summary: Get a specific blog based off an ID
 *      parameters:
 *        - name: blogId
 *          in: path
 *          description: provide blogId
 *          required: true
 *      responses:
 *        200:
 *          description: success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              properties:
 *                title:
 *                  type: string
 *                content:
 *                  type: string
 *                author:
 *                  type: string
 *        404:
 *          description: not found
 */

router.get("/posts/:id", getSinglePost);

/**
 * @swagger
 * '/api/posts/{id}':
 *  patch:
 *     tags:
 *     - Posts
 *     summary: Edit a Post
 *     parameters:
 *      - name: blogId
 *        in: path
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - title
 *              - content
 *              - author
 *            properties:
 *              title:
 *                type: string
 *                default: Sample Post
 *              content:
 *                type: string
 *                default: New Post
 *              author:
 *                type: string
 *                default: Fred
 *     responses:
 *      200:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 */
router.patch("/posts/:id", auth, authorize, updatePost);

/**
 * @swagger
 * /api/posts/{blogId}:
 *    delete:
 *      tags:
 *        - Posts
 *      summary: Delete a specific blog based off an ID
 *      parameters:
 *        - name: blogId
 *          in: path
 *          description: provide blogId
 *          required: true
 *      responses:
 *        200:
 *          description: success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              properties:
 *                message:
 *                  type: string
 *        404:
 *          description: not found
 */
router.delete("/posts/:id", auth, authorize, deletePost);

/**
 * @swagger
 * '/api/post/comments/{blogId}':
 *  get:
 *     tags:
 *     - Comments
 *     summary: Get Post comments
 *     parameters:
 *      - name: blogId
 *        in: path
 *        description: please provide blogid
 *        required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  user:
 *                    type: string
 *                  post:
 *                    type: string
 *                  content:
 *                    type: string
 *       400:
 *         description: Bad request
 */
router.get("/post/comments/:blogId", auth, getComments);
/* Post Comments */
/**
 * @swagger
 * '/api/post/comments/{blogId}':
 *  post:
 *     tags:
 *     - Comments
 *     summary: Create a Post
 *     parameters:
 *      - name: blogId
 *        in: path
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - content
 *            properties:
 *              content:
 *                type: string
 *                default: Sample comment
 *     responses:
 *      200:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 */

router.post("/post/comments/:blogId", auth, postComment);
/* Post likes */
/**
 * @swagger
 * /api/post/likes/{blogId}:
 *    post:
 *      tags:
 *      - Likes:
 *      summary: Get Likes
 *      parameters:
 *        - name: blogId
 *          in: path
 *          description: provide blogId
 *          required: true
 *      responses:
 *        200:
 *          description: success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              properties:
 *                user:
 *                  type: string
 *                post:
 *                  type: string
 *                likeCount:
 *                  type: number
 *        404:
 *          description: not found
 */

router.post("/post/likes/:blogId", auth, postLike);
/* Get likes */

/**
 * @swagger
 * /api/get/likes/{blogId}:
 *    get:
 *      tags:
 *      - Likes:
 *      summary: Get Likes
 *      parameters:
 *        - name: blogId
 *          in: path
 *          description: provide blogId
 *          required: true
 *      responses:
 *        200:
 *          description: success
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *              properties:
 *                title:
 *                  type: string
 *                content:
 *                  type: string
 *                author:
 *                  type: string
 *        404:
 *          description: not found
 */
router.get("/get/likes/:blogId", auth, getLikes);
/* Post Comments */
/**
 * @swagger
 * '/api/create-refresh-token':
 *  post:
 *     tags:
 *     - Refresh Token
 *     summary: Create access token from refresh token
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - token
 *            properties:
 *              token:
 *                type: string
 *     responses:
 *      200:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 */
router.post('/create-refresh-token', auth, createAccessToken)

/* Post Message */
/**
 * @swagger
 * '/api/create-message':
 *  post:
 *     tags:
 *     - Messages
 *     summary: Create A message
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - name
 *              - email
 *              - message
 *            properties:
 *              name:
 *                type: string
 *              email:
 *                type: string
 *              message:
 *                type: string
 *     responses:
 *      200:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 */
router.post('/create-message', auth, createMessage)

/**
 * @swagger
 * /api/get-messages:
 *    get:
 *      tags:
 *      - Messages:
 *      summary: Get Messages
 *      responses:
 *        200:
 *          description: success
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *              properties:
 *                name:
 *                  type: string
 *                email:
 *                  type: string
 *                message:
 *                  type: string
 *        404:
 *          description: not found
 */
router.get('/get-messages', auth, authorize, getMessages)

module.exports = router;
