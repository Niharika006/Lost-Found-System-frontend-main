# 🌐 Lost & Found System - Frontend

Welcome to the user-facing part of the Lost & Found System! This Next.js application provides a modern and responsive interface for reporting and finding lost items or people.

## 🏁 Getting Started

To get started with the Lost & Found System, follow these steps:

1.  **Create a New Project Directory (if you haven't already):**
    ```bash
    mkdir Lost-Found-System
    cd Lost-Found-System
    ```

2.  **Clone the Frontend Repository:**
    ```bash
    git clone https://github.com/UnsettledAverage73/Lost-Found-System-frontend frontend
    ```

3.  **Clone the Backend Repository (if you haven't already):**
    ```bash
    git clone https://github.com/UnsettledAverage73/Lost-found-system-backend backend
    ```

4.  **Continue with the Frontend Setup:**
    Now, proceed with the [Frontend Setup](#🛠️-setup) instructions below.

## ✨ Features

-   **🔐 User Authentication:** Seamless sign-in and sign-up flows with protected routes.
-   **📝 Report Submission:** Easy-to-use forms for submitting both lost and found reports.
-   **📊 Dynamic Report Display:** View all lost and found reports with filtering capabilities.
-   **⚡ Real-time Dashboard:** Instant updates on new reports and matches via WebSockets.

## 🛠️ Setup

### Prerequisites

Ensure you have the following installed on your system:

-   **Node.js (v18 or higher)**
-   **npm** (Node package manager, usually comes with Node.js)
-   **A Running Backend API:** This frontend relies on the backend API. Please refer to the [Backend README](../backend/README.md) for detailed setup and running instructions.

### Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variable. This tells your frontend where to find the backend API.

```dotenv
NEXT_PUBLIC_BACKEND_API_URL="http://localhost:8000" # Or the URL of your deployed backend API
```

### Installation

Follow these steps to get the frontend up and running:

1.  **Navigate to the `frontend` directory:**
    ```bash
    cd frontend
    ```

2.  **Install the Node.js dependencies:**
    ```bash
    npm install
    ```

## 🚀 Running the Application

To start the Next.js development server, navigate to the `frontend` directory and execute:

```bash
npm run dev
```

The frontend application will open in your browser at `http://localhost:3000`.

## 🤝 Running Both Frontend and Backend (Monorepo Setup)

If you're setting up the entire `Lost-Found-System` project from its root directory, here's how to run both the frontend and backend simultaneously:

1.  **Ensure your backend server is running.** Please refer to the [Backend README](../backend/README.md) for detailed instructions on how to set up and run the FastAPI backend.

2.  **Open a new terminal window** (separate from where your backend is running).

3.  **Navigate to the `frontend` directory:**
    ```bash
    cd /path/to/Lost-Found-System/frontend
    ```

4.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```

This approach allows you to develop both parts of the application concurrently, with the frontend automatically connecting to the running backend API.

## 📁 Project Structure

-   `app/`: Contains the main Next.js pages, layouts, and server actions.
-   `components/`: Reusable UI components used throughout the application.
-   `lib/`: Utility functions, authentication context, and helper modules.
-   `public/`: Static assets such as images and fonts.
-   `styles/`: Global CSS styles and Tailwind CSS configurations.

## 🌍 Internationalization (i18n)

The frontend supports multiple languages through `react-i18next` and `i18next`.

### Supported Languages

The application currently supports the following languages:

-   **English (en)**
-   **Hindi (hi)**
-   **Marathi (mr)**
-   **Bhojpuri (bh)**
-   **Bengali (bn)**
-   **Tamil (ta)**

### Configuration

The i18n configuration is located in `frontend/lib/i18n.ts`. This file initializes `i18next` and loads the translation resources.

### Translation Files

Translation files are stored in `frontend/public/locales/{language_code}/translation.json`. Each `translation.json` file contains key-value pairs for translated strings in the respective language.

### Language Switching

Users can switch languages using the language selector component, typically found in the navigation bar. The selected language is then used for displaying content and is sent to the backend via the `Accept-Language` header for API calls.
