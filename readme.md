# Brews & Views

## Website Overview
The Brews & Views Mobile Cart Cafe Ordering System is a web-based application developed for a mobile coffee cart business to streamline and modernize its ordering process. The system allows customers to browse the menu and place orders digitally, reducing manual errors and improving transaction efficiency, while a secure Admin Dashboard enables the business owner to manage products, monitor orders in real time, and track daily sales performance for better operational control and decision-making.

---

## Objectives
- To develop a digital ordering system for a mobile coffee cart business
- To streamline the ordering and transaction process
- To improve customer experience and reduce waiting time
- To provide an admin dashboard for monitoring sales and orders
- To minimize manual errors in order recording
- To support business growth through digital transformation

---

## Tools and Technologies
### Frontend
- React.js (Vite)
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- Protected Routes & Password Hashing

### Database
- MySQL (via XAMPP / phpMyAdmin)

### Development Tools
- Visual Studio Code
- Git & GitHub

---

## Brews and Views Setup Guide

## 1. Database Configuration
1. Open XAMPP Control Panel and start Apache and MySQL.
2. Navigate to http://localhost/phpmyadmin.
3. Create a new database named views_and_brews.
4. Select the database and click the Import tab.
5. Upload the SQL file located at: client/database/views_and_brews.sql.

## 2. Install Dependencies
### Install backend dependencies
cd server
npm install

### Install frontend dependencies
cd ../client
npm install

## 3. Environment Setup
### Create a .env file in the server directory and update your MySQL credentials:
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="yourpassword"
DB_NAME="views_and_brews"
PORT=5000

## 4. Run Application
### Backend
cd server
node server.js

### Frontend
cd client
npm run dev

---

## Project Structure
```text
views-and-brews/
├── client/
│   ├── database/
│   │   └── views_and_brews.sql      # Database schema and initialization 
│   ├── public/                      # Static assets (images, icons) 
│   │   ├── background.jpg
│   │   └── placeholder.png
│   ├── src/                         # Core Frontend Logic (React/Vite)
│   │   ├── About.jsx                # Info/About page component 
│   │   ├── Admin.jsx                # Admin dashboard 
│   │   ├── App.jsx                  # Main application entry and routing 
│   │   ├── ClientLogin.jsx          # Login logic for standard users 
│   │   ├── ClientLogout.jsx         # Logout functionality 
│   │   ├── Home.jsx                 # Landing/Home page 
│   │   ├── Layout.jsx               # UI wrapper (Header/Footer) 
│   │   ├── Login.jsx                # General login component 
│   │   ├── Menu.jsx                 # Brews/Items menu component 
│   │   ├── Navbar.jsx               # Navigation bar logic 
│   │   ├── ProtectedRoute.jsx       # Auth-guarded route logic 
│   │   ├── Sidebar.jsx              # Side navigation menu 
│   │   ├── Signup.jsx               # User registration component 
│   │   └── main.jsx                 # React DOM mounting point 
│   └── vite.config.js               # Frontend build configuration 
├── server/
│   └── .env                         # Backend environment variables 
├── package.json                     # Project dependencies and scripts 
└── readme.md                        # Project documentation
``` 
---

## Features
### Customer Features
- Categorized Menu: Browse drinks by specific categories (Espresso, Non-Coffee).
- Cart Management: Add items, modify quantities, and see a live total.
- Secure Accounts: User registration and login with encrypted credentials.
- Order Placement: Digital submission of orders directly to the cart.
- Responsive Design: Optimized for mobile browser ordering.

### Admin Dashboard Features
- Secure Authentication: Dedicated admin login for business operations.
- Inventory Management: Add, edit, or delete products and track stock_quantity.
- Ingredient Tracking: Monitor raw material stock (Coffee beans, Milk, etc.).
- Live Order Feed: Monitor customer orders and update status (Pending, Preparing, Completed).
- Sales Analytics: Track daily revenue and transaction history.

---

## How To Use
### For Customers
1. Open the website on your mobile device or browser.
2. Browse the coffee menu.
3. Add items to your cart and review the order summary.
4. Confirm and place your order.
5. Wait for your order to be prepared at the mobile cart.

### For Admin
1. Navigate to the /admin login page and enter credentials.
2. Access the dashboard to manage the menu and pricing.
3. Monitor incoming orders and update their status as you prepare them.
4. Review daily sales records for operational control.

## Business Owner
**Ryan Quizon**
Owner of Brews & Views - Mobile Cart Cafe

## Team Members
- **Avanceña, Aaron Edwin L.**
- **Baltero, Rexandra A.**  
- **Franco, John Carlo S.**  
- **Gonzales, Adrian Paul D.**  
- **Perona, Christian F.**