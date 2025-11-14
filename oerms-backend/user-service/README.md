# User Service - Cached User Profile Management

## Overview

The **User Service** is a read-optimized microservice in the OERMS (Online Exam and Result Management System) that provides fast access to user profile data. It acts as a **read replica** that synchronizes with the Auth Server through event-driven architecture.

**Key Responsibilities:**
- Consume user events from Kafka
- Maintain a cached copy of user profiles
- Provide fast read access to user data
- Fallback to Auth Server for cache misses
- Serve user lookups for other microservices

---

## Architecture Role

```
┌─────────────────────────────────────────────────────────┐
│                    USER SERVICE                         │
│                                                         │
│  ✓ Kafka Consumer (user-events topic)                  │
│  ✓ Cached User Profile Storage                         │
│  ✓ Redis Caching Layer                                 │
│  ✓ Fast Read Operations                                │
│  ✓ Fallback to Auth Server (Feign Client)              │
│  ✓ Eventually Consistent Data                          │
└─────────────────┬───────────────────────────────────────┘
                  ▲
                  │ Consumes Events
            ┌──────────┐
            │  Kafka   │ Topic: user-events
            └──────────┘
                  ▲
                  │ Publishes Events
          ┌───────────────┐
          │  Auth Server  │ (Master Database)
          └───────────────┘
```

---

## Technology Stack

- **Spring Boot 3.2.0**
- **Spring Data JPA**
- **PostgreSQL 15** (Database: `oerms_user`)
- **Redis** (Caching layer)
- **Apache Kafka Consumer** (Event consumption)
- **Spring Cloud OpenFeign** (Auth Server client)
- **Netflix Eureka Client** (Service discovery)
- **Lombok** (Code generation)

---

## Database Schema

### Tables

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY,  -- Same as auth-server user.id
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
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
    enabled BOOLEAN,
    synced_at TIMESTAMP NOT NULL
);
```

#### `user_profile_roles`
```sql
CREATE TABLE user_profile_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);
```

**Note**: This is a **read-only replica**. All writes are handled by Auth Server.

---

## Data Synchronization

### Event-Driven Sync Flow

```
┌─────────────┐
│ Auth Server │ User Created/Updated/Deleted
└──────┬──────┘
       │
       │ Publish Event
       ▼
┌──────────────┐
│    Kafka     │ Topic: user-events
│ Partition by │ userId for ordering
│  user_id     │
└──────┬───────┘
       │
       │ Consume Event
       ▼
┌──────────────┐
│ User Service │
│  1. Receive  │
│  2. Validate │
│  3. Sync DB  │──► PostgreSQL (user_profiles)
│  4. Cache    │──► Redis (userProfiles cache)
└──────────────┘
```

### Event Processing

The service listens to three event types:

1. **user.created** - Creates new user profile
2. **user.updated** - Updates existing profile
3. **user.deleted** - Removes user profile

#### Processing Logic
```java
@KafkaListener(topics = "user-events", groupId = "user-service")
public void handleUserEvent(Map<String, Object> event) {
    String eventType = event.get("eventType");
    Long userId = event.get("userId");
    
    switch (eventType) {
        case "user.created":
        case "user.updated":
            syncUser(event);      // Create or update
            break;
        case "user.deleted":
            deleteUser(userId);   // Remove from DB and cache
            break;
    }
}
```

---

## API Endpoints

### Read Operations (Fast, Cached)

#### Get User Profile by ID
```http
GET /api/users/profile/{userId}
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
    "profileImageUrl": "https://example.com/avatar.jpg",
    "dateOfBirth": "2000-01-15T00:00:00",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "roles": ["ROLE_STUDENT"],
    "enabled": true
  }
}
```

#### Get User Profile by Username
```http
GET /api/users/profile/username/{username}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Get All Users (Admin Only)
```http
GET /api/users/admin/all
Authorization: Bearer {access_token}

Response: 200 OK
{
  "success": true,
  "data": [
    { "id": 1, "username": "user1", ... },
    { "id": 2, "username": "user2", ... }
  ]
}
```

### Write Operations (Delegated to Auth Server)

#### Update User Profile
```http
PUT /api/users/profile/{userId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "bio": "Updated bio",
  "address": "456 Oak Ave",
  "city": "Boston",
  "state": "MA",
  "country": "USA"
}

Response: 200 OK
```

**Note**: This endpoint delegates to Auth Server via Feign client. After Auth Server processes the update, a Kafka event is published, and User Service syncs automatically.

---

## Caching Strategy

### Redis Cache Configuration

```yaml
Cache Name: userProfiles
TTL: 1 hour
Eviction: On user update/delete events
Key Pattern: user:{userId} or username:{username}
```

### Cache Flow

```
┌──────────────┐
│   Request    │ GET /api/users/profile/1
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Check Redis  │ Key: userProfiles::1
└──────┬───────┘
       │
       ├─► Cache Hit ──► Return Data
       │
       └─► Cache Miss
           │
           ▼
    ┌──────────────┐
    │ Check DB     │ user_profiles table
    └──────┬───────┘
           │
           ├─► Found ──► Cache & Return
           │
           └─► Not Found
               │
               ▼
        ┌──────────────┐
        │ Fallback to  │ Via Feign Client
        │ Auth Server  │
        └──────────────┘
```

### Cache Annotations

```java
@Cacheable(value = "userProfiles", key = "#userId")
public UserProfile getUser(Long userId) { ... }

@CacheEvict(value = "userProfiles", key = "#userId")
public void syncUser(Long userId) { ... }
```

---

## Configuration

### application.yml

```yaml
spring:
  application:
    name: user-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_user
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
  
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: 6379
  
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    consumer:
      group-id: user-service
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
  
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9000

server:
  port: 9001

eureka:
  client:
    service-url:
      defaultZone: http://eureka:eureka123@localhost:8761/eureka/

feign:
  client:
    config:
      auth-server:
        connectTimeout: 5000
        readTimeout: 5000

logging:
  level:
    com.oerms.user: DEBUG
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USERNAME` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `REDIS_HOST` | Redis host | `localhost` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka servers | `localhost:9092` |
| `EUREKA_URL` | Eureka server URL | `http://localhost:8761/eureka/` |

---

## Running the Service

### Prerequisites

1. **Auth Server** running on port 9000
2. **PostgreSQL** running on port 5432
3. **Redis** running on port 6379
4. **Kafka & Zookeeper** running on port 9092
5. **Eureka Server** running on port 8761

### Create Database

```sql
CREATE DATABASE oerms_user;
```

### Start Service

#### Using Maven
```bash
cd user-service
mvn clean install
mvn spring-boot:run
```

#### Using JAR
```bash
cd user-service
mvn clean package
java -jar target/user-service-1.0.0.jar
```

#### Using Docker
```bash
docker build -t oerms-user-service .
docker run -p 9001:9001 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e REDIS_HOST=redis \
  -e KAFKA_BOOTSTRAP_SERVERS=kafka:9092 \
  oerms-user-service
```

### Verify Service

```bash
# Check health
curl http://localhost:9001/actuator/health

# Check if synced with auth-server
curl http://localhost:9001/actuator/health/sync

# Check Eureka registration
curl http://localhost:8761/eureka/apps/USER-SERVICE
```

---

## Event Consumption

### Kafka Consumer Configuration

```yaml
Consumer Group: user-service
Topic: user-events
Partitions: 3
Auto Offset Reset: earliest
```

### Event Handling

#### Success Flow
```
Event Received → Validate → Sync to DB → Update Cache → Log Success
```

#### Error Flow
```
Event Received → Error Occurs → Log Error → Continue Processing
                                      ↓
                            (Consider Dead Letter Queue)
```

### Monitoring Events

```bash
# Check consumer lag
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group user-service \
  --describe

# Sample output:
GROUP           TOPIC      PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
user-service    user-events    0          150            150            0
user-service    user-events    1          148            148            0
user-service    user-events    2          152            152            0
```

---

## Fallback Mechanism

### Auth Server Client (Feign)

When user profile is not found in cache or database, the service falls back to Auth Server:

```java
@FeignClient(name = "auth-server")
public interface AuthServiceClient {
    @GetMapping("/users/{userId}")
    UserProfileDTO getUser(@PathVariable Long userId);
    
    @GetMapping("/users/username/{username}")
    UserProfileDTO getUserByUsername(@PathVariable String username);
    
    @PutMapping("/users/{userId}")
    UserProfileDTO updateUser(@PathVariable Long userId, 
                             @RequestBody UserProfileDTO dto);
}
```

### Fallback Flow

```
Request → User Service
    │
    ├─► Check Redis Cache
    │       │
    │       └─► Miss
    │           │
    │           ├─► Check Database
    │           │       │
    │           │       └─► Miss
    │           │           │
    │           │           └─► Feign to Auth Server ✓
    │           │                   │
    │           │                   └─► Return & Cache
    │           │
    │           └─► Hit → Return
    │
    └─► Hit → Return
```

---

## Health Checks

### Custom Health Indicators

#### Sync Health
```java
@Component
public class SyncHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        long userCount = userProfileRepository.count();
        return Health.up()
            .withDetail("syncedUsers", userCount)
            .withDetail("status", "Synced")
            .build();
    }
}
```

#### Kafka Health
```java
@Component
public class KafkaHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // Check Kafka connection
        return Health.up()
            .withDetail("kafka", "Connected")
            .build();
    }
}
```

### Health Endpoint Response

```bash
curl http://localhost:9001/actuator/health
```

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL"
      }
    },
    "redis": {
      "status": "UP"
    },
    "sync": {
      "status": "UP",
      "details": {
        "syncedUsers": 150,
        "status": "Synced"
      }
    },
    "kafka": {
      "status": "UP",
      "details": {
        "kafka": "Connected"
      }
    }
  }
}
```

---

## Testing Synchronization

### End-to-End Sync Test

```bash
# 1. Create user in Auth Server
curl -X POST http://localhost:9000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "synctest",
    "email": "sync@test.com",
    "password": "password123",
    "firstName": "Sync",
    "lastName": "Test"
  }'

# 2. Wait 1-2 seconds for Kafka sync

# 3. Verify in User Service
curl http://localhost:9001/api/users/profile/username/synctest \
  -H "Authorization: Bearer {token}"

# 4. Check database
psql -U postgres -d oerms_user -c \
  "SELECT id, username, email, synced_at FROM user_profiles WHERE username='synctest';"

# 5. Update in Auth Server
curl -X PUT http://localhost:9000/users/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name"
  }'

# 6. Wait 1-2 seconds

# 7. Verify update in User Service
curl http://localhost:9001/api/users/profile/1 \
  -H "Authorization: Bearer {token}"

# Expected: firstName and lastName should be updated
```

### Manual Verification

```sql
-- Check synced users
SELECT id, username, email, synced_at 
FROM user_profiles 
ORDER BY synced_at DESC 
LIMIT 10;

-- Check sync lag
SELECT 
    username,
    synced_at,
    NOW() - synced_at AS sync_age
FROM user_profiles
WHERE synced_at < NOW() - INTERVAL '5 minutes';
```

---

## Performance Optimization

### 1. Redis Caching
- **Cache Hit Ratio**: Target > 90%
- **TTL**: 1 hour (adjustable)
- **Eviction**: LRU policy

### 2. Database Indexing
```sql
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_synced_at ON user_profiles(synced_at);
```

### 3. Connection Pooling
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
```

### 4. Kafka Consumer Tuning
```yaml
spring:
  kafka:
    consumer:
      max-poll-records: 100
      fetch-min-size: 1024
      fetch-max-wait: 500ms
```

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Sync Lag** - Time between event publish and consumption
2. **Cache Hit Ratio** - Percentage of requests served from cache
3. **Fallback Rate** - Frequency of Auth Server fallbacks
4. **Event Processing Time** - Time to process each event
5. **Database Query Time** - Average query response time

### Prometheus Metrics

```bash
# Cache hit ratio
cache_hits_total / cache_requests_total

# Kafka consumer lag
kafka_consumer_lag{group="user-service"}

# Feign client calls
feign_client_requests_total{client="auth-server"}
```

---

## Troubleshooting

### Common Issues

#### 1. User Not Found After Creation
```
Error: User not found in user-service
```

**Possible Causes:**
- Kafka consumer not running
- Network partition
- Event processing error

**Solution:**
```bash
# Check Kafka consumer status
curl http://localhost:9001/actuator/health/kafka

# Check consumer lag
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group user-service --describe

# Check logs
docker logs user-service | grep "user.created"
```

#### 2. Sync Lag High
```
Warning: Sync lag > 5 seconds
```

**Solution:**
- Increase Kafka partitions
- Scale up User Service instances
- Optimize event processing

#### 3. Cache Not Working
```
Error: All requests hitting database
```

**Solution:**
```bash
# Check Redis connection
redis-cli -h localhost -p 6379 ping

# Check cache keys
redis-cli -h localhost keys "userProfiles::*"

# Clear and rebuild cache
redis-cli -h localhost FLUSHDB
```

#### 4. Auth Server Fallback Failing
```
Error: Feign client connection refused
```

**Solution:**
```bash
# Verify Auth Server is running
curl http://localhost:9000/actuator/health

# Check Eureka service registration
curl http://localhost:8761/eureka/apps/AUTH-SERVER

# Test direct connection
curl http://localhost:9000/users/1
```

#### 5. Duplicate Events
```
Warning: Same event processed multiple times
```

**Solution:**
- Check Kafka consumer offset management
- Implement idempotent event processing
- Use unique constraint on user_profiles.id

---

## Data Consistency

### Eventually Consistent Model

- **Write Latency**: < 1 second typical
- **Consistency Guarantee**: Eventually consistent
- **Conflict Resolution**: Last-write-wins (via updated_at)

### Handling Inconsistencies

```java
// Periodic sync verification (optional)
@Scheduled(cron = "0 0 2 * * *") // 2 AM daily
public void verifySyncIntegrity() {
    // Compare counts, checksums, or sample records
    // Alert if discrepancies found
}
```

---

## Disaster Recovery

### Rebuilding Cache

If user-service data is lost:

```bash
# 1. Stop user-service
docker stop user-service

# 2. Clear database
psql -U postgres -d oerms_user -c "TRUNCATE user_profiles CASCADE;"

# 3. Clear Redis cache
redis-cli FLUSHDB

# 4. Restart service
docker start user-service

# 5. Trigger full sync from Auth Server (manual script)
# Or wait for users to be accessed (lazy loading via fallback)
```

---

## Security

### OAuth2 Resource Server

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9000
```

### Endpoint Protection

```java
@PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
public UserProfileDTO getUserProfile(Long userId) { ... }

@PreAuthorize("hasRole('ADMIN')")
public List<UserProfileDTO> getAllUsers() { ... }
```

---

## Best Practices

1. **Read from User Service** - Always prefer User Service for reads
2. **Write to Auth Server** - Never write directly to user-service DB
3. **Monitor Sync Lag** - Alert if lag > 5 seconds
4. **Use Caching** - Leverage Redis for performance
5. **Implement Fallback** - Always have Auth Server fallback
6. **Handle Errors Gracefully** - Don't fail on sync errors
7. **Log Everything** - Track all event processing
8. **Test Sync Flow** - Regular end-to-end tests

---

## API Flow Examples

### Reading User Profile

```
Client → API Gateway → User Service (Port 9001)
                            │
                            ├─► Redis Cache (Hit) → Return ✓
                            │
                            └─► Redis Cache (Miss)
                                    │
                                    ├─► PostgreSQL (Hit) → Cache & Return ✓
                                    │
                                    └─► PostgreSQL (Miss)
                                            │
                                            └─► Auth Server Feign → Return ✓
```

### Updating User Profile

```
Client → API Gateway → User Service (Port 9001)
                            │
                            └─► Feign Client
                                    │
                                    ▼
                              Auth Server (Port 9000)
                                    │
                                    ├─► Update Database
                                    │
                                    └─► Publish Kafka Event
                                            │
                                            ▼
                                      User Service
                                            │
                                            ├─► Sync Database
                                            │
                                            └─► Evict Cache
```

---

## Development Tips

### Hot Reload
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
</dependency>
```

### Debug Kafka Events
```java
@KafkaListener(topics = "user-events")
public void handleEvent(Map<String, Object> event) {
    log.debug("Received event: {}", event);
    // Process event
}
```

### Test Feign Client Locally
```java
@SpringBootTest
class AuthServiceClientTest {
    @Autowired
    private AuthServiceClient authServiceClient;
    
    @Test
    void testGetUser() {
        UserProfileDTO user = authServiceClient.getUser(1L);
        assertNotNull(user);
    }
}
```

---

## Production Checklist

- [ ] Configure proper database connection pooling
- [ ] Set up Redis cluster for HA
- [ ] Configure Kafka consumer with proper error handling
- [ ] Implement circuit breaker for Auth Server calls
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Implement rate limiting
- [ ] Set up backup and recovery procedures
- [ ] Configure HTTPS/TLS
- [ ] Implement distributed tracing

---

## Contributing

1. Never write directly to user_profiles table
2. All writes must go through Auth Server
3. Test synchronization after changes
4. Update health indicators for new features
5. Document cache eviction strategies

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
- Kafka consumer implementation
- Event-driven sync with Auth Server
- Redis caching layer
- Feign client fallback
- Health indicators
- Read-optimized endpoints