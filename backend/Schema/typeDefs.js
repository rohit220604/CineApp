const { gql } = require("apollo-server-express");

module.exports = gql`

type User {
  id: ID!
  username: String!
  publicName: String
  email: String!
  isVerified: Boolean!
  watchedMovies: [Int!]!
  savedMovies: [Int!]!
  followers: [String!]!
  following: [String!]!
  followRequests: [String!]!
}

type AuthPayload {
  token: String!
  user: User!
}

type Review {
  id: ID!
  user: User!
  tmdbId: Int!
  rating: Int!
  comment: String
  createdAt: String!
}

type Query {
  me: User
  myReviews: [Review!]!
  myWatchedMovies: [Int!]!
  mySavedMovies: [Int!]!
  reviewsForMovie(tmdbId: Int!): [Review!]!
  followers(username: String!): [String!]!
  following(username: String!): [String!]!
  pendingFollowRequests: [String!]!
  userWatchedMovies(username: String!): [Int!]!
  userSavedMovies(username: String!): [Int!]!
}

type Mutation {
  register(name: String!, email: String!, password: String!, username: String!): Boolean!
  verifyOTP(email: String!, otp: String!): Boolean!
  login(email: String!, password: String!): AuthPayload!
  forgotPassword(email: String!): Boolean!
  resetPassword(email: String!, otp: String!, newPassword: String!): Boolean!
  saveForLater(tmdbId: Int!): Boolean!
  markAsWatched(tmdbId: Int!): Boolean!
  removeFromSaved(tmdbId: Int!): Boolean!
  removeFromWatched(tmdbId: Int!): Boolean!
  addReview(tmdbId: Int!, rating: Int!, comment: String): Review!
  sendFollowRequest(username: String!): Boolean!
  acceptFollowRequest(username: String!): Boolean!
  rejectFollowRequest(username: String!): Boolean!
}
`;
