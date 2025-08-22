import { makeStyles } from "@fluentui/react-components";

export const useStyles = makeStyles({
  root: {
    fontFamily: `"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    fontSize: "15px",
    color: "#1f2937",
  },
  skuBox: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    padding: "12px 16px",
    marginBottom: "12px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "20px",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    alignItems: "center",
  },
  dropdowns: {
    minWidth: "20px",
    width: "100%",
    height: "36px",
    borderRadius: "6px",
    borderBottom: "1px solid #d1d5db",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }
});