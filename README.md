# Allergy Tracker

A comprehensive Progressive Web Application (PWA) for tracking and analyzing allergy incidents, built with Next.js 15, TypeScript, and Supabase.

## 🌟 Features

### Core Functionality
- **Incident Tracking**: Record detailed allergy incidents with symptoms, triggers, and environmental factors
- **Smart Analytics**: Interactive charts and trend analysis to identify patterns
- **Trigger Identification**: Correlate foods, activities, and environmental factors with reactions
- **Severity Monitoring**: Track incident severity over time with visual indicators

### Technical Features
- **Progressive Web App**: Installable, offline-capable, app-like experience
- **Real-time Data**: Live updates with optimistic UI patterns
- **Performance Optimized**: Code splitting, lazy loading, and intelligent caching
- **Mobile-First**: Responsive design optimized for mobile devices
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

### User Experience
- **Intuitive Interface**: Clean, modern design with smooth animations
- **Smart Defaults**: Pre-filled forms with intelligent suggestions
- **Comprehensive Filtering**: Advanced search and filter capabilities
- **Data Export**: Export your data for external analysis
- **Offline Support**: Continue using the app without internet connection

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd allergy-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Run migrations
   supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 PWA Installation

### Mobile Devices
1. Open the app in your mobile browser
2. Look for the "Add to Home Screen" prompt
3. Follow the installation instructions
4. Launch from your home screen like a native app

### Desktop
1. Open the app in Chrome, Edge, or Safari
2. Look for the install icon in the address bar
3. Click "Install" when prompted
4. Access from your applications folder or start menu

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Chart.js with React Chart.js 2
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: SWR with optimistic updates
- **PWA**: next-pwa with Workbox

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── forms/           # Form components
│   ├── incidents/       # Incident management components
│   ├── layout/          # Layout components
│   └── ui/              # Base UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── services/           # API services
└── types/              # TypeScript type definitions
```

### Key Features Implementation

#### Performance Optimizations
- **Code Splitting**: Dynamic imports for charts and heavy components
- **Lazy Loading**: Components load on-demand
- **Memoization**: React.memo and useMemo for expensive calculations
- **Virtualization**: Handle large datasets efficiently
- **Caching**: Multi-level caching strategy with SWR and service workers

#### Error Handling
- **Error Boundaries**: Graceful error recovery
- **Toast Notifications**: User-friendly error messages
- **Retry Logic**: Automatic retry for failed requests
- **Offline Detection**: Handle network connectivity issues

#### Data Management
- **Optimistic Updates**: Immediate UI feedback
- **Real-time Sync**: Automatic data synchronization
- **Conflict Resolution**: Handle concurrent updates
- **Data Validation**: Client and server-side validation

## 📊 Usage Guide

### Recording Incidents
1. Click "Add Incident" from the dashboard
2. Fill in the incident details:
   - Date and time of the incident
   - Severity level (Mild, Moderate, Severe)
   - Symptoms experienced
   - Potential trigger foods
   - Activities before the incident
   - Environmental factors
   - Medications taken
   - Duration and notes

### Analyzing Data
1. **Dashboard Overview**: View key statistics and recent incidents
2. **Charts and Trends**: Analyze patterns over time
3. **Trigger Analysis**: Identify common trigger foods and activities
4. **Severity Tracking**: Monitor how your reactions change over time
5. **Filtering**: Use advanced filters to focus on specific time periods or triggers

### Managing Incidents
- **View Details**: Click on any incident to see full details
- **Edit Incidents**: Update incident information as needed
- **Delete Incidents**: Remove incorrect or duplicate entries
- **Search and Filter**: Find specific incidents quickly

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Database Schema
The application uses the following main tables:
- `incidents` - Core incident data with user isolation via RLS
- Indexes optimized for common query patterns
- Row Level Security for data protection

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<repository-url>)

1. Click the deploy button
2. Connect your GitHub account
3. Set environment variables
4. Deploy!

## 📈 Performance

### Lighthouse Scores
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 100

### Bundle Size
- Initial bundle: ~102kB gzipped
- Dashboard: ~169kB (with lazy-loaded charts)
- Forms: ~116kB (with validation)

## 🔒 Security

- **Authentication**: Secure user authentication via Supabase
- **Data Isolation**: Row Level Security ensures users only see their data
- **Input Validation**: Client and server-side validation
- **HTTPS**: Enforced in production
- **CSP**: Content Security Policy headers
- **XSS Protection**: Built-in React protections

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with PWA support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Check the [troubleshooting guide](./DEPLOYMENT.md#troubleshooting)
- Review the [documentation](./docs/)
- Open an issue on GitHub

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- UI components inspired by [Tailwind UI](https://tailwindui.com/)
- Charts powered by [Chart.js](https://www.chartjs.org/)

---

**Made with ❤️ for people managing allergies and food sensitivities.**