// import React, { useEffect, useState } from "react";
// import {
//   Button,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   IconButton,
//   Snackbar,
//   Alert,
//   Tabs,
//   Tab,
//   useMediaQuery,
//   useTheme
// } from "@mui/material";
// import { Search, Refresh, Clear } from "@mui/icons-material";
// import { SelectChangeEvent } from "@mui/material/Select";
// import { loadExcelData, getWorksheetNames } from "../../utils/excelUtils";
// import { useStyles } from "../../styles/styles";
// import { TEXT } from "../../utils/textResources";
// import { SkuRow, EnrichedSkuRow } from "../../utils/types";

// /* --- Notification type --- */
// interface Notification {
//   open: boolean;
//   message: string;
//   severity: "success" | "info" | "warning" | "error";
// }

// /* --- Product classification helpers (unchanged) --- */
// const getProductType = (row: SkuRow): "Hardware and Licenses" | "Accessories" | "Renewal" => {
//   const description = (row["Short Description"] || "").toLowerCase().trim();
//   const productFamily = (row.productFamily || "").toLowerCase().trim();
//   const partNumber = (row.PartNumber || "").toLowerCase().trim();

//   if (
//     partNumber.match(/(ba-mc400|bf-mc400|mb-mc400|ma-mc400|mc20|rx20|rx30|sec-|1709|1708|1707)/i)
//   )
//     return "Accessories";
//   if (description.includes("renewal") || partNumber.includes("-r") || productFamily.includes("renewal"))
//     return "Renewal";
//   return "Hardware and Licenses";
// };

// /* --- Main Component --- */
// const Ericsson: React.FC = () => {
//   const styles = useStyles();
//   const theme = useTheme();
//   const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

//   const [availableSheets, setAvailableSheets] = useState<string[]>([]);
//   const [activeSheet, setActiveSheet] = useState<string>("");
//   const [enrichedData, setEnrichedData] = useState<EnrichedSkuRow[]>([]);
//   const [searchResults, setSearchResults] = useState<EnrichedSkuRow[]>([]);
//   const [searchText, setSearchText] = useState("");

//   const [notification, setNotification] = useState<Notification>({
//     open: false,
//     message: "",
//     severity: "info"
//   });

//   const handleCloseNotification = () => setNotification((prev) => ({ ...prev, open: false }));
//   const showNotification = (message: string, severity: Notification["severity"]) =>
//     setNotification({ open: true, message, severity });

//   /* --- Dynamically load sheet names on startup --- */
//   useEffect(() => {
//     Excel.run(async () => {
//       try {
//         const names = await getWorksheetNames();
//         setAvailableSheets(names);

//         // Prefer "The Americas" or default first sheet
//         const defaultSheet =
//           names.find((n) => n.toLowerCase().includes("americ")) || names[0] || "";
//         if (defaultSheet) setActiveSheet(defaultSheet);
//       } catch (err) {
//         console.error("Error loading sheet names:", err);
//         showNotification("Failed to load sheet names", "error");
//       }
//     });
//   }, []);

//   /* --- Load Excel data whenever sheet changes --- */
//   useEffect(() => {
//     if (!activeSheet) return;

//     loadExcelData(activeSheet)
//       .then(({ workbookData }) => {
//         const enriched = workbookData.map((row): EnrichedSkuRow => ({
//           ...row,
//           productType: getProductType(row),
//           routerModel: row["Product Family"] || "",
//           categoryType: row["Market Segment or Category"] || "",
//           planType: row["Plan Type"] || "",
//           termInYears: Number(row["Warranty"]) || null
//         }));
//         setEnrichedData(enriched);
//         showNotification(`Loaded data from "${activeSheet}"`, "success");
//       })
//       .catch((err) => {
//         console.error(`Error loading Excel data from ${activeSheet}:`, err);
//         showNotification(`Failed to load data from ${activeSheet}`, "error");
//       });
//   }, [activeSheet]);

//   /* --- Handle tab (sheet) change --- */
//   const handleSheetChange = (_: React.SyntheticEvent, newValue: string) => {
//     setActiveSheet(newValue);
//     Excel.run(async (context) => {
//       try {
//         const sheet = context.workbook.worksheets.getItem(newValue);
//         sheet.activate();
//         await context.sync();
//       } catch (error) {
//         console.error("Error activating sheet:", error);
//         showNotification(`Could not activate sheet "${newValue}"`, "error");
//       }
//     });
//   };

//   /* --- Search Handler --- */
//   const handleTextSearch = () => {
//     if (!searchText.trim()) {
//       showNotification("Please enter a search term", "warning");
//       return;
//     }
//     const filtered = enrichedData.filter(
//       (r) =>
//         r.productFamily?.toLowerCase().includes(searchText.toLowerCase()) ||
//         r.PartNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
//         r["Short Description"]?.toLowerCase().includes(searchText.toLowerCase())
//     );
//     setSearchResults(filtered);
//     if (filtered.length)
//       showNotification(`Found ${filtered.length} results for "${searchText}"`, "success");
//     else showNotification(`No results found for "${searchText}"`, "warning");
//   };

//   return (
//     <Box sx={{ p: 2 }} className={styles.root}>
//       <Box sx={{ textAlign: "center", mt: 4 }}>
//         <img src={require("../../../../../assets/Icon.png")} width={200} alt="Logo" />
//       </Box>

//       {/* Dynamic Sheet Tabs */}
//       <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", mt: 2 }}>
//         {availableSheets.length > 0 && (
//           <Tabs
//             value={activeSheet}
//             onChange={handleSheetChange}
//             variant={isSmallScreen ? "scrollable" : "fullWidth"}
//             scrollButtons={isSmallScreen ? "auto" : false}
//             allowScrollButtonsMobile
//             aria-label="sheet selection tabs"
//             sx={{
//               "& .MuiTabs-indicator": { backgroundColor: "#000" },
//               "& .MuiTab-root.Mui-selected": { color: "#000", fontWeight: "bold" }
//             }}
//           >
//             {availableSheets.map((sheet) => (
//               <Tab key={sheet} label={sheet} value={sheet} />
//             ))}
//           </Tabs>
//         )}
//       </Box>

//       {/* Search UI */}
//       <Box
//         sx={{
//           mt: 4,
//           p: 2.5,
//           bgcolor: "#fff",
//           border: "1px solid #e5e7eb",
//           borderRadius: "10px",
//           boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
//         }}
//       >
//         <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
//           Search Products from {activeSheet || "Workbook"}
//         </Typography>

//         <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
//           <TextField
//             placeholder={TEXT.searchPlaceholder}
//             value={searchText}
//             onChange={(e) => setSearchText(e.target.value)}
//             sx={{ flex: 1 }}
//             size="small"
//           />
//           <IconButton onClick={handleTextSearch}>
//             <Search />
//           </IconButton>
//           <IconButton
//             onClick={() => {
//               setSearchText("");
//               setSearchResults([]);
//               showNotification("Search cleared", "info");
//             }}
//           >
//             <Clear />
//           </IconButton>
//         </Box>
//       </Box>

//       {/* Results */}
//       {searchResults.length > 0 && (
//         <Box sx={{ mt: 3 }}>
//           <Typography variant="h6" fontWeight={700}>
//             Search Results
//           </Typography>
//           {searchResults.map((sku, idx) => (
//             <Card
//               key={`${sku.PartNumber}-${idx}`}
//               sx={{
//                 mt: 2,
//                 bgcolor: "#ffffff",
//                 border: "1px solid #e5e7eb",
//                 borderRadius: "6px",
//                 padding: "20px",
//                 boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
//               }}
//             >
//               <CardContent>
//                 <Typography variant="h6" sx={{ color: "#004328", fontWeight: "bold" }}>
//                   {sku.routerModel}
//                 </Typography>
//                 <Typography>
//                   <strong>Part Number:</strong> {sku.PartNumber}
//                 </Typography>
//                 <Typography>
//                   <strong>Category:</strong> {sku.categoryType}
//                 </Typography>
//                 <Typography>
//                   <strong>Retail Price:</strong>{" "}
//                   <Box
//                     component="span"
//                     sx={{
//                       backgroundColor: "#ffe000",
//                       fontWeight: "bold",
//                       px: 1
//                     }}
//                   >
//                     ${sku["MSRP / \nRetail Price"]}
//                   </Box>
//                 </Typography>
//                 <Typography>
//                   <strong>Description:</strong> {sku["Short Description"]}
//                 </Typography>
//               </CardContent>
//             </Card>
//           ))}
//         </Box>
//       )}

//       <Snackbar
//         open={notification.open}
//         autoHideDuration={5000}
//         onClose={handleCloseNotification}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
//           {notification.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default Ericsson;


import React, { useEffect, useState, useCallback } from "react";
import {
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    useMediaQuery,
    useTheme,
    CircularProgress
} from "@mui/material";
import { Search, Refresh, Clear } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
import { loadExcelData, getWorksheetNames } from "../../utils/excelUtils";
import { useStyles } from "../../styles/styles";
import { TEXT } from "../../utils/textResources";
import { SkuRow, EnrichedSkuRow } from "../../utils/types";

// --- Notification type ---
interface Notification {
    open: boolean;  
    message: string;
    severity: "success" | "info" | "warning" | "error";
}

// --- ROBUST CLASSIFICATION HELPERS ---
const getProductType = (row: SkuRow): "Hardware and Licenses" | "Accessories" | "Renewal" | "Other" => {
    const marketSegment = (row["Market Segment or Category"] || "").toLowerCase();
    const description = (row["Short Description"] || "").toLowerCase();
    const partNumber = (row.PartNumber || "").toLowerCase();
    if (marketSegment.includes("renewal") || description.includes("renewal") || partNumber.endsWith("-r")) return "Renewal";
    if (marketSegment === "accessories" || marketSegment.startsWith("sim") || marketSegment.includes("antenna") || marketSegment.includes("power") || marketSegment.includes("cable") || marketSegment.includes("mount")) return "Accessories";
    if (marketSegment.includes("branch") || marketSegment.includes("mobile") || marketSegment.includes("iot") || marketSegment.includes("lan")) return "Hardware and Licenses";
    return "Other";
};
const getCategoryType = (row: SkuRow): string => {
    const marketSegment = (row["Market Segment or Category"] || "").trim();
    if (marketSegment) return marketSegment;
    const description = (row["Short Description"] || "").toLowerCase();
    if (description.includes("router")) return "Routers";
    if (description.includes("adapter")) return "Adapters";
    return "Uncategorized";
};
const getRouterModel = (row: SkuRow): string => (row.productFamily || "Unknown").trim();
const getPlanType = (row: SkuRow): string => {
    const description = (row["Short Description"] || "").toLowerCase();
    if (description.includes("essentials") && description.includes("advanced")) return "Essentials+Advanced";
    if (description.includes("advanced")) return "Advanced";
    if (description.includes("essentials")) return "Essentials";
    return "Standard";
};
const getTermInYears = (row: SkuRow): number | null => {
    const description = row["Short Description"] || "";
    const match = description.match(/(\d+)-yr/);
    if (match && match[1]) return parseInt(match[1], 10);
    const warranty = parseInt(row.Warranty, 10);
    if (!isNaN(warranty) && [1, 2, 3, 5].includes(warranty)) return warranty;
    return null;
};

// --- Main Component ---
const Ericsson: React.FC = () => {
    const styles = useStyles();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [availableSheets, setAvailableSheets] = useState<string[]>([]);
    const [activeSheet, setActiveSheet] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [enrichedData, setEnrichedData] = useState<EnrichedSkuRow[]>([]);
    const [searchResults, setSearchResults] = useState<EnrichedSkuRow[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedProductType, setSelectedProductType] = useState<string | undefined>();
    const [selectedCategoryType, setSelectedCategoryType] = useState<string | undefined>();
    const [selectedModel, setSelectedModel] = useState<string | undefined>();
    const [selectedPlanType, setSelectedPlanType] = useState<string | undefined>();
    const [selectedTerm, setSelectedTerm] = useState<number | undefined>();
    const [availableCategoryTypes, setAvailableCategoryTypes] = useState<string[]>([]);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [availablePlanTypes, setAvailablePlanTypes] = useState<string[]>([]);
    const [availableTerms, setAvailableTerms] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSku, setActiveSku] = useState<EnrichedSkuRow | null>(null);
    const [notification, setNotification] = useState<Notification>({ open: false, message: "", severity: "info" });

    const handleCloseNotification = () => setNotification((p) => ({ ...p, open: false }));
    const showNotification = useCallback((m: string, s: Notification["severity"]) => setNotification({ open: true, message: m, severity: s }), []);
    const resetAllSelections = useCallback((showMsg = false) => {
        setSearchText(""); setSelectedProductType(undefined); setSelectedCategoryType(undefined); setSelectedModel(undefined);
        setSelectedPlanType(undefined); setSelectedTerm(undefined); setAvailableCategoryTypes([]); setAvailableModels([]);
        setAvailablePlanTypes([]); setAvailableTerms([]); setSearchResults([]);
        if (showMsg) showNotification("All filters cleared", "info");
    }, [showNotification]);

    useEffect(() => {
        getWorksheetNames().then(names => {
            setAvailableSheets(names);
            if (names.length > 0) {
                const defaultSheet = names.find(n => n.toLowerCase().includes("americ")) || names[0];
                setActiveSheet(defaultSheet);
            } else { setIsLoading(false); }
        }).catch(err => {
            console.error("Error loading sheet names:", err);
            showNotification("Failed to load sheet names", "error");
        });
    }, [showNotification]);

    useEffect(() => {
        if (!activeSheet) return;
        setIsLoading(true); resetAllSelections();
        loadExcelData(activeSheet)
            .then(({ workbookData }) => {
                const enriched = (workbookData as SkuRow[]).map((row): EnrichedSkuRow => ({
                    ...row, productType: getProductType(row), categoryType: getCategoryType(row),
                    routerModel: getRouterModel(row), planType: getPlanType(row), termInYears: getTermInYears(row),
                }));
                console.log(`--- Enriched Data for: ${activeSheet} ---`, enriched);
                setEnrichedData(enriched);
                showNotification(`Loaded ${enriched.length} items from "${activeSheet}"`, "success");
            })
            .catch((err) => {
                console.error(`❌ Error loading data for ${activeSheet}:`, err);
                showNotification(err.message || `Failed to load data from ${activeSheet}`, "error");
            })
            .finally(() => setIsLoading(false));
    }, [activeSheet, resetAllSelections, showNotification]);

    const handleSheetChange = (_e: React.SyntheticEvent, newSheet: string) => {
        if (newSheet === activeSheet) return;
        setActiveSheet(newSheet);
        Excel.run(async (context) => {
            try { context.workbook.worksheets.getItem(newSheet).activate(); await context.sync(); }
            catch (error) { console.error("Error activating sheet:", error); }
        });
    };
    const handleTextSearch = () => {
        if (!searchText.trim()) return showNotification("Enter a search term", "warning");
        resetAllSelections();
        const term = searchText.trim().toLowerCase();
        const filtered = enrichedData.filter(r => (r.productFamily || "").toLowerCase().includes(term) || (r.PartNumber || "").toLowerCase().includes(term) || (r["Short Description"] || "").toLowerCase().includes(term));
        setSearchResults(filtered);
        showNotification(filtered.length ? `Found ${filtered.length} results` : "No results found", filtered.length ? "success" : "warning");
    };
    const handleProductTypeSelect = (event: SelectChangeEvent<string>) => {
        const type = event.target.value; resetAllSelections(); setSelectedProductType(type);
        const uniqueCategories = Array.from(new Set(enrichedData.filter(r => r.productType === type).map(r => r.categoryType))).filter(Boolean).sort();
        setAvailableCategoryTypes(uniqueCategories); showNotification(`Selected type: ${type}`, "info");
    };
    const handleCategoryTypeSelect = (event: SelectChangeEvent<string>) => {
        const category = event.target.value; setSelectedCategoryType(category); setSelectedModel(undefined);
        const uniqueModels = Array.from(new Set(enrichedData.filter(r => r.productType === selectedProductType && r.categoryType === category).map(r => r.routerModel))).filter(Boolean).sort();
        setAvailableModels(uniqueModels); showNotification(`Selected category: ${category}`, "info");
    };
    const handleModelSelect = (event: SelectChangeEvent<string>) => {
        const model = event.target.value; setSelectedModel(model); setSelectedPlanType(undefined); setSelectedTerm(undefined);
        const results = enrichedData.filter(r => r.productType === selectedProductType && r.categoryType === selectedCategoryType && r.routerModel === model);
        setSearchResults(results);
        const plans = Array.from(new Set(results.map(r => r.planType))).filter(Boolean).sort();
        const terms = Array.from(new Set(results.map(r => r.termInYears).filter((t): t is number => t !== null))).sort((a, b) => a - b);
        setAvailablePlanTypes(plans); setAvailableTerms(terms);
        showNotification(`Found ${results.length} initial results for ${model}`, "success");
    };
    const handlePlanTypeSelect = (event: SelectChangeEvent<string>) => {
        const plan = event.target.value; setSelectedPlanType(plan); setSelectedTerm(undefined);
        const results = enrichedData.filter(r => r.productType === selectedProductType && r.categoryType === selectedCategoryType && r.routerModel === selectedModel && r.planType === plan);
        setSearchResults(results);
        const terms = Array.from(new Set(results.map(r => r.termInYears).filter((t): t is number => t !== null))).sort((a, b) => a - b);
        setAvailableTerms(terms); showNotification(`Filtered by plan: ${plan}`, "info");
    };
    const handleTermSelect = (event: SelectChangeEvent<string>) => {
        const term = parseInt(event.target.value, 10); setSelectedTerm(term);
        const results = enrichedData.filter(r => r.productType === selectedProductType && r.categoryType === selectedCategoryType && r.routerModel === selectedModel && (!selectedPlanType || r.planType === selectedPlanType) && r.termInYears === term);
        setSearchResults(results); showNotification(`Found ${results.length} results for ${term}-year term`, "success");
    };
    const handleClearCategory = () => { setSelectedCategoryType(undefined); setSelectedModel(undefined); setAvailableModels([]); showNotification("Category cleared", "info"); };
    const handleClearModel = () => { setSelectedModel(undefined); setSelectedPlanType(undefined); setAvailablePlanTypes([]); showNotification("Model cleared", "info"); };
    const handleClearPlan = () => { setSelectedPlanType(undefined); setSelectedTerm(undefined); setAvailableTerms([]); showNotification("Plan cleared", "info"); };
    const handleClearTerm = () => { setSelectedTerm(undefined); showNotification("Term cleared", "info"); };

    const renderSkuCards = (data: EnrichedSkuRow[]) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#323130" }}>{TEXT.heading2} ({data.length})</Typography>
            {data.map((sku, idx) => {
                return (
                    <Card key={`${sku.PartNumber}-${idx}`} sx={{ bgcolor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "20px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease", "&:hover": { bgcolor: "#f9fafb", transform: "scale(1.03)", boxShadow: "0 6px 12px rgba(0,0,0,0.05)", }, }}>
                        <CardContent sx={{ p: '0 !important' }}>
                            <Typography variant="h6" sx={{ color: "#004328", textAlign: "center", fontWeight: "bold" }}>{sku.routerModel}</Typography>
                            <Typography sx={{ mt: 1.5 }}><strong>Part Number:</strong> {sku.PartNumber}</Typography>
                            <Typography><strong>Category:</strong> {sku.categoryType}</Typography>
                                <Typography><strong>Retail Price:</strong>
                                    <Box component="span" sx={{ backgroundColor: '#ffe000', fontWeight: 'bold', p: "2px 6px", ml: 1, borderRadius: '4px' }}>
                                       ${sku["MSRP / \nRetail Price"]}
                                    </Box>
                                </Typography>
                            <Typography><strong>Description:</strong> {sku["Short Description"]}</Typography>
                            <Box sx={{ textAlign: "center", mt: 2 }}>
                                <Button variant="contained" sx={{ bgcolor: "#004328", "&:hover": { bgcolor: "#003020" } }} onClick={() => { console.log("Opening Dialog for SKU:", sku); setActiveSku(sku); setIsModalOpen(true); }}>View More</Button>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Box>
    );

    return (
        <Box sx={{ p: 2 }} className={styles.root}>
            <Box sx={{ textAlign: "center", my: 4 }}><img src={"assets/Icon.png"} width={200} alt="Company Logo" /></Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                {availableSheets.length > 0 &&
                    <Tabs 
                        value={activeSheet}
                        onChange={handleSheetChange}
                        variant={isSmallScreen ? "scrollable" : "fullWidth"}
                        scrollButtons={isSmallScreen ? "auto" : false}
                        allowScrollButtonsMobile
                        sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#000000ff',
                        },
                        '& .MuiTab-root.Mui-selected': {
                            color: '#000000ff',
                            fontWeight: 'bold',
                        },
                    }}
                        >
                        {availableSheets.map(s => <Tab key={s} label={s} value={s} />)}
                    </Tabs>}
            </Box>
            <Box sx={{ mt: 4, p: 2.5, bgcolor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box> : (
                    <>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}><Typography variant="subtitle1" sx={{ color: "#1f2937", fontWeight: 600 }}>{`Select & Search From ${activeSheet}`}</Typography><IconButton onClick={() => resetAllSelections(true)}><Refresh /></IconButton></Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}><TextField fullWidth placeholder={TEXT.searchPlaceholder} value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTextSearch()} size="small" /><IconButton onClick={handleTextSearch}><Search /></IconButton></Box>
                        <Typography sx={{ textAlign: "center", my: 1, color: "#6b7280" }}>OR</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <FormControl size="small"><InputLabel>1. Select Product Type</InputLabel><Select value={selectedProductType || ""} onChange={handleProductTypeSelect} label="1. Select Product Type">{["Hardware and Licenses", "Accessories", "Renewal"].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><FormControl size="small" sx={{ flex: 1 }} disabled={!selectedProductType}><InputLabel>2. Select Category</InputLabel><Select value={selectedCategoryType || ""} onChange={handleCategoryTypeSelect} label="2. Select Category">{availableCategoryTypes.map(ct => <MenuItem key={ct} value={ct}>{ct}</MenuItem>)}</Select></FormControl>{selectedCategoryType && <IconButton onClick={handleClearCategory}><Clear /></IconButton>}</Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><FormControl size="small" sx={{ flex: 1 }} disabled={!selectedCategoryType}><InputLabel>3. Select Model</InputLabel><Select value={selectedModel || ""} onChange={handleModelSelect} label="3. Select Model">{availableModels.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl>{selectedModel && <IconButton onClick={handleClearModel}><Clear /></IconButton>}</Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><FormControl size="small" sx={{ flex: 1 }} disabled={!selectedModel || availablePlanTypes.length === 0}><InputLabel>4. Select Plan</InputLabel><Select value={selectedPlanType || ""} onChange={handlePlanTypeSelect} label="4. Select Plan">{availablePlanTypes.map(pt => <MenuItem key={pt} value={pt}>{pt}</MenuItem>)}</Select></FormControl>{selectedPlanType && <IconButton onClick={handleClearPlan}><Clear /></IconButton>}</Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><FormControl size="small" sx={{ flex: 1 }} disabled={!selectedModel || availableTerms.length === 0}><InputLabel>5. Select Term</InputLabel><Select value={selectedTerm ? `${selectedTerm}` : ""} onChange={handleTermSelect} label="5. Select Term">{availableTerms.map(t => <MenuItem key={t} value={t}>{`${t} Year(s)`}</MenuItem>)}</Select></FormControl>{selectedTerm && <IconButton onClick={handleClearTerm}><Clear /></IconButton>}</Box>
                        </Box>
                    </>
                )}
            </Box>
            {searchResults.length > 0 && renderSkuCards(searchResults)}
            {isModalOpen && activeSku && (
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <DialogTitle><Typography variant="h6" textAlign={"center"} fontWeight={700}>Details for: {activeSku.routerModel}</Typography></DialogTitle>
                    <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 3 }}>
                             <Typography sx={{ color: "#374151" }}>
                                <strong>Retail Price:</strong>{' '}
                                <Box component="span" sx={{ backgroundColor: '#ffe000', fontWeight: 'bold', p: "2px 6px" }}>
                                   ${activeSku["MSRP / \nRetail Price"]}
                                </Box>
                            </Typography>
                        <Typography><strong>Part Number:</strong> {activeSku.PartNumber}</Typography>
                        <Typography><strong>Product Type:</strong> {activeSku.productType}</Typography>
                        <Typography><strong>Category:</strong> {activeSku.categoryType}</Typography>
                        {activeSku.planType !== 'Standard' && <Typography><strong>Plan Type:</strong> {activeSku.planType}</Typography>}
                        {activeSku.termInYears && <Typography><strong>Term:</strong> {activeSku.termInYears} Year(s)</Typography>}
                        {activeSku.Warranty && <Typography><strong>Warranty:</strong> {activeSku.Warranty} Year(s)</Typography>}
                        {activeSku["Country of Origin"] && <Typography><strong>Country of Origin:</strong> {activeSku["Country of Origin"]}</Typography>}
                        <Typography sx={{ mt: 1 }}><strong>Description:</strong> {activeSku["Short Description"]}</Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}><Button fullWidth variant="contained" sx={{ bgcolor: "#004328", "&:hover": { bgcolor: "#003020" } }} onClick={() => setIsModalOpen(false)}>Close</Button></DialogActions>
                </Dialog>
            )}
            <Snackbar open={notification.open} autoHideDuration={3000} onClose={handleCloseNotification} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                            <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>{notification.message}</Alert>
                        </Snackbar>
        </Box>
    );
};

export default Ericsson;