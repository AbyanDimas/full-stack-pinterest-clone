import { useState } from "react";
import { useNavigate } from "react-router";
import Image from "../image/image";
import "./postInteractions.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";

const interact = async (id, type) => {
  const res = await apiRequest.post(`/pins/interact/${id}`, { type });
  return res.data;
};

const PostInteractions = ({ postId }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const mutation = useMutation({
    mutationFn: ({ id, type }) => interact(id, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["interactionCheck", postId] });
      queryClient.invalidateQueries({ queryKey: ["pins"] });
      if (variables.type === "save") {
        showToast("Save status updated!");
      } else {
        showToast("Like status updated!");
      }
    },
    onError: () => {
      showToast("Action failed. Please log in.");
    },
  });

  const { isPending, error, data } = useQuery({
    queryKey: ["interactionCheck", postId],
    queryFn: () =>
      apiRequest
        .get(`/pins/interaction-check/${postId}`)
        .then((res) => res.data),
  });

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/pin/${postId}`);
    showToast("Link copied to clipboard!");
    setShowMoreMenu(false);
  };

  const handleDownload = async () => {
    // Note: We need the actual media filename, but we only have interactionCheck data here.
    // However, the parent PostPage already fetched the full pin data.
    // We can fetch it from the query cache.
    const pinData = queryClient.getQueryData(["pin", postId]);
    if (!pinData) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_IMGPROXY_URL}/rs:fill:0:0:0/g:sm/plain/s3://pinterest/${pinData.media}`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pinterest-${postId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started!");
    } catch (err) {
      showToast("Download failed.");
    }
    setShowMoreMenu(false);
  };

  const handleHide = () => {
    // Simulate hiding the pin by navigating back
    showToast("Pin hidden!");
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  if (isPending || error) return null;

  return (
    <div className="postInteractions" style={{ position: "relative" }}>
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "24px",
            fontWeight: "500",
            fontSize: "14px",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          {toastMessage}
        </div>
      )}

      {showMoreMenu && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "0",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 100,
            minWidth: "150px",
          }}
        >
          <button
            onClick={handleShare}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              textAlign: "left",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              width: "100%",
              color: "#111",
            }}
          >
            Copy Link
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              textAlign: "left",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              width: "100%",
              color: "#111",
            }}
          >
            Download Image
          </button>
          <button
            onClick={() => {
              window.open(`/pin/${postId}`, "_blank");
              setShowMoreMenu(false);
            }}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              textAlign: "left",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              width: "100%",
              color: "#111",
            }}
          >
            Open in New Tab
          </button>
          <button
            onClick={handleHide}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              textAlign: "left",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              color: "#e60023",
              width: "100%",
            }}
          >
            Hide Pin
          </button>
        </div>
      )}

      <div className="interactionIcons">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => mutation.mutate({ id: postId, type: "like" })}
          style={{ cursor: "pointer" }}
        >
          <path
            d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
            stroke={data.isLiked ? "#e50829" : "#000000"}
            strokeWidth="2"
            fill={data.isLiked ? "#e50829" : "none"}
          />
        </svg>
        {data.likeCount}
        <button
          onClick={handleShare}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            padding: 0,
          }}
        >
          <Image path="/general/share.svg" alt="" />
        </button>
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            padding: 0,
          }}
        >
          <Image path="/general/more.svg" alt="" />
        </button>
      </div>
      <button
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ id: postId, type: "save" })}
        style={{
          background: data.isSaved ? "#111" : "#e50829",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "24px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {data.isSaved ? "Saved" : "Save"}
      </button>
    </div>
  );
};

export default PostInteractions;
