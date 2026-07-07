import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "./routes/layouts/mainLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import Homepage from "./routes/homepage/homepage";
// import CreatePage from "./routes/createPage/createPage";
// import PostPage from "./routes/postPage/postPage";
// import ProfilePage from "./routes/profilePage/profilePage";
// import SearchPage from "./routes/searchPage/searchPage";
// import AuthPage from "./routes/authPage/authPage";

const Homepage = React.lazy(() => import("./routes/homepage/homepage"));
const CreatePage = React.lazy(() => import("./routes/createPage/createPage"));
const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
const ProfilePage = React.lazy(
  () => import("./routes/profilePage/profilePage"),
);
const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));
const MessagesPage = React.lazy(
  () => import("./routes/messagesPage/messagesPage"),
);
const NotificationsPage = React.lazy(
  () => import("./routes/notificationsPage/notificationsPage"),
);
const SettingsPage = React.lazy(
  () => import("./routes/settingsPage/settingsPage"),
);
const SavedPage = React.lazy(() => import("./routes/savedPage/savedPage"));

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/pin/:id" element={<PostPage />} />
            <Route path="/:username" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
