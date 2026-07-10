import { useState } from "react";
import useAuthStore from "../../utils/authStore";
import apiRequest from "../../utils/apiRequest";
import Image from "../../components/image/image";
import { useMutation } from "@tanstack/react-query";
import "./settingsPage.css";

const updateProfile = async (data) => {
  const { id, payload } = data;
  const res = await apiRequest.put(`/users/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

const SettingsPage = () => {
  const { currentUser, logout, updateCurrentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || "",
    username: currentUser?.username || "",
    email: currentUser?.email || "",
  });
  const [file, setFile] = useState(null);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update global auth store with new user data
      updateCurrentUser(data);
      alert("Profile updated successfully!");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to update profile.");
    },
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataPayload = new FormData();
    formDataPayload.append("displayName", formData.displayName);
    formDataPayload.append("username", formData.username);
    formDataPayload.append("email", formData.email);
    
    if (file) {
      formDataPayload.append("media", file);
    }

    mutation.mutate({ id: currentUser._id, payload: formDataPayload });
  };

  return (
    <div className="settingsPage">
      <div className="settingsSidebar">
        <h2>Settings</h2>
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Public profile
        </button>
        <button
          className={activeTab === "account" ? "active" : ""}
          onClick={() => setActiveTab("account")}
        >
          Account management
        </button>
      </div>

      <div className="settingsContent">
        {activeTab === "profile" && (
          <div className="settingsSection">
            <div>
              <h1>Public profile</h1>
              <p>People visiting your profile will see the following info</p>
            </div>

            <form className="settingsForm" onSubmit={handleSubmit}>
              <div className="settingsFormGroup">
                <label>Photo</label>
                <div className="settingsProfilePic">
                  {file ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" />
                  ) : (
                    <Image path={currentUser?.img || "/general/noAvatar.png"} />
                  )}
                  <label htmlFor="fileInput">Change</label>
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="settingsFormGroup">
                <label htmlFor="displayName">Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Your Name"
                />
              </div>

              <div className="settingsFormGroup">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                />
              </div>

              <div className="settingsFormGroup">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                />
              </div>

              <div className="settingsActions">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      displayName: currentUser?.displayName || "",
                      username: currentUser?.username || "",
                      email: currentUser?.email || "",
                    });
                    setFile(null);
                  }}
                >
                  Reset
                </button>
                <button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "account" && (
          <div className="settingsSection">
            <div>
              <h1>Account management</h1>
              <p>Make changes to your personal information or account type.</p>
            </div>

            <div className="settingsForm">
              <div className="dangerZone">
                <h3>Danger Zone</h3>
                <p>Log out from this device to end your current session.</p>
                <button onClick={logout}>Log out</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
