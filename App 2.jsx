import { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { text: input, done: false }]);
      setInput('');
    }
  };

  const toggleDone = (index) => {
    const newTodos = [...todos];
    newTodos[index].done = !newTodos[index].done;
    setTodos(newTodos);
  };

  const deleteTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Todo List</h1>
      <input value={input} onChange={e => setInput(e.target.value)} className="border p-1 mr-2"/>
      <button onClick={addTodo} className="bg-blue-500 text-white px-2 py-1">新增</button>
      <ul className="mt-4">
        {todos.map((todo, index) => (
          <li key={index} className="flex justify-between mt-2">
            <span className={todo.done ? "line-through" : ""} onClick={() => toggleDone(index)}>{todo.text}</span>
            <button onClick={() => deleteTodo(index)} className="text-red-500">刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
