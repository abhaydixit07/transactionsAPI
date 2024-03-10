# transactionsAPI

transactionsAPI is a secure and user-friendly RESTful API designed for managing financial transactions. Built on Node.js and PostgreSQL, it offers essential features such as user authentication, transaction recording (income and expenses), retrieval of transaction lists, and summary details. transactionsAPI ensures data security through JWT-based authentication and provides a straightforward interface for users to monitor and control their financial activities.

## Features

- **User Authentication:**
  - Implements JWT-based authentication for secure user interactions.

- **Transaction Operations:**
  - **Add a New Transaction:**
    - Endpoint: `POST /transactions`
    - Record income or expenses by providing details like description, amount, and type.
  - **Retrieve Transactions:**
    - Endpoint: `GET /transactions`
    - Access a list of transactions for a detailed overview of financial activities.
  - **Retrieve Transactions Summary:**
    - Endpoint: `GET /transactions/summary`
    - Obtain a summary of total income, total expenses, and savings for a specified period.
  - **Delete a Specific Transaction:**
    - Endpoint: `DELETE /transactions/:id`
    - Delete a specific transaction based on its unique identifier.

- **Data Validation and Security:**
  - Ensures robust data validation and sanitization to prevent common vulnerabilities.

- **Response Handling:**
  - Uses standard HTTP status codes and provides meaningful JSON responses.

- **Home Route:**
  - Endpoint: `GET /`
  - Displays a welcome message and redirects users to the [API documentation](https://documenter.getpostman.com/view/30145336/2sA2xh3DRb).

- **Database Schema:**
  - Utilizes PostgreSQL with two tables: 'users' for storing user information and 'transactions' for transaction details.

## Getting Started

1. Ensure Node.js and PostgreSQL are installed.
2. Clone the transactionsAPI repository and install dependencies.
3. Configure PostgreSQL connection details and secret keys.
4. Run the API server locally and start interacting with the endpoints.

## Usage

1. Register or login to receive a JWT token.
2. Include the token in the `Authorization` header for authenticated requests.
3. Explore transaction-related endpoints for recording, retrieving, and managing financial data.

## Contribution

Contributions are welcome! If you have any suggestions, issues, or improvements, feel free to open a GitHub issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
