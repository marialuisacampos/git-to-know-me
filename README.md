# git-to-know-me

<img width="2048" height="1077" alt="image" src="https://github.com/user-attachments/assets/d751ab21-94fa-4133-9ec8-f13e90163af6" />

A modern portfolio platform that transforms your GitHub repositories into a beautiful, personalized website. - www.gittoknowme.com

## About

git-to-know-me automatically syncs your GitHub projects and blog posts, creating a professional portfolio without any manual setup. Just log in with GitHub and your portfolio is ready to share.

## Features

- GitHub OAuth authentication
- Automatic project sync from GitHub
- Blog posts from `blog-posts` repository
- Custom bio and social links (Twitter, LinkedIn, Instagram)
- Preview for projects
- "Share post" buttons in blog post page
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
- [ ] IA chat with your profile
- [ ] Analytics dashboard
- [ ] Project categories and tags
- [ ] RSS feed for blog
- [ ] SEO optimization
- [ ] PWA support
