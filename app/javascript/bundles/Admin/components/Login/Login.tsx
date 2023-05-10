import React from "react";
import type { ActionFunction } from "react-router-dom";
import { Form, Link, redirect } from "react-router-dom";
import style from "./Login.module.css";
import ReactOnRails from "react-on-rails";
import { HomeIcon } from "@heroicons/react/24/solid";

export const loginAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = "/api/v1/login";
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "POST",
    body: formData,
  });
  if (res.ok) {
    return redirect("/");
  }
  alert("Invalid email or password");
  return redirect("/auth/signup");
};

const Login = () => {
  return (
    <div className={style.main}>
      <a href="/">
        <HomeIcon className={style.icon} />
      </a>
      <div className={style.outlet}>
        <Form className="flexbox" method="post">
          <div className="flexbox">
            <label htmlFor="email">
              <input
                id="email"
                placeholder="yourname@example.com"
                name="user[email]"
                type="text"
              />
            </label>
            <label htmlFor="password">
              <input
                id="password"
                placeholder="password"
                name="user[password]"
                type="password"
              />
            </label>
          </div>
          <button type="submit">Submit</button>
          <Link to="/auth/signup" className="subtle">
            No account? Signup
          </Link>
        </Form>
      </div>
    </div>
  );
};

export default Login;
