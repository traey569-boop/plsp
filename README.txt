PLSP ONE — HTML, CSS, JAVASCRIPT + NODE.JS + MYSQL (NO PHP)

WHAT IS INCLUDED
- index.html, style.css, app.js: original portal frontend
- server.js: Node.js + Express API and static website server
- database.sql: MySQL database and students table
- package.json: required Node.js packages
- .env.example: example configuration values

REQUIREMENTS
- Node.js LTS installed
- MySQL Server installed and running (XAMPP MySQL is also okay; PHP/Apache are NOT used)
- VS Code or another editor

SETUP
1. Extract this folder.
2. Open the folder in VS Code.
3. Start MySQL. If using XAMPP, start ONLY MySQL; Apache is not needed.
4. Open phpMyAdmin at http://localhost/phpmyadmin (or MySQL Workbench / MySQL command line).
5. Import database.sql. This creates the plsp_one database and students table.
6. Open a terminal in this project folder.
7. Run: npm install
8. If your MySQL root account has a password, set DB_PASSWORD before starting the app.
   Windows PowerShell example:
   $env:DB_PASSWORD="your_mysql_password"
   $env:SESSION_SECRET="use-a-long-random-secret"
9. Run: npm start
10. Open http://localhost:3000/ (NOT Live Server / 127.0.0.1:5500).
11. Register a new student account, sign in, then open My Profile > Edit Profile > Save Changes.

DATABASE SETTINGS
Defaults: host=localhost, user=root, password=(blank), database=plsp_one.
Change the environment variables DB_HOST, DB_USER, DB_PASSWORD, DB_NAME if your MySQL setup differs.

IMPORTANT
- This uses a real MySQL database through a Node.js backend. It does not use PHP, localStorage for account storage, or Live Server.
- Keep your existing assets folder beside index.html, style.css, and app.js. It was not included in the provided uploads, so the logo and images may not appear until you copy it over.
- The admin demo login in the original frontend is still a front-end demo and is not authenticated against the students table.
- For real deployment, use HTTPS, a persistent session store, CSRF protection, rate limiting, and proper admin authentication.
