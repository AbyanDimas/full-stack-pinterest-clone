# Full Stack Pinterest Clone

This is a full-stack Pinterest clone project. 

> **Note**: This project was originally cloned from another open-source repository. However, significant modifications and improvements have been made to the original codebase.

## Modifications & Features
- **Self-Hosted Image Kit**: Replaced the original third-party image service with a fully self-hosted solution using **MinIO** for S3-compatible object storage.
- **Dynamic Image Optimization**: Integrated **imgproxy** for on-the-fly, highly responsive image resizing and optimization to prevent pixelation.
- **Masonry Layout Engine**: Revamped the UI to feature an authentic, smooth Pinterest-style masonry layout using CSS `column-count`.
- **Advanced Security**:
  - Implemented `helmet` for HTTP header protection (XSS, Clickjacking, MIME Sniffing protection).
  - Integrated `express-rate-limit` to protect against Brute Force and DDoS attacks.
  - Secured authentication preventing NoSQL injections.
- **Comprehensive Testing**: Added extensive testing suites using `vitest`, `supertest`, and `JSDOM` for both the frontend components and backend API logic.
- **Real-Time UI Updates**: Utilizing TanStack React Query to reflect changes (Likes, Saves, Notifications) instantly without page reloads.

## Tech Stack
- **Frontend**: React, Vite, React Router, TanStack Query, Vanilla CSS
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), MinIO (AWS SDK S3), JWT Auth
- **Infrastructure**: MinIO (Storage), Imgproxy (Image processing)

## Setup Instructions

### Prerequisites
- Node.js (v20+)
- MongoDB instance
- MinIO instance (or AWS S3)
- Imgproxy instance

### Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials.
4. Run tests: `npm run test`
5. Start the server: `npm run dev` (for development) or `npm run start` (for production)

### Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in the environment variables.
4. Run tests: `npm run test`
5. Start the Vite dev server: `npm run dev`
6. Build for production: `npm run build`
