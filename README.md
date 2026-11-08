# AFG Church Web Platform

A responsive web application designed and built from the ground up. The platform combines a custom-styled frontend with a content management system for the church website.

## 🚀 Live Demo
[afgchurch.com](https://afgchurch.com)

## 🛠️ Tech Stack & Architecture

- **Frontend:** Astro, TypeScript, semantic HTML, and custom CSS using variables, Flexbox, and Grid.
- **Data & Configuration:** JSON for church content and YAML for Decap CMS configuration.
- **Hosting & Contact:** Netlify hosts the site, and Formspree handles contact submissions.
- **Documentation:** Markdown.

## ✨ Key Features

- **CMS Integration:** Edit service information, pastor and leader profiles, mission stories, and photos in Decap CMS.
- **Fully Responsive UI:** Layouts adapt from desktop to mobile, with stacked pastor profiles and a swipeable leader carousel.
- **Interactive UI Enhancements:** Looping homepage video, dedicated mission pages, expandable photo galleries, and a contact form.
- **Custom CSS Foundations:** Shared colors, typography, and spacing keep the site consistent across pages.

## 📦 Installation & Local Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/arunbaraili/afg-church-web.git
   cd afg-church-web
   npm ci
   ```

2. Start the site with `npm run dev` and open [localhost:4321](http://localhost:4321/).
3. To edit content locally, run `npm run cms` in a second terminal and open [the CMS](http://localhost:4321/admin/).
