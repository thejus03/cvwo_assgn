import React from 'react';
// import logo from './logo.svg';
import './App.css';
import Home from './pages/Home';
import PostView from './components/PostView';
import { createBrowserRouter, RouterProvider, ScrollRestoration } from 'react-router-dom';

const routes = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/post/:postid',
    element: <PostView />,
  },
]);
function App() {
  return (
    <div className="App" id='root' >
      <RouterProvider router={routes} />
    </div>
  );
}

export default App;
