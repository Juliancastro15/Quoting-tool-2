import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import Ericssons from "./views/shared/Ericsson";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App: React.FC<AppProps> = (_props: AppProps) => {

  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Ericssons/>
    </div>
  );
};

export default App;
