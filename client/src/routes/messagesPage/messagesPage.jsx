import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import Image from "../../components/image/image";
import useAuthStore from "../../utils/authStore";

const MessagesPage = () => {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { isPending, error, data } = useQuery({
    queryKey: ["messages"],
    queryFn: () => apiRequest.get("/messages").then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: () => apiRequest.put("/messages/read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  if (isPending) return <div style={{ padding: "20px" }}>Loading messages...</div>;
  if (error) return <div style={{ padding: "20px" }}>An error occurred: {error.message}</div>;

  const unreadCount = data.filter((m) => !m.read && m.recipient._id === currentUser._id).length;

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Messages</h1>
        {unreadCount > 0 && (
          <button 
            onClick={() => mutation.mutate()}
            style={{ padding: "8px 16px", borderRadius: "20px", border: "none", background: "#e60023", color: "white", cursor: "pointer", fontWeight: "bold" }}>
            Mark all as read
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div style={{ padding: "20px", background: "#f0f0f0", borderRadius: "16px", textAlign: "center" }}>
          <h3>Your Inbox</h3>
          <p>No new messages right now.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.map((m) => {
            const isMe = m.sender._id === currentUser._id;
            const otherUser = isMe ? m.recipient : m.sender;
            const isUnread = !m.read && !isMe;
            
            return (
              <div 
                key={m._id} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "15px", 
                  padding: "15px", 
                  background: isUnread ? "#fff0f0" : "#f9f9f9", 
                  borderRadius: "16px",
                  border: isUnread ? "1px solid #ffcccc" : "1px solid #efefef"
                }}>
                
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden" }}>
                  <Image path={otherUser.img || "/general/noAvatar.png"} w={40} h={40} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "bold" }}>
                    {otherUser.displayName}
                  </p>
                  <p style={{ margin: 0, color: "#555", fontSize: "14px" }}>
                    {isMe ? "You: " : ""}{m.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default MessagesPage;
