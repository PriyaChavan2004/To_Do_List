// App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import API from './services/api';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [view, setView] = useState("today");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);

  const today = new Date().toISOString().split("T")[0];
// Fetch Tasks on Login

 if (!isLoggedIn) {
    return showRegister ? (
      <Register setShowRegister={setShowRegister} />
    ) : (
      <Login onLogin={() => setIsLoggedIn(true)} setShowRegister={setShowRegister} />
    );
  }
  
  useEffect(() => {
    if (isLoggedIn) fetchTodos();
  }, [isLoggedIn]);

const fetchTodos = async () => {
    const res = await API.get('/todos');
    setTodos(res.data);
  };
  

   

  const handleChange = (e) => setTodo(e.target.value);

  const handleAdd = async () => {
    if (!todo.trim()) {
      setErrorMsg("Please enter a task");
      return;
    }
    const res = await API.post('/todos', {
      todo: todo.trim(),
      date: today
    });
    setTodos([...todos, res.data]);
    setTodo("");
    setErrorMsg("");
  };

  const handleDelete = async (id) => {
    await API.delete(`/todos/${id}`);
    setTodos(todos.filter((t) => t._id !== id));
  };

  const handleEdit = (id) => {
    const taskToEdit = todos.find((t) => t._id === id);
    if (taskToEdit) {
      setTodo(taskToEdit.todo);
      handleDelete(id);
    }
  };

  const handleToggleComplete = async (id) => {
    const updatedTask = todos.find((t) => t._id === id);
    const res = await API.put(`/todos/${id}`, {
      ...updatedTask,
      isCompleted: !updatedTask.isCompleted
    });
    setTodos(todos.map((task) => (task._id === id ? res.data : task)));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setTodos([]);
  };

  const filteredTodos = view === "today"
    ? todos.filter((t) => t.date === today)
    : todos;

  const completedTasks = filteredTodos.filter(task => task.isCompleted).length;
  const incompleteTasks = filteredTodos.filter(task => !task.isCompleted).length;

   

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <div className="container bg-violet-100 rounded-xl p-4 my-10 mx-auto w-[35%] h-[80vh] overflow-auto">
        <h2 className="font-bold text-2xl text-center">TODO List</h2>

        <div className="addtodo my-5">
          <h3 className="font-semibold text-lg mb-2">Add a Task</h3>
          <div className="flex">
            <input
              type="text"
              value={todo}
              onChange={handleChange}
              placeholder="Enter your task"
              className="flex-grow px-4 py-2 rounded-l-full border border-violet-400"
            />
            <button
              onClick={handleAdd}
              className="bg-violet-700 text-white px-4 py-2 rounded-r-full hover:bg-violet-900"
            >
              Add
            </button>
          </div>
          {errorMsg && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
        </div>

        <div className="view-toggle flex justify-between my-3">
          <button
            onClick={() => setView("today")}
            className={`px-3 py-1 rounded-full ${view === "today"
              ? "bg-violet-600 text-white"
              : "bg-white border border-violet-600 text-violet-600"}`}
          >
            Today's Tasks
          </button>
          <button
            onClick={() => setView("all")}
            className={`px-3 py-1 rounded-full ${view === "all"
              ? "bg-violet-600 text-white"
              : "bg-white border border-violet-600 text-violet-600"}`}
          >
            All Tasks
          </button>
        </div>

        <div className="todos mt-4 overflow-y-auto h-[40vh]">
          <h3 className="text-lg font-bold mb-2">Your Tasks</h3>
          {filteredTodos.length === 0 ? (
            <p className="text-violet-700">No tasks to display</p>
          ) : (
            filteredTodos.map((task) => (
              <div
                key={task._id}
                className="flex justify-between items-center bg-white p-3 mb-2 rounded shadow"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleComplete(task._id)}
                  />
                  <span className={task.isCompleted ? "line-through text-gray-500" : ""}>
                    {task.todo}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(task._id)}
                    className="bg-amber-400 text-white px-2 py-1 rounded hover:bg-amber-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="conclusion mt-4 text-center p-4 bg-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto">
          <h3 className="font-semibold text-xl text-violet-700">Conclusion of the Day</h3>
          <div className="mt-2">
            <p className="text-lg">
              <span className="font-bold text-green-600">{completedTasks}</span> completed task{completedTasks !== 1 ? 's' : ''}
            </p>
            <p className="text-lg">
              <span className="font-bold text-red-600">{incompleteTasks}</span> incomplete task{incompleteTasks !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
