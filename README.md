# git-to-know-me

<img width="2048" height="1077" alt="image" src="https://github.com/user-attachments/assets/d751ab21-94fa-4133-9ec8-f13e90163af6" />

A modern portfolio platform that transforms your GitHub repositories into a beautiful, personalized website. - www.gittoknowme.com.br

## About

git-to-know-me automatically syncs your GitHub projects and blog posts, creating a professional portfolio without any manual setup. Just log in with GitHub and your portfolio is ready to share.

## How to Use

Creating your portfolio is simple:

1. **Sign in with GitHub**

   - Visit the platform and click "Login with GitHub"
   - Authorize the application to access your public repositories

2. **Your portfolio is created automatically**

   - On first login, all your public repositories are synced automatically
   - Your profile is available at `www.gittoknowme.com/u/your-github-username`
   - After the first login, sync must be done manually when you want to update

3. **Customize your profile** (optional)

   - Add a bio
   - Add social links (Twitter, LinkedIn, Instagram)
   - Select which repositories to display
   - Add custom preview URLs for your projects

4. **Create blog posts** (optional)

   - Create a public repository named `blog-posts` on GitHub
   - Add markdown files

   - Sync again to see your posts

5. **Share your portfolio**
   - Your unique URL: `www.gittoknowme.com/u/your-github-username`
   - To update your portfolio with new repositories or blog posts, click the sync button on your profile page

## Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind 4
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (GitHub OAuth)
- **Markdown**: @uiw/react-markdown-preview + rehype-sanitize
- **UI Components**: Radix UI primitives
- **Notifications**: Sonner
- **Validation**: Zod
- **Testing**: Jest + Testing Library

## Features

- GitHub OAuth authentication
- Automatic project sync from GitHub
- Blog posts from `blog-posts` repository
- Custom bio and social links (Twitter, LinkedIn, Instagram)
- Preview for projects
- Responsive design with glassmorphism effects

### Security

- XSS protection with rehype-sanitize
- URL validation (http/https only)
- CSRF protection via NextAuth
- Sanitized markdown rendering

### UX

- Auto-sync on first login
- Toast notifications
- Loading states
- Minimal, Apple-inspired design
- Smooth animations with reduced-motion support

## Roadmap

- [ ] Internationalization (i18n) for profile and blog posts
- [ ] Analytics dashboard
- [ ] Project categories and tags
- [ ] RSS feed for blog
- [ ] SEO optimization
- [ ] PWA support
