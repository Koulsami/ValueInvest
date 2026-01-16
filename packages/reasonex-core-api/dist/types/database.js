"use strict";
/**
 * Database entity types for Reasonex Core API
 * Phase 2b: Database Integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyStatus = exports.CheckStatus = exports.ValidationStatus = exports.AnalysisStatus = void 0;
// Enums
var AnalysisStatus;
(function (AnalysisStatus) {
    AnalysisStatus["DRAFT"] = "DRAFT";
    AnalysisStatus["SCORED"] = "SCORED";
    AnalysisStatus["LOCKED"] = "LOCKED";
    AnalysisStatus["VALIDATED"] = "VALIDATED";
    AnalysisStatus["APPROVED"] = "APPROVED";
    AnalysisStatus["SUPERSEDED"] = "SUPERSEDED";
    AnalysisStatus["REJECTED"] = "REJECTED";
})(AnalysisStatus || (exports.AnalysisStatus = AnalysisStatus = {}));
var ValidationStatus;
(function (ValidationStatus) {
    ValidationStatus["PENDING"] = "PENDING";
    ValidationStatus["PASSED"] = "PASSED";
    ValidationStatus["FLAGGED"] = "FLAGGED";
    ValidationStatus["FAILED"] = "FAILED";
})(ValidationStatus || (exports.ValidationStatus = ValidationStatus = {}));
var CheckStatus;
(function (CheckStatus) {
    CheckStatus["PASS"] = "PASS";
    CheckStatus["FLAG"] = "FLAG";
    CheckStatus["FAIL"] = "FAIL";
})(CheckStatus || (exports.CheckStatus = CheckStatus = {}));
var CompanyStatus;
(function (CompanyStatus) {
    CompanyStatus["ACTIVE"] = "ACTIVE";
    CompanyStatus["PAUSED"] = "PAUSED";
    CompanyStatus["ARCHIVED"] = "ARCHIVED";
})(CompanyStatus || (exports.CompanyStatus = CompanyStatus = {}));
//# sourceMappingURL=database.js.map