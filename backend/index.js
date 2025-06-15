require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const typeDefs = require("./Schema/typeDefs");
const resolvers = require("./Schema/resolvers");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({ origin: true, credentials: true }));

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
      return { user };
    },
  });
  await server.start();
  server.applyMiddleware({ app, cors: false });

  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  app.listen(4000, () => {
    console.log("Server running at http://localhost:4000" + server.graphqlPath);
  });
}

startServer();
