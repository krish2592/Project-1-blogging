
const mongoose = require("mongoose")
const authorModel = require("../Models/authorModel")
const blogModel = require("../Models/blogModel")
const ObjectId = require("mongoose").Types.ObjectId;

// Blog Creation
let createBlog = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data).length != 0) {

            if (!data.title) return res.status(400).send({ status: false, msg: "Please Fill the required field title!" })
            if (!data.body) return res.status(400).send({ status: false, msg: "Please Fill the required field body!" })
            if (!data.authorId) return res.status(400).send({ status: false, msg: "Please Fill the required field Author details!" })
            if (!data.category) return res.status(400).send({ status: false, msg: "Please Fill the required field catergory!" })
            // Validation of ID format
            let isValid = mongoose.Types.ObjectId.isValid(data.authorId)
            if (isValid == false) return res.status(400).send({ status: false, msg: "Not a valid author ID" })
            // Validation of id exist or not
            let id = req.body.authorId
            let findAuthorId = await authorModel.findById(id)
            if (!findAuthorId) return res.status(404).send({ status: false, msg: "Author Not found. Please enter a valid Author id." })
            // Adding Publish date if true
            if (data.isPublished)
                req.body['publishedAt'] = new Date()


            let saveData = await blogModel.create(data);
            res.status(201).send({ status: true, msg: saveData });
        } else {
            res.status(400).send({ status: false, msg: "NO USER INPUT" })
        }

    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message });
    }
}

// GET Blogs
const getBlogs = async function (req, res) {
    try {
        let userInput = req.query
        if (Object.keys(userInput).length == 0) {
            let findBLogs = await blogModel.find({ isDeleted: false, isPublished: true })
            // If both condition false 
            if (Object.entries(findBLogs).length == 0)
                return res.status(404).send({ status: false, msg: "Sorry!! No blogs found." })
            res.status(200).send({ status: true, msg: findBLogs })
        } else {
            let filter = { isDeleted: false, isPublished: true, ...userInput }
            const filterByInput = await blogModel.find(filter)
            if (Object.entries(filterByInput).length == 0)
                return res.status(404).send({ status: false, msg: "Sorry!! No blogs found. Please enter valid Input." })

            res.status(200).send({ status: true, msg: filterByInput })
        }

    } catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message });
    }
}

// Update Blog 
const updateBlogById = async function (req, res) {
    try {
        let id = req.params.blogId

        let isValid = mongoose.Types.ObjectId.isValid(id)
        if (isValid == false) return res.status(400).send({ status: false, msg: "Not a valid BLOG ID" })

        let blogDetails = await blogModel.findById(id)
        let blogDelete = blogDetails.isDeleted
        if (blogDelete == true) return res.status(404).send({ status: false, msg: "Blog is deleted" })

        let updatedData = req.body
        let updatedTitle = req.body.title
        let updatedBody = req.body.body
        let updatedTag = req.body.tags
        let updatedSubcategory = req.body.subcategory

        if (Object.keys(updatedData).length == 0) return res.status(400).send({ status: false, msg: "NO INPUT BY USER" })

        let blogPublished = blogDetails.isPublished
        // if book is not published 
        if (blogPublished == false) {
            let updatedBlog = await blogModel.findOneAndUpdate({ _id: id },
                {
                    $set: { title: updatedTitle, body: updatedBody, isPublished: true, publishedAt: new Date() },
                    $push: { tags: updatedTag, subcategory: updatedSubcategory }
                }, { new: true })

            res.status(200).send({ status: true, msg: updatedBlog })
        }
        // if book is already published
        else {
            let updatedBlog = await blogModel.findOneAndUpdate({ _id: id },
                {
                    $set: { title: updatedTitle, body: updatedBody },
                    $push: { tags: updatedTag, subcategory: updatedSubcategory }
                }, { new: true })
            res.status(200).send({ status: true, msg: updatedBlog })
        }

    } catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message });
    }
}

// Delete by Id
let deleteBlogById = async function (req, res) {
    try {
        let blogId = req.params.blogId;
        if (!ObjectId.isValid(blogId))
            return res.status(400).send({ status: false, msg: "Not a valid blog id" })
        let deleteBlog = await blogModel.findOneAndUpdate(
            { _id: blogId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        if (!deleteBlog)
            return res.status(404).send({ status: false, msg: "Blog does not exist" })
        res.status(200).send({ status: true, data: deleteBlog })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}
// Delete by Query
// let deleteBlogByQuery = async function (req, res) {
//     try {
//         let data = req.query
//         if (!Object.keys(data).length)
//             return res.status(400).send({ status: false, msg: "No user input" })
//         let filter = { isDeleted: false, ...data }

//         let findDocsById = await blogModel.find(filter).select({ _id: 1 })
//         if (!findDocsById.length)
//             return res.status(400).send({ status: false, msg: "Document Not found" })

//         let deleteBlog = await blogModel.updateMany({ _id: findDocsById},
//             { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
//         res.status(200).send({ status: true, data: deleteBlog })
//     }
//     catch (err) {
//         console.log(err.message)
//         res.status(500).send({ status: false, error: err.msg })
//     }
// }


let deleteBlogByQuery = async function (req, res) {
        try {
            let data = req.query
            if (!Object.keys(data).length)
                return res.status(400).send({ status: false, msg: "No user input" })
            let filter = { isDeleted: false, ...data }
    
            let findDocsById = await blogModel.find(filter).select({ _id: 1 })
            if (!findDocsById.length)
                return res.status(404).send({ status: false, msg: "Document Not found" })
    
            let deleteBlog = await blogModel.updateMany({ _id: findDocsById},
                { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
            res.status(200).send({ status: true, data: deleteBlog })
        }
        catch (err) {
            console.log(err.message)
            res.status(500).send({ status: false, error: err.msg })
        }
    }

module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlogById = updateBlogById
module.exports.deleteBlogById = deleteBlogById;
module.exports.deleteBlogByQuery = deleteBlogByQuery;

