import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      if (login) login(token);
      navigate("/"); 
    } else {
      navigate("/login"); 
    }
  }, [location, navigate, login]);

  return <div>Signing you in...</div>;
};

export default OAuthSuccess;
