import ReactOnRails from "react-on-rails";

import AskMyBook from "../bundles/AskMyBook/components/AskMyBookServer";

// This is how react_on_rails can see the AskMyBook in the browser.
ReactOnRails.register({
  AskMyBook,
});
