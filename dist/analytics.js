"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_node_1 = __importDefault(require("analytics-node"));
const node_machine_id_1 = require("node-machine-id");
const analytics = new analytics_node_1.default("PldV2cAUZJxVfvgYDUPwyxH8NMGB6kNl");
class NaviAnalytics {
    sendAnalytics(event, properties) {
        return __awaiter(this, void 0, void 0, function* () {
            const analyticsData = {
                event,
                userId: yield this.getMachineId(),
            };
            if (properties) {
                analyticsData.properties = properties;
            }
            analytics.track(analyticsData);
        });
    }
    getMachineId() {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield (0, node_machine_id_1.machineId)();
            return id;
        });
    }
}
exports.default = NaviAnalytics;
//# sourceMappingURL=analytics.js.map