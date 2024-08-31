import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
// server api
const API_URL = "http://localhost:4000";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// home route
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching post" });
  }
});

// get New post
app.get("/new", (req, res) => {
  res.render("new-post.ejs");
});

// create new post
app.post("/new-post", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/api/new-post`, req.body);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ error: "Error posting the blog" });
  }
});

// edit post

app.get("/edit/:id", async (req, res) => {
  const response = await axios.get(`${API_URL}/edit-post/${req.params.id}`);
  res.render("edit-post.ejs", { postData: response.data });
});

app.post("/edit-post/:id", async (req, res) => {
  const editPostId = req.params.id;
  try {
    const response = await axios.patch(
      `${API_URL}/api/edit-post/${editPostId}`,
      req.body
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error editing post. Try again later" });
  }
});

// delete blog post
app.get("/delete/:id", async (req, res) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/delete-post/${req.params.id}`
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error deleting post" });
  }
});

// display whole content.

app.get("/content/:author/:id", async (req, res) => {
  const contentId = req.params.id;
  const response = await axios.get(`${API_URL}/api/content/${contentId}`);
  let postContentData = response.data;
  res.render("blog-content.ejs", { contentDetails: postContentData });
});

// contact page
app.get("/contact-me", (req, res) => {
  res.render("contact-form.ejs");
});

// filter conditions

app.get("/:id", async (req, res) => {
  let userChoice = req.params.id;
  try {
    const response = await axios.get(`${API_URL}/api/${userChoice}`);
    let filteredPosts = response.data;
    if (filteredPosts.length > 0) {
      res.render("filter-content.ejs", { filteredPosts: filteredPosts });
    } else {
      res.send("No records found under the chosen category!!");
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "RError found filtering data based on the selection!!" });
  }
});

// news letters

app.post("/news-letter", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/api/news-letter`, req.body);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error subscribing news letter" });
  }
});

app.listen(port, () => {
  console.log(`Backend Server running at port ${port}`);
});
