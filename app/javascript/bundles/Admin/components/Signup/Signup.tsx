import React from "react";
import type { ActionFunction } from "react-router-dom";
import { Form, Link, redirect } from "react-router-dom";
import style from "./Signup.module.css";
import ReactOnRails from "react-on-rails";
import { HomeIcon } from "@heroicons/react/24/solid";

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
            <label htmlFor="confirm-password">
              <input
                placeholder="confirm password"
                id="password_confirmation"
                name="user[password_confirmation]"
                type="password"
              />
            </label>
            <label htmlFor="code">
              <input
                id="code"
                placeholder="your access code"
                name="user[code]"
                type="password"
              />
            </label>
          </div>
          <button type="submit">Submit</button>
          <Link to="/auth/login" className="subtle">
            Already a user? Login
          </Link>
        </Form>
      </div>
    </div>
  );
};

export default Signup;
