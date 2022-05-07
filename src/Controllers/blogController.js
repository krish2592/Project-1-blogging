const { is } = require("express/lib/request");
const authorModel = require("../Models/authorModel")
const blogModel = require("../Models/blogModel");
const { isValid, isValidObjectId, isValidRequestBody } = require("../utility/validator");
const ObjectId = require("mongoose").Types.ObjectId;

// Blog Creation
const createBlog = async function (req, res) {
    try {

        let requestBody = req.body
        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "No USER INPUT" });

        let { title, body, authorId, tags, category, subcategory, isPublished, publishedAt } = requestBody

        if (!isValid(title)) return res.status(400).send({ status: false, msg: "Title is a mendatory field" })
        if (!isValid(body)) return res.status(400).send({ status: false, msg: "Body is a mendatory field" })
        if (!isValid(authorId)) return res.status(400).send({ status: false, msg: "Author Id is a mendatory field" })
        if (!isValidObjectId(authorId)) return res.status(400).send({ status: false, msg: `${authorId} is not a valid author Id` })
        if (!isValid(category)) return res.status(400).send({ status: false, msg: "Category is a mendatory field" })

        let findAuthorId = await authorModel.findById(authorId)
        if (!findAuthorId) return res.status(404).send({ status: false, msg: "Author Not found" })

        if (isPublished) {
            publishedAt = true;
        }

        let blogData = { title, body, authorId, category, isPublished: isPublished ? isPublished : false, publishedAt: publishedAt ? new Date() : null }

        if (tags) {
            if (Array.isArray(tags)) {
                blogData["tags"] = [...tags]
            }
            if (Object.prototype.toString.call(tags) === "[object String]") {
                blogData["tags"] = [tags]
            }
        }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                blogData["subcategory"] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === "[object String]") {
                blogData["subcategory"] = [subcategory]
            }
        }

        let saveData = await blogModel.create(blogData);
        return res.status(201).send({ status: true, msg: "Blog created sucessfully", data: saveData });

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

// GET Blogs
const getBlogs = async function (req, res) {
    try {
        let queryParams = req.query
        let filter = { isDeleted: false, deletedAt: null, isPublished: true }
        if (!isValidRequestBody(queryParams)) {
            let findBLogs = await blogModel.find(filter)
            // If both condition false 
            if (Array.isArray(findBLogs) && findBLogs.length === 0) return res.status(404).send({ status: false, msg: "No blogs found" })

            return res.status(200).send({ status: true, msg: "Blog List", data: findBLogs })
        }
        if (isValidRequestBody(queryParams)) {
            let { authorId, tags, category, subcategory } = queryParams;

            if (isValid(authorId) && isValidObjectId(authorId)) {
                filter["authorId"] = authorId;
            }
            if (isValid(category)) {
                filter["category"] = category.trim();
            }

            if (isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim())
                filter["tags"] = { $all: tagsArr };

            }
            if (isValid(subcategory)) {
                const subCatArray = subcategory.trim().split(',').map(subcategory => subcategory.trim())
                filter["subcategory"] = { $all: subCatArray };
            }

            const filterByQuery = await blogModel.find(filter)
            if (Array.isArray(filterByQuery) && filterByQuery.length === 0) return res.status(404).send({ status: false, msg: "No blogs found" })

            return res.status(200).send({ status: true, msg: "Blog list", data: filterByQuery })

        }
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: err.message });
    }
}

// Update Blog 
const updateBlogById = async function (req, res) {
    try {
        let blogId = req.params.blogId
        
        // Id verification
        let blogDetails = await blogModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })
        if (!blogDetails) return res.status(404).send({ status: false, msg: "Blog not found." })
        const { isPublished } = blogDetails;
        let requestBody = req.body
        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "NO INPUT BY USER" })
        let { title, body, tags, category, subcategory } = requestBody;

        if (title == "") {
            return res.status(400).send({ status: false, msg: "Title can not be empty" })
        } else if (title) {
            if (!title.trim()) return res.status(400).send({ status: false, msg: "Title can not be empty" })
        }
        if (body == "") {
            return res.status(400).send({ status: false, msg: "Body can not be empty" })
        } else if (body) {
            if (!body.trim()) return res.status(400).send({ status: false, msg: "Body can not be empty" })
        }
        if (category == "") {
            return res.status(400).send({ status: false, msg: "Body can not be empty" })
        } else if (category) {
            if (!category.trim()) return res.status(400).send({ status: false, msg: "Body can not be empty" })
        }

        let updatedTagData = {}
        if (tags) {
            if (Array.isArray(tags)) {
                updatedTagData['tags'] = { $each: [...tags] }
            }
            if (typeof tags === "string") {
                updatedTagData['tags'] = tags
            }
        }


        let updatedSubcategoryData = {}
        if (subcategory) {
            if (Array.isArray(subcategory)) {
                updatedSubcategoryData['subcategory'] = { $each: [...subcategory] }
            }
            if (typeof subcategory === "string") {
                updatedSubcategoryData['subcategory'] = subcategory
            }
        }

        const setIfNotPublished = { title: title, body: body, category: category, isPublished: true, publishedAt: new Date() }
        const addToSetIfNotPublished = { tags: updatedTagData['tags'], subcategory: updatedSubcategoryData['subcategory'] }
        // if blog is not published 
        if (!isPublished) {
            let updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId },
                {
                    $set: setIfNotPublished,
                    $addToSet: addToSetIfNotPublished
                }, { new: true })

            return res.status(200).send({ status: true, message: "Updation successful", data: updatedBlog })
        }
        // if blog is already published
        else {
            const setIfPublished = { title: title, body: body, category: category }
            const addToSetPublished = { tags: updatedTagData['tags'], subcategory: updatedSubcategoryData['subcategory'] }
            let updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId },
                {
                    $set: setIfPublished,
                    $addToSet: addToSetPublished
                }, { new: true })

            return res.status(200).send({ status: true, message: "Updation successful", data: updatedBlog })
        }

    } catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: err.message });
    }
}

// Delete by Id
const deleteBlogById = async function (req, res) {
    try {
        let blogId = req.params.blogId;

        let deleteBlog = await blogModel.findOneAndUpdate(
            { _id: blogId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

        if (!deleteBlog) return res.status(404).send({ status: false, msg: "Blog does not exist" })
        return res.status(200).send({ status: true, msg: "Blog deleted sucessfully", data: deleteBlog })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ msg: "Error", error: err.message })
    }
}

// Delete by Query
const deleteBlogByQuery = async function (req, res) {
    try {
        let queryParams = req.query
        if (!isValidRequestBody(queryParams)) return res.status(400).send({ status: false, msg: "No query recieved for delete operation" })
        let filterQuery = { isDeleted: false, deletedAt: null }
        let { authorId, tags, category, subcategory, isPublished } = queryParams;
        if (isValid(authorId) && isValidObjectId(authorId)) {
            filterQuery['authorId'] = authorId;
        }
        if (isValid(category)) {
            filterQuery['category'] = category.trim();
        }
        if (isValid(isPublished)) {
            filterQuery['isPublished'] = isPublished;
        }
        if (isValid(tags)) {
            let tagArr = tags.trim().split(",").map(item => item.trim())
            filterQuery['tags'] = tagArr;
        }
        if (isValid(subcategory)) {
            let subCatArr = subcategory.trim().split(",").map(item => item.trim())
            filterQuery['subcategory'] = subCatArr;
        }
        let findBlog = await blogModel.find(filterQuery)

        if (!findBlog.length && Array.isArray(findBlog)) return res.status(404).send({ status: false, msg: "No Blogs found" })

        let IdOffilterBlog = findBlog.map(item => { if (item.authorId.toString() === req.authorId.toString()) return item._id })

        let deleteBlog = await blogModel.updateMany({ _id: IdOffilterBlog },
            { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

        return res.status(200).send({ status: true, data: deleteBlog })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, error: err.msg })
    }
}

module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlogById = updateBlogById
module.exports.deleteBlogById = deleteBlogById;
module.exports.deleteBlogByQuery = deleteBlogByQuery;



