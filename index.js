import "dotenv/config";
import { db } from "./db/index.js";
import { todosTable } from "./db/schema.js";
import { ilike, eq } from "drizzle-orm";
import readlineSync from "readline-sync";

// ------------------ Tools ------------------
async function getAllTodos() {
  const todos = await db.select().from(todosTable);
  return todos;
}

async function createTodo(todo) {
  const [result] = await db
    .insert(todosTable)
    .values({ todo })
    .returning({ id: todosTable.id });
  return result.id;
}

async function searchTodo(search) {
  const todos = await db
    .select()
    .from(todosTable)
    .where(ilike(todosTable.todo, `%${search}%`));
  return todos;
}

async function deleteTodoById(id) {
  await db.delete(todosTable).where(eq(todosTable.id, id));
  return `Todo with ID ${id} deleted successfully.`;
}

const tools = { getAllTodos, createTodo, searchTodo, deleteTodoById };

// ------------------ System Prompt ------------------
const System_Prompt = `
You are an AI To-Do List Assistant with START, PLAN, ACTION, Obeservation and Output State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations, Return the AI response based on START propmt and observations

You are an AI To-Do List Assistant. You can manage tasks by adding, viewing, update and deleting You must strictly follow the JSON output format.

Todo DB Schema:

id: Int and Primary Key
todo: String
reated_at: Date Time
pdated_at: Date Time


Available Tools:
-getAllTodos(): Returns all the Todos from Database
-⁠createTodo (todo: string): Creates a new Todo in the DB and takes todo as a string and returns the ID of the created todo
-deleteTodoById(id: string): Deleted the todo by ID given in the DB
-searchTodo (query: string): Searches for all todos matching teh query string using iLIKE operator


Example:
START
{"type": "user", "user": "Add a task for shopping groceries"}
{"type": "plan", "plan": "I will try to get more context on what user needs to shop."}
{"type": "output", "output": "I will use createTodo to create a new Todo in DB."}
{"type": "plan", "plan": "Can you tell me what all you want to shop for?"}
{"type": "user", "user": "I want to shop for vegetables, fruits and dairy products."}
{"type": "plan", "plan": "I will use createTodo to create a new Todo in DB."}
{"type": "action", "function": "createTodo", "input": "Shop for vegetables, fruits and dairy products"}
{"type": "observation", "observation": "2"}
{"type": "output", "output": "your todo has been added successfully with ID 2."}
`;

const messages = [{ role: "system", content: System_Prompt }];

while (true) {
  const query = readlineSync.question(">> ");
  const userMessage = { type: "user", user: query };
  messages.push({ role: "user", content: JSON.stringify(userMessage) });

  while (true) {
    const chatResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, 
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: messages,
      }),
    });

    const data = await chatResponse.json();

    const result = data.choices?.[0]?.message?.content;
    if (!result) {
      console.error("No valid response from AI:", data);
      break;
    }

    messages.push({ role: "assistant", content: result });

    let action;
    try {
      action = JSON.parse(result);
    } catch (err) {
      console.error("AI did not return valid JSON:", result);
      break;
    }

    if (action.type === "output") {
      console.log("AI:", action.output);
      break;
    } else if (action.type === "action") {
      const fn = tools[action.function];
      if (!fn) throw new Error("Invalid Tool call");

      const observation = await fn(action.input);
      const observationMessage = { type: "observation", observation };
      messages.push({
        role: "user",
        content: JSON.stringify(observationMessage),
      });
    }
  }
}