import { useState } from "react";
import "./postPage.css";
import Image from "../../components/image/image";
import PostInteractions from "../../components/postInteractions/postInteractions";
import { Link, useParams, useNavigate } from "react-router";
import Comments from "../../components/comments/comments";
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const { isPending, error, data } = useQuery({
    queryKey: ["pin", id],
    queryFn: () => apiRequest.get(`/pins/${id}`).then((res) => res.data),
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  if (!data) return "Pin not found!";

  return (
    <div className="postPage">
      <div 
        onClick={() => navigate(-1)} 
        style={{ cursor: "pointer", display: "flex", marginTop: "16px" }}
        title="Go Back"
      >
        <svg height="24" viewBox="0 0 24 24" width="24">
          <path d="M8.41 4.59a2 2 0 1 1 2.83 2.82L8.66 10H21a2 2 0 0 1 0 4H8.66l2.58 2.59a2 2 0 1 1-2.82 2.82L1 12z"></path>
        </svg>
      </div>
      <div className={`postContainer ${isExpanded ? "expanded" : ""}`}>
        <div className="postImg" style={{ position: "relative" }}>
          <Image path={data.media} alt="" w={isExpanded ? undefined : 736} />
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              padding: "10px 16px",
              borderRadius: "24px",
              border: "none",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(4px)",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            {isExpanded ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                Minimize
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                Expand
              </>
            )}
          </button>
        </div>
        <div className="postDetails">
          <PostInteractions postId={id}/>
          <Link to={`/${data.user.username}`} className="postUser">
            <Image path={data.user.img || "/general/noAvatar.png"} />
            <span>{data.user.displayName}</span>
          </Link>
          <Comments id={data._id}/>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
