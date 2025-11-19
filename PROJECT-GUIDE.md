# How to Use This MERN Master Setup

A simple guide to create new MERN projects using this master setup.

## 1. Overview

This master setup contains everything you need to build a full-stack web application:

- **Frontend**: React + Vite + TypeScript + TailwindCSS (what users see in browser)
- **Backend**: Express.js + Node.js (server logic)
- **API**: RESTful endpoints (communication between frontend and backend)
- **Database**: MongoDB with Mongoose (data storage)
- **Authentication**: JWT-based auth system (pre-built)
- **Testing**: Vitest (frontend) + Jest (backend)
- **Docker**: Docker Compose configuration included
- **CI/CD**: GitHub Actions workflow ready

All parts are pre-configured to work together.

## 2. Quick Start - Create a New Project (3 Methods)

### Method 1: Simple Copy-Paste (Recommended for Beginners)

1. **Copy the master setup folder**
   - Navigate to where `p6-master-mern-setup` is located
   - Right-click on the `p6-master-mern-setup` folder
   - Select "Copy"

2. **Paste and rename**
   - Navigate to where you want your new project
   - Right-click → "Paste"
   - Rename the folder to your project name (e.g., `my-blog`, `task-manager`, `ecommerce-app`)

3. **Open in VS Code**
   - Open VS Code
   - File → Open Folder
   - Select your renamed project folder

4. **Install dependencies (One command for everything)**
   ```bash
   npm install
   ```
   This will install dependencies for backend, frontend, and CLI generator.

5. **Setup environment**
   - Copy `backend/.env.example` to `backend/.env`
   - Update `MONGO_URI` and `JWT_SECRET` in `.env`

6. **Run the project**
   ```bash
   npm run dev
   ```
   This starts both backend (port 5000) and frontend (port 3000) simultaneously.

### Method 2: Using Git Clone (For Version Control)

1. **Clone the master setup**
   ```bash
   git clone <your-master-repo-url> my-new-project
   cd my-new-project
   ```

2. **Remove old git history and start fresh**
   ```bash
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit from MERN master setup"
   ```

3. **Install and run**
   ```bash
   npm install
   cp backend/.env.example backend/.env
   npm run dev
   ```

### Method 3: Create from Scratch Directory Structure

If you want to keep the master setup clean and create new projects in a different location:

1. **Create a projects folder**
   ```bash
   mkdir my-projects
   cd my-projects
   ```

2. **Copy master setup here**
   ```bash
   cp -r /path/to/p6-master-mern-setup ./my-new-project
   cd my-new-project
   ```

3. **Clean and setup**
   ```bash
   npm install
   cp backend/.env.example backend/.env
   npm run dev
   ```

## 3. What's Already Configured

Your new project comes with:

### Frontend Features
- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ TailwindCSS for styling
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Authentication pages (Login, Register, Dashboard)
- ✅ Protected routes
- ✅ Auth context for global state
- ✅ ESLint configured
- ✅ Vitest for testing

### Backend Features
- ✅ Express.js server
- ✅ MongoDB with Mongoose
- ✅ JWT authentication (register, login, profile)
- ✅ Password hashing with bcrypt
- ✅ Security middleware (helmet, cors, rate-limiting)
- ✅ Error handling middleware
- ✅ Request logging (morgan)
- ✅ Environment variable support
- ✅ Jest for testing

### DevOps
- ✅ Docker & Docker Compose
- ✅ GitHub Actions CI/CD
- ✅ Git hooks with Husky
- ✅ Prettier for code formatting

## 4. Backend Setup (Detailed)

If you used Method 1 and ran `npm install` in the root, you can skip steps 1-2.

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies** (if not done already)
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

4. **Edit .env file** - Open `backend/.env` and update:
   ```env
   # Change database name to your project
   MONGO_URI=mongodb://localhost:27017/my_project_name
   
   # Generate a secure random string
   JWT_SECRET=your_super_secret_key_change_this
   
   # Keep these as is
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   LOG_LEVEL=info
   ```

5. **Run backend server**
   ```bash
   npm run dev
   ```
   Server will start on http://localhost:5000

## 5. Frontend Setup (Detailed)

If you used Method 1 and ran `npm install` in the root, you can skip steps 1-2.

1. **Navigate to frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies** (if not done already)
   ```bash
   npm install
   ```

3. **Verify API configuration**
   - Frontend is pre-configured to connect to `http://localhost:5000`
   - Check `frontend/vite.config.ts` - proxy is already set up

4. **Run frontend**
   ```bash
   npm run dev
   ```
   Frontend will start on http://localhost:3000

## 6. Run Everything at Once

From the **root** directory:

```bash
# Install all dependencies
npm install

# Run both frontend and backend
npm run dev
```

This single command starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

## 7. Verify Setup is Working

1. **Check backend**
   - Open browser: http://localhost:5000
   - You should see: `{"message":"MERN Backend API","version":"1.0.0",...}`

2. **Check frontend**
   - Open browser: http://localhost:3000
   - You should see the home page

3. **Test authentication**
   - Click "Register" and create an account
   - Login with your credentials
   - You should be redirected to Dashboard

4. **Check MongoDB**
   - Make sure MongoDB is running locally OR
   - Use MongoDB Atlas (cloud) - update `MONGO_URI` in `.env`

## 8. Important: Keep Master Setup Clean

### Best Practice for Using This Setup

1. **Never modify the master setup directly**
   - Always create a copy for new projects
   - Keep `p6-master-mern-setup` as your clean template

2. **Create a dedicated folder for projects**
   ```
   C:\Users\YourName\Projects\
   ├── p6-master-mern-setup\     <- Your clean master template (never modify)
   ├── blog-app\                <- Copy 1: Blog project
   ├── ecommerce\               <- Copy 2: E-commerce project
   └── task-manager\            <- Copy 3: Task manager project
   ```

3. **Update master setup periodically**
   - Add new features or fixes to master setup
   - Then copy fresh for new projects

### Quick Commands Reference

```bash
# From root directory - runs both frontend & backend
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Only backend
cd backend && npm run dev

# Only frontend
cd frontend && npm run dev
```

## 9. Customizing Your New Project

### Change Project Name

1. **Root package.json**
   ```json
   {
     "name": "my-new-project",  // Change this
     "description": "My awesome project"
   }
   ```

2. **Backend package.json**
   ```json
   {
     "name": "my-project-backend"
   }
   ```

3. **Frontend package.json**
   ```json
   {
     "name": "my-project-frontend"
   }
   ```

### Update Database Name

- Edit `backend/.env`:
  ```env
  MONGO_URI=mongodb://localhost:27017/my_project_db
  ```

### Customize Frontend

- **Colors**: Edit `frontend/tailwind.config.js`
- **Pages**: Add new pages in `frontend/src/pages/`
- **Components**: Add in `frontend/src/components/`
- **Logo/Title**: Edit `frontend/index.html` and `frontend/src/App.tsx`

### Add Backend Features

- **New routes**: Create in `backend/src/routes/`
- **New models**: Create in `backend/src/models/`
- **New controllers**: Create in `backend/src/controllers/`

## 10. Environment Variables (Reference)

### Backend .env Template
```env
# MongoDB connection
MONGO_URI=mongodb://localhost:27017/my_project_name

# JWT for authentication
JWT_SECRET=your_super_secret_random_string_here
JWT_EXPIRE=7d

# Server settings
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# Logging level
LOG_LEVEL=info
```

### Frontend Environment (Optional)
```env
# Create frontend/.env if needed
VITE_API_URL=http://localhost:5000
```

## 11. Deployment Guide (Make Your Project Live)

### Deploy Backend to Render.com (Free)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create Render account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Deploy backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - Click "Advanced" and add environment variables:
     - `MONGO_URI` = your MongoDB Atlas connection string
     - `JWT_SECRET` = your secret key
     - `CLIENT_URL` = your frontend URL
     - `NODE_ENV` = production
   - Click "Create Web Service"

4. **Get backend URL**
   - Copy the URL (e.g., `https://your-app.onrender.com`)

### Deploy Frontend to Vercel (Free)

1. **Create Vercel account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Deploy frontend**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - Add environment variable:
     - `VITE_API_URL` = your Render backend URL
   - Click "Deploy"

3. **Update backend CORS**
   - Go back to Render dashboard
   - Update `CLIENT_URL` environment variable with your Vercel URL
   - Service will auto-redeploy

### Use MongoDB Atlas (Cloud Database)

1. **Create account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create cluster**
   - Choose Free tier (M0)
   - Select region closest to you
   - Click "Create"

3. **Setup access**
   - Create database user (username + password)
   - Network Access → Add IP Address → "Allow from Anywhere" (0.0.0.0/0)

4. **Get connection string**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password
   - Update `MONGO_URI` in Render environment variables

## 12. Docker Deployment (Advanced)

### Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

Services will run on:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## 13. Troubleshooting Common Issues

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Failed

**Problem**: `MongoNetworkError: connect ECONNREFUSED`

**Solutions**:
1. Make sure MongoDB is running:
   ```bash
   # Check if MongoDB is running
   # Windows: Check Services or Task Manager
   # Mac: brew services list
   ```
2. Or use MongoDB Atlas (cloud) instead of local
3. Check `MONGO_URI` in `.env` is correct

### Cannot Find Module '@/...' 

**Problem**: Vite can't resolve `@/` imports

**Solution**: Already fixed in this setup! Path alias configured in `vite.config.ts`

### CORS Error

**Problem**: Frontend can't connect to backend

**Solution**:
1. Check `CLIENT_URL` in backend `.env` matches frontend URL
2. Make sure backend is running on port 5000
3. Check `vite.config.ts` proxy configuration

### npm install Fails

**Problem**: Dependencies won't install

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Tests Fail

**Problem**: Testing library modules not found

**Solution**: Already fixed! All testing dependencies included.

## 14. Project Structure Overview

```
p6-master-mern-setup/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoints
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Main entry point
│   ├── __tests__/           # Test files
│   ├── .env.example         # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Global state (Auth)
│   │   ├── pages/           # Route pages
│   │   ├── __tests__/       # Test files
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── vite.config.ts       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── package.json
│
├── .github/
│   └── workflows/           # CI/CD pipelines
│
├── docker-compose.yml   # Docker configuration
├── package.json         # Root scripts
└── PROJECT-GUIDE.md     # This file!
```

## 15. Useful Commands Cheat Sheet

```bash
# SETUP
npm install                          # Install all dependencies
cp backend/.env.example backend/.env # Create environment file

# DEVELOPMENT
npm run dev                          # Run both frontend & backend
cd backend && npm run dev            # Run only backend
cd frontend && npm run dev           # Run only frontend

# TESTING
npm test                             # Run all tests
cd backend && npm test               # Backend tests only
cd frontend && npm test              # Frontend tests only

# CODE QUALITY
npm run lint                         # Lint all code
npm run lint:fix                     # Auto-fix linting issues

# PRODUCTION BUILD
npm run build                        # Build both for production

# DOCKER
docker-compose up --build            # Run with Docker
docker-compose down                  # Stop Docker containers

# GIT
git init                             # Initialize git
git add .                            # Stage all changes
git commit -m "message"              # Commit changes
git push                             # Push to remote
```

## 16. Next Steps

Now that you have your project set up:

1. ✅ **Verify everything works** (Section 7)
2. ✅ **Customize your project** (Section 9)
3. ✅ **Build your features**
4. ✅ **Test regularly** (`npm test`)
5. ✅ **Deploy when ready** (Section 11)

### Learning Resources

- **React**: https://react.dev
- **Express**: https://expressjs.com
- **MongoDB**: https://www.mongodb.com/docs
- **TypeScript**: https://www.typescriptlang.org
- **TailwindCSS**: https://tailwindcss.com

### Need Help?

- Check existing issues in similar projects
- Read error messages carefully
- Use browser DevTools console
- Check backend logs in terminal

---

**Happy Coding! 🚀**

Remember: This is YOUR project now. Modify, break, fix, and learn!