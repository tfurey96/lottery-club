import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import type { Schema } from "../amplify/data/resource"; // Adjust the import path as needed
import { generateClient } from "aws-amplify/data";
import { Authenticator, AuthEventData } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

interface TodoListProps {
  user?: {
    signInDetails?: {
      loginId?: string;
    };
  };
  signOut: (data?: AuthEventData) => void; // Ensure signOut matches the expected type
}

const TodoList: React.FC<TodoListProps> = ({ user, signOut }) => {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    return () => subscription.unsubscribe();
  }, []);

  const createTodo = () => {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content });
    }
  };

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review the next step of this tutorial.
        </a>
      </div>
      <button onClick={() => signOut()}>Sign out</button>
    </main>
  );
};

const About: React.FC = () => {
  return <h1>About Page</h1>;
};

const Navbar: React.FC = () => {
  return (
    <nav>
      <Link to="/">Todo List</Link>
      <Link to="/about">About</Link>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Authenticator>
        {({ signOut, user }: { signOut?: (data?: AuthEventData) => void; user?: any }) => (
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<TodoList user={user} signOut={signOut || (() => {})} />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<h1>404 - Not Found</h1>} />
            </Routes>
          </>
        )}
      </Authenticator>
    </Router>
  );
};

export default App;
