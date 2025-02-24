# Air Quality API

The **Air Quality API** is a backend service built using **NestJS**, **PostgreSQL**, and **Prisma ORM**. It provides endpoints for user authentication, air quality data management, and CSV file ingestion for bulk data processing.

## Features

- **User Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (Admin, User)

- **Air Quality Data Management**

  - Upload CSV files for bulk data ingestion
  - Query data based on date range and specific parameters (e.g., AQI, pollutants)

- **Secure & Scalable API**

  - Input validation with `class-validator`
  - Request throttling with `@nestjs/throttler`
  - Secure headers with `helmet`
  - Logging with `winston`

- **Database**

  - Uses **PostgreSQL** with Prisma ORM
  - Database migrations with Prisma

- **Code Quality & Testing**
  - Linting with ESLint & Prettier
  - Unit and integration tests with Jest
  - Commit linting & pre-commit hooks with Husky

---

## Installation

### Prerequisites

- **Node.js v20+** (using `nvm` recommended)
- **PostgreSQL**
- **Docker** (optional for running PostgreSQL in a container)

## Project setup

Clone the repository:
git clone <repository-url>


1. Make sure you have node >= 20 installed
2. Open the directory and run `npm i`
3. To create a production build run `npm run build`
4. to run the project `npm run start`
5. go to this link http://localhost:8000/api/docs

## Set up environment variables\

DATABASE_URL="postgresql://postgres:your_password@localhost:5432/postgres?schema=air_quality"
JWT_SECRET="your_secret_key"
PORT=8000


## Run database migrations:

# Prisma Setup

1- **Install Prisma (If Not Installed)**

```bash
$ npm install @prisma/client prisma
```

2️- **Run Database Migrations**

```bash
$ npx prisma migrate dev --name init
```

(Replace init with a meaningful migration name.)

3️- **Generate Prisma Client**

```bash
$ npx prisma generate
```

4️- **Verify Database & Data**

```bash
$ npx prisma studio
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
