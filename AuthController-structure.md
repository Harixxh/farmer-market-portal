# AuthController.js Structure

## Dependencies
- jsonwebtoken (JWT)
- bcrypt
- User model

## Exported Functions

### 1. register
- **Purpose**: Handle user registration
- **Input**: Request body containing name, email, password, role
- **Process**:
  - Hash the password
  - Create new user in database
- **Output**: Success or error response

### 2. login
- **Purpose**: Handle user authentication
- **Input**: Request body containing email, password
- **Process**:
  - Find user by email
  - Verify password match
  - Generate JWT token
- **Output**: Success response with token or error response