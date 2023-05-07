import ReactOnRails from "react-on-rails";

import App from "../bundles/AskMyBook/components/App";
import "../stylesheets/AskMyBook.css";

// This is how react_on_rails can see the AskMyBook in the browser.
ReactOnRails.register({
  App,
});
