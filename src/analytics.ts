import Analytics from "analytics-node";
import {machineId} from "node-machine-id";

const analytics = new Analytics("PldV2cAUZJxVfvgYDUPwyxH8NMGB6kNl");

interface AnalyticsData {
  event: string;
  userId: string;
  properties?: any;
}

class NaviAnalytics {
  public async sendAnalytics(event: string, properties?: any) {
    const analyticsData: AnalyticsData = {
      event,
      userId: await this.getMachineId(),
    };
    if (properties) {
      analyticsData.properties = properties;
    }
    analytics.track(analyticsData);
  }

  public async sendPageView(page: string) {
    analytics.page({
      userId: await this.getMachineId(),
      category: "CLI",
      name: page,
    });
  }

  private async getMachineId() {
    const id = await machineId();
    return id;
  }
}

export default NaviAnalytics;
