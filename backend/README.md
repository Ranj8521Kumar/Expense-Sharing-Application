# Expense Sharing Application - Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

**A professional, scalable RESTful API for managing shared expenses, group settlements, and financial tracking**

[Documentation](#documentation) • [Installation](#installation) • [API Endpoints](#api-endpoints) • [Testing](#testing-with-postman)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Testing with Postman](#testing-with-postman)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Expense Sharing Application Backend is a robust Node.js/Express API designed to handle complex expense splitting scenarios among groups of users. Built with modern ES6+ features, it provides secure authentication, flexible expense management, and intelligent settlement calculations.

### Key Highlights

- **Smart Split Algorithms**: Equal, exact amount, and percentage-based splits
- **Automated Settlement**: Minimizes transactions using graph optimization
- **Real-time Balance Tracking**: Instant balance calculations across all groups
- **Secure & Scalable**: JWT authentication, input validation, and rate limiting
- **RESTful Design**: Clean, intuitive API following REST principles

---

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT-based secure authentication
- Password hashing with bcrypt
- Token-based session management
- Protected routes with middleware

### 👥 **User Management**
- User registration and login
- Profile management (view/update)
- User search functionality
- Avatar support

### 🏢 **Group Management**
- Create and manage expense groups
- Add/remove group members
- Admin role management
- Group categories (trip, home, couple, friends, etc.)
- Leave group functionality with validation

### 💰 **Expense Tracking**
- Multiple split types:
  - **Equal Split**: Divide equally among members
  - **Exact Split**: Specify exact amounts per member
  - **Percentage Split**: Split by percentage
- Expense categories (food, transport, accommodation, etc.)
- Update and delete expenses
- Filter expenses by date, category, and group
- Attachment support for receipts

### ⚖️ **Settlement & Balances**
- Real-time balance calculations
- Simplified settlement suggestions
- Settlement history tracking
- Per-user and per-group balance views
- Balance with specific user

### 🔒 **Security Features**
- Helmet.js for HTTP headers security
- CORS configuration
- Rate limiting (100 requests/15 minutes)
- Input validation and sanitization
- MongoDB injection protection

---

## 🏗️ Architecture

The application follows a layered MVC architecture pattern:

```
┌─────────────────┐
│   Client Apps   │
└────────┬────────┘
         │ HTTP/JSON
┌────────▼────────┐
│  Express Routes │ ◄── Authentication Middleware
└────────┬────────┘
         │
┌────────▼────────┐
│   Controllers   │ ◄── Validation Middleware
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │ ◄── Business Logic Layer
└────────┬────────┘
         │
┌────────▼────────┐
│  Models (ODM)   │ ◄── Data Access Layer
└────────┬────────┘
         │
┌────────▼────────┐
│   MongoDB       │
└─────────────────┘
```

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | 18+ |
| **Express.js** | Web Framework | ^4.18.2 |
| **MongoDB** | Database | 6.0+ |
| **Mongoose** | ODM (Object Data Modeling) | ^8.0.3 |
| **JWT** | Authentication | ^9.0.2 |
| **Bcrypt.js** | Password Hashing | ^2.4.3 |
| **Express Validator** | Input Validation | ^7.0.1 |
| **Helmet** | Security Headers | ^7.1.0 |
| **CORS** | Cross-Origin Resource Sharing | ^2.8.5 |
| **Morgan** | HTTP Request Logger | ^1.10.0 |
| **Dotenv** | Environment Variables | ^16.3.1 |

---

## 📦 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6.0 or higher) or MongoDB Atlas account
- **npm** or **yarn** package manager

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ranj8521Kumar/Expense-Sharing-Application.git
cd Expense-Sharing-Application/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/expense-sharing-app
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense-sharing-app

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Step 5: Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** (recommended for production)

### Step 6: Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### Step 7: Verify Installation

Visit: `http://localhost:5000/health`

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-19T10:30:00.000Z"
}
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | 7d | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | * | No |

### Database Setup

**MongoDB Atlas (Recommended):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

**Local MongoDB:**
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use `mongodb://localhost:27017/expense-sharing-app`

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### 🔓 Public Endpoints

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register new user | No |
| `POST` | `/auth/login` | Login user | No |

### 🔐 Protected Endpoints

> **Note:** All endpoints below require JWT token in Authorization header:
> ```
> Authorization: Bearer <your_jwt_token>
> ```

#### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/me` | Get current user profile |
| `PUT` | `/auth/update-password` | Update password |
| `GET` | `/users/profile` | Get user profile |
| `PUT` | `/users/profile` | Update user profile |
| `GET` | `/users/search?q=<query>` | Search users by name/email |
| `GET` | `/users/:id` | Get user by ID |

#### Group Management

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| `POST` | `/groups` | Create new group | Any user |
| `GET` | `/groups` | Get all user's groups | Any user |
| `GET` | `/groups/:id` | Get group details | Member |
| `PUT` | `/groups/:id` | Update group | Admin |
| `DELETE` | `/groups/:id` | Delete group | Creator |
| `POST` | `/groups/:id/members` | Add member to group | Admin |
| `DELETE` | `/groups/:id/members/:userId` | Remove member | Admin |
| `POST` | `/groups/:id/leave` | Leave group | Member |

#### Expense Management

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| `POST` | `/expenses` | Create new expense | Member |
| `GET` | `/expenses` | Get user's expenses | Any user |
| `GET` | `/expenses/:id` | Get expense details | Involved user |
| `PUT` | `/expenses/:id` | Update expense | Payer only |
| `DELETE` | `/expenses/:id` | Delete expense | Payer only |
| `GET` | `/expenses/group/:groupId` | Get group expenses | Member |

**Query Parameters for GET /expenses:**
- `groupId` - Filter by group
- `category` - Filter by category
- `startDate` - Filter from date (ISO 8601)
- `endDate` - Filter to date (ISO 8601)

#### Settlement & Balances

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/settlements/balances` | Get user's overall balances |
| `GET` | `/settlements/group/:groupId` | Get group balance summary |
| `POST` | `/settlements/settle` | Record a settlement |
| `GET` | `/settlements/history` | Get settlement history |
| `GET` | `/settlements/balance/:userId` | Get balance with specific user |

---

## 🧪 Testing with Postman

### Quick Start

#### Option 1: Import Postman Collection (Recommended)

**📥 Postman Collection Link:**
```
🔗 [Import Collection Here - Add your published Postman collection link]
```

**Steps:**
1. Click the link above
2. Import to your Postman workspace
3. Set up environment variables
4. Start testing!

#### Option 2: Manual Setup

**Create Postman Environment:**

1. Click **Environments** → **Create Environment**
2. Name: `Expense Sharing API`
3. Add variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:5000/api` | `http://localhost:5000/api` |
| `token` | _(leave empty)_ | _(auto-filled after login)_ |
| `user_id` | _(leave empty)_ | _(auto-filled after register)_ |
| `group_id` | _(leave empty)_ | _(auto-filled after group creation)_ |
| `expense_id` | _(leave empty)_ | _(auto-filled after expense creation)_ |

### Testing Workflow

#### 1. **Register User**
```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Auto-save token in Tests tab:**
```javascript
pm.environment.set("token", pm.response.json().data.token);
pm.environment.set("user_id", pm.response.json().data.user._id);
```

#### 2. **Login**
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 3. **Create Group**
```http
POST {{base_url}}/groups
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Bali Trip 2025",
  "description": "Summer vacation",
  "category": "trip",
  "members": ["<user_id_2>", "<user_id_3>"]
}
```

**Auto-save in Tests:**
```javascript
pm.environment.set("group_id", pm.response.json().data.group._id);
```

#### 4. **Add Expense (Equal Split)**
```http
POST {{base_url}}/expenses
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "description": "Dinner at Restaurant",
  "amount": 150,
  "groupId": "{{group_id}}",
  "category": "food",
  "splitType": "equal",
  "members": ["<user1_id>", "<user2_id>", "<user3_id>"],
  "notes": "Italian restaurant"
}
```

#### 5. **Check Balances**
```http
GET {{base_url}}/settlements/balances
Authorization: Bearer {{token}}
```

#### 6. **Settle Payment**
```http
POST {{base_url}}/settlements/settle
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "groupId": "{{group_id}}",
  "paidToId": "<creditor_user_id>",
  "amount": 50,
  "notes": "Cash payment"
}
```

### Sample Test Collections

**Complete testing guide available in:** [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

### Expected Responses

**✅ Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**❌ Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success (GET, PUT, DELETE) |
| `201` | Created (POST) |
| `400` | Bad Request (validation failed) |
| `401` | Unauthorized (invalid/missing token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `500` | Server Error |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── database.js      # MongoDB connection setup
│   │
│   ├── controllers/         # Request handlers
│   │   ├── authController.js       # Authentication logic
│   │   ├── userController.js       # User management
│   │   ├── groupController.js      # Group operations
│   │   ├── expenseController.js    # Expense handling
│   │   └── settlementController.js # Settlement calculations
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # JWT verification
│   │   ├── errorHandler.js  # Global error handling
│   │   ├── validate.js      # Input validation
│   │   └── groupAuth.js     # Group permission checks
│   │
│   ├── models/              # Mongoose schemas
│   │   ├── User.js          # User model
│   │   ├── Group.js         # Group model
│   │   ├── Expense.js       # Expense model
│   │   └── Settlement.js    # Settlement model
│   │
│   ├── routes/              # API routes
│   │   ├── authRoutes.js    # /api/auth/*
│   │   ├── userRoutes.js    # /api/users/*
│   │   ├── groupRoutes.js   # /api/groups/*
│   │   ├── expenseRoutes.js # /api/expenses/*
│   │   └── settlementRoutes.js # /api/settlements/*
│   │
│   ├── services/            # Business logic
│   │   ├── expenseService.js    # Expense calculations
│   │   └── settlementService.js # Balance algorithms
│   │
│   ├── utils/               # Helper functions
│   │   ├── AppError.js      # Custom error class
│   │   ├── catchAsync.js    # Async error wrapper
│   │   └── sendResponse.js  # Standardized responses
│   │
│   ├── validators/          # Input validation rules
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   ├── groupValidator.js
│   │   ├── expenseValidator.js
│   │   └── settlementValidator.js
│   │
│   └── server.js            # Application entry point
│
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lock file
├── README.md                # This file
└── API_DOCUMENTATION.md     # Detailed API docs
```

---

## 🗃️ Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  phone: String,
  avatar: String,
  groups: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Group Schema
```javascript
{
  name: String,
  description: String,
  createdBy: ObjectId,
  members: [{
    user: ObjectId,
    isAdmin: Boolean,
    addedAt: Date
  }],
  category: Enum['trip', 'home', 'couple', 'friends', 'other'],
  image: String,
  totalExpenses: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Schema
```javascript
{
  description: String,
  amount: Number,
  paidBy: ObjectId,
  group: ObjectId,
  category: Enum['food', 'transport', 'accommodation', ...],
  splitType: Enum['equal', 'exact', 'percentage'],
  splits: [{
    user: ObjectId,
    amount: Number,
    percentage: Number,
    isPaid: Boolean
  }],
  date: Date,
  notes: String,
  attachments: [String],
  isSettled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Settlement Schema
```javascript
{
  group: ObjectId,
  paidBy: ObjectId,
  paidTo: ObjectId,
  amount: Number,
  status: Enum['pending', 'completed', 'cancelled'],
  settledAt: Date,
  notes: String,
  relatedExpenses: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Advanced Features

### Split Algorithms

#### 1. **Equal Split**
Divides expense equally among all members:
```
Amount = 150, Members = 3
Split = 50 per person
```

#### 2. **Exact Split**
Custom amounts per member:
```
Total = 300
John: 150, Jane: 100, Bob: 50
```

#### 3. **Percentage Split**
Based on percentage contribution:
```
Total = 200
John: 50% = 100
Jane: 30% = 60
Bob: 20% = 40
```

### Settlement Optimization

The settlement service uses a **graph-based algorithm** to minimize the number of transactions:

**Before Optimization:**
- A owes B: $20
- B owes C: $20
- Requires 2 transactions

**After Optimization:**
- A owes C: $20
- Requires 1 transaction

---

## 🚀 Deployment

### Deploy to Production

#### Prerequisites
- Node.js hosting (Heroku, Railway, Render)
- MongoDB Atlas account

#### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<strong-random-secret>
JWT_EXPIRE=7d
ALLOWED_ORIGINS=https://yourfrontend.com
```

#### Deployment Steps

**1. Build and Test:**
```bash
npm install --production
npm start
```

**2. Deploy to Heroku:**
```bash
heroku create expense-sharing-api
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

**3. Deploy to Railway:**
```bash
railway login
railway init
railway add
railway up
```

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```
Error: connect ECONNREFUSED ::1:27017
```
**Solution:** Start MongoDB service or check MongoDB Atlas connection string

**JWT Token Invalid:**
```
Error: Invalid token. Please log in again
```
**Solution:** Ensure token is sent in Authorization header: `Bearer <token>`

**Validation Errors:**
```
Error: Please provide a valid email
```
**Solution:** Check request body format and required fields

**Port Already in Use:**
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in .env or kill process using port 5000

---

## 📚 Additional Resources

- **Full API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Postman Collection:** [Add your link here]
- **Architecture Diagram:** See repository `/docs` folder
- **Contributing Guide:** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/AmazingFeature`
3. **Commit changes:** `git commit -m 'Add AmazingFeature'`
4. **Push to branch:** `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Code Style
- Use ES6+ features
- Follow existing naming conventions
- Add JSDoc comments for functions
- Write unit tests for new features

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Ranj8521Kumar**

- GitHub: [@Ranj8521Kumar](https://github.com/Ranj8521Kumar)
- Repository: [Expense-Sharing-Application](https://github.com/Ranj8521Kumar/Expense-Sharing-Application)

---

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the robust database
- All contributors and open-source libraries used in this project

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star! ⭐**

Made with ❤️ by [Ranj8521Kumar](https://github.com/Ranj8521Kumar)

</div>
