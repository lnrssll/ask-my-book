import React from "react";
import style from "./AskMyBook.module.css";

const AskMyBook = () => {
  const val: string = "AskMyBook";
  return (
    <div className={style.temp}>
      <h3>{val}!</h3>
      <hr />
    </div>
  );
};

export default AskMyBook;
