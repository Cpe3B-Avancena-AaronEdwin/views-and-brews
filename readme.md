# Brews & Views

## Website Overview
The Brews & Views Coffee Vendo Shop Ordering System is a web-based application developed for a mobile coffee cart business to streamline and modernize its ordering process. The system allows customers to browse the menu and place orders digitally, reducing manual errors and improving transaction efficiency, while a secure Admin Dashboard enables the business owner to manage products, monitor orders in real time, and track daily sales performance for better operational control and decision-making.

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
- HTML5
- CSSS3
- JavaScript

### Backend
- Node.js
- Express.js
- React.js

### Database
- MySQL (via XAMPP)

### Development Tools
- Visual Studio Code
- Git & GitHub

---

## Views and Brews Setup Guide

### 1. Install MySQL

### 2. Create database
CREATE DATABASE views_and_brews;

### 3. Import database
Open phpMyAdmin
Select views_and_brews
Click Import
Upload database/views_and_brews.sql

### 4. Update server.js credentials
host: "localhost"
user: "root"
password: "yourpassword"
database: "views_and_brews"

### 5. Run backend
node server.js

### 6. Run frontend
npm run dev

---

## Project Structure
```text
Brews-&-Views
│
├── server/
|
|
├── client/
|
|
├── admin/
|
|
├── README.md

``` 
---

## Features
### Customer Features
- View available coffee menu
- Add items to cart
- Modify quantity
- Order summary preview
- Place orders digitally
- Mobile-responsive design (suitable for phone ordering)

### Admin Dashboard Features
- Secure admin authentication
- Add / Edit / Delete products
- View all customer orders
- Update order status (Pending, Preparing, Completed)
- Sales monitoring and tracking
- Daily transaction overview

---

## How To Use
### For Customers
1. Open the website on your mobile device or browser.
2. Browse the available coffee products.
3. Add selected items to your cart.
4. Review your order summary.
5. Confirm and place your order.
6. Wait for your order to be prepared at the mobile cart.

### For Admin
1. Navigate to /admin login page.
2. Enter admin credentials.
3. Access the dashboard.
4. Manage products and pricing.
5. Monitor orders and update statuses.
6. Review daily sales records.

## Business Owner
**Ryan**
Owner of Brews & Views - Mobile Coffee Cart

## Team Members
- **Avanceña, Aaron Edwin L.**
- **Baltero, Rexandra A.**  
- **Franco, John Carlo S.**  
- **Gonzales, Adrian Paul D.**  
- **Perona, Christian F.**