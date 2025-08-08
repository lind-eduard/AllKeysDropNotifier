export async function fetchPricesFromPage(link) {
    try {
        const response = await fetch(link);
        const contentType = response.headers.get("Content-Type");
        let data;

        if (contentType && contentType.includes("text/html")) {
            data = await response.text();
        } else if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.blob();
        }

        if (typeof data === "string") {
            const pricesMatch = data.match(/"prices"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/);
            if (pricesMatch && pricesMatch[1]) {
                try {
                    return JSON.parse(pricesMatch[1]);
                } catch (err) {
                    console.error("Error parsing prices:", err);
                    return null;
                }
            } else {
                console.log("No prices array found.", data);
                return null;
            }
        } else {
            console.log("Response is not HTML, cannot extract prices.");
            return null;
        }
    } catch (err) {
        console.error("Fetch error:", err);
        return null;
    }
}

// Example usage:
// fetchPricesFromPage("https://www.allkeyshop.com/blog/buy-dying-light-2-cd-key-compare-prices/").then(prices => console.log(prices));