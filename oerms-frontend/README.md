# OERMS - Online Examination & Result Management System

A comprehensive, production-ready frontend for an Online Examination & Result Management System built with Next.js 15, featuring role-based access control, real-time exam taking, advanced analytics, and seamless integration with Spring Cloud microservices.

## 🚀 Features

### Core Functionality
- **Multi-Role Authentication**: Secure JWT-based authentication for Admin, Teacher, and Student roles with enhanced user experience
- **Advanced Exam Interface**: Real-time timers, auto-save functionality, question navigation sidebar, and progress tracking
- **Question Management**: Support for both MCQ and subjective questions with bulk upload capabilities and question banks
- **Comprehensive Analytics**: Interactive charts including scatter plots, composed charts, and detailed question-level analysis
- **Result Management**: Automatic result generation with detailed performance metrics and time tracking
- **Real-time Notifications**: Email and WhatsApp integration via Kafka messaging for exam updates and results

### Enhanced UI/UX Features
- **Modern Design System**: Comprehensive design tokens, status badges, loading states, and consistent styling
- **Enhanced Navigation**: User profile menu with role display, dropdown navigation, and mobile-responsive design
- **Progress Tracking**: Real-time progress indicators, question completion status, and time spent per question
- **Interactive Components**: Auto-save feedback, submit confirmation modals, and enhanced form validation
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support, and WCAG compliance

### Technical Features
- **Performance Optimized**: Lazy loading, code splitting, optimized bundle sizes, and standalone output
- **Microservices Ready**: Seamless integration with Spring Cloud backend services and API Gateway
- **Docker Support**: Production-ready containerization with multi-stage builds and health checks
- **Security**: Comprehensive security headers, rate limiting, and secure token handling
- **Mobile Responsive**: Fully optimized for desktop and mobile devices with touch-friendly interfaces

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.5, React 19.1.0, TypeScript 5
- **Styling**: Tailwind CSS 4.1.14, Custom Design System with comprehensive tokens
- **Charts**: Recharts 3.2.1 for interactive analytics visualization
- **Forms**: React Hook Form 7.65.0 with Zod 4.1.12 validation
- **HTTP Client**: Axios 1.4.0 with JWT interceptors and error handling
- **Authentication**: JWT-decode 3.1.2 for token management
- **Icons**: Lucide React 0.545.0
- **Deployment**: Docker, Docker Compose, Nginx load balancer
- **Backend Integration**: Spring Boot microservices with API Gateway

## 📦 Installation

### Prerequisites
- Node.js 20+ 
- Docker & Docker Compose
- Git
- PostgreSQL (for local development)
- Redis (for caching)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oerms-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the environment variables in `.env.local`:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE=http://localhost:8080
   NODE_ENV=development
   
   # Database (for local development)
   DATABASE_URL=postgresql://username:password@localhost:5432/oerms
   REDIS_URL=redis://localhost:6379
   
   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRES_IN=24h
   
   # Kafka Configuration
   KAFKA_BOOTSTRAP_SERVERS=localhost:9092
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8080
   - Service Registry (Eureka): http://localhost:8761
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379
   - Kafka: localhost:9092

### Infrastructure Setup

The application uses a microservices architecture with the following services:

- **Frontend**: Next.js application (Port 3000)
- **API Gateway**: Spring Cloud Gateway (Port 8080)
- **Eureka Server**: Service registry (Port 8761)
- **User Service**: User management and authentication
- **Exam Service**: Exam management and session handling
- **Question Service**: Question CRUD operations
- **Attempt Service**: Exam attempt tracking
- **Result Service**: Result calculation and analytics
- **Notification Service**: Email and WhatsApp notifications
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **Kafka**: Message streaming for real-time updates
- **Nginx**: Load balancer and reverse proxy

## 🏗️ Project Structure

```
oerms-frontend/
├── app/
│   ├── components/                    # Reusable UI components
│   │   ├── AuthProvider.tsx          # Authentication context and JWT handling
│   │   ├── NavClient.tsx             # Enhanced navigation with user menu
│   │   ├── ExamRunner.tsx            # Advanced exam taking interface
│   │   ├── ExamTimer.tsx             # Timer component with warnings
│   │   ├── ResultAnalytics.tsx       # Comprehensive analytics dashboard
│   │   └── ...
│   ├── admin/                        # Admin-specific pages
│   │   ├── dashboard/                # Admin dashboard
│   │   ├── exams/                    # Exam management
│   │   ├── questions/                # Question management
│   │   └── users/                    # User management
│   ├── teacher/                      # Teacher-specific pages
│   │   ├── dashboard/                # Teacher dashboard
│   │   ├── exams/                    # Exam creation and management
│   │   ├── questions/                # Question bank management
│   │   └── results/                  # Result analysis
│   ├── student/                      # Student-specific pages
│   │   ├── dashboard/                # Student dashboard
│   │   ├── exams/                    # Available and taken exams
│   │   └── results/                  # Personal results
│   ├── auth/                         # Authentication pages
│   │   ├── login/                    # Enhanced login page
│   │   ├── register/                 # User registration
│   │   └── forgot-password/          # Password recovery
│   ├── types/                        # TypeScript type definitions
│   │   ├── exam.ts                   # Exam and question types
│   │   ├── result.ts                 # Result and analytics types
│   │   └── attempt.ts                # Attempt and session types
│   ├── styles/                       # Global styles and design tokens
│   │   ├── tokens.css                # Design system tokens
│   │   └── globals.css               # Global styles
│   ├── globals.css                   # Tailwind and base styles
│   ├── layout.tsx                    # Root layout with providers
│   └── page.tsx                      # Enhanced landing page
├── lib/                              # Utility functions and API client
│   ├── api.ts                        # Axios configuration with interceptors
│   ├── auth.ts                       # Authentication utilities
│   ├── errors.ts                     # Error handling utilities
│   └── templates.ts                  # Email/notification templates
├── docs/                             # Documentation
│   └── api_endpoints.txt             # Comprehensive API documentation
├── public/                           # Static assets
├── docker-compose.yml                # Multi-service Docker orchestration
├── Dockerfile                        # Multi-stage production build
├── nginx.conf                        # Nginx load balancer configuration
├── next.config.ts                    # Next.js configuration with optimizations
├── package.json                      # Dependencies and scripts
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── .env.example                      # Environment variables template
```

## 🎨 Design System

The application uses a comprehensive design system with:

- **Color Palette**: Primary, success, warning, error, and neutral color scales with 50-900 variants
- **Typography**: Geist Sans and Mono fonts with consistent sizing and weight scales
- **Spacing**: 8px-based spacing system with consistent padding and margins
- **Components**: Reusable button, form, card, status badge, and loading components
- **Status Indicators**: Color-coded status badges for different states and roles
- **Loading States**: Skeleton loaders, spinners, and progress indicators
- **Responsive**: Mobile-first responsive design with breakpoint-specific layouts
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support, and WCAG compliance
- **Animations**: Smooth transitions, hover effects, and micro-interactions
- **Utility Classes**: Custom utility classes for common patterns and layouts

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, exam management, user management
- **Teacher**: Exam creation, question management, result viewing
- **Student**: Exam taking, result viewing, profile management

### Security Features
- JWT token-based authentication
- Role-based route protection
- Automatic token refresh
- Secure API communication
- Rate limiting on sensitive endpoints

## 📊 Analytics & Reporting

### Key Metrics
- Total attempts and completion rates
- Average scores and pass percentages
- Time distribution analysis
- Question difficulty analysis
- Performance trends and patterns
- Individual question performance
- Time spent per question analysis

### Enhanced Visualizations
- **Interactive Charts**: Using Recharts with custom tooltips and animations
- **Score Distribution**: Histograms and bar charts for score analysis
- **Time vs Performance**: Scatter plots showing correlation between time and scores
- **Question Difficulty**: Pie charts and donut charts for difficulty distribution
- **Performance Trends**: Line charts showing performance over time
- **Composed Charts**: Multi-metric visualizations combining different data points
- **Question Analysis**: Detailed table view with sorting and filtering
- **Real-time Updates**: Live data updates during exam sessions

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting with dynamic imports
- **Image Optimization**: Next.js Image component with lazy loading and WebP support
- **Bundle Analysis**: Optimized package imports with tree shaking
- **Caching**: Static asset caching with proper headers and ETags
- **Compression**: Gzip compression for all text assets
- **Standalone Output**: Optimized Docker builds with minimal runtime dependencies
- **CSS Optimization**: Tailwind CSS purging and critical CSS extraction
- **CDN Ready**: Static asset optimization for CDN deployment
- **Lazy Loading**: Component-level lazy loading for better initial load times
- **Memory Management**: Efficient state management and cleanup

## 🐳 Docker Configuration

### Multi-Stage Build
- **Dependencies**: Separate layer for npm dependencies with Alpine Linux
- **Builder**: Build stage with all source code and TypeScript compilation
- **Runner**: Minimal production image with only necessary files and standalone output

### Production Features
- Non-root user (nextjs) for enhanced security
- Health checks for all microservices
- Proper signal handling and graceful shutdown
- Optimized image size (~150MB with standalone output)
- Multi-service orchestration with Docker Compose
- Environment variable configuration
- Volume mounts for persistent data

### Service Architecture
- **Frontend**: Next.js application with Nginx reverse proxy
- **Backend Services**: Spring Boot microservices with API Gateway
- **Database**: PostgreSQL with persistent volumes
- **Cache**: Redis for session storage and caching
- **Message Queue**: Kafka with Zookeeper for real-time messaging
- **Load Balancer**: Nginx with SSL termination and rate limiting

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with optimizations
npm run start        # Start production server
npm run lint         # Run ESLint with Next.js configuration
npm run type-check   # Run TypeScript type checking
```

### Code Quality
- **TypeScript**: Comprehensive type safety with strict mode
- **ESLint**: Next.js ESLint configuration with custom rules
- **Prettier**: Consistent code formatting (configured via ESLint)
- **Type Checking**: Automated type checking in CI/CD pipeline
- **Build Optimization**: Turbopack for faster development builds
- **Standalone Output**: Optimized production builds for Docker deployment

## 🌐 API Integration

The frontend integrates with Spring Cloud microservices through a comprehensive API:

### Backend Services
- **API Gateway**: Spring Cloud Gateway for routing and load balancing
- **User Service**: User management, authentication, and JWT token handling
- **Exam Service**: Exam management, session handling, and scheduling
- **Question Service**: Question CRUD operations and question bank management
- **Attempt Service**: Exam attempt tracking and session management
- **Result Service**: Result calculation, analytics, and performance metrics
- **Notification Service**: Email and WhatsApp notifications via Kafka
- **Eureka Server**: Service discovery and registry

### API Documentation
- **Comprehensive API Specs**: Detailed endpoint documentation in `docs/api_endpoints.txt`
- **Request/Response Examples**: Complete examples for all API endpoints
- **Authentication**: JWT-based authentication with role-based access control
- **Error Handling**: Standardized error responses and status codes
- **Real-time Communication**: WebSocket and Server-Sent Events for live updates

### Integration Features
- **Axios Interceptors**: Automatic token attachment and error handling
- **Type Safety**: TypeScript interfaces matching backend DTOs
- **Caching**: Redis integration for session and data caching
- **Real-time Updates**: Kafka message streaming for live notifications

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface elements
- Mobile-optimized exam taking experience
- Progressive Web App (PWA) capabilities
- Offline support for exam taking

## 🔒 Security

- HTTPS enforcement in production
- Security headers (XSS, CSRF protection)
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure cookie handling
- Content Security Policy (CSP)

## 📈 Monitoring & Logging

- Health check endpoints
- Error boundary components
- Performance monitoring
- User activity tracking
- API response time monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Enhanced UI/UX with modern design system
- **v1.2.0**: Mobile optimization and responsive design
- **v1.3.0**: Advanced analytics dashboard with interactive charts
- **v1.4.0**: Enhanced exam interface with progress tracking and auto-save
- **v1.5.0**: Comprehensive API integration with Spring Boot microservices
- **v1.6.0**: Production-ready Docker configuration and infrastructure setup

---

Built with ❤️ using Next.js and modern web technologies.