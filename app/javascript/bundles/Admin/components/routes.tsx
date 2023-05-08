import React from "react";
import { Outlet } from "react-router-dom";

import Admin, { adminLoader } from "./Admin";
import { Signup, signupAction } from "./Signup";
import { Deactivate, deactivateAction } from "./Deactivate";
import { Login, loginAction } from "./Login";
import { Logout, logoutAction } from "./Logout";

import { Dashboard } from "./Dashboard";
import { Upload, uploadAction } from "./Upload";
import { Docs, docsLoader } from "./Docs";
import { Doc, docLoader, docAction } from "./Docs/Doc";
import { chunkAction } from "./Docs/Doc/Chunk";
import { embedAction } from "./Docs/Doc/Embed";
import { decomposeAction } from "./Docs/Doc/Decompose";
import { buildAction } from "./Docs/Doc/Build";
import { classifyAction } from "./Docs/Doc/Classify";
import { Questions, questionsAction } from "./Docs/Doc/Questions";
import { questionAction } from "./Docs/Doc/Questions/Question";
import { Search, searchAction } from "./Docs/Doc/Search";

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
        element: <Dashboard />,
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
            id: "doc",
            element: <Outlet />,
            children: [
              {
                index: true,
                loader: docLoader,
                action: docAction,
                element: <Doc />,
              },
              {
                path: "chunk",
                action: chunkAction,
              },
              {
                path: "embed",
                action: embedAction,
              },
              {
                path: "decompose",
                action: decomposeAction,
              },
              {
                path: "build",
                action: buildAction,
              },
              {
                path: "classify",
                action: classifyAction,
              },
              {
                path: "search",
                action: searchAction,
                element: <Search />,
              },
              {
                path: "questions",
                action: questionsAction,
                element: <Questions />,
                children: [
                  {
                    path: ":questionId",
                    action: questionAction,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
