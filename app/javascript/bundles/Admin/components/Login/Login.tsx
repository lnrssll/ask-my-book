import React from "react";
import type { ActionFunction } from "react-router-dom";
import { Form, Link, redirect } from "react-router-dom";
import style from "./Login.module.css";
import ReactOnRails from "react-on-rails";

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
  return redirect("/signup");
};

const Login = () => {
  return (
    <Form className={style.flexbox} method="post">
      <label className={style.flexbox} htmlFor="email">
        <div>Email</div>
        <input id="email" name="user[email]" type="text" />
      </label>
      <label className={style.flexbox} htmlFor="password">
        <div>Password</div>
        <input id="password" name="user[password]" type="password" />
      </label>
      <button type="submit">Submit</button>
      <Link to="/signup">No account? Signup</Link>
    </Form>
  );
};

export default Login;
