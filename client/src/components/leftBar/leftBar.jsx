import Image from "../image/image";
import { Link } from "react-router";
import "./leftBar.css";

const LeftBar = () => {
  return (
    <div className="leftBar">
      <div className="menuIcons">
        <Link to="/" className="menuIcon">
          <Image path="/general/logo.png" alt="" className="logo" />
        </Link>
        <Link to="/" className="menuIcon">
          <Image path="/general/home.svg" alt="" />
        </Link>
        <Link to="/create" className="menuIcon">
          <Image path="/general/create.svg" alt="" />
        </Link>
        <Link to="/saved" className="menuIcon" title="Saved Pins">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="2"
            style={{ cursor: "pointer" }}
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </Link>
        <Link to="/notifications" className="menuIcon">
          <Image path="/general/updates.svg" alt="" />
        </Link>
        <Link to="/messages" className="menuIcon">
          <Image path="/general/messages.svg" alt="" />
        </Link>
      </div>
      <Link to="/settings" className="menuIcon">
        <Image path="/general/settings.svg" alt="" />
      </Link>
    </div>
  );
};

export default LeftBar;
