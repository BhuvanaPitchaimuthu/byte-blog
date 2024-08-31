import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv"; 

// Blog API
const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
env.config()
const categories = ["space", "tech", "food", "health", "arts", "env", "other"];

// create connection for the database
const db = new pg.Client({
  host: "localhost",
  port: "5432",
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "blog",
});

db.connect();

let posts = [];
db.query("SELECT * FROM posts", (err, res) => {
  if (err) {
    console.log("error fetching data.");
  } else {
    posts = res.rows;
  }
});

// get all posts
app.get("/posts", (req, res) => {
  res.send(posts);
});

// create new posts
app.post("/api/new-post", async (req, res) => {
  let userTitle = req.body.title;
  let userContent = req.body.content;
  let userName = req.body.author;
  let creationDateofPost = new Date().toISOString().split("T")[0];
  let userChoosenCategory = req.body.category;

  try {
    let newPost = await db.query(
      `INSERT INTO POSTS (title, content, author, creation_date, category) VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [
        userTitle,
        userContent,
        userName,
        creationDateofPost,
        userChoosenCategory,
      ]
    );
    posts.push(newPost.rows[0]);
    res.send(newPost.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error inserting data." });
  }
});

// edit existing posts
app.get("/edit-post/:id", (req, res) => {
  let editData;
  const postId = parseInt(req.params.id);
  editData = posts.find((post) => {
    return post.id === postId;
  });
  res.json(editData);
});

app.patch("/api/edit-post/:id", async (req, res) => {
  const postId = parseInt(req.params.id);

  try {
    let existingPost = posts.find((post) => {
      return post.id === postId;
    });

    let changesTitel = req.body.title || existingPost.title;
    let changedContent = req.body.content || existingPost.content;
    let changedAuthor = req.body.author || existingPost.author;
    let changedDate = new Date().toISOString().split("T")[0];
    let changedCategory = req.body.category || existingPost.category;

    let editedPost = await db.query(
      `UPDATE posts SET title = $1, content = $2 , author = $3, creation_date = $4, category = $5 WHERE id = $6 RETURNING *`,
      [
        changesTitel,
        changedContent,
        changedAuthor,
        changedDate,
        changedCategory,
        existingPost.id,
      ]
    );
    let existingPostIndex = posts.findIndex((post) => {
      return post.id === postId;
    });

    posts[existingPostIndex] = editedPost.rows[0];
    res.send(editedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error editing the post" });
  }
});

// display the blog content
app.get("/api/content/:id", (req, res) => {
  const contentId = parseInt(req.params.id);
  let contentData = posts.find((post) => {
    return post.id === contentId;
  });
  res.send(contentData);
});

// delete the blog post

app.delete("/api/delete-post/:id", async (req, res) => {
  const deleteId = parseInt(req.params.id);
  try {
    let deletePostIndex = posts.findIndex((post) => {
      return post.id === deleteId;
    });
    posts.splice(deletePostIndex, 1);

    let deletePost = await db.query(
      "DELETE FROM POSTS WHERE id = $1 RETURNING *",
      [deleteId]
    );
    res.send(deletePost.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleteing post" });
  }
});

// categories:

app.get("/api/:category", (req, res) => {
  let userChosenCategory = req.params.category;
  if (categories.includes(userChosenCategory)) {
    try {
      let chosenPosts = posts.filter((post) => {
        return post.category === userChosenCategory;
      });
      res.send(chosenPosts);
    } catch {
      res.status(500).json("No post found in the category you choose. ");
    }
  }
});

// news letters - subscribe

app.post("/api/news-letter", async (req, res) => {
  try {
    const email = await db.query(
      "INSERT INTO newsletter (email) VALUES($1) RETURNING *",
      [req.body.email[0]]
    );
    res.send(email.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error inserting email into data base " });
  }
});

app.listen(port, () => {
  console.log(`API is running at port ${port}`);
});
