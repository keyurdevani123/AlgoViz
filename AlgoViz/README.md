# DSA Visualizer

## Overview

This is a Flask-based web application that provides interactive visualizations for Data Structures and Algorithms (DSA). The application features step-by-step visual demonstrations of sorting algorithms, tree traversals, graph traversals, and recursion examples with real-time pseudocode display and animation controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5 with dark theme
- **Canvas-based Visualizations**: HTML5 Canvas API for rendering algorithm animations
- **Responsive Design**: Mobile-first approach with Bootstrap grid system
- **Component Structure**: 
  - Modular JavaScript classes for each visualization type
  - Shared animation controller for consistent playback controls
  - Common utilities for cross-component functionality

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Structure**: Simple MVC pattern with routes, templates, and algorithm implementations
- **API Design**: RESTful endpoints for algorithm step generation
- **Session Management**: Basic Flask session handling with configurable secret key

## Key Components

### Core Algorithm Engine (`algorithms.py`)
- **Purpose**: Contains step-by-step implementations of various algorithms
- **Functionality**: Generates visualization data structures with metadata for each algorithm step
- **Algorithms Implemented**: 
  - Sorting: Bubble, Selection, Insertion, Merge, Quick Sort
  - Graph traversals: BFS, DFS (referenced but not fully shown in provided code)
  - Tree traversals: Inorder, Preorder, Postorder
  - Recursion examples: Factorial, Fibonacci, Tower of Hanoi

### Visualization Classes
- **SortingVisualizer**: Handles array-based sorting algorithm animations
- **TreeVisualizer**: Manages binary tree rendering and traversal animations
- **GraphVisualizer**: Controls graph node/edge visualization and traversal highlighting
- **RecursionVisualizer**: Displays recursive call stack and execution flow

### Animation Controller (`common.js`)
- **Purpose**: Centralized animation playback management
- **Features**: Play/pause/stop controls, variable speed adjustment, step-by-step navigation
- **Design Pattern**: Observer pattern for step callbacks

### Route Structure (`routes.py`)
- **Static Routes**: Serve HTML templates for each algorithm category
- **API Routes**: Provide JSON responses with algorithm step data
- **Data Flow**: Accept user input parameters, process through algorithm engines, return structured step data

## Data Flow

1. **User Input**: User selects algorithm and provides input data through web interface
2. **Parameter Processing**: Frontend validates and formats input data
3. **API Request**: AJAX call to Flask backend with algorithm type and parameters
4. **Algorithm Execution**: Backend processes input through appropriate algorithm function
5. **Step Generation**: Algorithm generates array of step objects with visualization metadata
6. **Response Delivery**: JSON response containing all algorithm steps
7. **Visualization Rendering**: Frontend canvas rendering based on step data
8. **Animation Playback**: Animation controller manages step-by-step visualization

## External Dependencies

### Frontend Libraries
- **Bootstrap 5**: UI framework with dark theme variant
- **Feather Icons**: Icon library for consistent UI elements
- **Native Canvas API**: For algorithm visualizations

### Backend Dependencies
- **Flask**: Core web framework
- **Werkzeug**: WSGI utilities and proxy fix middleware

### Development Tools
- **No build process**: Vanilla JavaScript and CSS approach
- **CDN Dependencies**: External libraries loaded via CDN for simplicity

## Deployment Strategy

### Environment Configuration
- **Development Mode**: Flask debug mode enabled for local development
- **Production Considerations**: Environment-based secret key configuration
- **WSGI Setup**: ProxyFix middleware for proper header handling behind reverse proxies

### Application Structure
- **Entry Points**: Both `app.py` and `main.py` provide application entry points
- **Static Assets**: CSS and JavaScript files served through Flask's static file handling
- **Template System**: Jinja2 templates with shared layout patterns

### Scalability Considerations
- **Stateless Design**: No persistent data storage, algorithms run in memory
- **Client-side Rendering**: Heavy visualization work performed in browser
- **Lightweight Backend**: Minimal server-side processing for algorithm step generation

### Hosting Requirements
- **Python Runtime**: Flask application requires Python environment
- **Static File Serving**: CSS, JS, and other assets served through Flask
- **Port Configuration**: Default configuration for port 5000 with host binding
- **Session Storage**: In-memory session management suitable for single-instance deployment