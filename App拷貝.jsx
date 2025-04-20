import { useState } from 'react';

function App() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email.includes('@')) {
      setError('請輸入正確的姓名與 Email');
    } else {
      setError('');
      alert('表單提交成功');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">表單驗證</h1>
      <input name="name" value={form.name} onChange={handleChange} placeholder="姓名" className="border p-1 block mb-2"/>
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-1 block mb-2"/>
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleSubmit} className="bg-green-500 text-white px-2 py-1">提交</button>
    </div>
  );
}

export default App;
