const express = require('express');
const router = express.Router();
const blogController = require("../Controllers/blogController")
const authorController = require("../Controllers/authorController")
const middleware = require("../Middlewares/middleware")
//--------------------------------------------------------//

router.get("/test-me", function (req, res) {
    res.send("My server is running awesome!")
})
//--------------------------------------------------------//

router.post("/authors/create", authorController.createAuthor)
router.post("/blogs/create", blogController.createBlog)
router.get("/blogs/active", blogController.getBlogs)
router.put("/blogs/update/:blogId", blogController.updateBlogById)
router.delete("/blogs/:blogId", blogController.deleteBlogById)
router.delete("/blog", blogController.deleteBlogByQuery)
router.post("/login", middleware.authenticateUser)

module.exports = router;