import { AllocationDocument } from "./allocation";
import { StockAdjustmentDocument } from "./stock-adjustment";
import { RecoveryDocument } from "./recovery";

// ============================================
// UNIFIED DOCUMENT DETAIL TYPE
// ============================================

/**
 * Union type for all document types
 * Add more document types here as needed (e.g., Transfer, Maintenance, etc.)
 */
export type DocumentDetail =
    | AllocationDocument
    | StockAdjustmentDocument
    | RecoveryDocument;

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard to check if document is an Allocation
 */
export const isAllocationDocument = (
    doc: DocumentDetail,
): doc is AllocationDocument => {
    return (
        "allocated_to_name" in doc &&
        "allocation_date" in doc &&
        "allocated_to_type" in doc
    );
};

/**
 * Type guard to check if document is a Stock Adjustment
 */
export const isStockAdjustmentDocument = (
    doc: DocumentDetail,
): doc is StockAdjustmentDocument => {
    return (
        "adjustment_date" in doc &&
        "total_quantity" in doc &&
        !("allocated_to_name" in doc) &&
        !("recovery_date" in doc)
    );
};

/**
 * Type guard to check if document is a Recovery
 */
export const isRecoveryDocument = (
    doc: DocumentDetail,
): doc is RecoveryDocument => {
    return (
        "recovery_date" in doc &&
        "recovered_from_type" in doc &&
        "recovered_from_name" in doc
    );
};

// ============================================
// DOCUMENT TYPE ENUM
// ============================================

export enum DocumentType {
    ALLOCATION = "allocation",
    STOCK_IN = "stock_in",
    STOCK_OUT = "stock_out",
    RECOVERY = "recovery",
    TRANSFER = "transfer",
    MAINTENANCE = "maintenance",
    LIQUIDATION = "liquidation",
}

/**
 * Get document title based on document type
 */
export const getDocumentTitle = (documentType: string): string => {
    const titles: Record<string, string> = {
        allocation: "Allocation information",
        stock_in: "Stock in information",
        stock_out: "Stock out information",
        recovery: "Recovery information",
        transfer: "Transfer information",
        maintenance: "Maintenance information",
        liquidation: "Liquidation information",
    };

    return titles[documentType] || "Document information";
};
