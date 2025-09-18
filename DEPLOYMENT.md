# Deployment Guide

This guide covers deploying the Allergy Tracker application to production.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project
- Vercel account (recommended) or other hosting platform

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics and Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Production Environment Variables

For production deployment, ensure these environment variables are set:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NODE_ENV`: Set to "production"

## Database Setup

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   ```

2. **Run Database Migrations**
   ```bash
   # Apply initial schema
   supabase db push
   
   # Or manually run migrations
   supabase migration up
   ```

3. **Seed Database (Optional)**
   ```bash
   # Run seed data
   supabase db seed
   ```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add environment variables under "Environment Variables"

### Option 2: Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Environment Variables**: Add in Netlify dashboard

### Option 3: Docker

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## Performance Optimization

### 1. Enable Compression
The application includes built-in compression and caching strategies.

### 2. CDN Configuration
- Static assets are optimized for CDN delivery
- Service worker provides offline caching
- Images are optimized with Next.js Image component

### 3. Database Optimization
- Indexes are configured for optimal query performance
- Connection pooling is handled by Supabase

## Monitoring and Analytics

### Health Checks
- Health endpoint: `/api/health`
- Uptime monitoring: `/healthz`

### Performance Monitoring
- Built-in Web Vitals tracking
- Performance metrics in development mode
- Memory usage monitoring

### Error Tracking
- Comprehensive error boundaries
- Client-side error logging
- Server-side error handling

## Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use secure environment variable management in production
- Rotate API keys regularly

### 2. Database Security
- Row Level Security (RLS) is enabled
- User data is isolated by authentication
- API endpoints are protected

### 3. Content Security Policy
- Configured in `next.config.js`
- Prevents XSS attacks
- Restricts resource loading

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database migrations have been applied
- [ ] Health check endpoint responds correctly
- [ ] PWA functionality works (installable, offline support)
- [ ] Authentication flow works end-to-end
- [ ] All forms submit successfully
- [ ] Charts and analytics display correctly
- [ ] Mobile responsiveness is verified
- [ ] Performance metrics are acceptable
- [ ] Error tracking is working
- [ ] Backup strategy is in place

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Ensure RLS policies are correct

3. **Performance Issues**
   - Enable compression
   - Optimize images
   - Check database query performance
   - Monitor memory usage

### Support

For deployment issues:
1. Check the application logs
2. Verify environment variables
3. Test the health endpoint
4. Check database connectivity
5. Review error boundaries and logging

## Scaling Considerations

### Database Scaling
- Supabase handles automatic scaling
- Monitor connection limits
- Consider read replicas for high traffic

### Application Scaling
- Vercel provides automatic scaling
- Consider edge functions for global performance
- Monitor memory usage and optimize as needed

### Caching Strategy
- Service worker provides client-side caching
- SWR handles data caching
- Static assets are cached at CDN level