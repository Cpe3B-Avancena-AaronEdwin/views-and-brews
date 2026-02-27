# Views and Brews Setup Guide

## 1. Install MySQL

## 2. Create database
CREATE DATABASE views_and_brews;

## 3. Import database
Open phpMyAdmin
Select views_and_brews
Click Import
Upload database/views_and_brews.sql

## 4. Update server.js credentials
host: "localhost"
user: "root"
password: "yourpassword"
database: "views_and_brews"

## 5. Run backend
node server.js

## 6. Run frontend
npm run dev