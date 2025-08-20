import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import SkuLookup from "./views/shared/LookUp";
// import Ericsson from "./views/shared/Ericsson";

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

      <SkuLookup/>

      {/* <Ericsson/> */}
      
    </div>
  );
};

export default App;
