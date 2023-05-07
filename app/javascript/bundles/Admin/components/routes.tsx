import React from "react";

import Admin, { adminLoader } from "./Admin";
import { Signup, signupAction } from "./Signup";
import { Deactivate, deactivateAction } from "./Deactivate";
import { Login, loginAction } from "./Login";
import { Logout, logoutAction } from "./Logout";
import { Upload, uploadAction } from "./Upload";

export default [
  {
    path: "/admin",
    id: "admin",
    loader: adminLoader,
    element: <Admin />,
    children: [
      {
        index: true,
        loader: adminLoader,
        element: <div>hello</div>,
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
        path: "upload",
        action: uploadAction,
        element: <Upload />,
      },
    ],
  },
];
