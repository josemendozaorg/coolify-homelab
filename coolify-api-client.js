"use strict";
/**
 * Coolify API Client
 * A TypeScript client for interacting with Coolify's REST API
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoolifyAPI = void 0;
exports.exampleCoolifyUsage = exampleCoolifyUsage;
var CoolifyAPI = /** @class */ (function () {
    function CoolifyAPI(config) {
        this.config = __assign({ timeout: 30000 }, config);
        this.headers = {
            'Authorization': "Bearer ".concat(this.config.apiToken),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    CoolifyAPI.prototype.request = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, options) {
            var url, config, response, location_1, text, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this.config.baseUrl, "/api/v1").concat(endpoint);
                        config = __assign(__assign({}, options), { headers: __assign(__assign({}, this.headers), options.headers) });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(url, config)];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            // Check if it's a Cloudflare Access redirect (common case)
                            if (response.status === 302) {
                                location_1 = response.headers.get('location');
                                if (location_1 && location_1.includes('cloudflareaccess.com')) {
                                    throw new Error("Cloudflare Access protection detected. API calls are being redirected to authentication. Please configure Cloudflare Access to allow API token access, or access Coolify from a different endpoint.");
                                }
                            }
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.text()];
                    case 3:
                        text = _a.sent();
                        // Check if response is HTML (common when hitting a web page instead of API)
                        if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
                            throw new Error('API returned HTML instead of JSON. Check if the API endpoint is correct and accessible.');
                        }
                        try {
                            return [2 /*return*/, JSON.parse(text)];
                        }
                        catch (parseError) {
                            throw new Error("Invalid JSON response: ".concat(text.substring(0, 100), "..."));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Coolify API Error [".concat(endpoint, "]:"), error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Projects
    CoolifyAPI.prototype.getProjects = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/projects')];
            });
        });
    };
    CoolifyAPI.prototype.getProject = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/projects/".concat(id))];
            });
        });
    };
    CoolifyAPI.prototype.createProject = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/projects', {
                        method: 'POST',
                        body: JSON.stringify(data)
                    })];
            });
        });
    };
    CoolifyAPI.prototype.updateProject = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/projects/".concat(id), {
                        method: 'PATCH',
                        body: JSON.stringify(data)
                    })];
            });
        });
    };
    CoolifyAPI.prototype.deleteProject = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request("/projects/".concat(id), { method: 'DELETE' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Environments
    CoolifyAPI.prototype.getEnvironments = function (projectId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/projects/".concat(projectId, "/environments"))];
            });
        });
    };
    CoolifyAPI.prototype.getEnvironment = function (projectId, envId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/projects/".concat(projectId, "/environments/").concat(envId))];
            });
        });
    };
    CoolifyAPI.prototype.createEnvironment = function (projectId, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/projects/".concat(projectId, "/environments"), {
                        method: 'POST',
                        body: JSON.stringify(data)
                    })];
            });
        });
    };
    // Applications
    CoolifyAPI.prototype.getApplications = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/applications')];
            });
        });
    };
    CoolifyAPI.prototype.getApplication = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/applications/".concat(id))];
            });
        });
    };
    CoolifyAPI.prototype.createApplication = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/applications', {
                        method: 'POST',
                        body: JSON.stringify(data)
                    })];
            });
        });
    };
    CoolifyAPI.prototype.updateApplication = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/applications/".concat(id), {
                        method: 'PATCH',
                        body: JSON.stringify(data)
                    })];
            });
        });
    };
    CoolifyAPI.prototype.deleteApplication = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request("/applications/".concat(id), { method: 'DELETE' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Application Deployments
    CoolifyAPI.prototype.deployApplication = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/applications/".concat(id, "/deploy"), {
                        method: 'POST',
                        body: JSON.stringify(options || {})
                    })];
            });
        });
    };
    CoolifyAPI.prototype.stopApplication = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/applications/".concat(id, "/stop"), {
                        method: 'POST'
                    })];
            });
        });
    };
    CoolifyAPI.prototype.restartApplication = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/applications/".concat(id, "/restart"), {
                        method: 'POST'
                    })];
            });
        });
    };
    CoolifyAPI.prototype.getApplicationLogs = function (id_1) {
        return __awaiter(this, arguments, void 0, function (id, lines) {
            if (lines === void 0) { lines = 100; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/applications/".concat(id, "/logs?lines=").concat(lines))];
            });
        });
    };
    CoolifyAPI.prototype.getDeploymentLogs = function (applicationId, deploymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint;
            return __generator(this, function (_a) {
                endpoint = deploymentId
                    ? "/applications/".concat(applicationId, "/deployments/").concat(deploymentId, "/logs")
                    : "/applications/".concat(applicationId, "/deployments/logs");
                return [2 /*return*/, this.request(endpoint)];
            });
        });
    };
    // Databases
    CoolifyAPI.prototype.getDatabases = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/databases')];
            });
        });
    };
    CoolifyAPI.prototype.getDatabase = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/databases/".concat(id))];
            });
        });
    };
    CoolifyAPI.prototype.createDatabase = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/databases', {
                        method: 'POST',
                        body: JSON.stringify(data)
                    })];
            });
        });
    };
    CoolifyAPI.prototype.startDatabase = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/databases/".concat(id, "/start"), {
                        method: 'POST'
                    })];
            });
        });
    };
    CoolifyAPI.prototype.stopDatabase = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/databases/".concat(id, "/stop"), {
                        method: 'POST'
                    })];
            });
        });
    };
    CoolifyAPI.prototype.restartDatabase = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/databases/".concat(id, "/restart"), {
                        method: 'POST'
                    })];
            });
        });
    };
    // Services
    CoolifyAPI.prototype.getServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/services')];
            });
        });
    };
    CoolifyAPI.prototype.getService = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/services/".concat(id))];
            });
        });
    };
    CoolifyAPI.prototype.startService = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/services/".concat(id, "/start"), {
                        method: 'POST'
                    })];
            });
        });
    };
    CoolifyAPI.prototype.stopService = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/services/".concat(id, "/stop"), {
                        method: 'POST'
                    })];
            });
        });
    };
    CoolifyAPI.prototype.restartService = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/services/".concat(id, "/restart"), {
                        method: 'POST'
                    })];
            });
        });
    };
    // System Information
    CoolifyAPI.prototype.getSystemInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/system')];
            });
        });
    };
    CoolifyAPI.prototype.getVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/version')];
            });
        });
    };
    // Health Check
    CoolifyAPI.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.request('/health')];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 2:
                        error_2 = _a.sent();
                        // Handle case where health endpoint returns plain text "OK"
                        if (error_2.message && error_2.message.includes('Invalid JSON response: OK')) {
                            return [2 /*return*/, { status: 'OK' }];
                        }
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Utility methods
    CoolifyAPI.prototype.getAllResources = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, projects, applications, databases, services;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.getProjects(),
                            this.getApplications(),
                            this.getDatabases(),
                            this.getServices()
                        ])];
                    case 1:
                        _a = _b.sent(), projects = _a[0], applications = _a[1], databases = _a[2], services = _a[3];
                        return [2 /*return*/, {
                                projects: projects,
                                applications: applications,
                                databases: databases,
                                services: services
                            }];
                }
            });
        });
    };
    CoolifyAPI.prototype.getApplicationsByProject = function (projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var environments, applications, envIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEnvironments(projectId)];
                    case 1:
                        environments = _a.sent();
                        return [4 /*yield*/, this.getApplications()];
                    case 2:
                        applications = _a.sent();
                        envIds = environments.map(function (env) { return env.id; });
                        return [2 /*return*/, applications.filter(function (app) { return envIds.includes(app.environment_id); })];
                }
            });
        });
    };
    return CoolifyAPI;
}());
exports.CoolifyAPI = CoolifyAPI;
// Example usage
function exampleCoolifyUsage() {
    return __awaiter(this, void 0, void 0, function () {
        var coolify, health, projects, applications, deployment, systemInfo, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    coolify = new CoolifyAPI({
                        baseUrl: 'https://your-coolify-instance.com', // Replace with your Coolify URL
                        apiToken: 'your-api-token-here' // Replace with your API token
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, coolify.healthCheck()];
                case 2:
                    health = _a.sent();
                    console.log('Coolify Health:', health);
                    return [4 /*yield*/, coolify.getProjects()];
                case 3:
                    projects = _a.sent();
                    console.log('Projects:', projects);
                    return [4 /*yield*/, coolify.getApplications()];
                case 4:
                    applications = _a.sent();
                    console.log('Applications:', applications);
                    if (!(applications.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, coolify.deployApplication(applications[0].id)];
                case 5:
                    deployment = _a.sent();
                    console.log('Deployment started:', deployment);
                    _a.label = 6;
                case 6: return [4 /*yield*/, coolify.getSystemInfo()];
                case 7:
                    systemInfo = _a.sent();
                    console.log('System Info:', systemInfo);
                    return [3 /*break*/, 9];
                case 8:
                    error_3 = _a.sent();
                    console.error('Error using Coolify API:', error_3);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.default = CoolifyAPI;
