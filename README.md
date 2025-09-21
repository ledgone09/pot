# Rainbow Kingdom

A magical world where everyone is equal! An educational children's entertainment website promoting values of equality, friendship, and problem-solving through engaging characters and interactive content.

## 🌈 About

Rainbow Kingdom is a children's educational entertainment website featuring:
- **Rainbow** - The main character promoting equality and friendship
- **Lily the Fox** - A clever and kind companion
- **Lavender Fairy** - A magical helper spreading joy
- **Robin** - An adventurous friend
- **Andrew the Mole** - A thoughtful problem-solver

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd rainbow-kingdom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   
   The site will be available at `http://localhost:3000`

### Build and Preview

```bash
# Build the project (for static sites, this just validates)
npm run build

# Preview the built site
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel

This project is optimized for Vercel deployment as a static site.

#### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

#### Option 2: Deploy via Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will automatically detect the configuration and deploy

### Vercel Configuration

The project includes a `vercel.json` configuration file that:
- Sets up clean URLs (removes `.html` extensions)
- Configures proper routing for all pages
- Optimizes caching for static assets
- Handles redirects for SEO files (robots.txt, sitemap.xml)

### Environment Setup

No environment variables are required for this static site.

## 📁 Project Structure

```
rainbow-kingdom/
├── public/                 # Static assets
│   ├── images/            # Character and background images
│   ├── robots.txt         # SEO configuration
│   ├── sitemap.xml        # Site structure for search engines
│   └── *.png              # Image assets
├── css/
│   └── styles.css         # Main stylesheet
├── index.html             # Homepage
├── characters.html        # Characters page
├── about.html            # About page
├── parents.html          # Parents information page
├── script.js             # Main JavaScript functionality
├── globals.css           # Global styles
├── package.json          # Project configuration
├── vercel.json           # Vercel deployment configuration
└── README.md             # This file
```

## 🎨 Features

- **Responsive Design** - Works on all devices
- **Character Showcases** - Interactive character presentations
- **Video Content** - Embedded trailers and content
- **Newsletter Signup** - Email collection for updates
- **SEO Optimized** - Proper meta tags, sitemap, and robots.txt
- **Performance Optimized** - Fast loading with image optimization
- **Accessibility** - Designed with accessibility best practices

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript** - Interactive functionality
- **Lucide Icons** - Icon library
- **Google Fonts** - Typography (Inter & Poppins)

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Development

### Code Style

- Use semantic HTML elements
- Follow CSS BEM methodology for class naming
- Keep JavaScript modular and well-commented
- Optimize images for web delivery

### Performance

The site includes several performance optimizations:
- Image preloading for critical assets
- Font preloading to prevent FOIT/FOUT
- CSS critical path optimization
- Proper caching headers via Vercel configuration

## 📊 SEO Features

- Complete meta tag configuration
- Open Graph tags for social sharing
- Twitter Card support
- Structured sitemap.xml
- Robots.txt for search engine guidance
- Semantic HTML structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🎯 Live Demo

Visit the live site: [https://rainbow-kingdom.vercel.app](https://rainbow-kingdom.vercel.app)

---

Made with ❤️ by Rainbow Kingdom Productions