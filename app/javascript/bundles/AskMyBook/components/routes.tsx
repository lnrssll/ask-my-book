import React from "react";

import AskMyBook, { homeLoader } from "./AskMyBook";
import { Signup, signupAction } from "./Signup";
import { Deactivate, deactivateAction } from "./Deactivate";
import { Login, loginAction } from "./Login";
import { Logout, logoutAction } from "./Logout";
import { Books, booksLoader } from "./Books";
import { Ask, askAction, askLoader } from "./Ask";

export default [
  {
    path: "/",
    id: "root",
    element: <AskMyBook />,
    loader: homeLoader,
    children: [
      {
        index: true,
        loader: booksLoader,
        element: <Books />,
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
      {
        path: "questions/:id",
        element: <Ask />,
        action: askAction,
        loader: askLoader,
      },
    ],
  },
];
