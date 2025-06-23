import React, { useEffect, useState } from "react";

// Helper for GraphQL fetch
const fetchGraphQL = async (query, variables = {}, token = null) => {
  const res = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
};

const ME_QUERY = `
  query Me {
    me {
      id
      username
      publicName
      followers
      following
    }
  }
`;

const PENDING_REQUESTS_QUERY = `
  query PendingFollowRequests {
    pendingFollowRequests
  }
`;

const SEND_FOLLOW_REQUEST = `
  mutation SendFollowRequest($username: String!) {
    sendFollowRequest(username: $username)
  }
`;

const ACCEPT_FOLLOW_REQUEST = `
  mutation AcceptFollowRequest($username: String!) {
    acceptFollowRequest(username: $username)
  }
`;

const REJECT_FOLLOW_REQUEST = `
  mutation RejectFollowRequest($username: String!) {
    rejectFollowRequest(username: $username)
  }
`;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [requestMsg, setRequestMsg] = useState("");
  const token = localStorage.getItem("token");

  // Fetch user data and follow requests on mount
  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [meRes, reqRes] = await Promise.all([
        fetchGraphQL(ME_QUERY, {}, token),
        fetchGraphQL(PENDING_REQUESTS_QUERY, {}, token),
      ]);
      if (meRes.errors) throw new Error(meRes.errors[0].message);
      if (reqRes.errors) throw new Error(reqRes.errors[0].message);
      setUser(meRes.data.me);
      setPendingRequests(reqRes.data.pendingFollowRequests);
    } catch (err) {
      setError(err.message || "Error loading profile.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [token]);

  // Handle follow by username
  const handleFollow = async (username) => {
    setFollowLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetchGraphQL(SEND_FOLLOW_REQUEST, { username }, token);
      if (res.errors) throw new Error(res.errors[0].message);
      setSuccessMsg("Follow request sent!");
    } catch (err) {
      setError(err.message || "Failed to send follow request.");
    }
    setFollowLoading(false);
  };

  // Accept follow request
  const handleAccept = async (username) => {
    setRequestsLoading(true);
    setRequestMsg("");
    setError("");
    try {
      const res = await fetchGraphQL(ACCEPT_FOLLOW_REQUEST, { username }, token);
      if (res.errors) throw new Error(res.errors[0].message);
      setRequestMsg(`Accepted @${username}'s follow request.`);
      // Refresh requests and followers
      await fetchAll();
    } catch (err) {
      setError(err.message || "Failed to accept request.");
    }
    setRequestsLoading(false);
  };

  // Reject follow request
  const handleReject = async (username) => {
    setRequestsLoading(true);
    setRequestMsg("");
    setError("");
    try {
      const res = await fetchGraphQL(REJECT_FOLLOW_REQUEST, { username }, token);
      if (res.errors) throw new Error(res.errors[0].message);
      setRequestMsg(`Rejected @${username}'s follow request.`);
      // Refresh requests
      await fetchAll();
    } catch (err) {
      setError(err.message || "Failed to reject request.");
    }
    setRequestsLoading(false);
  };

  // Followers/following as usernames
  const followers = user?.followers || [];
  const following = user?.following || [];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: "32px 48px",
        background: "#181d2a",
        color: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      {loading ? (
        <div style={{ color: "#8bb4ff", fontSize: 18 }}>Loading profile...</div>
      ) : error ? (
        <div style={{ color: "red", fontSize: 16 }}>{error}</div>
      ) : (
        user && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 4 }}>
                {user.publicName || user.username}{" "}
                <span style={{ fontWeight: 400, fontSize: 20, color: "#8bb4ff" }}>
                  @{user.username}
                </span>
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: 40,
                  marginTop: 16,
                  marginBottom: 8,
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: 18 }}>
                    {followers.length}
                  </span>{" "}
                  <span style={{ color: "#b0b4c0" }}>Followers</span>
                  <div style={{ marginTop: 8 }}>
                    {followers.map((uname) => (
                      <div key={uname} style={{ fontSize: 15, marginBottom: 2 }}>
                        <span style={{ color: "#8bb4ff" }}>@{uname}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 18 }}>
                    {following.length}
                  </span>{" "}
                  <span style={{ color: "#b0b4c0" }}>Following</span>
                  <div style={{ marginTop: 8 }}>
                    {following.map((uname) => (
                      <div key={uname} style={{ fontSize: 15, marginBottom: 2 }}>
                        <span style={{ color: "#8bb4ff" }}>@{uname}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Follow Requests Section */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 22, marginBottom: 12, fontWeight: 600 }}>
                Follow Requests
              </h3>
              {requestsLoading && (
                <div style={{ color: "#8bb4ff", marginBottom: 8 }}>
                  Updating...
                </div>
              )}
              {requestMsg && (
                <div style={{ color: "#8bb4ff", marginBottom: 8 }}>
                  {requestMsg}
                </div>
              )}
              {pendingRequests.length === 0 ? (
                <div style={{ color: "#888", fontSize: 15 }}>No pending requests.</div>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {pendingRequests.map((uname) => (
                    <li
                      key={uname}
                      style={{
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #22283a",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>
                        <span style={{ color: "#8bb4ff" }}>@{uname}</span>
                      </span>
                      <span>
                        <button
                          style={{
                            padding: "5px 14px",
                            borderRadius: 6,
                            background: "#4f8cff",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 500,
                            fontSize: 14,
                            marginRight: 8,
                          }}
                          onClick={() => handleAccept(uname)}
                          disabled={requestsLoading}
                        >
                          Accept
                        </button>
                        <button
                          style={{
                            padding: "5px 14px",
                            borderRadius: 6,
                            background: "#ff5c5c",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 500,
                            fontSize: 14,
                          }}
                          onClick={() => handleReject(uname)}
                          disabled={requestsLoading}
                        >
                          Reject
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <hr style={{ borderColor: "#22283a", margin: "24px 0" }} />

            <div style={{ marginBottom: 8 }}>
              <h3 style={{ fontSize: 22, marginBottom: 12, fontWeight: 600 }}>
                Find and Follow Users
              </h3>
              <input
                type="search"
                placeholder="Enter username to follow..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 7,
                  border: "1px solid #2a3142",
                  width: "100%",
                  marginBottom: 16,
                  background: "#22283a",
                  color: "#fff",
                  fontSize: 16,
                }}
              />
              <button
                style={{
                  padding: "6px 18px",
                  borderRadius: 6,
                  background: "#4f8cff",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: 15,
                  transition: "background 0.2s",
                  opacity: followLoading ? 0.7 : 1,
                }}
                onClick={() => handleFollow(searchUsername)}
                disabled={followLoading || !searchUsername || searchUsername === user.username}
              >
                {followLoading ? "Requesting..." : "Follow"}
              </button>
              {successMsg && (
                <div style={{ color: "#8bb4ff", marginTop: 8 }}>{successMsg}</div>
              )}
              {searchUsername && searchUsername === user.username && (
                <div style={{ color: "#f99", marginTop: 8 }}>You cannot follow yourself.</div>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
};

export default UserProfile;
