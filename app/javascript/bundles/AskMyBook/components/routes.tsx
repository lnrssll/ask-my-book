import React from "react";
import { Outlet } from "react-router-dom";

import AskMyBook, { homeLoader } from "./AskMyBook";
import { Signup, signupAction } from "./Signup";
import { Deactivate, deactivateAction } from "./Deactivate";
import { Login, loginAction } from "./Login";
import { Logout, logoutAction } from "./Logout";

export default [
  {
    path: "/",
    id: "root",
    element: <Outlet />,
    children: [
      {
        index: true,
        loader: homeLoader,
        element: <AskMyBook />,
      },
      {
        path: "signup",
        element: <Signup />,
        action: signupAction,
      },
      {
        path: "login",
        element: <Login />,
        action: loginAction,
      },
      {
        path: "logout",
        action: logoutAction,
        element: <Logout />,
      },
      {
        path: "deactivate",
        action: deactivateAction,
        element: <Deactivate />,
      },
    ],
  },
];
