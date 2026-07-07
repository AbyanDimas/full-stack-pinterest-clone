import './savedPage.css'
import Gallery from "../../components/gallery/gallery";
import useAuthStore from "../../utils/authStore";

const SavedPage = () => {
  const { currentUser } = useAuthStore();

  if (!currentUser) return <div style={{ padding: "20px" }}>Please login to view saved pins.</div>;

  return (
    <div className="savedPage" style={{ padding: "0 20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2>Your Saved Pins</h2>
        <p style={{ color: "#777" }}>All the ideas you've collected in one place.</p>
      </div>
      <Gallery savedUserId={currentUser._id} />
    </div>
  )
}

export default SavedPage
