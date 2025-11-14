# Auth Server - OAuth2 Authorization & User Management

## Overview

The **Auth Server** is the central authentication and user management service in the OERMS (Online Exam and Result Management System). It serves as:

- **OAuth2 Authorization Server** - Issues JWT tokens for secure authentication
- **User Management Master** - Single source of truth for all user data
- **Event Publisher** - Publishes user lifecycle events via Kafka

---

## Architecture Role

```
┌─────────────────────────────────────────────────────────┐
│                    AUTH SERVER                          │
│                                                         │
│  ✓ OAuth2 Authorization Server                         │
│  ✓ User Registration & Authentication                  │
│  ✓ User CRUD Operations (Master Database)              │
│  ✓ JWT Token Generation & Validation                   │
│  ✓ Role-Based Access Control                           │
│  ✓ Kafka Event Publisher (user-events)                 │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Publishes Events
                  ▼
            ┌──────────┐
            │  Kafka   │ Topic: user-events
            └──────────┘
                  │
                  ▼
          [User Service & Others consume]
```

---

## Technology Stack

- **Spring Boot 3.2.0**
- **Spring Security OAuth2 Authorization Server 1.2.0**
- **Spring Data JPA**
- **PostgreSQL 15** (Database: `oerms_auth`)
- **Redis** (Session & Token storage)
- **Apache Kafka** (Event streaming)
- **Netflix Eureka Client** (Service discovery)
- **Lombok** (Code generation)

---

## Database Schema

### Tables

#### 1. `users`
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    profile_image_url VARCHAR(500),
    date_of_birth TIMESTAMP,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    enabled BOOLEAN DEFAULT TRUE,
    account_non_expired BOOLEAN DEFAULT TRUE,
    account_non_locked BOOLEAN DEFAULT TRUE,
    credentials_non_expired BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### 2. `user_roles`
```sql
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 3. `oauth2_authorization`
Spring OAuth2 managed table for storing authorization codes and tokens.

#### 4. `oauth2_registered_client`
Spring OAuth2 managed table for OAuth2 client configurations.

---

## API Endpoints

### Public Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["ROLE_STUDENT"],
    "enabled": true,
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

#### Get OAuth2 Token
```http
POST /oauth2/token
Authorization: Basic b2VybXMtd2ViLWNsaWVudDpzZWNyZXQ=
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=john_doe&password=securePassword123&scope=read write

Response: 200 OK
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scope": "read write"
}
```

### Protected Endpoints (Require JWT Token)

#### Get User by ID
```http
GET /users/{userId}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "bio": "Computer Science Student",
    "roles": ["ROLE_STUDENT"],
    "enabled": true
  }
}
```

#### Get User by Username
```http
GET /users/username/{username}
Authorization: Bearer {access_token}
```

#### Update User
```http
PUT /users/{userId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "bio": "Updated bio",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA"
}

Response: 200 OK
```

#### Update User Roles (Admin Only)
```http
PUT /users/{userId}/roles
Authorization: Bearer {access_token}
Content-Type: application/json

["ROLE_STUDENT", "ROLE_TEACHER"]

Response: 200 OK
```

#### Toggle User Status (Admin Only)
```http
PATCH /users/{userId}/toggle-status
Authorization: Bearer {access_token}

Response: 200 OK
```

#### Get All Users (Admin Only)
```http
GET /users
Authorization: Bearer {access_token}

Response: 200 OK
{
  "success": true,
  "data": [...]
}
```

#### Delete User (Admin Only)
```http
DELETE /users/{userId}
Authorization: Bearer {access_token}

Response: 200 OK
```

---

## OAuth2 Configuration

### Registered Clients

#### Web Client
- **Client ID**: `oerms-web-client`
- **Client Secret**: `secret` (configure via environment)
- **Grant Types**:
    - `authorization_code`
    - `refresh_token`
    - `password`
    - `client_credentials`
- **Scopes**: `read`, `write`
- **Redirect URI**: `http://localhost:3000/callback`
- **Token Settings**:
    - Access Token TTL: 1 hour
    - Refresh Token TTL: 7 days

### JWT Token Structure

```json
{
  "sub": "john_doe",
  "userId": 1,
  "authorities": ["ROLE_STUDENT"],
  "email": "john@example.com",
  "iss": "http://localhost:9000",
  "exp": 1705324200,
  "iat": 1705320600
}
```

---

## Kafka Events

### Topic: `user-events`

The auth-server publishes events whenever user data changes.

#### Event Types

1. **user.created**
```json
{
  "eventType": "user.created",
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "Student",
  "profileImageUrl": null,
  "dateOfBirth": null,
  "address": null,
  "city": null,
  "state": null,
  "country": null,
  "roles": ["ROLE_STUDENT"],
  "enabled": true,
  "timestamp": "2024-01-15T10:30:00"
}
```

2. **user.updated**
```json
{
  "eventType": "user.updated",
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "bio": "Updated bio",
  "roles": ["ROLE_STUDENT"],
  "enabled": true,
  "timestamp": "2024-01-15T11:45:00"
}
```

3. **user.deleted**
```json
{
  "eventType": "user.deleted",
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "timestamp": "2024-01-15T12:00:00"
}
```

---

## Default Roles

The system supports three roles:

- **ROLE_STUDENT** - Default role for registered users
- **ROLE_TEACHER** - Can create and manage exams
- **ROLE_ADMIN** - Full system access

---

## Configuration

### application.yml

```yaml
spring:
  application:
    name: auth-server
  
  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_auth
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: 6379
  
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

server:
  port: 9000

eureka:
  client:
    service-url:
      defaultZone: http://eureka:eureka123@localhost:8761/eureka/

logging:
  level:
    org.springframework.security: DEBUG
    com.oerms.auth: DEBUG
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USERNAME` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `REDIS_HOST` | Redis host | `localhost` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka servers | `localhost:9092` |
| `EUREKA_PASSWORD` | Eureka password | `eureka123` |

---

## Running the Service

### Prerequisites

1. **PostgreSQL** running on port 5432
2. **Redis** running on port 6379
3. **Kafka & Zookeeper** running on port 9092
4. **Eureka Server** running on port 8761

### Create Database

```sql
CREATE DATABASE oerms_auth;
```

### Start Service

#### Using Maven
```bash
cd auth-server
mvn clean install
mvn spring-boot:run
```

#### Using JAR
```bash
cd auth-server
mvn clean package
java -jar target/auth-server-1.0.0.jar
```

#### Using Docker
```bash
docker build -t oerms-auth-server .
docker run -p 9000:9000 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e REDIS_HOST=redis \
  -e KAFKA_BOOTSTRAP_SERVERS=kafka:9092 \
  oerms-auth-server
```

### Verify Service

```bash
# Check health
curl http://localhost:9000/actuator/health

# Check Eureka registration
curl http://localhost:8761/eureka/apps/AUTH-SERVER
```

---

## Security Features

### Password Encoding
- Uses **BCrypt** algorithm
- Salt rounds: 10 (default)
- Passwords are never stored in plain text

### JWT Token Security
- **RSA-256** signing algorithm
- **2048-bit** key pair
- Token includes user ID and roles
- Tokens are stateless

### Account Security
- Account locking support
- Account expiration support
- Password expiration support
- Failed login attempt tracking (can be implemented)

---

## Testing

### Register and Login Flow

```bash
# 1. Register new user
curl -X POST http://localhost:9000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# 2. Get OAuth2 token
curl -X POST http://localhost:9000/oauth2/token \
  -u oerms-web-client:secret \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=testuser&password=password123&scope=read write"

# 3. Use token to access protected resource
export TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X GET http://localhost:9000/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Verify Kafka Events

```bash
# Listen to user-events topic
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic user-events \
  --from-beginning
```

---

## Monitoring & Health Checks

### Health Endpoint
```bash
curl http://localhost:9000/actuator/health
```

Response:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "redis": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP"
    }
  }
}
```

### Metrics
```bash
curl http://localhost:9000/actuator/metrics
```

### Info
```bash
curl http://localhost:9000/actuator/info
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: Connection to localhost:5432 refused
```
**Solution**: Ensure PostgreSQL is running and accessible
```bash
pg_isready -h localhost -p 5432
```

#### 2. Kafka Connection Failed
```
Error: Failed to send message to Kafka
```
**Solution**: Verify Kafka is running
```bash
kafka-topics --bootstrap-server localhost:9092 --list
```

#### 3. Redis Connection Failed
```
Error: Unable to connect to Redis at localhost:6379
```
**Solution**: Check Redis status
```bash
redis-cli ping
```

#### 4. JWT Token Invalid
```
Error: An error occurred while attempting to decode the Jwt
```
**Solution**: Check issuer-uri in resource server configuration

#### 5. User Already Exists
```
Error: Username already exists
```
**Solution**: Use a different username or check existing users

---

## Development Tips

### Hot Reload
Add Spring Boot DevTools to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

### Debug Mode
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### Custom Logging
```yaml
logging:
  level:
    com.oerms.auth: TRACE
    org.springframework.security: TRACE
    org.springframework.kafka: DEBUG
```

---

## Production Considerations

### 1. Secure Credentials
- Use environment variables for sensitive data
- Never commit passwords to version control
- Use secrets management (AWS Secrets Manager, Vault)

### 2. Database Connection Pooling
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### 3. JWT Key Management
- Generate strong RSA keys
- Rotate keys periodically
- Store private keys securely

### 4. Rate Limiting
Implement rate limiting for:
- `/auth/register` endpoint
- `/oauth2/token` endpoint
- Failed login attempts

### 5. HTTPS
Always use HTTPS in production:
```yaml
server:
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${KEYSTORE_PASSWORD}
    key-store-type: PKCS12
```

---

## API Documentation

Swagger UI (if configured):
```
http://localhost:9000/swagger-ui.html
```

OpenAPI JSON:
```
http://localhost:9000/v3/api-docs
```

---

## Contributing

1. Follow Spring Boot best practices
2. Write unit tests for all business logic
3. Update this README for any API changes
4. Ensure Kafka events are published correctly
5. Test with user-service synchronization

---

## License

MIT License - Part of OERMS Project

---

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Documentation: [wiki-url]
- Email: support@oerms.com

---

## Version History

### v1.0.0 (Current)
- OAuth2 Authorization Server implementation
- User registration and authentication
- JWT token generation
- User CRUD operations
- Kafka event publishing
- Role-based access control