Build a Daily News Reading Website using only HTML, CSS, JavaScript, PostgreSQL, Git, GitHub, and Vercel.

Project requirements:

1. Create a clean, modern, responsive news-reading website.
2. The main page should display the latest news as cards.
3. News categories:

   * Sports
   * Politics
   * Technology
   * Business
   * Entertainment
   * Education
4. Add category filtering with an "All" option.
5. Add a search bar to search news by title, description, and content.
6. Add a news details page where users can read the complete article.
7. Each news card should display:

   * Image
   * Category
   * Title
   * Short description
   * Published date
   * Source
   * Read More button
8. Use PostgreSQL as the database.
9. Create a news table with:

   * id
   * title
   * description
   * content
   * image_url
   * category
   * source
   * author
   * published_at
   * created_at
   * updated_at
10. Create APIs for:

* Getting all news
* Getting a single news article
* Filtering by category
* Searching news
* Pagination

11. API should support query parameters such as:
    /api/news?category=sports
    /api/news?search=AI
    /api/news?page=1&limit=10
12. Do not expose PostgreSQL credentials in frontend code.
13. Use environment variables for database credentials.
14. Add .env to .gitignore.
15. Do not use React, Next.js, Tailwind, MongoDB, or other frameworks unless explicitly requested.
16. Add loading, error, and empty states.
17. Make the website responsive for desktop, tablet, and mobile.
18. Use semantic HTML and maintain clean, modular JavaScript and CSS.
19. Keep frontend, API/backend logic, and database logic clearly separated.
20. Add proper Git commits throughout development.
21. Prepare the project for GitHub and Vercel deployment.
22. Initially use sample news data/database records. Do not integrate an external news API yet.
23. Structure the application so a real news API can be integrated later without major changes.
24. Before considering the project complete, test:

* Category filtering
* Search
* News details
* Pagination
* Empty results
* API errors
* Responsive layout
* Broken image handling
* Database connection
* Production environment variables

Development approach:

First create the project structure and database schema.

Then implement the backend/API.

Then implement the frontend UI.

Then connect the frontend to the APIs.

Then implement filtering, search, and pagination.

Then perform testing and fix errors.

Finally prepare the project for GitHub and Vercel deployment.

Do not build everything in one step. Complete and verify each stage before moving to the next stage.

---

## 🗄️ PostgreSQL Database ('newsdb') Setup Instructions

1. Open `.env` in the project root:
   ```env
   PGUSER=postgres
   PGPASSWORD=your_actual_password
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=newsdb
   DATABASE_URL=postgresql://postgres:your_actual_password@localhost:5432/newsdb
   ```
2. Run the automated database setup command:
   ```bash
   npm run db:setup
   ```
   This command connects to PostgreSQL, creates `newsdb` if it doesn't already exist, applies the schema with indexes, and seeds initial data.
3. Start or check the server:
   ```bash
   npm start
   ```
4. Check database connection health:
   Navigate to `http://localhost:3000/api/health` or `http://localhost:3000/api/db-status` in your browser. All live news, regional editions, and photos will now be automatically persisted in `newsdb`.

