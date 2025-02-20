require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 7000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8oded.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB Once
async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
}
connectDB();

// Database Collections
const userCollection = client.db("scic").collection("users");
const taskCollection = client.db("scic").collection("alltask");

// ✅ Store a new user
app.post("/user", async (req, res) => {
  try {
    const user = req.body;
    const result = await userCollection.insertOne(user);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Error storing user", error });
  }
});

// ✅ Get all users
app.get("/users", async (req, res) => {
  try {
    const result = await userCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error fetching users", error });
  }
});

// ✅ Store a new task
app.post("/task", async (req, res) => {
  try {
    const task = req.body;
    const result = await taskCollection.insertOne(task);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Error storing task", error });
  }
});

// ✅ Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await taskCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error fetching tasks", error });
  }
});

// ✅ Get tasks by user email
app.get("/tasks/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const result = await taskCollection.find({ email }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error fetching tasks by email", error });
  }
});

// ✅ Get a single task by ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await taskCollection.findOne({ _id: id });
    if (!result) return res.status(404).send({ message: "Task not found" });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error fetching task", error });
  }
});

// ✅ Delete a task by ID
app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await taskCollection.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).send({ message: "Task not found" });
    res.send({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error deleting task", error });
  }
});

// ✅ Update task (PATCH)
app.patch("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    const result = await taskCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, description, category } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "Task not found" });
    }

    const updatedTask = await taskCollection.findOne({ _id: new ObjectId(id) });
    res.send(updatedTask);
  } catch (error) {
    res.status(500).send({ message: "Failed to update task", error });
  }
});

// ✅ Update only category (PUT)
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    const result = await taskCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { category } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await taskCollection.findOne({ _id: new ObjectId(id) });
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("Server Running");
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
