# Developer Access Guide

## Overview

This guide explains how to securely access the developer permissions interface in the Insurance CRM system. The developer interface allows authorized personnel to manage users, roles, and permissions.

## Security Implementation

### Backend Security
- Developer credentials are stored in environment variables (`DEVELOPER_EMAIL`, `DEVELOPER_PASSWORD`, `DEVELOPER_NAME`)
- No hardcoded credentials in the source code
- JWT-based authentication with developer-specific tokens
- Environment variable validation to ensure credentials are configured

### Frontend Security
- Credentials are accessed through Vite environment variables (`VITE_DEVELOPER_EMAIL`, `VITE_DEVELOPER_PASSWORD`)
- Auto-fill functionality for authorized developers
- Secure token storage and management

## Accessing Developer Interface

### Method 1: Direct URL Access
1. Navigate to: `http://localhost:8083/developer-permissions`
2. Click "Load Developer Credentials" button
3. Click "Authenticate" to access the interface

### Method 2: Manual Entry
1. Navigate to: `http://localhost:8083/developer-permissions`
2. Enter the developer email and password manually
3. Click "Authenticate"

## Developer Interface Features

### User Management
- View all system users
- Create new users with specific roles
- Assign roles and permissions
- Manage user status and branches

### Role Management
- View existing roles and their permissions
- Create new roles with custom permissions
- Update role permissions
- Delete non-essential roles

### Permission Templates
- Access predefined permission templates
- Apply templates to roles
- Bulk update permissions

## Environment Configuration

### Backend (.env)
```env
# Developer credentials for admin access
DEVELOPER_EMAIL=info@smeetghori.in
DEVELOPER_PASSWORD=Smeet@123
DEVELOPER_NAME=Smeet Ghori
```

### Frontend (.env)
```env
# Developer credentials for admin access (securely stored)
VITE_DEVELOPER_EMAIL=info@smeetghori.in
VITE_DEVELOPER_PASSWORD=Smeet@123
```

## Regular CRM Login vs Developer Access

### Regular CRM Login (`/auth`)
- **Purpose**: Daily business operations
- **Authentication**: MongoDB user validation
- **Credentials**: Must exist in the database
- **Available Accounts**:
  - Super Admin: `admin@gmail.com` / `admin123`
  - Test Agent: `agent@gmail.com` / `agent123`

### Developer Access (`/developer-permissions`)
- **Purpose**: System administration and user management
- **Authentication**: Environment variable validation
- **Credentials**: Configured in environment files
- **Access Level**: Full system control

## Security Best Practices

1. **Environment Variables**: Never commit actual credentials to version control
2. **Access Control**: Limit developer interface access to authorized personnel only
3. **Token Management**: Developer tokens expire after 24 hours
4. **Audit Trail**: All developer actions should be logged
5. **Regular Updates**: Change developer credentials periodically

## Troubleshooting

### "Developer credentials not configured" Error
- Ensure environment variables are set in both backend and frontend `.env` files
- Restart both servers after updating environment variables
- Verify the variable names match exactly (`DEVELOPER_EMAIL`, `VITE_DEVELOPER_EMAIL`, etc.)

### Authentication Failed
- Check that the credentials in environment variables match
- Ensure the backend server is running on port 5002
- Verify JWT_SECRET is configured in backend environment

### Interface Not Loading
- Confirm frontend server is running on port 8083
- Check browser console for any JavaScript errors
- Ensure all required dependencies are installed

## API Endpoints

### Developer Authentication
```
POST /api/developer/auth
Body: { email: string, password: string }
Response: { token: string, authenticated: boolean }
```

### User Management
```
GET /api/developer/users
POST /api/developer/users
Headers: Authorization: Bearer <token>
```

### Role Management
```
GET /api/developer/permissions/roles
POST /api/developer/permissions/roles
PUT /api/developer/permissions/roles/:id
DELETE /api/developer/permissions/roles/:id
Headers: Authorization: Bearer <token>
```

## Support

For technical support or questions about the developer interface:
1. Check the console logs for detailed error messages
2. Verify environment configuration
3. Ensure all servers are running properly
4. Contact the development team if issues persist

---

**Note**: This interface is intended for authorized developers only. Unauthorized access attempts will be logged and may result in security alerts.