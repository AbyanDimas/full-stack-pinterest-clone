import useAuthStore from "../../utils/authStore";

const SettingsPage = () => {
  const { currentUser, logout } = useAuthStore();

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Settings</h1>
      
      <div style={{ padding: "20px", background: "#f0f0f0", borderRadius: "16px" }}>
        <h2>Profile Information</h2>
        <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <p><strong>Username:</strong> {currentUser?.username}</p>
          <p><strong>Display Name:</strong> {currentUser?.displayName}</p>
          <p><strong>Email:</strong> {currentUser?.email}</p>
        </div>
      </div>

      <div style={{ padding: "20px", background: "#ffebe9", borderRadius: "16px", border: "1px solid #ff8182" }}>
        <h2 style={{ color: "#d1242f" }}>Danger Zone</h2>
        <p style={{ margin: "10px 0" }}>Log out from this device to end your current session.</p>
        <button 
          onClick={logout} 
          style={{ padding: "10px 20px", background: "#e60023", color: "white", border: "none", borderRadius: "24px", cursor: "pointer", fontWeight: "bold" }}>
          Log out
        </button>
      </div>
    </div>
  );
};
export default SettingsPage;
