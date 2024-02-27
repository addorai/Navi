import Analytics from "analytics-node";
import {v4 as uuidv4} from "uuid";
import fs from "fs";
import path from "path";

const analytics = new Analytics("PldV2cAUZJxVfvgYDUPwyxH8NMGB6kNl");

interface AnalyticsData {
  event: string;
  userId: string;
  properties?: any;
}

class NaviAnalytics {
  public sendAnalytics(event: string, properties?: any) {
    const analyticsData: AnalyticsData = {
      event,
      userId: this.getOrGenerateUserId(),
    };
    if (properties) {
      analyticsData.properties = properties;
    }
    analytics.track(analyticsData);
  }

  // Function to generate or retrieve user ID
  private getOrGenerateUserId(): string {
    const configFilePath = path.join(__dirname, "navi_analytics.txt");

    try {
      // Check if config file exists
      if (fs.existsSync(configFilePath)) {
        // If exists, read user ID from config file
        const userId = fs.readFileSync(configFilePath, "utf-8").trim();
        return userId;
      } else {
        // If config file doesn't exist, generate new user ID
        const userId = uuidv4();
        // Write user ID to config file for future use
        fs.writeFileSync(configFilePath, userId, "utf-8");
        return userId;
      }
    } catch (error) {
      console.error("Error:", error);
      return ""; // Return empty string if error occurs
    }
  }
}

export default NaviAnalytics;
