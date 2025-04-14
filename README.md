# Gigi Glitz - Ultra-Modern Web Experience

A hyper-contemporary, minimalistic, and functional Next.js website for Gigi Glitz, featuring advanced animations, glitch effects, and an immersive user experience.

## 🚀 Features

- **Cutting-edge Design**: Embrace the vaporwave aesthetic with modern minimalistic UI
- **Reactive Animations**: Powered by Framer Motion and Three.js
- **Interactive Components**: Quiz, animated cards, and custom cursor effects
- **Fully Responsive**: Perfect experience across all devices
- **Performance Optimized**: Fast loading and smooth animations

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **3D Effects**: Three.js with React Three Fiber
- **Deployment**: Vercel

## 🛠️ Installation & Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd gigi-website
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📤 Deployment

The site is configured for seamless deployment on Vercel. Use the following command to deploy:

```bash
vercel
```

Or for production deployment:

```bash
vercel --prod
```

## 📝 Project Structure

- `/src/components/ui`: Reusable UI components (Header, Footer, etc.)
- `/src/components/sections`: Main page sections (Hero, About, etc.)
- `/src/components/animations`: Animation components (GlitchBackground, ShinyText, etc.)
- `/public/images`: Static images and assets

## 🎨 Customization

- Color scheme can be modified in `/src/app/globals.css`
- Fonts can be changed in `/src/app/layout.tsx`
- Content can be updated in respective section components

## 👩‍💻 Development

To add new sections or features:

1. Create component in appropriate directory
2. Import and add to main page in `/src/app/page.tsx`
3. Add any necessary styles using Tailwind or in `/src/app/globals.css`

## 📄 License

[MIT](LICENSE)

---

Created with ✨ for Gigi Glitz | Bold Bodies. Sharp Minds. Digital Queens.
