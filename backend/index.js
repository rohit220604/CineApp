require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const typeDefs = require("./Schema/typeDefs");
const resolvers = require("./Schema/resolvers");
const jwt = require("jsonwebtoken");

// Importing models
const User = require("./models/User");
const Review = require("./models/Review");

const app = express();

//CORS configuration
app.use(cors({
  origin: true,
  credentials: true 
}));

const getUser = (token) => {
  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET);
    }
    return null;
  } catch {
    return null;
  }
};

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      const user = getUser(token.replace("Bearer ", ""));
      return {
        user,
        User,
        Review
      };
    },
    introspection: true,
    playground: true
  });

  await server.start();
  server.applyMiddleware({ app, cors: false });

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(err => {
  console.error("Server startup error:", err);
  process.exit(1);
});
