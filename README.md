# NodeJSCart-PP-REST

This project is a NodeJS Express-based eCommerce store for integrating with PayPal's API's via REST calls. It provides functionalities for managing products, handling user authentication, and processing payments.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [Dev Dependencies](#dev-dependencies)
- [MongoDB Setup](#mongodb-setup)
- [Migrations](#migrations)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/NodeJSCart-PP-ServerSDK.git
   cd NodeJSCart-PP-ServerSDK
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   MONGODB_URI=your_mongodb_uri
   ```

## Usage

1. Start the server:

   ```sh
   npm start
   ```

2. The server will be running at `http://localhost:3000`.

## Scripts

- `start`: Starts the server using nodemon.
- `migration:write`: Runs the product migration script.

## MongoDB Setup

To use this project, you need a MongoDB account. Follow these steps to create one:

1. Go to the [MongoDB website](https://www.mongodb.com/).
2. Click on the "Try Free" button.
3. Follow the instructions to create a new account.
4. Once your account is created, set up a new cluster and get your connection string.
5. Use the connection string in your `.env` file as the value for `MONGODB_URI`.

## Migrations

Current app implementation doesn't have a UI for adding new products, but you can run a script with migrations to add some products into the DB and receive it from the application's UI. Update this product information in the products-migration.js file in the migrations folder. Make sure MongoDB is installed and running first.

```sh
npm run migration:write
```
