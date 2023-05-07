import React from "react";
import { Outlet } from "react-router-dom";

import Admin, { adminLoader } from "./Admin";
import { Signup, signupAction } from "./Signup";
import { Deactivate, deactivateAction } from "./Deactivate";
import { Login, loginAction } from "./Login";
import { Logout, logoutAction } from "./Logout";

import { Upload, uploadAction } from "./Upload";
import { Docs, docsLoader } from "./Docs";
import { Doc, docLoader, docAction } from "./Docs/Doc";

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
      {
        path: "docs",
        loader: docsLoader,
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <Docs />,
            loader: docsLoader,
          },
          {
            path: ":id",
            action: docAction,
            loader: docLoader,
            element: <Outlet />,
            children: [
              {
                index: true,
                loader: docLoader,
                action: docAction,
                id: "doc",
                element: <Doc />,
              },
            ],
          },
        ],
      },
    ],
  },
];
