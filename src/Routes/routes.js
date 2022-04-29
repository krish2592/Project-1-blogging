const express = require('express');
const router = express.Router();
const blogController = require("../Controllers/blogController")
const authorController = require("../Controllers/authorController")
const middleware= require("../Middlewares/middleware")
//--------------------------------------------------------//

router.get("/test-me", function (req, res) {
    res.send("My server is running awesome!")
})
//--------------------------------------------------------//

router.post("/authors", authorController.createAuthor)
router.post("/blogs/:authorId",middleware.authenticateUser,middleware.authUser, blogController.createBlog)
router.get("/blogs",middleware.authenticateUser, blogController.getBlogs)
router.put("/blogs/:blogId",middleware.authenticateUser,middleware.authoriseUser,blogController.updateBlogById)
router.delete("/blogs/:blogId",middleware.authenticateUser,middleware.authoriseUser,blogController.deleteBlogById)
router.delete("/blogs",middleware.authenticateUser,blogController.deleteBlogByQuery)
router.post("/login",authorController.loginUser)

module.exports = router;