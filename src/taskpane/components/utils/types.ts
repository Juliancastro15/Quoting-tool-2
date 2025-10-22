export type SkuRow = {
  [key: string]: any;
  mainCategory: string;
  productFamily: string;
};


export type EnrichedSkuRow = SkuRow & {
  productType: "Hardware and Licenses" | "Accessories" | "Renewal" | "Other";
  categoryType: string;
  routerModel: string; 
  planType: string; 
  termInYears: number | null;
};

// Optional interfaces (not used in current implementation but provided for future use)
export interface SkuCardProps {
  sku: SkuRow;
  onViewMore: () => void;
};

export interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  sku: SkuRow;
  headers: string[];
};

export interface ProductFamilyDropdownProps {
  productFamilies: string[];
  selected: string | undefined;
  onChange: (value: string) => void;
};

export interface CheckedItems {
  branch: boolean;
  iot: boolean;
  mobile: boolean;
  essentials: boolean;
  advanced: boolean;
};