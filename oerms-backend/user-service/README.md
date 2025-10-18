/*
# User Service - Complete Implementation

## Overview
The User Service handles authentication, authorization, and user management for the OERMS platform.

## Features

### Authentication
- ✅ User login with JWT tokens
- ✅ Refresh token mechanism
- ✅ Token rotation for security
- ✅ Automatic token cleanup
- ✅ Logout functionality

### User Management
- ✅ User CRUD operations
- ✅ Role-based access control (ADMIN, TEACHER, STUDENT)
- ✅ User search and filtering
- ✅ Pagination support
- ✅ Soft delete
- ✅ Password management

### Security
- ✅ BCrypt password hashing (strength 12)
- ✅ JWT with HS512 algorithm
- ✅ Token expiry (24h access, 7d refresh)
- ✅ Input validation
- ✅ Redis caching

## Tech Stack

- **Framework**: Spring Boot 3.2.0
- **Security**: Spring Security 6
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **Cache**: Redis 7
- **Authentication**: JWT (jjwt 0.12.3)
- **Mapping**: MapStruct 1.5.5
- **Testing**: JUnit 5, Mockito, TestContainers

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Login user and get JWT tokens.

**Request:**
```json
{
  "email": "admin@oerms.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "email": "admin@oerms.com",
    "name": "System Administrator",
    "roles": ["ADMIN"],
    "isActive": true
  },
  "expiresIn": 86400
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "user": { ... },
  "expiresIn": 86400
}
```

#### POST /api/auth/logout
Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: <user-uuid>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### User Management Endpoints

#### GET /api/users/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: <user-uuid>
```

**Response (200 OK):**
```json
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "email": "admin@oerms.com",
  "name": "System Administrator",
  "roles": ["ADMIN"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

#### GET /api/users
Get paginated list of users with optional filters.

**Query Parameters:**
- `page` - Page number (default: 0)
- `size` - Page size (default: 20)
- `search` - Search by name or email
- `role` - Filter by role (ADMIN, TEACHER, STUDENT)
- `sortBy` - Sort field (default: createdAt)
- `direction` - Sort direction (asc/desc, default: desc)

**Example:**
```
GET /api/users?page=0&size=10&search=john&role=TEACHER&sortBy=name&direction=asc
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "roles": ["TEACHER"]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

#### GET /api/users/{id}
Get user by ID.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "roles": ["STUDENT"],
  "phoneNumber": "+1234567890",
  "bio": "User bio",
  "isActive": true
}
```

#### POST /api/users
Create new user (Admin only).

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "phoneNumber": "+1234567890",
  "roles": ["STUDENT"]
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "name": "New User",
  "roles": ["STUDENT"],
  "isActive": true
}
```

#### PUT /api/users/{id}
Update user details.

**Request:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phoneNumber": "+0987654321",
  "bio": "Updated bio"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "updated@example.com",
  "name": "Updated Name",
  "phoneNumber": "+0987654321",
  "bio": "Updated bio"
}
```

#### DELETE /api/users/{id}
Soft delete user (Admin only).

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

#### POST /api/users/{id}/change-password
Change user password.

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

#### GET /api/users/stats/count-by-role
Get count of users by role.

**Query Parameters:**
- `role` - Role to count (ADMIN, TEACHER, STUDENT)

**Response (200 OK):**
```json
25
```

## Database Schema

### users table
```sql
id                  UUID PRIMARY KEY
email               VARCHAR(255) UNIQUE NOT NULL
password_hash       VARCHAR(255) NOT NULL
name                VARCHAR(255) NOT NULL
phone_number        VARCHAR(20)
profile_picture_url VARCHAR(500)
bio                 TEXT
is_active           BOOLEAN DEFAULT TRUE
is_deleted          BOOLEAN DEFAULT FALSE
last_login_at       TIMESTAMP
created_at          TIMESTAMP NOT NULL
updated_at          TIMESTAMP NOT NULL
```

### user_roles table
```sql
id         UUID PRIMARY KEY
user_id    UUID REFERENCES users(id)
role       VARCHAR(50) NOT NULL
created_at TIMESTAMP NOT NULL
UNIQUE(user_id, role)
```

### refresh_tokens table
```sql
id         UUID PRIMARY KEY
user_id    UUID REFERENCES users(id)
token      VARCHAR(500) UNIQUE NOT NULL
expires_at TIMESTAMP NOT NULL
created_at TIMESTAMP NOT NULL
```

## Default Users

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@oerms.com | admin123 | ADMIN | System administration |
| teacher@oerms.com | teacher123 | TEACHER | Create and manage exams |
| student@oerms.com | student123 | STUDENT | Take exams |

**⚠️ IMPORTANT**: Change these passwords in production!

## Running the Service

### Prerequisites
- JDK 17 or higher
- Maven 3.9 or higher
- PostgreSQL 15 or higher
- Redis 7 or higher

### Local Development

1. **Start infrastructure:**
```bash
docker-compose up -d postgres redis
```

2. **Run database migration:**
```bash
mvn flyway:migrate
```

3. **Start service:**
```bash
mvn spring-boot:run
```

4. **Verify service is running:**
```bash
curl http://localhost:8084/actuator/health
```

5. **Test login:**
```bash
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oerms.com","password":"admin123"}'
```

### Docker

```bash
# Build image
docker build -t oerms/user-service:1.0.0 .

# Run container
docker run -p 8084:8084 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/oerms \
  -e SPRING_DATA_REDIS_HOST=redis \
  -e JWT_SECRET=your-secret-key \
  oerms/user-service:1.0.0
```

## Configuration

### Environment Variables

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/oerms
SPRING_DATASOURCE_USERNAME=oerms_user
SPRING_DATASOURCE_PASSWORD=oerms_password

# Redis
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=

# JWT
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Eureka
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://localhost:8761/eureka/
```

### application.yml

Key configurations:
```yaml
server:
  port: 8084

spring:
  application:
    name: user-service
  
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        default_schema: oerms_user
  
  cache:
    type: redis
    redis:
      time-to-live: 3600000  # 1 hour

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000  # 24 hours
  refresh-expiration: 604800000  # 7 days

security:
  password:
    bcrypt-strength: 12
```

## Testing

### Run Unit Tests
```bash
mvn test
```

### Run Integration Tests
```bash
mvn verify
```

### Test Coverage
```bash
mvn test jacoco:report
open target/site/jacoco/index.html
```

### Manual API Testing

**Complete Test Flow:**
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oerms.com","password":"admin123"}' \
  | jq -r '.token')

USER_ID="a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

# 2. Get current user
curl http://localhost:8084/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-User-Id: $USER_ID" | jq

# 3. Get all users
curl "http://localhost:8084/api/users?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Search users
curl "http://localhost:8084/api/users?search=admin&role=ADMIN" \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Create user
curl -X POST http://localhost:8084/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "roles": ["STUDENT"]
  }' | jq

# 6. Update user
curl -X PUT http://localhost:8084/api/users/<user-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "bio": "Updated bio"
  }' | jq

# 7. Change password
curl -X POST http://localhost:8084/api/users/$USER_ID/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-User-Id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newpassword123"
  }' | jq

# 8. Logout
curl -X POST http://localhost:8084/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-User-Id: $USER_ID" | jq
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec -it oerms-postgres psql -U oerms_user -d oerms

# Check schema exists
\dn
```

#### 2. Redis Connection Failed
```bash
# Check Redis is running
docker exec -it oerms-redis redis-cli ping

# Check keys
docker exec -it oerms-redis redis-cli KEYS "*"
```

#### 3. JWT Validation Fails
- Ensure JWT_SECRET is consistent across services
- Check token is not expired
- Verify Authorization header format: `Bearer <token>`

#### 4. Migration Fails
```bash
# Check migration status
mvn flyway:info

# Repair if needed
mvn flyway:repair

# Clean and re-migrate (CAUTION: Deletes data!)
mvn flyway:clean flyway:migrate
```

## Monitoring

### Health Check
```bash
curl http://localhost:8084/actuator/health | jq
```

### Metrics
```bash
curl http://localhost:8084/actuator/metrics | jq
curl http://localhost:8084/actuator/metrics/jvm.memory.used | jq
```

### Prometheus Metrics
```bash
curl http://localhost:8084/actuator/prometheus
```

## Security Considerations

1. **Password Policy**: Minimum 8 characters (can be extended with regex validation)
2. **BCrypt Strength**: Set to 12 for security/performance balance
3. **Token Expiry**: Adjust based on security requirements
4. **Rate Limiting**: Implemented at API Gateway level
5. **HTTPS**: Always use HTTPS in production
6. **Secret Management**: Use environment variables, never commit secrets

## Performance Tips

1. **Connection Pooling**: HikariCP configured with 20 max connections
2. **Redis Caching**: Users cached for 1 hour
3. **Indexes**: All foreign keys and frequently queried fields indexed
4. **Pagination**: Always use pagination for large datasets
5. **Lazy Loading**: Configure based on use case

## License

MIT License

---

**Version**: 1.0.0  
**Last Updated**: October 2024  
**Status**: Production Ready ✅
*/
```
http://localhost:8084/swagger-ui.html
```

### Docker

Build and run:
```bash
docker build -t oerms/user-service .
docker run -p 8084:8084 oerms/user-service
```

## Default Users

The migration script creates three default users:

| Email | Password | Role |
|-------|----------|------|
| admin@oerms.com | admin123 | ADMIN |
| teacher@oerms.com | teacher123 | TEACHER |
| student@oerms.com | student123 | STUDENT |

**⚠️ Change these passwords in production!**

## Testing

Run tests:
```bash
mvn test
```

Run integration tests:
```bash
mvn verify
```

## Configuration

Key configuration properties in `application.yml`:

```yaml
jwt:
  secret: your-secret-key
  expiration: 86400000  # 24 hours
  refresh-expiration: 604800000  # 7 days

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/oerms
    username: oerms_user
    password: oerms_password

  data:
    redis:
      host: localhost
      port: 6379
```

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oerms.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "email": "admin@oerms.com",
    "name": "System Administrator",
    "roles": ["ADMIN"]
  },
  "expiresIn": 86400
}
```

### Get Current User
```bash
curl http://localhost:8084/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: YOUR_USER_ID"
```

### Create User
```bash
curl -X POST http://localhost:8084/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "roles": ["STUDENT"]
  }'
```

### Search Users
```bash
curl "http://localhost:8084/api/users?search=john&role=TEACHER&page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret in production
2. **Password Policy**: Minimum 8 characters (can be extended)
3. **BCrypt**: Password hashing with strength 12
4. **Token Expiry**: Adjust based on security requirements
5. **Rate Limiting**: Implemented at API Gateway level
6. **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL
docker exec -it oerms-postgres psql -U oerms_user -d oerms

# Check schema
\dn

# Check tables
\dt oerms_user.*
```

### Redis Connection Issues
```bash
# Check Redis
docker exec -it oerms-redis redis-cli ping

# Check keys
docker exec -it oerms-redis redis-cli KEYS "*"
```

### JWT Token Issues
- Ensure JWT secret is same across all services
- Check token expiry time
- Verify Authorization header format: `Bearer <token>`

## Monitoring

Health check:
```bash
curl http://localhost:8084/actuator/health
```

Metrics:
```bash
curl http://localhost:8084/actuator/metrics
```

Prometheus metrics:
```bash
curl http://localhost:8084/actuator/prometheus
```

## Future Enhancements

- [ ] Email verification
- [ ] Forgot password functionality
- [ ] OAuth2 integration
- [ ] Two-factor authentication
- [ ] User activity logging
- [ ] Account lockout after failed attempts
- [ ] Password history
- [ ] Session management

## Contributing

1. Create a feature branch
2. Write tests
3. Ensure all tests pass
4. Submit pull request

## License

MIT License