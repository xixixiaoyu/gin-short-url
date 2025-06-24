# URL Shortener Frontend

A modern, responsive frontend for the Gin URL Shortener service built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript support for better development experience
- **Real-time Updates**: Instant feedback and state management
- **Analytics Dashboard**: Visual charts and statistics
- **Mobile Responsive**: Optimized for all device sizes
- **Offline Support**: Graceful handling of network issues
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized for speed and SEO

## 🛠 Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and configure:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI components (Button, Input, etc.)
│   │   ├── URLShortener.tsx # Main URL shortening component
│   │   ├── URLList.tsx     # URL management component
│   │   ├── StatsPage.tsx   # Analytics dashboard
│   │   └── Layout.tsx      # App layout wrapper
│   ├── pages/              # Next.js pages
│   │   ├── index.tsx       # Home page
│   │   ├── manage.tsx      # URL management page
│   │   ├── analytics.tsx   # Analytics page
│   │   └── _app.tsx        # App wrapper
│   ├── hooks/              # Custom React hooks
│   │   └── useAPI.ts       # API-related hooks
│   ├── lib/                # Utility libraries
│   │   └── api.ts          # API client
│   ├── types/              # TypeScript type definitions
│   │   └── api.ts          # API types
│   ├── utils/              # Utility functions
│   │   └── index.ts        # Common utilities
│   └── styles/             # Global styles
│       └── globals.css     # Tailwind CSS imports
├── public/                 # Static assets
├── __tests__/              # Test files
└── docs/                   # Documentation
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run type-check` - Run TypeScript type checking

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | Backend API URL |
| `NODE_ENV` | `development` | Environment mode |

### API Integration

The frontend communicates with the Go backend through these endpoints:

- `POST /shorten` - Create short URL
- `GET /info/:shortCode` - Get URL information
- `GET /health` - Health check
- `GET /:shortCode` - Redirect to original URL

### Local Storage

The app uses localStorage to persist:
- Created short codes list
- User preferences
- Theme settings (if implemented)

## 🎨 UI Components

### Core Components

- **Button**: Flexible button component with variants and states
- **Input**: Enhanced input with validation and icons
- **Card**: Container component for content sections
- **LoadingSpinner**: Loading states and skeleton screens

### Feature Components

- **URLShortener**: Main URL creation interface
- **URLList**: Table view of created URLs with search/sort
- **StatsPage**: Analytics dashboard with charts
- **Layout**: App navigation and structure

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### Test Structure

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API integration tests
- **E2E Tests**: Full user flow tests (optional)

### Coverage Goals

- **Components**: > 80%
- **Utilities**: > 90%
- **API Client**: > 85%

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment-specific Builds

```bash
# Development
npm run dev

# Staging
NODE_ENV=staging npm run build

# Production
NODE_ENV=production npm run build
```

## 🔍 Performance Optimization

### Bundle Analysis

```bash
npm run build
npm run analyze
```

### Performance Features

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Google Fonts optimization
- **Caching**: Aggressive caching strategies

## 🛡 Security

### Security Features

- **XSS Protection**: Input sanitization
- **CSRF Protection**: Built-in Next.js protection
- **Content Security Policy**: Configured headers
- **Secure Headers**: Security-focused HTTP headers

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend is running on port 8080
   - Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
   - Check CORS settings in backend

2. **Build Errors**
   - Run `npm run type-check` to find TypeScript errors
   - Clear `.next` folder and rebuild
   - Check for missing dependencies

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Verify PostCSS configuration

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run tests and linting
6. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write tests for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library
- [Chart.js](https://www.chartjs.org/) - Charting library
