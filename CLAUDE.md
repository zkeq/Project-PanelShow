# Project-PanelShow

A comprehensive portfolio showcase project that displays interactive frontend projects with localized backend functionality.

## Project Overview

Project-PanelShow is a dual-service portfolio platform consisting of:

1. **Portfolio Showcase Website** - A beautiful display site showing project status, descriptions, and interactive demos
2. **API Snapshot Service** - A caching service that stores and serves API responses locally to keep legacy projects functional

## Architecture

### Frontend Portfolio Site
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Features**:
  - Interactive project gallery
  - Live project previews (not just screenshots)
  - Project status indicators
  - Detailed project descriptions
  - Responsive design

### API Snapshot Service
- **Purpose**: Cache and serve API responses for projects with deprecated backends
- **Functionality**:
  - Store API response snapshots
  - Serve cached data to frontend projects
  - Maintain project functionality even when original APIs are down

## Development Commands

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Project Goals
- Create an interactive portfolio that goes beyond static screenshots
- Enable visitors to explore actual UI interfaces of showcased projects
- Maintain functionality of legacy projects through API snapshots
- Provide a professional showcase of development work

## Timeline
Target completion: 1 month

## Key Features
- ✨ Interactive project exploration
- 📱 Responsive design
- 🚀 Modern tech stack
- 🔄 API response caching
- 💼 Professional portfolio presentation