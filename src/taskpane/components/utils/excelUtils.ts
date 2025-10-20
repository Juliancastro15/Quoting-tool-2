// import { SkuRow } from "./types";

// // UPDATED: The function now accepts a sheetName to load data from a specific sheet.
// export async function loadExcelData(sheetName: string): Promise<{
//   headers: string[];
//   workbookData: SkuRow[];
//   mainCategories: string[];
// }> {
//   return Excel.run(async (context) => {
//     try {
//         // UPDATED: Instead of getActiveWorksheet(), we get the sheet by its name.
//         const sheet = context.workbook.worksheets.getItem(sheetName);
//         const range = sheet.getUsedRange();
//         range.load("values");
//         await context.sync();

//         const values: any[][] = range.values;
//         if (!values || values.length <= 6) {
//           return { headers: [], workbookData: [], mainCategories: [] };
//         }

//         const headerRowIndex = 6;
//         const headers: string[] = values[headerRowIndex].map((cell) => (cell ? cell.toString().trim() : ""));
//         const dataRows = values.slice(headerRowIndex + 1);

//         let lastKnownSegment = "";
//         const allRows = dataRows.map((row) => {
//           const obj: any = {};
//           headers.forEach((h, i) => {
//             obj[h] = row[i] !== undefined && row[i] !== null ? row[i].toString() : "";
//           });

//           let currentSegment = (obj["Market Segment or Category"] || "").trim();
//           if (currentSegment) {
//             lastKnownSegment = currentSegment;
//           } else {
//             currentSegment = lastKnownSegment;
//           }

//           obj.marketSegment = currentSegment;
//           obj.productFamily = obj["Product Family"] || "";
//           return obj;
//         });

//         let currentMainCategory = "";
//         const enrichedRows = allRows.map((row) => {
//           const segment = row.marketSegment.trim();
//           const family = row.productFamily.trim();
//           const partNum = (row["PartNumber"] || "").trim();

//           if (segment && !family && (!partNum || partNum === "(blank)")) {
//             currentMainCategory = segment;
//           }

//           return { ...row, mainCategory: currentMainCategory };
//         });

//         const workbookData = enrichedRows.filter((row) => row.productFamily && row.PartNumber);

//         const uniqueMainCategories = Array.from(new Set(enrichedRows.map((r) => r.mainCategory).filter(Boolean)));

//         return {
//           headers,
//           workbookData: workbookData,
//           mainCategories: uniqueMainCategories,
//         };
//     } catch (error) {
//         console.error(`Error in loadExcelData for sheet: ${sheetName}`, error);
//         // On error, return empty arrays to prevent the app from crashing.
//         return { headers: [], workbookData: [], mainCategories: [] };
//     }
//   });
// }

import { SkuRow } from "./types";

/**
 * ✅ Get all worksheet names dynamically
 */
export async function getWorksheetNames(): Promise<string[]> {
  return Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;
    sheets.load("items/name");
    await context.sync();
    return sheets.items.map((s) => s.name);
  });
}

/**
 * ✅ Load Excel data from a specific sheet
 * Automatically detects header row and parses consistent structure
 */
export async function loadExcelData(sheetName: string): Promise<{
  headers: string[];
  workbookData: SkuRow[];
  mainCategories: string[];
}> {
  return Excel.run(async (context) => {
    try {
      const sheet = context.workbook.worksheets.getItem(sheetName);
      const range = sheet.getUsedRange();
      range.load("values");
      await context.sync();

      const values: any[][] = range.values;
      if (!values || values.length < 2) {
        console.warn(`⚠️ Sheet "${sheetName}" has no data.`);
        return { headers: [], workbookData: [], mainCategories: [] };
      }

      /**
       * ✅ Auto-detect header row
       * We look for the first row that contains "PartNumber" or "Product Family"
       */
      let headerRowIndex = values.findIndex((row) =>
        row.some((cell) => {
          const str = (cell || "").toString().toLowerCase();
          return (
            str.includes("part") ||
            str.includes("product family") ||
            str.includes("short description")
          );
        })
      );
      if (headerRowIndex === -1) headerRowIndex = 6; // fallback for old sheets

      const headers: string[] = values[headerRowIndex].map((cell) =>
        cell ? cell.toString().trim() : ""
      );

      const dataRows = values.slice(headerRowIndex + 1);

      let lastKnownSegment = "";
      const allRows = dataRows.map((row) => {
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] =
            row[i] !== undefined && row[i] !== null ? row[i].toString() : "";
        });

        let currentSegment = (obj["Market Segment or Category"] || "").trim();
        if (currentSegment) {
          lastKnownSegment = currentSegment;
        } else {
          currentSegment = lastKnownSegment;
        }

        obj.marketSegment = currentSegment;
        obj.productFamily = obj["Product Family"] || "";
        return obj;
      });

      let currentMainCategory = "";
      const enrichedRows = allRows.map((row) => {
        const segment = row.marketSegment?.trim() || "";
        const family = row.productFamily?.trim() || "";
        const partNum = (row["PartNumber"] || "").trim();

        if (segment && !family && (!partNum || partNum === "(blank)")) {
          currentMainCategory = segment;
        }

        return { ...row, mainCategory: currentMainCategory };
      });

      const workbookData = enrichedRows.filter(
        (row) => row.productFamily && row.PartNumber
      );

      const uniqueMainCategories = Array.from(
        new Set(enrichedRows.map((r) => r.mainCategory).filter(Boolean))
      );

      return {
        headers,
        workbookData,
        mainCategories: uniqueMainCategories,
      };
    } catch (error) {
      console.error(`❌ Error loading Excel data from sheet: ${sheetName}`, error);
      return { headers: [], workbookData: [], mainCategories: [] };
    }
  });
}
