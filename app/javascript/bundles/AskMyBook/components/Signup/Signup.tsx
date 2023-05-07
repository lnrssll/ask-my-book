import React from "react";
import type { ActionFunction } from "react-router-dom";
import { Form, Link, redirect } from "react-router-dom";
import style from "./Signup.module.css";
import ReactOnRails from "react-on-rails";

export const signupAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = "/api/v1/signup";
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "POST",
    body: formData,
  });
  if (res.ok) {
    return redirect("/login");
  }
};

const Signup = () => {
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
      <label className={style.flexbox} htmlFor="confirm-password">
        <div>Confirm Password</div>
        <input
          id="password_confirmation"
          name="user[password_confirmation]"
          type="password"
        />
      </label>
      <button type="submit">Submit</button>
      <Link to="/login">Already a user? Login</Link>
    </Form>
  );
};

export default Signup;
