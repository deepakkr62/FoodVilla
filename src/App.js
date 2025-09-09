import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Body from './components/Body';
import Footer from './components/Footer';
import Contact from './components/Contact';
import About from './components/About';
import Error from './components/Error';
import { createBrowserRouter,RouterProvider,Outlet } from 'react-router-dom';
import ResturantMenu from './components/ResturantMenu';
// import Grocery from './components/grocery';

// import logo from './logo.jpg';
const Grocery=lazy(()=>import('./components/grocery'));
const Applayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};
const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Applayout />,
    children: [
      {
        path:"/",
        element: <Body />
      },
      { 
        path: "/About",
        element: <About />,
      },
      {
        path: "/Contact",
        element: <Contact />,
      },
      {
        path: "/resturants/:resId",
        element: <ResturantMenu />,
      },
      {
        path: "/grocery",
        element: <Suspense fallback={<h1>Loading....</h1>}><Grocery /></Suspense>,
      },
    ],
    errorElement: <Error />,
  },
]);
const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={AppRouter} />);
   