export const openapiSpec = `
openapi: 3.0.3
info:
  title: HUMMBL Backend API
  description: |
    HUMMBL (Highly Useful Mental Model Base Language) Backend API provides workflow orchestration, 
    agent management, and team collaboration features.
    
    ## Authentication
    
    Most endpoints require authentication via session tokens. Use \`/api/auth/login\` to obtain a session token,
    then include it in subsequent requests via the \`Authorization: Bearer <token>\` header or session cookie.
    
    ## Rate Limiting
    
    - Auth endpoints: 5 requests per minute
    - Execution endpoints: 10 requests per minute  
    - General endpoints: 100 requests per minute
    
    Rate limit headers are included in responses:
    - \`X-RateLimit-Limit\`: Maximum requests allowed
    - \`X-RateLimit-Remaining\`: Requests remaining
    - \`X-RateLimit-Reset\`: Time when limit resets (Unix timestamp)
    
  version: 1.0.0
  contact:
    name: HUMMBL Support
    url: https://hummbl.vercel.app
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://hummbl-backend.hummbl.workers.dev
    description: Production server
  - url: http://localhost:8787
    description: Local development server

tags:
  - name: Health
    description: Service health and status endpoints
  - name: Authentication
    description: User authentication and session management
  - name: Workflows
    description: Workflow CRUD operations (requires auth)
  - name: Executions
    description: Workflow execution and monitoring
  - name: Admin
    description: Administrative endpoints (requires admin role)

paths:
  /:
    get:
      summary: Health Check
      description: Returns service health status, database connectivity, and schema version
      tags:
        - Health
      responses:
        '200':
          description: Service is operational
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'
              example:
                service: hummbl-backend
                version: 1.0.0
                status: operational
                database:
                  status: healthy
                  schemaVersion: 1
                timestamp: 1699700000000

  /api/auth/register:
    post:
      summary: Register New User
      description: Create a new user account with email and password
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
            example:
              email: user@example.com
              password: SecurePassword123!
              name: John Doe
      responses:
        '201':
          description: User registered successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Invalid input or user already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '429':
          description: Rate limit exceeded
          headers:
            Retry-After:
              schema:
                type: integer
              description: Seconds until rate limit resets

  /api/auth/login:
    post:
      summary: Login
      description: Authenticate user and receive session token
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
            example:
              email: user@example.com
              password: SecurePassword123!
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /api/auth/logout:
    post:
      summary: Logout
      description: Invalidate current session token
      tags:
        - Authentication
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Logout successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Logged out successfully
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /api/auth/me:
    get:
      summary: Get Current User
      description: Retrieve current authenticated user's profile
      tags:
        - Authentication
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User profile retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Not authenticated

  /api/workflows-protected:
    get:
      summary: List User Workflows
      description: Get all workflows owned by the authenticated user
      tags:
        - Workflows
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Workflows retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  workflows:
                    type: array
                    items:
                      $ref: '#/components/schemas/Workflow'
        '401':
          description: Not authenticated

    post:
      summary: Create Workflow
      description: Create a new workflow for the authenticated user
      tags:
        - Workflows
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateWorkflowRequest'
      responses:
        '201':
          description: Workflow created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Workflow'
        '400':
          description: Invalid workflow data
        '401':
          description: Not authenticated

  /api/workflows-protected/{id}:
    delete:
      summary: Delete Workflow
      description: Delete a workflow owned by the authenticated user
      tags:
        - Workflows
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
          description: Workflow ID
      responses:
        '200':
          description: Workflow deleted successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Workflow deleted successfully
        '401':
          description: Not authenticated
        '403':
          description: Not authorized to delete this workflow
        '404':
          description: Workflow not found

  /api/workflows-protected/admin/workflows:
    get:
      summary: List All Workflows (Admin)
      description: Get all workflows in the system (admin only)
      tags:
        - Admin
      security:
        - bearerAuth: []
      responses:
        '200':
          description: All workflows retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  workflows:
                    type: array
                    items:
                      $ref: '#/components/schemas/Workflow'
        '401':
          description: Not authenticated
        '403':
          description: Insufficient permissions (admin required)

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Session token obtained from login endpoint

  schemas:
    HealthResponse:
      type: object
      properties:
        service:
          type: string
          example: hummbl-backend
        version:
          type: string
          example: 1.0.0
        status:
          type: string
          enum: [operational, degraded, down]
        database:
          type: object
          properties:
            status:
              type: string
              enum: [healthy, degraded, down]
            schemaVersion:
              type: integer
              example: 1
        timestamp:
          type: integer
          format: int64
          description: Current Unix timestamp in milliseconds

    RegisterRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          example: user@example.com
        password:
          type: string
          format: password
          minLength: 8
          example: SecurePassword123!
        name:
          type: string
          example: John Doe

    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          example: user@example.com
        password:
          type: string
          format: password
          example: SecurePassword123!

    AuthResponse:
      type: object
      properties:
        token:
          type: string
          description: Session token for authentication
          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        user:
          $ref: '#/components/schemas/User'
        expiresAt:
          type: integer
          format: int64
          description: Token expiration timestamp

    User:
      type: object
      properties:
        id:
          type: string
          example: user_123abc
        email:
          type: string
          format: email
          example: user@example.com
        name:
          type: string
          example: John Doe
        role:
          type: string
          enum: [admin, user, viewer]
          example: user
        isActive:
          type: boolean
          example: true
        createdAt:
          type: integer
          format: int64
        lastLoginAt:
          type: integer
          format: int64

    Workflow:
      type: object
      properties:
        id:
          type: string
          example: wf_abc123
        name:
          type: string
          example: Research Pipeline
        description:
          type: string
          example: Automated research and analysis workflow
        userId:
          type: string
          example: user_123abc
        status:
          type: string
          enum: [draft, active, paused, completed, failed]
          example: active
        tasks:
          type: array
          items:
            $ref: '#/components/schemas/Task'
        agents:
          type: array
          items:
            type: string
          description: Array of agent IDs
        createdAt:
          type: integer
          format: int64
        updatedAt:
          type: integer
          format: int64

    Task:
      type: object
      properties:
        id:
          type: string
          example: task_xyz789
        name:
          type: string
          example: Gather Research
        description:
          type: string
        agentId:
          type: string
        status:
          type: string
          enum: [pending, running, completed, failed, skipped]
        dependencies:
          type: array
          items:
            type: string
          description: Array of task IDs that must complete first
        input:
          type: object
          description: Task input parameters
        output:
          type: object
          description: Task output results
        retryCount:
          type: integer
          minimum: 0
        maxRetries:
          type: integer
          minimum: 0

    CreateWorkflowRequest:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          example: My Workflow
        description:
          type: string
          example: Workflow description
        tasks:
          type: array
          items:
            $ref: '#/components/schemas/Task'
        agents:
          type: array
          items:
            type: string

    ErrorResponse:
      type: object
      properties:
        error:
          type: string
          example: Invalid credentials
        code:
          type: string
          example: AUTH_FAILED
        details:
          type: object
          description: Additional error details
`;
