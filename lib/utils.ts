import { PriceHistoryItem, Product } from "@/types";

const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

// Extracts and returns the price from a list of possible elements.
export function extractPrice(...elements: any) {
    for (const element of elements) {
        const priceText = element.text().trim();

        if (priceText) {
            const cleanPrice = priceText.replace(/[^\d.]/g, '');

            let firstPrice;

            if (cleanPrice) {
                firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
            }

            return firstPrice || cleanPrice;
        }
    }

    return '';
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element: any) {
    const currencyText = element.text().trim().slice(0, 1);
    return currencyText ? currencyText : "";
}

// Extracts description from two possible elements from amazon
export function extractDescription($: any) {
    // these are possible elements holding description of the product
    const selectors = [
        ".a-unordered-list .a-list-item",
        ".a-expander-content p",
        // Add more selectors here if needed
    ];

    for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
            const textContent = elements
                .map((_: any, element: any) => $(element).text().trim())
                .get()
                .join("\n");
            return textContent;
        }
    }

    // If no matching elements were found, return an empty string
    return "";
}

// Extracts and returns the rating from the Amazon rating element.
export function extractRating($: any) {
    const ratingElement = $('span[data-hook="rating-out-of-text"]');
    if (ratingElement.length > 0) {
        const ratingText = ratingElement.text().trim();
        // Extract only the numeric part of the rating
        const ratingMatch = ratingText.match(/(\d+\.\d+)/); // Matches patterns like "3.9"
        if (ratingMatch) {
            return parseFloat(ratingMatch[0]); // Convert to float
        }
    }
    return null; // Return null if no valid rating found
}

// Extracts and returns the total number of reviews from the Amazon review count element.
export function extractTotalReviews($: any) {
    // Possible selectors for total review count
    const selectors = [
        'span[data-hook="total-review-count"]',
        '.a-size-base .a-color-secondary' // Common secondary location for review count
    ];

    for (const selector of selectors) {
        const reviewCountElement = $(selector);
        if (reviewCountElement.length > 0) {
            const reviewText = reviewCountElement.text().trim();
            // Extract only the numeric part of the review count text
            const reviewCount = reviewText.replace(/[^0-9]/g, '');
            if (reviewCount) {
                return parseInt(reviewCount, 10); // Convert to integer
            }
        }
    }
    
    return null; // Return null if no valid review count found
}

export function getHighestPrice(priceList: PriceHistoryItem[]) {
    let highestPrice = priceList[0];

    for (let i = 0; i < priceList.length; i++) {
        if (priceList[i].price > highestPrice.price) {
            highestPrice = priceList[i];
        }
    }

    return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
    let lowestPrice = priceList[0];

    for (let i = 0; i < priceList.length; i++) {
        if (priceList[i].price < lowestPrice.price) {
            lowestPrice = priceList[i];
        }
    }

    return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
    const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
    const averagePrice = sumOfPrices / priceList.length || 0;

    return averagePrice;
}

export const getEmailNotifType = (
    scrapedProduct: Product,
    currentProduct: Product
) => {
    const lowestPrice = getLowestPrice(currentProduct.priceHistory);

    if (scrapedProduct.currentPrice < lowestPrice) {
        return Notification.LOWEST_PRICE as keyof typeof Notification;
    }
    if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
        return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
    }
    if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
        return Notification.THRESHOLD_MET as keyof typeof Notification;
    }

    return null;
};

export const formatNumber = (num: number = 0) => {
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};