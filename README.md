# Building a Real-World AI Agent with OpenAI and Postgres

This project demonstrates how to build a **real-world AI Agent** from scratch by integrating **OpenAI** with a **PostgreSQL** database to manage a simple **To-Do application**.  

The AI agent understands natural language queries and interacts with the database through predefined tools (functions). Using **Drizzle ORM** for schema management and queries, the assistant can create, search, update, and delete to-do items.  

---

## 🚀 Features
- **Natural Language Interface**: Talk to your AI agent like you would to a human assistant.
- **Database Integration**: PostgreSQL database with schema managed using **Drizzle ORM**.
- **CRUD Operations**:
  - Create a new todo
  - View all todos
  - Search todos
  - Delete todos by ID
- **AI Planning System**: The agent uses a structured prompt to PLAN, take ACTION, OBSERVE, and OUTPUT results.

---

## 🛠️ Tech Stack
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (running in Docker)
- [Drizzle ORM](https://orm.drizzle.team/)
- [OpenAI API](https://platform.openai.com/)
- [readline-sync](https://www.npmjs.com/package/readline-sync) for CLI interaction

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/soubhik7/ai-todo-app.git
cd ai-todo-app
