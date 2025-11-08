# Ahmed Omar - Personal Portfolio Website

A modern, responsive personal portfolio website built with HTML5, CSS3, and JavaScript. Features a clean design, smooth animations, and mobile-first responsive layout.

## 🚀 Live Demo

Visit the live site: [https://AhmedOmarO.github.io](https://AhmedOmarO.github.io)

## ✨ Features

### Design & UX
- 🎨 Modern, professional design with gradient themes
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎭 Smooth animations and transitions
- 🌙 Clean, readable typography using Google Fonts (Poppins)
- ⚡ Fast loading and optimized performance

### Functionality
- 🧭 Smooth scrolling navigation
- 📱 Mobile-friendly hamburger menu
- ⌨️ Typing animation effect
- 📊 Animated statistics counters
- 📬 Contact form with validation
- 🎯 Active navigation highlighting
- 📜 Intersection Observer animations

### Sections
- 🏠 **Hero Section**: Introduction with typing animation
- 👨‍💻 **About**: Personal background and statistics
- 🛠️ **Skills**: Technical skills organized by category
- 💼 **Projects**: Featured project showcase
- 📞 **Contact**: Contact form and information
- 🔗 **Footer**: Social links and copyright

## 🏗️ Project Structure

```
AhmedOmarO.github.io/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   └── script.js          # JavaScript functionality
├── assets/
│   ├── images/            # Image assets
│   │   └── README.md      # Image guidelines
│   └── favicon-placeholder.txt
├── .gitattributes         # Git configuration
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/AhmedOmarO/AhmedOmarO.github.io.git
cd AhmedOmarO.github.io
```

### 2. Customize Content
Edit `index.html` to update:
- Personal information and bio
- Skills and technologies
- Project details and links
- Contact information
- Social media links

### 3. Add Your Images
Replace placeholder references in `assets/images/` with your actual images:
- `profile.jpg` (300x300px) - Main profile picture
- `about-me.jpg` (400x400px) - About section photo
- `project1.jpg`, `project2.jpg`, etc. (400x250px) - Project screenshots

### 4. Deploy to GitHub Pages
1. Push your changes to the main branch
2. Go to your repository settings
3. Enable GitHub Pages from the main branch
4. Your site will be live at `https://yourusername.github.io`

## 🎨 Customization Guide

### Colors and Branding
The site uses a blue-purple gradient theme. To change colors, update these CSS variables in `style.css`:

```css
/* Main gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* You can replace with your brand colors */
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### Content Updates

#### Personal Information
Update these sections in `index.html`:
- Hero title and description
- About section text and statistics
- Skills list (add/remove as needed)
- Project information and links
- Contact details

#### Navigation
To add/remove sections:
1. Update the navigation menu in the `<nav>` section
2. Add/remove corresponding `<section>` elements
3. Update JavaScript scroll handling if needed

### Adding New Projects
To add a new project:

1. **Add HTML**: Copy a project card in the projects section
```html
<div class="project-card">
    <div class="project-image">
        <img src="./assets/images/your-project.jpg" alt="Your Project">
        <div class="project-overlay">
            <a href="https://your-live-demo.com" class="project-link">
                <i class="fas fa-external-link-alt"></i>
            </a>
            <a href="https://github.com/username/repo" class="project-link">
                <i class="fab fa-github"></i>
            </a>
        </div>
    </div>
    <div class="project-content">
        <h3>Your Project Name</h3>
        <p>Description of your project...</p>
        <div class="project-tags">
            <span class="tag">React</span>
            <span class="tag">Node.js</span>
            <!-- Add relevant technology tags -->
        </div>
    </div>
</div>
```

2. **Add Image**: Place your project screenshot in `assets/images/`

### Social Links
Update social media links in:
- Hero section (`.hero-social`)
- Footer section (`.footer-social`)

Replace placeholder URLs with your actual profiles:
```html
<a href="https://github.com/yourusername" target="_blank">
    <i class="fab fa-github"></i>
</a>
```

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Interactive functionality

### Libraries & Resources
- **Font Awesome**: Icons
- **Google Fonts**: Typography (Poppins)
- **Intersection Observer API**: Scroll animations
- **CSS Grid & Flexbox**: Responsive layouts

### Tools & Optimization
- **GitHub Pages**: Free hosting
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized CSS and JavaScript
- **Accessibility**: ARIA labels and keyboard navigation

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ Internet Explorer (basic support)

## 🎯 SEO & Performance

### Included Optimizations
- Meta descriptions and proper HTML semantics
- Optimized images and lazy loading ready
- Minification ready for CSS/JS
- Proper heading hierarchy
- Alt text for images

### Additional Recommendations
- Compress images before uploading
- Consider adding a robots.txt file
- Add Google Analytics if desired
- Implement structured data markup

## 📝 Content Guidelines

### Writing Tips
- Keep descriptions concise and engaging
- Use action words for project descriptions
- Highlight specific technologies and achievements
- Include measurable results when possible

### Image Guidelines
- Use high-quality, professional photos
- Maintain consistent aspect ratios
- Optimize file sizes (aim for <200KB per image)
- Use descriptive alt text

## 🚀 Deployment Options

### GitHub Pages (Recommended)
- Free hosting for public repositories
- Automatic deployment from main branch
- Custom domain support
- HTTPS enabled by default

### Alternative Hosting
- **Netlify**: Drag and drop deployment
- **Vercel**: Git integration and fast CDN
- **Firebase Hosting**: Google's hosting solution
- **Surge.sh**: Simple static site hosting

## 🔧 Development Setup

### Local Development
```bash
# Clone the repository
git clone https://github.com/AhmedOmarO/AhmedOmarO.github.io.git

# Navigate to directory
cd AhmedOmarO.github.io

# Open in your preferred code editor
code .

# Serve locally (optional - use Live Server extension or Python)
python -m http.server 8000
# or
npx http-server
```

### Making Changes
1. Edit files in your code editor
2. Test changes locally
3. Commit and push to GitHub
4. Changes will automatically deploy via GitHub Pages

## 🤝 Contributing

This is a personal portfolio, but feel free to:
- Report bugs by opening an issue
- Suggest improvements
- Fork for your own use (please customize it!)

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 📞 Contact

- **Email**: ahmedomar92@yahoo.com
- **LinkedIn**: [linkedin.com/in/ahmed-omar](https://linkedin.com/in/ahmed-omar)
- **GitHub**: [github.com/AhmedOmarO](https://github.com/AhmedOmarO)
- **Website**: [AhmedOmarO.github.io](https://AhmedOmarO.github.io)

---

**Built with ❤️ by Ahmed Omar**

*Last updated: November 2024*