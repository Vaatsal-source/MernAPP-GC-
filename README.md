A full-stack social platform for gamers to browse titles, share reviews, and provide community ratings. This application features a React-based interactive frontend and a secure Node.js/Express backend integrated with MongoDB.Getty Images🚀 FeaturesDynamic Game Discovery: Browse a library of games with real-time search filtering.Interactive Ratings: 5-star rating system with instant average calculation.Community Reviews: Full CRUD (Create, Read, Update, Delete) functionality for game reviews.Secure Authentication: JWT-based authentication flow with Google Login integration.Persistent Sessions: User state and tokens are managed via LocalStorage for a seamless experience.Responsive Design: Modern UI with "Gamer-centric" aesthetics and CSS animations.🛠️ Tech StackFrontend:React.js (Functional Components & Hooks)CSS3 (Custom animations and Glassmorphism effects)JavaScript (ES6+)Backend:Node.js & ExpressMongoDB & Mongoose (ODM)JSON Web Tokens (JWT) for secure API accessCORS & Dotenv for environment management📂 Project StructurePlaintext├── client/                # React Frontend
│   ├── src/
│   │   ├── App.js         # Main logic, routing, and state
│   │   ├── index.css      # Global styling and themes
│   │   └── gamesData.js   # Local game metadata
│   └── dist/              # Production build folder
│
├── server/                # Node.js Backend
│   ├── Server.js          # Express entry point & API routes
│   ├── Comment.js         # Mongoose Schema for Reviews
│   ├── Rating.js          # Mongoose Schema for Ratings
│   ├── User.js            # Mongoose Schema for Users
│   └── auth.js            # JWT Middleware
└── .env                   # Environment variables (Secrets)
⚙️ Installation & Setup1. PrerequisitesNode.js installedMongoDB Atlas account or local MongoDB instance2. Backend SetupNavigate to the server directory.Install dependencies:Bashnpm install
Create a .env file in the root and add your credentials:Code snippetPORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SEC=your_jwt_secret_key
Start the server:Bashnode Server.js
3. Frontend SetupNavigate to the client directory.Install dependencies:Bashnpm install
Update the API_URL in App.js to http://localhost:5000/api for local development.Run the application:Bashnpm start
📡 API EndpointsMethodEndpointDescriptionAuth RequiredPOST/api/auth/google-loginAuthenticate user & return JWTNoGET/api/ratings/:gameIdGet avg rating & total countNoPOST/api/ratingsSubmit a new 5-star ratingYesGET/api/comments/:gameIdFetch all reviews for a gameNoPOST/api/commentsPost a new review or edit existingYesDELETE/api/comments/:idRemove a user's reviewYes🔐 Security WorkflowThe application uses a "Bearer Token" pattern for protected actions:Login: User authenticates; the server returns a signed JWT.Storage: The token is stored in the browser's localStorage.Validation: For requests like POST /ratings, the client sends the token in the auth-token header.Verification: The backend auth middleware verifies the token before allowing database modifications.📝 LicenseDistributed under the MIT License. See LICENSE for more information.
