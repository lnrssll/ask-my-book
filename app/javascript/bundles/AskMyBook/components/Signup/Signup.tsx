import React from "react";
import type { ActionFunction } from "react-router-dom";
import { Form, Link, redirect } from "react-router-dom";
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
    return redirect("/auth/login");
  }
};

const Signup = () => {
  return (
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
        <label htmlFor="confirm-password">
          <input
            placeholder="confirm password"
            id="password_confirmation"
            name="user[password_confirmation]"
            type="password"
          />
        </label>
      </div>
      <button type="submit">Submit</button>
      <Link to="/auth/login" className="subtle">
        Already a user? Login
      </Link>
    </Form>
  );
};

export default Signup;
