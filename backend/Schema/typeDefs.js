const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    isVerified: Boolean!
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    me: User
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): String
    verifyOTP(email: String!, otp: String!): String
    login(email: String!, password: String!): AuthPayload
    forgotPassword(email: String!): String
    resetPassword(email: String!, otp: String!, newPassword: String!): String
  }
`;
