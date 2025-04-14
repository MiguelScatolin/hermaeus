# Product Requirements Document

## Core Requirements

### Content Management
- System receives a link or list of links
- Extracts and manages comprehensive metadata about the text content:
    #### Resource Identification
    - URL/Link to resource
    - Resource title/name
    - Author(s)
    - Publication date
    - Date of addition to knowledge base
    - Source/Platform (e.g., Medium, Dev.to, official documentation)
    - language

    #### Resource Evaluation (in case the source is a website with useful information such as comments and likes)
    - Commenter sentiment (Positive, Negative, Mixed)
    
    #### Content Classification
    - Content type:
        - Article
        - Book
        - Book chapter
        - Documentation
        - Tutorial
        - Video transcript
        - Conference talk transcript
        - Blog post
    - Primary category (e.g., Philosophy, Development)
    - Secondary categories/tags (nihilism, React)
    
    #### Reading Metrics
    - Character count
    - Word count
    - Estimated reading time
    - Reading complexity level:
        - Easy (beginner-friendly)
        - Medium (intermediate)
        - Hard (advanced concepts)
    
    #### Learning Context
    - Prerequisites (what general knowledge is needed to fully understand resource) + Target audience level (Beginner/Intermediate/Advanced)
        - requirement: docker - Intermediate
    - Content freshness (Recent/Evergreen/Outdated)
    
    #### Engagement Metrics
    - User ratings/feedback
    - Number of times reviewed
    - Last review date
    - Comprehension score (based on exercises)
    - Personal notes count
- Extracts key concepts and generates summaries
- Manages a content library with status tracking:
    #### Reading Status
    - Unread: Added to library but not started
    - In Progress: Currently being read
    - Read: Completed first pass
    - Reviewed: Read and actively reviewed with exercises/notes
    - Archived: No longer relevant or outdated
    
    #### Learning Status
    - Need Review: Content understood but requires practice
    - Mastered: Content fully understood and applied
    - Struggling: Having difficulty with the content
    - Reference: Keep as reference material
    
    #### Personal Progress Status
    - To Read Next: Queued for immediate reading
    - Bookmarked: Saved for later reading
    - Favorite: High-value content worth revisiting
    - Shared: Content shared with others
    
Each content piece can have multiple status indicators, one from each category.

### Study Sessions
- Creates and manages **Study Sessions** with the following structure:

    #### Session Configuration
    - Session Duration:
        - Quick (15-30 minutes)
        - Standard (30-60 minutes)
        - Deep Dive (1-2 hours)
    - Focus Type:
        - Subject-focused (e.g., React, Development, Philosophy)
        - Random/Discovery
        - Review Previous Content
        - Mixed (combination of new content and review)
    
    #### Content Selection
    - Smart content selection based on:
        - Available session time
        - Selected focus type
        - Content age in system
        - Previous session history
        - Current learning priorities
    - Content mix rules:
        - New vs. Review ratio
        - Easy vs. Hard content balance
        - Short vs. Long content distribution
    
    #### Session Flow
    1. **Session Setup** (2-5 minutes):
        - Review session goals
        - Quick recap of previous related content
        - Set specific learning objectives
    
    2. **Active Reading** (60-70% of session time):
        - Content consumption
        - Note-taking
        - Highlight key concepts
        - Mark points for review
    
    3. **Learning Reinforcement** (15-20% of session time):
        - Quick knowledge check
        - Practice exercises
        - Create flashcards
        - Write short summaries
    
    4. **Reflection** (remaining time):
        - Summarize key points
        - Connect with existing knowledge
        - Identify unclear concepts
    
    #### Session Outcomes
    - Updates to content statuses
    - Generated study materials:
        - Notes
        - Summaries
        - Flashcards
        - Practice questions
    - Progress tracking:
        - Topics covered
        - Time spent
        - Comprehension metrics
    - Next session recommendations

## Technical Requirements

### Prescribed Technology Stack
The following technologies must be used when implementing features that align with their purposes:

1. **Core Development:**
   - TypeScript - For type-safe development
   - ESLint - For code quality and consistency

2. **Frontend:**
   - React - UI framework
   - Vite - Build tool and development server
   - Radix UI - Accessible component primitives
   - Panda CSS - Styling solution
   - Jotai - State management

3. **Testing:**
   - Playwright - End-to-end testing

4. **Form & Validation:**
   - React Hook Form - Form management
   - Valibot - Schema validation

## Architectural Decision Records (ADRs)

### ADR 1: TypeScript
- **Context:** Need for a type-safe development environment
- **Decision:** Use TypeScript for all code
- **Rationale:**
  - Provides compile-time type checking
  - Enhances code maintainability
  - Improves developer experience with better tooling
- **Consequences:**
  - Additional setup time
  - Learning curve for developers new to TypeScript
  - Better code quality and fewer runtime errors

### ADR 2: React + Vite
- **Context:** Need for a modern, performant frontend setup
- **Decision:** Use React with Vite
- **Rationale:**
  - React's component model suits the application's UI needs
  - Vite provides faster development experience
  - Hot Module Replacement (HMR) for rapid development
- **Consequences:**
  - Modern build setup with better performance
  - Excellent developer experience
  - Potential learning curve for Vite configuration

### ADR 3: Radix UI + Panda CSS
- **Context:** Need for accessible, customizable UI components
- **Decision:** Use Radix UI for components with Panda CSS for styling
- **Rationale:**
  - Radix UI provides accessible primitives
  - Panda CSS offers type-safe styling with good performance
  - Both tools align well with React ecosystem
- **Consequences:**
  - Guaranteed accessibility
  - Consistent component behavior
  - Need to style primitive components

### ADR 4: Jotai
- **Context:** Need for flexible state management
- **Decision:** Use Jotai for state management
- **Rationale:**
  - Atomic approach fits well with React's philosophy
  - Lightweight and flexible
  - TypeScript-first design
- **Consequences:**
  - Simpler state management model
  - Easy integration with React
  - Potential learning curve for atomic state concept

### ADR 5: Playwright
- **Context:** Need for reliable end-to-end testing
- **Decision:** Use Playwright for E2E testing
- **Rationale:**
  - Cross-browser testing capabilities
  - Modern features like auto-waiting
  - Good TypeScript support
- **Consequences:**
  - Robust test coverage
  - Additional setup and maintenance
  - Need for CI configuration

### ADR 6: React Hook Form + Valibot
- **Context:** Need for form handling and validation
- **Decision:** Use React Hook Form with Valibot
- **Rationale:**
  - React Hook Form provides performant form handling
  - Valibot offers lightweight, type-safe validation
  - Good integration between both tools
- **Consequences:**
  - Type-safe form validation
  - Reduced bundle size compared to alternatives
  - Need to learn two libraries' APIs