import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import Image from "../../components/image/image";
import { Link } from "react-router";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { isPending, error, data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest.get("/notifications").then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: () => apiRequest.put("/notifications/read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (isPending)
    return <div style={{ padding: "20px" }}>Loading notifications...</div>;
  if (error)
    return (
      <div style={{ padding: "20px" }}>An error occurred: {error.message}</div>
    );

  const unreadCount = data.filter((n) => !n.read).length;

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Updates & Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => mutation.mutate()}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: "#e60023",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div
          style={{
            padding: "20px",
            background: "#f0f0f0",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h3>All caught up!</h3>
          <p>No new updates for you right now.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.map((n) => (
            <Link
              key={n._id}
              to={n.pinId ? `/pin/${n.pinId._id}` : "#"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "15px",
                background: n.read ? "#f9f9f9" : "#fff0f0",
                borderRadius: "16px",
                textDecoration: "none",
                color: "black",
                border: n.read ? "1px solid #efefef" : "1px solid #ffcccc",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                <Image
                  path={n.sender.img || "/general/noAvatar.png"}
                  w={40}
                  h={40}
                />
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ margin: 0 }}>
                  <strong>{n.sender.displayName}</strong>{" "}
                  {n.type === "comment"
                    ? "commented on your pin:"
                    : "interacted with your pin:"}
                </p>
                <p style={{ margin: 0, color: "#555", fontSize: "14px" }}>
                  "{n.text}"
                </p>
              </div>

              {n.pinId && (
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <Image path={n.pinId.media} w={50} h={50} />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default NotificationsPage;
