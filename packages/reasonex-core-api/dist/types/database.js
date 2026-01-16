"use strict";
/**
 * Database entity types for Reasonex Core API
 * Phase 2b: Database Integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleValidationStatus = exports.ConfidenceLevel = exports.WorkbenchDocumentType = exports.DocumentUploadStatus = exports.SessionStatus = exports.CompanyStatus = exports.CheckStatus = exports.ValidationStatus = exports.AnalysisStatus = void 0;
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
    ValidationStatus["PASS"] = "PASS";
    ValidationStatus["FLAG"] = "FLAG";
    ValidationStatus["FAIL"] = "FAIL";
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
// ============================================
// Phase 3: Rule Development Workbench Types
// ============================================
// Phase 3 Enums
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["ACTIVE"] = "ACTIVE";
    SessionStatus["COMPLETED"] = "COMPLETED";
    SessionStatus["ABANDONED"] = "ABANDONED";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
var DocumentUploadStatus;
(function (DocumentUploadStatus) {
    DocumentUploadStatus["UPLOADING"] = "UPLOADING";
    DocumentUploadStatus["INDEXED"] = "INDEXED";
    DocumentUploadStatus["FAILED"] = "FAILED";
})(DocumentUploadStatus || (exports.DocumentUploadStatus = DocumentUploadStatus = {}));
var WorkbenchDocumentType;
(function (WorkbenchDocumentType) {
    WorkbenchDocumentType["REGULATION"] = "REGULATION";
    WorkbenchDocumentType["GUIDELINE"] = "GUIDELINE";
    WorkbenchDocumentType["PRECEDENT"] = "PRECEDENT";
    WorkbenchDocumentType["REFERENCE"] = "REFERENCE";
})(WorkbenchDocumentType || (exports.WorkbenchDocumentType = WorkbenchDocumentType = {}));
var ConfidenceLevel;
(function (ConfidenceLevel) {
    ConfidenceLevel["HIGH"] = "HIGH";
    ConfidenceLevel["MEDIUM"] = "MEDIUM";
    ConfidenceLevel["LOW"] = "LOW";
})(ConfidenceLevel || (exports.ConfidenceLevel = ConfidenceLevel = {}));
var RuleValidationStatus;
(function (RuleValidationStatus) {
    RuleValidationStatus["DRAFT"] = "DRAFT";
    RuleValidationStatus["VALIDATED"] = "VALIDATED";
    RuleValidationStatus["DEPLOYED"] = "DEPLOYED";
})(RuleValidationStatus || (exports.RuleValidationStatus = RuleValidationStatus = {}));
//# sourceMappingURL=database.js.map