import { Product, ProductPayload, ProductStatus } from "../../../../../app/api/productApi";

export interface ProductFormState {
  basicInfo: {
    code: string;
    name: string;
    otherLanguage: string;
    taxId: string;
    status: ProductStatus;
  };
  pricingAndRates: {
    profitPercentage: string;
    purchaseRate: string;
    cost: string;
    salesRate: string;
    normalRate: string;
    mrp: string;
    wholesaleRate: string;
  };
  stockAndMeasurement: {
    hsn: string;
    baseUomId: string;
    purchaseUomId: string;
    salesUomId: string;
    stockUomId: string;
    minimumStock: string;
    maximumStock: string;
    reOrderLevel: string;
    reOrderQuantity: string;
  };
  generalSettings: {
    inactive: boolean;
    lessProfit: boolean;
    counterItem: boolean;
    autoEntry: boolean;
    hideFromDevice: boolean;
    expiryDays: string;
    taxInclusive: boolean;
    serialNo: boolean;
  };
  categorization: {
    groupCategoryId: string;
    subGroupCategoryId: string;
    vendorId: string;
    brand: string;
  };
  additionalDetails: {
    packUnit: string;
    additionPercentage: string;
    addition: string;
    company: string;
    warehouseStock: string;
    document: string;
    barcode: string;
    purchaseHistory: string;
    salesHistory: string;
    companyStock: string;
  };
  openingStock: {
    quantity: string;
    asOfDate: string;
  };
}

const toStringOrEmpty = (value: number | null | undefined) => (value ?? "") === "" ? "" : String(value);

export const createProductFormState = (product?: Product | null): ProductFormState => ({
  basicInfo: {
    code: product?.basicInfo.code ?? "",
    name: product?.basicInfo.name ?? "",
    otherLanguage: product?.basicInfo.otherLanguage ?? "",
    taxId: product?.basicInfo.taxId ?? "",
    status: product?.status ?? "Active",
  },
  pricingAndRates: {
    profitPercentage: toStringOrEmpty(product?.pricingAndRates.profitPercentage),
    purchaseRate: toStringOrEmpty(product?.pricingAndRates.purchaseRate),
    cost: toStringOrEmpty(product?.pricingAndRates.cost),
    salesRate: toStringOrEmpty(product?.pricingAndRates.salesRate),
    normalRate: toStringOrEmpty(product?.pricingAndRates.normalRate),
    mrp: toStringOrEmpty(product?.pricingAndRates.mrp),
    wholesaleRate: toStringOrEmpty(product?.pricingAndRates.wholesaleRate),
  },
  stockAndMeasurement: {
    hsn: product?.stockAndMeasurement.hsn ?? "",
    baseUomId: product?.stockAndMeasurement.baseUomId ?? "",
    purchaseUomId: product?.stockAndMeasurement.purchaseUomId ?? "",
    salesUomId: product?.stockAndMeasurement.salesUomId ?? "",
    stockUomId: product?.stockAndMeasurement.stockUomId ?? "",
    minimumStock: toStringOrEmpty(product?.stockAndMeasurement.minimumStock),
    maximumStock: toStringOrEmpty(product?.stockAndMeasurement.maximumStock),
    reOrderLevel: toStringOrEmpty(product?.stockAndMeasurement.reOrderLevel),
    reOrderQuantity: toStringOrEmpty(product?.stockAndMeasurement.reOrderQuantity),
  },
  generalSettings: {
    inactive: product?.properties.generalSettings.inactive ?? false,
    lessProfit: product?.properties.generalSettings.lessProfit ?? false,
    counterItem: product?.properties.generalSettings.counterItem ?? false,
    autoEntry: product?.properties.generalSettings.autoEntry ?? false,
    hideFromDevice: product?.properties.generalSettings.hideFromDevice ?? false,
    expiryDays: String(product?.properties.generalSettings.expiryDays ?? 0),
    taxInclusive: product?.properties.generalSettings.taxInclusive ?? false,
    serialNo: product?.properties.generalSettings.serialNo ?? false,
  },
  categorization: {
    groupCategoryId: product?.properties.categorization.groupCategoryId ?? "",
    subGroupCategoryId: product?.properties.categorization.subGroupCategoryId ?? "",
    vendorId: product?.properties.categorization.vendorId ?? "",
    brand: product?.properties.categorization.brand ?? "",
  },
  additionalDetails: {
    packUnit: toStringOrEmpty(product?.additionalDetails.packUnit),
    additionPercentage: toStringOrEmpty(product?.additionalDetails.additionPercentage),
    addition: toStringOrEmpty(product?.additionalDetails.addition),
    company: product?.additionalDetails.company ?? "",
    warehouseStock: product?.additionalDetails.warehouseStock ?? "",
    document: product?.additionalDetails.document ?? "",
    barcode: product?.additionalDetails.barcode ?? "",
    purchaseHistory: product?.additionalDetails.purchaseHistory ?? "",
    salesHistory: product?.additionalDetails.salesHistory ?? "",
    companyStock: product?.additionalDetails.companyStock ?? "",
  },
  openingStock: {
    quantity: toStringOrEmpty(product?.openingStock?.quantity),
    asOfDate: product?.openingStock?.asOfDate ?? "",
  },
});

const numberOrNull = (value: string) => (value.trim() ? Number(value) : null);

export const toProductPayload = (state: ProductFormState): ProductPayload => ({
  basicInfo: {
    code: state.basicInfo.code.trim().toUpperCase(),
    name: state.basicInfo.name.trim(),
    otherLanguage: state.basicInfo.otherLanguage.trim() || null,
    taxId: state.basicInfo.taxId || null,
  },
  pricingAndRates: {
    profitPercentage: numberOrNull(state.pricingAndRates.profitPercentage),
    purchaseRate: numberOrNull(state.pricingAndRates.purchaseRate),
    cost: numberOrNull(state.pricingAndRates.cost),
    salesRate: numberOrNull(state.pricingAndRates.salesRate),
    normalRate: numberOrNull(state.pricingAndRates.normalRate),
    mrp: numberOrNull(state.pricingAndRates.mrp),
    wholesaleRate: numberOrNull(state.pricingAndRates.wholesaleRate),
  },
  stockAndMeasurement: {
    hsn: state.stockAndMeasurement.hsn.trim() || null,
    baseUomId: state.stockAndMeasurement.baseUomId,
    purchaseUomId: state.stockAndMeasurement.purchaseUomId,
    salesUomId: state.stockAndMeasurement.salesUomId,
    stockUomId: state.stockAndMeasurement.stockUomId,
    minimumStock: numberOrNull(state.stockAndMeasurement.minimumStock),
    maximumStock: numberOrNull(state.stockAndMeasurement.maximumStock),
    reOrderLevel: numberOrNull(state.stockAndMeasurement.reOrderLevel),
    reOrderQuantity: numberOrNull(state.stockAndMeasurement.reOrderQuantity),
  },
  properties: {
    generalSettings: {
      inactive: state.generalSettings.inactive,
      lessProfit: state.generalSettings.lessProfit,
      counterItem: state.generalSettings.counterItem,
      autoEntry: state.generalSettings.autoEntry,
      hideFromDevice: state.generalSettings.hideFromDevice,
      expiryDays: Number(state.generalSettings.expiryDays || 0),
      taxInclusive: state.generalSettings.taxInclusive,
      serialNo: state.generalSettings.serialNo,
    },
    categorization: {
      groupCategoryId: state.categorization.groupCategoryId || null,
      subGroupCategoryId: state.categorization.subGroupCategoryId || null,
      vendorId: state.categorization.vendorId || null,
      brand: state.categorization.brand.trim() || null,
    },
  },
  additionalDetails: {
    packUnit: numberOrNull(state.additionalDetails.packUnit),
    additionPercentage: numberOrNull(state.additionalDetails.additionPercentage),
    addition: numberOrNull(state.additionalDetails.addition),
    company: state.additionalDetails.company.trim() || null,
    warehouseStock: state.additionalDetails.warehouseStock.trim() || null,
    document: state.additionalDetails.document.trim() || null,
    barcode: state.additionalDetails.barcode.trim() || null,
    purchaseHistory: state.additionalDetails.purchaseHistory.trim() || null,
    salesHistory: state.additionalDetails.salesHistory.trim() || null,
    companyStock: state.additionalDetails.companyStock.trim() || null,
  },
  status: state.basicInfo.status,
  openingStock: state.openingStock.quantity.trim() || state.openingStock.asOfDate
    ? {
        quantity: Number(state.openingStock.quantity),
        asOfDate: state.openingStock.asOfDate,
      }
    : null,
});
