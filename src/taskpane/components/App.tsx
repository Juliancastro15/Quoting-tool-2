import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import Ericsson from "./views/shared/Ericsson";
import Ericsson2 from "./views/shared/Ericsson2";

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

      {/* <Ericsson/> */}

      <Ericsson2/>
      
    </div>
  );
};

export default App;
