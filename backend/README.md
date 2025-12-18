# Expense Sharing Application - Backend

A professional Node.js/Express backend for an expense sharing application with group management and settlement features.

## Features

- 🔐 User Authentication (JWT)
- 👥 User Profile Management
- 🏢 Group Management
- 💰 Expense Tracking & Splitting
- ⚖️ Balance Calculation & Settlement
- 🔒 Secure API with validation
- 📊 MongoDB Database

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:id/members/:userId` - Remove member from group

### Expenses
- `POST /api/expenses` - Add expense
- `GET /api/expenses` - Get user's expenses
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Settlements
- `GET /api/settlements/balances` - Get user balances
- `GET /api/settlements/group/:groupId` - Get group balances
- `POST /api/settlements/settle` - Settle balance
- `GET /api/settlements/history` - Get settlement history

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── server.js       # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## License

ISC
