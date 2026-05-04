/**
 * Document Route Utilities
 * Maps action types to their corresponding detail page routes
 */

/**
 * Get detail page URL based on action type and document ID
 * 
 * @param actionType - The type of action/document (e.g., "Allocation", "Cấp phát", "Rental")
 * @param refId - The document reference ID
 * @returns The URL path to the document detail page
 * 
 * @example
 * getDocumentDetailUrl("Allocation", 123) // returns "/allocation-recovery?tab=allocation&id=123"
 * getDocumentDetailUrl("Cấp phát", 123) // returns "/allocation-recovery?tab=allocation&id=123"
 * getDocumentDetailUrl("Rental", 456) // returns "/rentals/456"
 */
export const getDocumentDetailUrl = (actionType: string, refId: number): string => {
    if (!actionType || !refId) return "#";

    const actionTypeLower = actionType.toLowerCase().trim();

    // Map action types to routes (supports both English and Vietnamese)
    const routeMap: Record<string, string> = {
        // Allocation & Recovery
        // allocation: `/allocation-recovery?tab=allocation&id=${refId}`,
        // "cấp phát": `/allocation-recovery?tab=allocation&id=${refId}`,
        // recovery: `/allocation-recovery?tab=recovery&id=${refId}`,
        // "thu hồi": `/allocation-recovery?tab=recovery&id=${refId}`,

        // Stock In/Out
        "stock in": `/stock-in-out/${refId}`,
        "nhập kho": `/stock-in-out/${refId}`,
        "stock out": `/stock-in-out/${refId}`,
        "xuất kho": `/stock-in-out/${refId}`,
        "stock_in": `/stock-in-out/${refId}`,
        "stock_out": `/stock-in-out/${refId}`,
        "adjustment": `/stock-in-out/${refId}`,
        "điều chỉnh": `/stock-in-out/${refId}`,

        // Rentals
        rental: `/rentals/${refId}`,
        "cho thuê": `/rentals/${refId}`,
        "rental return": `/rentals/returns/${refId}`,
        "trả thuê": `/rentals/returns/${refId}`,
        "rental_return": `/rentals/returns/${refId}`,
        "return": `/rentals/returns/${refId}`,
        "hoàn trả tài sản thuê": `/rentals/returns/${refId}`,

        // Transfers
        transfer: `/transfers/${refId}`,
        "điều chuyển": `/transfers/${refId}`,
        "chuyển kho": `/transfers/${refId}`,

        // Maintenance
        maintenance: `/maintenance/${refId}`,
        "bảo trì": `/maintenance/${refId}`,
        "bảo dưỡng": `/maintenance/${refId}`,
        "sửa chữa": `/maintenance/${refId}`,

        // Liquidation
        liquidation: `/liquidations/${refId}`,
        "thanh lý": `/liquidations/${refId}`,
        "disposal": `/liquidations/${refId}`,
    };

    // Try exact match first
    if (routeMap[actionTypeLower]) {
        return routeMap[actionTypeLower];
    }

    // Try partial match (for cases like "Stock In - Nhập kho")
    for (const [key, url] of Object.entries(routeMap)) {
        if (actionTypeLower.includes(key) || key.includes(actionTypeLower)) {
            return url;
        }
    }

    // Default fallback - return # to prevent navigation
    return "#";
};

/**
 * Check if a document type has a detail page
 * 
 * @param actionType - The type of action/document
 * @returns true if the document has a detail page, false otherwise
 */
export const hasDocumentDetailPage = (actionType: string): boolean => {
    if (!actionType) return false;
    return getDocumentDetailUrl(actionType, 1) !== "#";
};

/**
 * Get the base route for a document type (without ID)
 * 
 * @param actionType - The type of action/document
 * @returns The base route path
 */
export const getDocumentBaseRoute = (actionType: string): string => {
    const urlWithId = getDocumentDetailUrl(actionType, 0);
    if (urlWithId === "#") return "#";

    // Remove the ID part from the URL
    return urlWithId.replace(/\/0$/, "").replace(/id=0/, "").replace(/\?$/, "");
};
