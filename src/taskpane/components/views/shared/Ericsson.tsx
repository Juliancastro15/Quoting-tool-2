import React, { useEffect, useState } from "react";
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
    Drawer
} from "@mui/material";
import { Search, Refresh, Clear } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
import { loadExcelData, getSheetNames } from "../../utils/excelUtils";
import { useStyles } from "../../styles/styles";
import { TEXT } from "../../utils/textResources";
import { SkuRow, EnrichedSkuRow } from "../../utils/types";

// Notification state interface
interface Notification {
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
}

const getProductType = (row: SkuRow): "Hardware and Licenses" | "Accessories" | "Renewal" => {
    const description = (row["Short Description"] || "").toLowerCase().trim();
    const productFamily = (row.productFamily || "").toLowerCase().trim();
    const partNumber = (row.PartNumber || "").toLowerCase().trim();

    // Explicitly classify R980 SKUs as Hardware and Licenses
    if (partNumber.match(/(mb01-r980-5gd-a|mb03-r980-5gd-a|mb05-r980-5gd-a|mba1-r980-5gd-a|mba3-r980-5gd-a|mba5-r980-5gd-a|tc03-r980-5gd-a|tc05-r980-5gd-a|tca3-r980-5gd-a|tca5-r980-5gd-a|max1-0980-5gd-xe|max3-0980-5gd-xe|max5-0980-5gd-xe)/i)) {
        return "Hardware and Licenses";
    }

    if (
        partNumber.match(/(ba-mc400-1200m-b|bf-mc400-1200m-b|bf-mc400-5gb|ba-mc400-5gb|mb-mc400-5gb|bf-mc20-bt|170900-015|170900-016|170900-017|170900-020|170900-001|170900-005|170900-009|170900-014|ma-mc400-1200m-b|ma-rx20-mc|mc20-srl|mc20-eth|mc20-gpo|rx20-mc|mb-rx30-poe|mb-rx30-mc|sec-0001-nciwf|sec-0003-nciwf|sec-0005-nciwf|170761-001|170765-000|170801-000|170836-000|170907-000|170923-000|170732-000|170732-001|170732-002|170732-003|170732-004|170877-000|170862-000|170863-000|170716-001|170717-000|170751-000|170869-000|170870-000|170924-000|170663-000|170663-001|170725-000|170585-001|170676-000|170712-000|170758-000|170623-001|170871-000|170665-000|170919-000|170864-000|170873-000|170671-001|170858-000|170872-000|170876-001|170886-000|170887-000|170888-000|170913-000|170750-001|170904-001|170718-000|170812-000|170848-000|170921-000)/i)
    ) {
        return "Accessories";
    }

    if (
        description.includes("renewal") &&
        !partNumber.match(/(mb01-r980-5gd-a|mb03-r980-5gd-a|mb05-r980-5gd-a|mba1-r980-5gd-a|mba3-r980-5gd-a|mba5-r980-5gd-a|tc03-r980-5gd-a|tc05-r980-5gd-a|tca3-r980-5gd-a|tca5-r980-5gd-a|max1-0980-5gd-xe|max3-0980-5gd-xe|max5-0980-5gd-xe)/i)
    ) {
        return "Renewal";
    }

    return "Hardware and Licenses";
};

const getCategoryType = (row: SkuRow): string => {
    const description = (row["Short Description"] || "").toLowerCase().trim();
    const productFamily = (row.productFamily || "").toLowerCase().trim();
    const partNumber = (row.PartNumber || "").toLowerCase().trim();
    const productType = getProductType(row);

    if (productType === "Renewal") {
        if (description.includes("mobile performance") || partNumber.includes("mbp") || productFamily.includes("mobile performance")) return "Mobile Performance Renewals";
        if (description.includes("enterprise branch") || partNumber.includes("bfp") || partNumber.includes("bfq") || partNumber.includes("bfr")) return "Enterprise Branch Renewals";
        if (description.includes("traffic steering") || partNumber.includes("maw")) return "Traffic Steering Renewals";
        if (description.includes("branch adapter") || partNumber.includes("bba")) return "Branch Adapter Renewals";
        if (description.includes("branch 5g adapter") || partNumber.includes("bea")) return "Branch 5G Adapter Renewals";
        if (description.includes("branch performance") || partNumber.includes("bda")) return "Branch Performance Renewals";
        if (description.includes("small branch") || partNumber.includes("bka")) return "Small Branch Renewals";
        if (description.includes("ericom") || productFamily.includes("ericom")) return "Ericom Renewals";
        return "Other Renewals";
    }

    if (productType === "Accessories") {
        const accessoryMappings: { [key: string]: { partNumbers: string[] } } = {
            "Modems": {
                partNumbers: ["170900-020", "170900-017", "170900-016", "170900-005", "170900-009", "170900-001", "ma-mc400-1200m-b", "170900-015", "170900-014", "mb-mc400-5gb", "ba-mc400-1200m-b", "ba-mc400-5gb", "bf-mc400-1200m-b", "bf-mc400-5gb"]
            },
            "Expansion Modules": {
                partNumbers: ["mc20-srl", "mc20-eth", "mc20-gpo", "ma-rx20-mc", "mb-rx30-poe", "mb-rx30-mc", "bf-mc20-bt"]
            },
            "Security": {
                partNumbers: ["sec-0001-nciwf", "sec-0003-nciwf", "sec-0005-nciwf"]
            },
            "Antenna": {
                partNumbers: ["170761-001", "170765-000", "170801-000", "170836-000", "170907-000", "170923-000"]
            },
            "PoE Injector": {
                partNumbers: ["170877-000", "170732-000", "170732-001", "170732-002", "170732-003", "170732-004"]
            },
            "Power Supply": {
                partNumbers: ["170862-000", "170863-000", "170716-001", "170717-000", "170751-000", "170869-000", "170870-000", "170924-000"]
            },
            "Cables & Adapters": {
                partNumbers: ["170663-000", "170663-001", "170725-000", "170585-001", "170676-000", "170712-000", "170758-000", "170623-001", "170871-000", "170665-000", "170919-000", "170864-000", "170873-000", "170671-001", "170858-000", "170872-000"]
            },
            "Mounting Brackets": {
                partNumbers: ["170876-001", "170886-000", "170887-000", "170888-000", "170913-000", "170750-001", "170904-001", "170718-000", "170812-000"]
            },
            "Battery": {
                partNumbers: ["170848-000", "170921-000"]
            }
        };

        for (const [category, { partNumbers }] of Object.entries(accessoryMappings)) {
            if (partNumbers.map(pn => pn.toLowerCase()).includes(partNumber)) {
                return category;
            }
        }
        return "Other";
    }

    if (
        (description.includes("router") && !description.includes("modem only")) ||
        productFamily.match(/(e3000|e400|e300|e102|e100|ibr1700|s700|s400|s450|r2100|r1900|r980|r920|r2105|r2155)/i) ||
        partNumber.match(/(bla1-e400-5ge|bl01-e400-5ge|bf01-30005gb|mb01-r980-5gd|mba1-r980-5gd|tc03-r980-5gd|tc05-r980-5gd|tca3-r980-5gd|tca5-r980-5gd|max1-0980-5gd|max3-0980-5gd|max5-0980-5gd)/i)
    ) {
        return "Routers";
    }

    if (productFamily.includes("w1855") || productFamily.includes("w1850") || productFamily.includes("w2005") || productFamily.includes("w4005") || productFamily.includes("l950")) return "Adapters";
    if (description.includes("virtual") || productFamily.includes("netcloud exchange") || productFamily.includes("ncx") || productFamily.includes("virtual edge") || description.includes("service gateway")) return "Virtual Appliances";
    if (productFamily.includes("sw2400p") || description.includes("lan switch")) return "LAN Switches";
    if (partNumber.includes("lw01") || description.includes("access point") || productFamily.includes("ap2600") || productFamily.includes("lan wi-fi ap")) return "Access Points";

    return "Other";
};

const getRouterModel = (row: SkuRow): string => {
    const description = (row["Short Description"] || "").toLowerCase().trim();
    const productFamily = (row.productFamily || "").toLowerCase().trim();
    const partNumber = (row.PartNumber || "").toLowerCase().trim();

    // Explicit mapping for R980 SKUs
    const skuModelMapping: { [key: string]: string } = {
        "mb01-r980-5gd-a": "R980",
        "mb03-r980-5gd-a": "R980",
        "mb05-r980-5gd-a": "R980",
        "mba1-r980-5gd-a": "R980",
        "mba3-r980-5gd-a": "R980",
        "mba5-r980-5gd-a": "R980",
        "tc03-r980-5gd-a": "R980",
        "tc05-r980-5gd-a": "R980",
        "tca3-r980-5gd-a": "R980",
        "tca5-r980-5gd-a": "R980",
        "max1-0980-5gd-xe": "R980",
        "max3-0980-5gd-xe": "R980",
        "max5-0980-5gd-xe": "R980",
        "bf01-30005gb-gn": "E300",
        "bf03-30005gb-gn": "E300",
        "bf05-30005gb-gn": "E300",
        "bl01-e400-5ge-am-n": "E400",
        "bl03-e400-5ge-am-n": "E400",
        "bl05-e400-5ge-am-n": "E400",
        "bla1-e400-5ge-gl-m": "E400",
        "bla3-e400-5ge-gl-m": "E400",
        "bla5-e400-5ge-gl-m": "E400"
    };

    if (skuModelMapping[partNumber]) return skuModelMapping[partNumber];

    const partMatch = partNumber.match(/-(e3000|e400|e300|e102|e100|ibr1700|s700|s400|s450|r2100|r1900|r980|r920|r2105|r2155|rx20|rx30|w1850|w1855|w1885|w2005|w4005|l950|0980)-/i);
    if (partMatch) {
        const model = partMatch[1].toUpperCase();
        return model === '0980' ? 'R980' : model;
    }

    const modelMapping: { [key: string]: string } = {
        "e400": "E400", "e300": "E300", "r980": "R980",
        "e3000": "E3000", "ap2600": "AP2600", "lan wi-fi ap": "AP2600",
        "r920": "R920", "r1900": "R1900", "ibr1700": "IBR1700",
        "s700": "S700", "s750": "S750", "s400": "S400", "s450": "S450",
        "e100": "E100", "e102": "E100", "e110": "E110",
        "r2100": "R2100", "r2105": "R2105", "r2155": "R2155",
        "w1850": "W1850", "w1855": "W1855", "w1885": "W1885", "w2000": "W2000", "w2005": "W2005", "w4005": "W4005", "l950": "L950",
        "rx20": "RX20", "rx30": "RX30", "sw2400p": "SW2400P",
        "aer2200": "AER2200", "cba850": "CBA850", "cba550": "CBA550", "cr4250": "CR4250",
        "ibr900": "IBR900", "ibr600c": "IBR600C", "ibr650c": "IBR600C", "r500-plte": "R500-PLTE"
    };

    if (modelMapping[partNumber]) return modelMapping[partNumber];
    if (modelMapping[productFamily]) return modelMapping[productFamily];

    const modelKeys = Object.keys(modelMapping);
    for (const key of modelKeys) {
        if (productFamily.includes(key)) return modelMapping[key];
    }

    return productFamily.toUpperCase() || "Unknown";
};

const getPlanType = (row: SkuRow): string => {
    const description = (row["Short Description"] || "").toLowerCase().trim();
    const partNumber = (row.PartNumber || "").toUpperCase().trim();

    // Explicit mapping for R980 SKUs
    const skuPlanMapping: { [key: string]: string } = {
        "MB01-R980-5GD-A": "Essentials",
        "MB03-R980-5GD-A": "Essentials",
        "MB05-R980-5GD-A": "Essentials",
        "MBA1-R980-5GD-A": "Advanced",
        "MBA3-R980-5GD-A": "Advanced",
        "MBA5-R980-5GD-A": "Advanced",
        "TC03-R980-5GD-A": "Essentials",
        "TC05-R980-5GD-A": "Essentials",
        "TCA3-R980-5GD-A": "Advanced",
        "TCA5-R980-5GD-A": "Advanced",
        "MAX1-0980-5GD-XE": "Essentials",
        "MAX3-0980-5GD-XE": "Essentials",
        "MAX5-0980-5GD-XE": "Essentials",
        "BF01-30005GB-GN": "Essentials",
        "BF03-30005GB-GN": "Essentials",
        "BF05-30005GB-GN": "Essentials",
        "BL01-E400-5GE-AM-N": "Essentials",
        "BL03-E400-5GE-AM-N": "Essentials",
        "BL05-E400-5GE-AM-N": "Essentials",
        "BL01-E400-5GE-GL-M": "Essentials",
        "BL03-E400-5GE-GL-M": "Essentials",
        "BL05-E400-5GE-GL-M": "Essentials",
        "BLA1-E400-5GE-GL-M": "Advanced",
        "BLA3-E400-5GE-GL-M": "Advanced",
        "BLA5-E400-5GE-GL-M": "Advanced"
    };

    if (skuPlanMapping[partNumber]) return skuPlanMapping[partNumber];

    if (description.includes("advanced plan") || description.includes("premium") || description.includes("advanced")) return "Advanced";
    if (description.includes("essentials plan") || description.includes("essentials")) return "Essentials";

    const advancedPrefixes = ['BLA', 'MBA', 'TCA', 'BFA'];
    const essentialsPrefixes = ['BL0', 'MB0', 'TC0', 'BF0', 'MAX'];

    if (advancedPrefixes.some(prefix => partNumber.startsWith(prefix))) return "Advanced";
    if (essentialsPrefixes.some(prefix => partNumber.startsWith(prefix))) return "Essentials";

    return "Standard";
};

const getTermInYears = (row: SkuRow): number | null => {
    const description = row["Short Description"] || "";
    const partNumber = (row.PartNumber || "").toUpperCase();
    const match = description.match(/(\d+)-yr/i) || partNumber.match(/(1|3|5)/);
    if (match && match[1]) {
        const term = parseInt(match[1], 10);
        if ([1, 3, 5].includes(term)) return term;
    }
    const warranty = parseInt(row["Warranty"]);
    if (!isNaN(warranty) && [1, 3, 5].includes(warranty)) return warranty;
    return null;
};

const Ericsson: React.FC = () => {
    const styles = useStyles();
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
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [activeSheet, setActiveSheet] = useState<string>('');
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [allSheetsData, setAllSheetsData] = useState<{ [sheetName: string]: EnrichedSkuRow[] }>({});
    const [filteredAllData, setFilteredAllData] = useState<EnrichedSkuRow[]>([]);
    const [sidePanelModel, setSidePanelModel] = useState<string | undefined>();
    const [sidePanelPlanType, setSidePanelPlanType] = useState<string | undefined>();
    const [sidePanelTerm, setSidePanelTerm] = useState<number | undefined>();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const handleCloseNotification = () => setNotification((prev) => ({ ...prev, open: false }));
    const showNotification = (message: string, severity: Notification["severity"]) => setNotification({ open: true, message, severity });

    const resetAllSelections = (showNotif: boolean = false) => {
        setSelectedProductType(undefined);
        setSelectedCategoryType(undefined);
        setSelectedModel(undefined);
        setSelectedPlanType(undefined);
        setSelectedTerm(undefined);
        setAvailableCategoryTypes([]);
        setAvailableModels([]);
        setAvailablePlanTypes([]);
        setAvailableTerms([]);
        setSearchResults([]);
        setSearchText("");
        setSidePanelModel(undefined);
        setSidePanelPlanType(undefined);
        setSidePanelTerm(undefined);
        if (showNotif) showNotification("All filters cleared", "info");
    };

    useEffect(() => {
        getSheetNames().then((names) => {
            console.log("Loaded sheet names:", names);
            setSheetNames(names);
            if (names.length > 0) {
                setActiveSheet(names[0]);
            }
        });
    }, []);

    const handleSheetChange = (_event: React.SyntheticEvent, newValue: string) => {
        setActiveSheet(newValue);
        resetAllSelections();
        Excel.run(async (context) => {
            try {
                const sheet = context.workbook.worksheets.getItem(newValue);
                sheet.activate();
                await context.sync();
            } catch (error) {
                console.error("Error switching sheets:", error);
                showNotification(`Could not find sheet named "${newValue}"`, "error");
            }
        }).catch(error => console.error(error));
    };

    useEffect(() => {
        if (activeSheet) {
            loadExcelData(activeSheet)
                .then(({ workbookData }) => {
                    const enriched = workbookData.map(
                        (row): EnrichedSkuRow => {
                            const enrichedRow = {
                                ...row,
                                productType: getProductType(row),
                                categoryType: getCategoryType(row),
                                routerModel: getRouterModel(row),
                                planType: getPlanType(row),
                                termInYears: getTermInYears(row),
                                sheetName: activeSheet
                            };
                            console.log(`Enriched row from ${activeSheet}:`, enrichedRow);
                            return enrichedRow;
                        }
                    );
                    setEnrichedData(enriched);
                    showNotification(`Data from ${activeSheet} loaded successfully`, "success");
                })
                .catch((err) => {
                    console.error(`Error loading Excel data from ${activeSheet}:`, err);
                    showNotification(`Failed to load data from ${activeSheet}. Please check the sheet.`, "error");
                });
        }
    }, [activeSheet]);

    useEffect(() => {
        if (sheetNames.length > 0) {
            const loadAllData = async () => {
                const allData: { [sheetName: string]: EnrichedSkuRow[] } = {};
                for (const name of sheetNames) {
                    try {
                        const { workbookData } = await loadExcelData(name);
                        const enriched = workbookData.map(
                            (row): EnrichedSkuRow => {
                                const enrichedRow = {
                                    ...row,
                                    productType: getProductType(row),
                                    categoryType: getCategoryType(row),
                                    routerModel: getRouterModel(row),
                                    planType: getPlanType(row),
                                    termInYears: getTermInYears(row),
                                    sheetName: name
                                };
                                console.log(`Enriched row from ${name}:`, enrichedRow);
                                return enrichedRow;
                            }
                        );
                        allData[name] = enriched;
                    } catch (err) {
                        console.error(`Error loading data from sheet ${name}:`, err);
                    }
                }
                setAllSheetsData(allData);
                const flattened = Object.values(allData).flat();
                setFilteredAllData(flattened.filter(row => row.categoryType === "Routers"));
                showNotification("Data loaded from all sheets", "success");
            };
            loadAllData();
        }
    }, [sheetNames]);

    const handleProductTypeSelect = (event: SelectChangeEvent<string>) => {
        const type = event.target.value as string;
        resetAllSelections();
        setSelectedProductType(type);

        if (type === "Hardware and Licenses") {
            setAvailableCategoryTypes(["Routers", "Adapters", "Virtual Appliances", "LAN Switches", "Access Points"]);
        } else if (type === "Renewal") {
            const nextOptions = enrichedData.filter((r) => r.productType === type);
            const uniqueCategoryTypes = Array.from(new Set(nextOptions.map((r) => r.categoryType))).filter((ct) => ct && ct !== "Other Renewals").sort();
            setAvailableCategoryTypes(uniqueCategoryTypes);
        } else if (type === "Accessories") {
            setAvailableCategoryTypes(["Modems", "Expansion Modules", "Security", "Antenna", "PoE Injector", "Power Supply", "Cables & Adapters", "Mounting Brackets", "Battery"]);
        }
        showNotification(`Selected product type: ${type}`, "info");
    };

    const handleCategoryTypeSelect = (event: SelectChangeEvent<string>) => {
        const type = event.target.value as string;
        setSelectedCategoryType(type);
        setSelectedModel(undefined);
        setSelectedPlanType(undefined);
        setSelectedTerm(undefined);
        setSearchResults([]);
        setAvailablePlanTypes([]);
        setAvailableTerms([]);

        const nextOptions = enrichedData.filter((r) => r.productType === selectedProductType && r.categoryType === type);
        const uniqueModels = Array.from(new Set(nextOptions.map((r) => r.routerModel))).filter(Boolean).sort();
        setAvailableModels(uniqueModels);

        if (uniqueModels.length === 0) showNotification(`No models available for ${type}`, "warning");
        else showNotification(`Selected category: ${type}`, "info");
    };

    const handleModelSelect = (event: SelectChangeEvent<string>) => {
        const model = event.target.value as string;
        setSelectedModel(model);
        setSelectedPlanType(undefined);
        setSelectedTerm(undefined);

        const initialResults = enrichedData.filter((r) => r.productType === selectedProductType && r.categoryType === selectedCategoryType && r.routerModel === model);
        setSearchResults(initialResults);

        if (selectedCategoryType === "Routers" || selectedCategoryType === "Adapters" || selectedProductType === "Renewal") {
            const plansInResults = new Set(initialResults.map((r) => r.planType));
            const dynamicPlans: string[] = Array.from(plansInResults).filter((p) => p === "Essentials" || p === "Advanced");
            setAvailablePlanTypes(dynamicPlans.sort());
        } else {
            setAvailablePlanTypes([]);
            const uniqueTerms = Array.from(new Set(initialResults.map((r) => r.termInYears).filter((t): t is number => t !== null))).sort((a, b) => a - b);
            setAvailableTerms(uniqueTerms);
        }

        if (initialResults.length > 0) showNotification(`Found ${initialResults.length} results for model ${model}`, "success");
        else showNotification(`No results found for model ${model}.`, "warning");
    };

    const handlePlanTypeSelect = (event: SelectChangeEvent<string>) => {
        if (!(selectedCategoryType === "Routers" || selectedCategoryType === "Adapters" || selectedProductType === "Renewal")) return;
        const planFilter = event.target.value as string;
        setSelectedPlanType(planFilter);
        setSelectedTerm(undefined);

        const planFilteredResults = enrichedData.filter((r) => r.productType === selectedProductType && r.categoryType === selectedCategoryType && r.routerModel === selectedModel && r.planType === planFilter);
        setSearchResults(planFilteredResults);

        const uniqueTerms = Array.from(new Set(planFilteredResults.map((r) => r.termInYears).filter((t): t is number => t !== null))).sort((a, b) => a - b);
        setAvailableTerms(uniqueTerms);

        if (planFilteredResults.length > 0) showNotification(`Found ${planFilteredResults.length} results for plan ${planFilter}`, "success");
        else showNotification(`No results found for plan ${planFilter}`, "warning");
    };

    const handleTermSelect = (event: SelectChangeEvent<string>) => {
        const term = parseInt(event.target.value as string, 10);
        setSelectedTerm(term);

        const finalResults = enrichedData.filter((r) => r.productType === selectedProductType && r.categoryType === selectedCategoryType && r.routerModel === selectedModel && r.termInYears === term && (selectedCategoryType === "Routers" || selectedCategoryType === "Adapters" || selectedProductType === "Renewal" ? r.planType === selectedPlanType : true));
        setSearchResults(finalResults);

        if (finalResults.length > 0) showNotification(`Found ${finalResults.length} results for ${term}-year term`, "success");
        else showNotification(`No results found for ${term}-year term`, "warning");
    };

    const handleSidePanelModelSelect = (event: SelectChangeEvent<string>) => {
        const model = event.target.value as string;
        setSidePanelModel(model);
        setSidePanelPlanType(undefined);
        setSidePanelTerm(undefined);

        let filtered = Object.values(allSheetsData).flat().filter((r) => r.categoryType === "Routers" && r.routerModel === model);
        setFilteredAllData(filtered);

        const plansInResults = new Set(filtered.map((r) => r.planType));
        const dynamicPlans: string[] = Array.from(plansInResults).filter((p) => p === "Essentials" || p === "Advanced");
        setAvailablePlanTypes(dynamicPlans.sort());
        setAvailableTerms([]);

        if (filtered.length > 0) showNotification(`Found ${filtered.length} routers for model ${model} across all regions`, "success");
        else showNotification(`No routers found for model ${model} across all regions`, "warning");
    };

    const handleClearCategory = () => {
        if (!selectedProductType) return;
        setSelectedCategoryType(undefined);
        setSelectedModel(undefined);
        setSelectedPlanType(undefined);
        setSelectedTerm(undefined);
        setAvailableModels([]);
        setAvailablePlanTypes([]);
        setAvailableTerms([]);
        setSearchResults([]);
        showNotification("Category filter cleared", "info");
    };

    const handleClearModel = () => {
        if (!selectedCategoryType) return;
        setSelectedModel(undefined);
        setSelectedPlanType(undefined);
        setSelectedTerm(undefined);
        setAvailablePlanTypes([]);
        setAvailableTerms([]);
        setSearchResults([]);
        const nextOptions = enrichedData.filter((r) => r.productType === selectedProductType && r.categoryType === selectedCategoryType);
        const uniqueModels = Array.from(new Set(nextOptions.map((r) => r.routerModel))).filter(Boolean).sort();
        setAvailableModels(uniqueModels);
        showNotification("Model filter cleared", "info");
    };

    const handleClearPlan = () => {
        if (!selectedModel) return;
        setSelectedPlanType(undefined);
        setSelectedTerm(undefined);
        const initialResults = enrichedData.filter((r) => r.productType === selectedProductType && r.categoryType === selectedCategoryType && r.routerModel === selectedModel);
        setSearchResults(initialResults);
        const plansInResults = new Set(initialResults.map((r) => r.planType));
        const dynamicPlans: string[] = Array.from(plansInResults).filter((p) => p === "Essentials" || p === "Advanced");
        setAvailablePlanTypes(dynamicPlans.sort());
        setAvailableTerms([]);
        showNotification("Plan filter cleared", "info");
    };

    const handleClearTerm = () => {
        if ((selectedCategoryType === "Routers" || selectedCategoryType === "Adapters" || selectedProductType === "Renewal" ? !selectedPlanType : !selectedModel) || !selectedCategoryType) return;
        setSelectedTerm(undefined);
        const baseResults = enrichedData.filter((r) => r.productType === selectedProductType && r.categoryType === selectedCategoryType && r.routerModel === selectedModel && (selectedCategoryType === "Routers" || selectedCategoryType === "Adapters" || selectedProductType === "Renewal" ? r.planType === selectedPlanType : true));
        setSearchResults(baseResults);
        const uniqueTerms = Array.from(new Set(baseResults.map((r) => r.termInYears).filter((t): t is number => t !== null))).sort((a, b) => a - b);
        setAvailableTerms(uniqueTerms);
        showNotification("Term filter cleared", "info");
    };

    const handleClearSidePanelFilters = () => {
        setSidePanelModel(undefined);
        setSidePanelPlanType(undefined);
        setSidePanelTerm(undefined);
        const filtered = Object.values(allSheetsData).flat().filter((r) => r.categoryType === "Routers");
        setFilteredAllData(filtered);
        setAvailablePlanTypes([]);
        setAvailableTerms([]);
        showNotification("Side panel filters cleared", "info");
    };

    const handleTextSearch = () => {
        if (!searchText.trim()) {
            showNotification("Please enter a search term", "warning");
            return;
        }
        resetAllSelections();
        const filtered = enrichedData.filter((r) => r.productFamily.toLowerCase().includes(searchText.trim().toLowerCase()) || r.PartNumber.toLowerCase().includes(searchText.trim().toLowerCase()) || r["Short Description"].toLowerCase().includes(searchText.trim().toLowerCase()));
        setSearchResults(filtered);
        if (filtered.length > 0) showNotification(`Found ${filtered.length} results for "${searchText}"`, "success");
        else showNotification(`No results found for "${searchText}"`, "warning");
    };

    const renderSkuCards = (data: EnrichedSkuRow[]) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#323130", mb: 0, mt: "20px" }}>
                {TEXT.heading2}
            </Typography>
            {data.map((sku, idx) => (
                <Card key={`${sku.PartNumber}-${idx}`} sx={{ bgcolor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "20px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease", "&:hover": { bgcolor: "#f9fafb", transform: "scale(1.03)", boxShadow: "0 6px 12px rgba(0,0,0,0.05)" } }}>
                    <CardContent sx={{ paddingBottom: "0px !important", padding: "0px !important" }}>
                        <Typography variant="h6" sx={{ color: "#004328", textAlign: "center", fontWeight: "bold" }}>{sku.routerModel}</Typography>
                        <Typography sx={{ mt: 1.5 }}><strong>Part Number:</strong> {sku.PartNumber}</Typography>
                        <Typography><strong>Retail Price:</strong> ${sku["MSRP / \nRetail Price"]}</Typography>
                        <Typography><strong>Short Description:</strong> {sku["Short Description"]}</Typography>
                        <Typography><strong>Region:</strong> {sku.sheetName}</Typography>
                        <Typography><strong>Plan Type:</strong> {sku.planType}</Typography>
                        <Typography><strong>Term:</strong> {sku.termInYears} Year(s)</Typography>
                        <Box sx={{ textAlign: "center", mt: 2 }}>
                            <Button variant="contained" sx={{ bgcolor: "#004328", "&:hover": { bgcolor: "#003020" }, color: "#fff" }} onClick={() => { setActiveSku(sku); setIsModalOpen(true); showNotification(`Viewing details for ${sku.routerModel}`, "info"); }}>View More</Button>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );

    return (
        <Box sx={{ p: 2 }} className={styles.root}>
            <Box sx={{ textAlign: "center", mt: 4 }}><img src={require("../../../../../assets/Icon.png")} width={200} alt="Company Logo"/></Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', mt: 2 }}>
                <Tabs
                    value={activeSheet}
                    onChange={handleSheetChange}
                    variant={isSmallScreen ? "scrollable" : "fullWidth"}
                    scrollButtons={isSmallScreen ? "auto" : false}
                    allowScrollButtonsMobile
                    aria-label="sheet selection tabs"
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
                    {sheetNames.map((name) => (
                        <Tab key={name} label={name} value={name} />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ mt: 4, p: 2.5, bgcolor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: "#1f2937", fontWeight: 600 }}>{`Select & Search Product Family From ${activeSheet}`}</Typography>
                    <Box><IconButton onClick={() => resetAllSelections(true)} sx={{ p: 1 }}><Refresh /></IconButton></Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <TextField placeholder={TEXT.searchPlaceholder} value={searchText} onChange={(e) => setSearchText(e.target.value)} sx={{ flex: 1 }} size="small" />
                    <IconButton onClick={handleTextSearch} sx={{ p: 1 }}><Search /></IconButton>
                </Box>

                <Box sx={{ textAlign: "center", my: 1, color: "#6b7280" }}>OR</Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <FormControl size="small">
                        <InputLabel>1. Select Product Type</InputLabel>
                        <Select value={selectedProductType || ""} onChange={handleProductTypeSelect} label="1. Select Product Type">
                            {["Hardware and Licenses", "Accessories", "Renewal"].map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FormControl size="small" sx={{ flex: 1 }} disabled={!selectedProductType}>
                            <InputLabel>2. Select Category</InputLabel>
                            <Select value={selectedCategoryType || ""} onChange={handleCategoryTypeSelect} label="2. Select Category">
                                {availableCategoryTypes.map((ct) => (<MenuItem key={ct} value={ct}>{ct}</MenuItem>))}
                            </Select>
                        </FormControl>
                        {selectedCategoryType && (<IconButton onClick={handleClearCategory} title="Clear category filter"><Clear /></IconButton>)}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FormControl size="small" sx={{ flex: 1 }} disabled={!selectedCategoryType}>
                            <InputLabel>3. Select Model</InputLabel>
                            <Select value={selectedModel || ""} onChange={handleModelSelect} label="3. Select Model">
                                {availableModels.map((m) => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
                            </Select>
                        </FormControl>
                        {selectedModel && (<IconButton onClick={handleClearModel} title="Clear model filter"><Clear /></IconButton>)}
                    </Box>

                    {(selectedCategoryType === "Routers" || selectedCategoryType === "Adapters" || selectedProductType === "Renewal") && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <FormControl size="small" sx={{ flex: 1 }} disabled={!selectedModel || availablePlanTypes.length === 0}>
                                <InputLabel>4. Select Plan</InputLabel>
                                <Select value={selectedPlanType || ""} onChange={handlePlanTypeSelect} label="4. Select Plan">
                                    {availablePlanTypes.map((pt) => (<MenuItem key={pt} value={pt}>{pt}</MenuItem>))}
                                </Select>
                            </FormControl>
                            {selectedPlanType && (<IconButton onClick={handleClearPlan} title="Clear plan filter"><Clear /></IconButton>)}
                        </Box>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FormControl size="small" sx={{ flex: 1 }} disabled={selectedCategoryType === "Routers" || selectedCategoryType === "Adapters" || selectedProductType === "Renewal" ? !selectedPlanType : !selectedModel}>
                            <InputLabel>5. Select Term</InputLabel>
                            <Select value={selectedTerm ? `${selectedTerm}` : ""} onChange={handleTermSelect} label="5. Select Term">
                                {availableTerms.map((t) => (<MenuItem key={t} value={t}>{`${t} Year(s)`}</MenuItem>))}
                            </Select>
                        </FormControl>
                        {selectedTerm && (<IconButton onClick={handleClearTerm} title="Clear term filter"><Clear /></IconButton>)}
                    </Box>
                </Box>
            </Box>

            {searchResults.length > 0 && renderSkuCards(searchResults)}

            {isModalOpen && activeSku && (
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <DialogTitle>
                        <Typography variant="h6" textAlign="center">
                            <span style={{ fontWeight: 600 }}>Details for: </span>
                            <span style={{ fontWeight: 700 }}>{activeSku.routerModel}</span>
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, padding: "33px", paddingBottom: "0" }}>
                        {activeSku["MSRP / \nRetail Price"] && (
                            <Typography sx={{ color: "#374151" }}>
                                <strong>Retail Price:</strong> ${activeSku["MSRP / \nRetail Price"]}
                            </Typography>
                        )}
                        {activeSku.productType && (
                            <Typography sx={{ color: "#374151" }}>
                                <strong>Product Type:</strong> {activeSku.productType}
                            </Typography>
                        )}
                        {activeSku.categoryType && (
                            <Typography sx={{ color: "#374151" }}>
                                <strong>Category Type:</strong> {activeSku.categoryType}
                            </Typography>
                        )}
                        {activeSku.planType && (
                            <Typography sx={{ color: "#374151" }}>
                                <strong>Plan Type:</strong> {activeSku.planType}
                            </Typography>
                        )}
                        {activeSku.termInYears && (
                            <Typography sx={{ color: "#374151" }}>
                                <strong>Term:</strong> {activeSku.termInYears} Year(s)
                            </Typography>
                        )}
                        {activeSku.sheetName && (
                            <Typography sx={{ color: "#374151" }}>
                                <strong>Region:</strong> {activeSku.sheetName}
                            </Typography>
                        )}
                        {activeSku["Country of Origin"] && (
                            <Typography sx={{ color: "#374151" }}>
                                <strong>Country of Origin:</strong> {activeSku["Country of Origin"]}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ padding: "25px" }}>
                        <Button fullWidth variant="contained" sx={{ bgcolor: "#004328", "&:hover": { bgcolor: "#003020" }, color: "#fff" }} onClick={() => { setIsModalOpen(false); showNotification("Details dialog closed", "info"); }}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}

            <Snackbar open={notification.open} autoHideDuration={3000} onClose={handleCloseNotification} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Ericsson;