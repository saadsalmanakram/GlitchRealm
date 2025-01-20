
---

# Artilence Project: AI Chatbot with Django Backend and Hugging Face Integration

## Overview

The **Artilence Project** is an AI-powered chatbot built with a **Django backend** and integrated with the **Hugging Face API** for generating intelligent responses. The chatbot listens for user messages, sends them to Hugging Face's pre-trained models for processing, and returns generated responses. The backend API is designed to receive `POST` requests with a user's message and provide an AI-generated response. The project also includes a frontend interface to interact with the chatbot.

## Features

- **Backend:** Django REST framework to handle API requests.
- **Hugging Face Integration:** Utilizes Hugging Face’s **DistilGPT-2** model for generating chatbot responses.
- **Cross-Origin Resource Sharing (CORS):** Enabled to allow requests from different origins.
- **Environment Configuration:** Uses a `.env` file to manage environment variables, including the Hugging Face API key.

## Technologies Used

- **Backend:** 
  - Python (Django 5.1)
  - Django REST Framework
  - Hugging Face API (DistilGPT-2)
- **Frontend:** 
  - React (for connecting to the backend API)
  - HTML/CSS (basic styling for frontend interface)
- **Others:**
  - CORS Headers for cross-origin requests
  - dotenv for environment variable management

## Project Structure

The project is structured into the following key components:

- **Backend (Django)**:
  - `chat/`: Django app handling the chatbot API.
  - `backend/`: The root directory for the Django project, containing settings, URLs, and other configurations.
  
- **Frontend (React)**:
  - You can integrate the frontend interface to communicate with the API and display the chatbot response.

## Setup Instructions

### 1. **Clone the Repository**

To get started, clone the repository to your local machine:

```bash
git clone https://github.com/saadsalmanakram/artilence-project.git
cd artilence-project
```

### 2. **Backend Setup (Django)**

#### Install Dependencies

Make sure you have **Python 3.7+** and **pip** installed. Then, create a virtual environment and install the required dependencies.

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows, use venv\Scripts\activate
pip install -r requirements.txt
```

#### Setup Environment Variables

Create a `.env` file in the root directory and add your **Hugging Face API key**:

```env
HUGGINGFACE_API_KEY=your_hugging_face_api_key
```

> **Note:** You can obtain your API key from [Hugging Face](https://huggingface.co/).

#### Run Migrations

Apply the migrations to set up the database:

```bash
python manage.py migrate
```

#### Start the Django Development Server

Start the backend server:

```bash
python manage.py runserver
```

Your API will now be running at `http://127.0.0.1:8000/`.

### 3. **Frontend Setup (React)**

#### Install Dependencies

Navigate to the frontend directory (or create your React project if not already created), and install the required dependencies:

```bash
cd frontend  # or your React directory
npm install
```

#### Start the Frontend Server

Run the development server for React:

```bash
npm start
```

This will open the React application in your browser, and it will communicate with the Django backend running at `http://127.0.0.1:8000/api/chat/`.

## Author

**Saad Salman Akram**  
GitHub: [https://github.com/saadsalmanakram](https://github.com/saadsalmanakram)  
LinkedIn: [https://www.linkedin.com/in/saadsalmanakram/](https://www.linkedin.com/in/saadsalmanakram/)

---
