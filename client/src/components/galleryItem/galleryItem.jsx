import "./galleryItem.css";
import { useState } from "react";
import { Link } from "react-router";
import Image from "../image/image";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";

const GalleryItem = ({ item }) => {
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const optimizedHeight = (372 * item.height) / item.width;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      apiRequest.post(`/pins/interact/${item._id}`, { type: "save" }),
    onSuccess: () => {
      showToast("Pin saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["pins"] });
    },
    onError: () => {
      showToast("Please login to save pins!");
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/pin/${item._id}`);
    showToast("Link copied to clipboard!");
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_IMGPROXY_URL}/rs:fill:0:0:0/g:sm/plain/s3://pinterest/${item.media}`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pinterest-${item._id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started!");
    } catch (err) {
      showToast("Download failed.");
    }
    setShowMoreMenu(false);
  };

  if (isHidden) return null;

  return (
    <div className="galleryItem">
      <Image path={item.media} alt="" w={372} h={optimizedHeight} />
      <Link to={`/pin/${item._id}`} className="overlay" />
      <button
        className="saveButton"
        onClick={(e) => {
          e.stopPropagation();
          saveMutation.mutate();
        }}
      >
        Save
      </button>

      {toastMessage && <div className="customToast">{toastMessage}</div>}

      {showMoreMenu && (
        <div className="moreMenuDropdown">
          <button
            onClick={() => {
              handleShare();
              setShowMoreMenu(false);
            }}
          >
            Copy Link
          </button>
          <button onClick={handleDownload}>Download Image</button>
          <button onClick={() => window.open(`/pin/${item._id}`, "_blank")}>
            Open in New Tab
          </button>
          <button
            onClick={() => setIsHidden(true)}
            style={{ color: "#e60023" }}
          >
            Hide Pin
          </button>
        </div>
      )}

      <div className="overlayIcons">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
        >
          <Image path="/general/share.svg" alt="" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMoreMenu(!showMoreMenu);
          }}
        >
          <Image path="/general/more.svg" alt="" />
        </button>
      </div>
    </div>
  );
};

export default GalleryItem;
