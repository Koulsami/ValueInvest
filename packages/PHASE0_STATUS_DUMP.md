# PHASE 0: REASONEX IMPLEMENTATION STATUS DUMP

**Generated:** $(date)
**Working Directory:** /home/amee/ValueInvest

---

## EXECUTIVE SUMMARY

This dump shows the current state of the Reasonex implementation built from the specification.

### What Was Built

| Component | Technology | Status | Location |
|-----------|-----------|--------|----------|
| Core API | Express.js + TypeScript | ✅ Deployed | Railway |
| n8n Nodes | TypeScript | ✅ Built | NPM Package |
| Database | NONE | ❌ Not implemented | - |
| n8n Workflows | NONE | ❌ Not implemented | - |

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  @reasonex/n8n-nodes (NPM)                      │
│  7 custom nodes: Lock, RuleEngine, Validation, TreeBuilder,     │
│  ChangeDetector, ReviewRouter, Explanation                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│         Reasonex Core API (Railway - LIVE)                      │
│         https://reasonex-core-api-production.up.railway.app     │
│                                                                 │
│  Engines: LockManager, RuleEngine, Validator, TreeBuilder,      │
│           ChangeDetector, TierRouter, ExplanationGenerator      │
└─────────────────────────────────────────────────────────────────┘
```

---


# PHASE 0: STATUS DUMP
Generated: Fri Jan 16 15:16:05 +08 2026
Working Directory: /home/amee/ValueInvest

========================================
SECTION 1: Repository Structure
========================================

### 1.1 Current Working Directory
/home/amee/ValueInvest

### 1.2 Complete File Tree (packages directory)
-rw-r--r-- 1 amee amee 1.7K Jan 16 14:02 ./packages/reasonex-n8n-nodes/package.json
-rw-r--r-- 1 amee amee 148 Jan 16 14:02 ./packages/reasonex-n8n-nodes/index.ts
-rw-r--r-- 1 amee amee 1.4K Jan 16 14:02 ./packages/reasonex-n8n-nodes/credentials/ReasonexApi.credentials.ts
-rw-r--r-- 1 amee amee 3.6K Jan 16 14:08 ./packages/reasonex-n8n-nodes/lib/logger.ts
-rw-r--r-- 1 amee amee 7.7K Jan 16 14:02 ./packages/reasonex-n8n-nodes/lib/api-client.ts
-rw-r--r-- 1 amee amee 7.4K Jan 16 14:08 ./packages/reasonex-n8n-nodes/nodes/ReasonexRuleEngine/ReasonexRuleEngine.node.ts
-rw-r--r-- 1 amee amee 981 Jan 16 14:03 ./packages/reasonex-n8n-nodes/nodes/ReasonexRuleEngine/engine.svg
-rw-r--r-- 1 amee amee 5.1K Jan 16 14:08 ./packages/reasonex-n8n-nodes/nodes/ReasonexChangeDetector/ReasonexChangeDetector.node.ts
-rw-r--r-- 1 amee amee 327 Jan 16 14:05 ./packages/reasonex-n8n-nodes/nodes/ReasonexChangeDetector/detect.svg
-rw-r--r-- 1 amee amee 358 Jan 16 14:05 ./packages/reasonex-n8n-nodes/nodes/ReasonexExplanation/explanation.svg
-rw-r--r-- 1 amee amee 4.9K Jan 16 14:08 ./packages/reasonex-n8n-nodes/nodes/ReasonexExplanation/ReasonexExplanation.node.ts
-rw-r--r-- 1 amee amee 8.1K Jan 16 14:08 ./packages/reasonex-n8n-nodes/nodes/ReasonexValidation/ReasonexValidation.node.ts
-rw-r--r-- 1 amee amee 298 Jan 16 14:04 ./packages/reasonex-n8n-nodes/nodes/ReasonexValidation/validation.svg
-rw-r--r-- 1 amee amee 337 Jan 16 14:03 ./packages/reasonex-n8n-nodes/nodes/ReasonexLock/lock.svg
-rw-r--r-- 1 amee amee 7.4K Jan 16 14:08 ./packages/reasonex-n8n-nodes/nodes/ReasonexLock/ReasonexLock.node.ts
-rw-r--r-- 1 amee amee 7.8K Jan 16 14:08 ./packages/reasonex-n8n-nodes/nodes/ReasonexReviewRouter/ReasonexReviewRouter.node.ts
-rw-r--r-- 1 amee amee 339 Jan 16 14:05 ./packages/reasonex-n8n-nodes/nodes/ReasonexReviewRouter/router.svg
-rw-r--r-- 1 amee amee 302 Jan 16 14:04 ./packages/reasonex-n8n-nodes/nodes/ReasonexTreeBuilder/tree.svg
-rw-r--r-- 1 amee amee 7.3K Jan 16 14:08 ./packages/reasonex-n8n-nodes/nodes/ReasonexTreeBuilder/ReasonexTreeBuilder.node.ts
-rw-r--r-- 1 amee amee 110K Jan 16 14:06 ./packages/reasonex-n8n-nodes/package-lock.json
-rw-r--r-- 1 amee amee 401 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/credentials/ReasonexApi.credentials.d.ts.map
-rw-r--r-- 1 amee amee 410 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/credentials/ReasonexApi.credentials.d.ts
-rw-r--r-- 1 amee amee 970 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/credentials/ReasonexApi.credentials.js.map
-rw-r--r-- 1 amee amee 1.6K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/credentials/ReasonexApi.credentials.js
-rw-r--r-- 1 amee amee 142 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/index.d.ts.map
-rw-r--r-- 1 amee amee 4.9K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/lib/api-client.js.map
-rw-r--r-- 1 amee amee 931 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/lib/logger.d.ts
-rw-r--r-- 1 amee amee 3.3K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/lib/logger.js.map
-rw-r--r-- 1 amee amee 3.9K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/lib/api-client.d.ts
-rw-r--r-- 1 amee amee 4.0K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/lib/logger.js
-rw-r--r-- 1 amee amee 4.1K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/lib/api-client.d.ts.map
-rw-r--r-- 1 amee amee 5.6K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/lib/api-client.js
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/lib/logger.d.ts.map
-rw-r--r-- 1 amee amee 981 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/ReasonexRuleEngine/engine.svg
-rw-r--r-- 1 amee amee 380 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexRuleEngine/ReasonexRuleEngine.node.d.ts.map
-rw-r--r-- 1 amee amee 8.8K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexRuleEngine/ReasonexRuleEngine.node.js
-rw-r--r-- 1 amee amee 5.9K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexRuleEngine/ReasonexRuleEngine.node.js.map
-rw-r--r-- 1 amee amee 331 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexRuleEngine/ReasonexRuleEngine.node.d.ts
-rw-r--r-- 1 amee amee 392 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexChangeDetector/ReasonexChangeDetector.node.d.ts.map
-rw-r--r-- 1 amee amee 5.9K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexChangeDetector/ReasonexChangeDetector.node.js
-rw-r--r-- 1 amee amee 4.2K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexChangeDetector/ReasonexChangeDetector.node.js.map
-rw-r--r-- 1 amee amee 339 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexChangeDetector/ReasonexChangeDetector.node.d.ts
-rw-r--r-- 1 amee amee 5.6K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexExplanation/ReasonexExplanation.node.js
-rw-r--r-- 1 amee amee 333 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexExplanation/ReasonexExplanation.node.d.ts
-rw-r--r-- 1 amee amee 3.8K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexExplanation/ReasonexExplanation.node.js.map
-rw-r--r-- 1 amee amee 383 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexExplanation/ReasonexExplanation.node.d.ts.map
-rw-r--r-- 1 amee amee 380 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexValidation/ReasonexValidation.node.d.ts.map
-rw-r--r-- 1 amee amee 6.3K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexValidation/ReasonexValidation.node.js.map
-rw-r--r-- 1 amee amee 331 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexValidation/ReasonexValidation.node.d.ts
-rw-r--r-- 1 amee amee 9.7K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexValidation/ReasonexValidation.node.js
-rw-r--r-- 1 amee amee 8.9K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexLock/ReasonexLock.node.js
-rw-r--r-- 1 amee amee 319 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexLock/ReasonexLock.node.d.ts
-rw-r--r-- 1 amee amee 5.7K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexLock/ReasonexLock.node.js.map
-rw-r--r-- 1 amee amee 360 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexLock/ReasonexLock.node.d.ts.map
-rw-r--r-- 1 amee amee 386 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexReviewRouter/ReasonexReviewRouter.node.d.ts.map
-rw-r--r-- 1 amee amee 9.5K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexReviewRouter/ReasonexReviewRouter.node.js
-rw-r--r-- 1 amee amee 335 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexReviewRouter/ReasonexReviewRouter.node.d.ts
-rw-r--r-- 1 amee amee 6.1K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexReviewRouter/ReasonexReviewRouter.node.js.map
-rw-r--r-- 1 amee amee 333 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexTreeBuilder/ReasonexTreeBuilder.node.d.ts
-rw-r--r-- 1 amee amee 8.9K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexTreeBuilder/ReasonexTreeBuilder.node.js
-rw-r--r-- 1 amee amee 5.7K Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexTreeBuilder/ReasonexTreeBuilder.node.js.map
-rw-r--r-- 1 amee amee 383 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/nodes/ReasonexTreeBuilder/ReasonexTreeBuilder.node.d.ts.map
-rw-r--r-- 1 amee amee 327 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/ReasonexChangeDetector/detect.svg
-rw-r--r-- 1 amee amee 358 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/ReasonexExplanation/explanation.svg
-rw-r--r-- 1 amee amee 99 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/index.d.ts
-rw-r--r-- 1 amee amee 164 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/index.js.map
-rw-r--r-- 1 amee amee 298 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/ReasonexValidation/validation.svg
-rw-r--r-- 1 amee amee 337 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/ReasonexLock/lock.svg
-rw-r--r-- 1 amee amee 339 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/ReasonexReviewRouter/router.svg
-rw-r--r-- 1 amee amee 973 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/index.js
-rw-r--r-- 1 amee amee 302 Jan 16 14:08 ./packages/reasonex-n8n-nodes/dist/ReasonexTreeBuilder/tree.svg
-rw-r--r-- 1 amee amee 762 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/untildify/package.json
-rw-r--r-- 1 amee amee 532 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/untildify/readme.md
-rw-r--r-- 1 amee amee 279 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/untildify/index.d.ts
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/untildify/license
-rw-r--r-- 1 amee amee 331 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/untildify/index.js
-rw-r--r-- 1 amee amee 19K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/index.d.cts
-rw-r--r-- 1 amee amee 8.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/package.json
-rw-r--r-- 1 amee amee 99 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/cancel/isCancel.js
-rw-r--r-- 1 amee amee 697 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/cancel/CanceledError.js
-rw-r--r-- 1 amee amee 2.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/cancel/CancelToken.js
-rw-r--r-- 1 amee amee 2.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/axios.js
-rw-r--r-- 1 amee amee 118 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/defaults/transitional.js
-rw-r--r-- 1 amee amee 4.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/defaults/index.js
-rw-r--r-- 1 amee amee 8.0K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/adapters/fetch.js
-rwxr-xr-x 1 amee amee 27K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/adapters/http.js
-rw-r--r-- 1 amee amee 915 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/adapters/README.md
-rw-r--r-- 1 amee amee 3.3K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/adapters/adapters.js
-rw-r--r-- 1 amee amee 6.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/adapters/xhr.js
-rw-r--r-- 1 amee amee 6.7K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/Axios.js
-rw-r--r-- 1 amee amee 3.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/mergeConfig.js
-rw-r--r-- 1 amee amee 1.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/InterceptorManager.js
-rw-r--r-- 1 amee amee 783 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/buildFullPath.js
-rw-r--r-- 1 amee amee 7.3K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/AxiosHeaders.js
-rw-r--r-- 1 amee amee 399 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/README.md
-rw-r--r-- 1 amee amee 2.2K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/dispatchRequest.js
-rw-r--r-- 1 amee amee 836 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/settle.js
-rw-r--r-- 1 amee amee 2.9K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/AxiosError.js
-rw-r--r-- 1 amee amee 778 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/transformData.js
-rw-r--r-- 1 amee amee 106 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/env/classes/FormData.js
-rw-r--r-- 1 amee amee 131 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/env/README.md
-rw-r--r-- 1 amee amee 32 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/env/data.js
-rw-r--r-- 1 amee amee 372 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/callbackify.js
-rw-r--r-- 1 amee amee 6.0K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/toFormData.js
-rw-r--r-- 1 amee amee 2.2K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/formDataToJSON.js
-rw-r--r-- 1 amee amee 1.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/fromDataURI.js
-rw-r--r-- 1 amee amee 2.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/estimateDataURLDecodedBytes.js
-rw-r--r-- 1 amee amee 852 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/throttle.js
-rw-r--r-- 1 amee amee 681 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/ZlibHeaderTransformStream.js
-rw-r--r-- 1 amee amee 561 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/isAbsoluteURL.js
-rw-r--r-- 1 amee amee 564 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/spread.js
-rw-r--r-- 1 amee amee 746 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/deprecatedMethod.js
-rw-r--r-- 1 amee amee 2.2K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/resolveConfig.js
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/speedometer.js
-rw-r--r-- 1 amee amee 1.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/composeSignals.js
-rw-r--r-- 1 amee amee 2.9K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/formDataToStream.js
-rw-r--r-- 1 amee amee 1.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/AxiosURLSearchParams.js
-rw-r--r-- 1 amee amee 420 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/isURLSameOrigin.js
-rw-r--r-- 1 amee amee 1.3K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/progressEventReducer.js
-rw-r--r-- 1 amee amee 1.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/parseHeaders.js
-rw-r--r-- 1 amee amee 1.7K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/trackStream.js
-rw-r--r-- 1 amee amee 56 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/null.js
-rw-r--r-- 1 amee amee 540 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/toURLEncodedForm.js
-rw-r--r-- 1 amee amee 351 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/README.md
-rw-r--r-- 1 amee amee 444 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/bind.js
-rw-r--r-- 1 amee amee 3.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/AxiosTransformStream.js
-rw-r--r-- 1 amee amee 373 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/isAxiosError.js
-rw-r--r-- 1 amee amee 151 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/parseProtocol.js
-rw-r--r-- 1 amee amee 382 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/combineURLs.js
-rw-r--r-- 1 amee amee 318 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/readBlob.js
-rw-r--r-- 1 amee amee 1.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/HttpStatusCode.js
-rw-r--r-- 1 amee amee 1.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/buildURL.js
-rw-r--r-- 1 amee amee 1.3K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/cookies.js
-rw-r--r-- 1 amee amee 2.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/validator.js
-rw-r--r-- 1 amee amee 188 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
-rw-r--r-- 1 amee amee 81 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/browser/classes/FormData.js
-rw-r--r-- 1 amee amee 71 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/browser/classes/Blob.js
-rw-r--r-- 1 amee amee 305 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/browser/index.js
-rw-r--r-- 1 amee amee 1.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/common/utils.js
-rw-r--r-- 1 amee amee 74 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/node/classes/URLSearchParams.js
-rw-r--r-- 1 amee amee 60 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/node/classes/FormData.js
-rw-r--r-- 1 amee amee 828 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/node/index.js
-rw-r--r-- 1 amee amee 130 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/index.js
-rw-r--r-- 1 amee amee 19K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/lib/utils.js
-rw-r--r-- 1 amee amee 212K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/browser/axios.cjs.map
-rw-r--r-- 1 amee amee 100K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/browser/axios.cjs
-rw-r--r-- 1 amee amee 36K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/esm/axios.min.js
-rw-r--r-- 1 amee amee 167K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/esm/axios.min.js.map
-rw-r--r-- 1 amee amee 214K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/esm/axios.js.map
-rw-r--r-- 1 amee amee 101K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/esm/axios.js
-rw-r--r-- 1 amee amee 54K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/axios.min.js
-rw-r--r-- 1 amee amee 175K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/axios.min.js.map
-rw-r--r-- 1 amee amee 247K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/axios.js.map
-rw-r--r-- 1 amee amee 148K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/axios.js
-rw-r--r-- 1 amee amee 292K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/node/axios.cjs.map
-rw-r--r-- 1 amee amee 139K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/dist/node/axios.cjs
-rw-r--r-- 1 amee amee 37 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/MIGRATION_GUIDE.md
-rw-r--r-- 1 amee amee 19K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/index.d.ts
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/LICENSE
-rw-r--r-- 1 amee amee 72K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/README.md
-rw-r--r-- 1 amee amee 94K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/CHANGELOG.md
-rw-r--r-- 1 amee amee 681 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/axios/index.js
-rw-r--r-- 1 amee amee 1.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/package.json
-rw-r--r-- 1 amee amee 1.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/serialOrdered.js
-rw-r--r-- 1 amee amee 941 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/state.js
-rw-r--r-- 1 amee amee 941 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/readable_serial_ordered.js
-rw-r--r-- 1 amee amee 673 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/readable_parallel.js
-rw-r--r-- 1 amee amee 655 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/readable_serial.js
-rw-r--r-- 1 amee amee 441 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/defer.js
-rw-r--r-- 1 amee amee 497 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/abort.js
-rw-r--r-- 1 amee amee 2.9K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/streamify.js
-rw-r--r-- 1 amee amee 1.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/iterate.js
-rw-r--r-- 1 amee amee 599 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/async.js
-rw-r--r-- 1 amee amee 533 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/terminator.js
-rw-r--r-- 1 amee amee 1.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/lib/readable_asynckit.js
-rw-r--r-- 1 amee amee 703 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/stream.js
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/LICENSE
-rw-r--r-- 1 amee amee 501 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/serial.js
-rw-r--r-- 1 amee amee 7.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/README.md
-rw-r--r-- 1 amee amee 1.3K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/bench.js
-rw-r--r-- 1 amee amee 156 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/index.js
-rw-r--r-- 1 amee amee 1017 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/asynckit/parallel.js
-rw-r--r-- 1 amee amee 783 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/safe-buffer/package.json
-rw-r--r-- 1 amee amee 8.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/safe-buffer/index.d.ts
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/safe-buffer/LICENSE
-rw-r--r-- 1 amee amee 20K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/safe-buffer/README.md
-rw-r--r-- 1 amee amee 1.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/safe-buffer/index.js
-rw-r--r-- 1 amee amee 4.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/esprima/package.json
-rw-r--r-- 1 amee amee 277K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/esprima/dist/esprima.js
-rwxr-xr-x 1 amee amee 7.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/esprima/bin/esvalidate.js
-rwxr-xr-x 1 amee amee 4.9K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/esprima/bin/esparse.js
-rw-r--r-- 1 amee amee 9.7K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/esprima/ChangeLog
-rw-r--r-- 1 amee amee 2.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/esprima/README.md
-rw-r--r-- 1 amee amee 1.3K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/esprima/LICENSE.BSD
-rw-r--r-- 1 amee amee 2.3K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/package.json
-rw-r--r-- 1 amee amee 352 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/ToObject.d.ts
-rw-r--r-- 1 amee amee 250 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/ToObject.js
-rw-r--r-- 1 amee amee 229 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/.eslintrc
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/test/index.js
-rw-r--r-- 1 amee amee 59 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/index.d.ts
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/LICENSE
-rw-r--r-- 1 amee amee 81 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/tsconfig.json
-rw-r--r-- 1 amee amee 2.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/README.md
-rw-r--r-- 1 amee amee 72 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/isObject.d.ts
-rw-r--r-- 1 amee amee 161 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/isObject.js
-rw-r--r-- 1 amee amee 2.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/CHANGELOG.md
-rw-r--r-- 1 amee amee 123 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/RequireObjectCoercible.d.ts
-rw-r--r-- 1 amee amee 313 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/RequireObjectCoercible.js
-rw-r--r-- 1 amee amee 555 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/.github/FUNDING.yml
-rw-r--r-- 1 amee amee 67 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/index.js
-rw-r--r-- 1 amee amee 1.9K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/LICENSE_EE.md
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/package.json
-rw-r--r-- 1 amee amee 4.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/LICENSE.md
-rw-r--r-- 1 amee amee 902 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/application.error.js
-rw-r--r-- 1 amee amee 354 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/types.d.ts
-rw-r--r-- 1 amee amee 168K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/build.tsbuildinfo
-rw-r--r-- 1 amee amee 86 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/index.d.ts
-rw-r--r-- 1 amee amee 140 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/index.js.map
-rw-r--r-- 1 amee amee 102 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/types.js.map
-rw-r--r-- 1 amee amee 110 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/types.js
-rw-r--r-- 1 amee amee 403 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/application.error.d.ts
-rw-r--r-- 1 amee amee 718 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/application.error.js.map
-rw-r--r-- 1 amee amee 344 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist/index.js
-rw-r--r-- 1 amee amee 1.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/package.json
-rw-r--r-- 1 amee amee 12K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/LICENSE.md
-rw-r--r-- 1 amee amee 82 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Parser.d.ts
-rw-r--r-- 1 amee amee 288 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Constants.js
-rw-r--r-- 1 amee amee 246 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Evaluator.d.ts
-rw-r--r-- 1 amee amee 169 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/ast.js.map
-rw-r--r-- 1 amee amee 330 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Constants.d.ts
-rw-r--r-- 1 amee amee 76 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Differ.d.ts
-rw-r--r-- 1 amee amee 2.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/ExpressionSplitter.js.map
-rw-r--r-- 1 amee amee 9.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/VariablePolyfill.js
-rw-r--r-- 1 amee amee 617 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/ast.d.ts
-rw-r--r-- 1 amee amee 3.0K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/ExpressionSplitter.js
-rw-r--r-- 1 amee amee 462 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/ast.js
-rw-r--r-- 1 amee amee 110 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Evaluator.js.map
-rw-r--r-- 1 amee amee 455 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/ExpressionSplitter.d.ts
-rw-r--r-- 1 amee amee 114 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Evaluator.js
-rw-r--r-- 1 amee amee 741 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Parser.js.map
-rw-r--r-- 1 amee amee 402 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/VariablePolyfill.d.ts
-rw-r--r-- 1 amee amee 759 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/FunctionEvaluator.js
-rw-r--r-- 1 amee amee 28K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/build.tsbuildinfo
-rw-r--r-- 1 amee amee 7.3K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/ExpressionBuilder.js.map
-rw-r--r-- 1 amee amee 311 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/FunctionEvaluator.d.ts
-rw-r--r-- 1 amee amee 937 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/index.d.ts
-rw-r--r-- 1 amee amee 741 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Analysis.d.ts
-rw-r--r-- 1 amee amee 3.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Differ.js.map
-rw-r--r-- 1 amee amee 4.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Differ.js
-rw-r--r-- 1 amee amee 955 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/index.js.map
-rw-r--r-- 1 amee amee 215 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Constants.js.map
-rw-r--r-- 1 amee amee 4.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Analysis.js
-rw-r--r-- 1 amee amee 6.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/VariablePolyfill.js.map
-rw-r--r-- 1 amee amee 761 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/FunctionEvaluator.js.map
-rw-r--r-- 1 amee amee 969 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Parser.js
-rw-r--r-- 1 amee amee 7.9K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/ExpressionBuilder.js
-rw-r--r-- 1 amee amee 593 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/ExpressionBuilder.d.ts
-rw-r--r-- 1 amee amee 3.2K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/Analysis.js.map
-rw-r--r-- 1 amee amee 1.9K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist/index.js
-rw-r--r-- 1 amee amee 661 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/tsconfig.json
-rw-r--r-- 1 amee amee 1.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/index.ts
-rw-r--r-- 1 amee amee 8.2K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/ExpressionBuilder.ts
-rw-r--r-- 1 amee amee 409 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/Constants.ts
-rw-r--r-- 1 amee amee 735 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/Parser.ts
-rw-r--r-- 1 amee amee 242 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/Evaluator.ts
-rw-r--r-- 1 amee amee 654 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/FunctionEvaluator.ts
-rw-r--r-- 1 amee amee 8.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/VariablePolyfill.ts
-rw-r--r-- 1 amee amee 3.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/Analysis.ts
-rw-r--r-- 1 amee amee 3.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/Differ.ts
-rw-r--r-- 1 amee amee 625 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/ast.ts
-rw-r--r-- 1 amee amee 2.5K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src/ExpressionSplitter.ts
-rw-r--r-- 1 amee amee 2.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/package.json
-rw-r--r-- 1 amee amee 224 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/.eslintrc
-rw-r--r-- 1 amee amee 656 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/test/index.js
-rw-r--r-- 1 amee amee 173 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/index.d.ts
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/LICENSE
-rw-r--r-- 1 amee amee 42 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/gOPD.d.ts
-rw-r--r-- 1 amee amee 116 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/tsconfig.json
-rw-r--r-- 1 amee amee 1.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/README.md
-rw-r--r-- 1 amee amee 97 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/gOPD.js
-rw-r--r-- 1 amee amee 3.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/CHANGELOG.md
-rw-r--r-- 1 amee amee 575 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/.github/FUNDING.yml
-rw-r--r-- 1 amee amee 206 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/gopd/index.js
-rw-r--r-- 1 amee amee 1.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/fill-range/package.json
-rw-r--r-- 1 amee amee 1.1K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/fill-range/LICENSE
-rw-r--r-- 1 amee amee 7.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/fill-range/README.md
-rw-r--r-- 1 amee amee 6.3K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/fill-range/index.js
-rw-r--r-- 1 amee amee 1.2K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mime-types/package.json
-rw-r--r-- 1 amee amee 1.2K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mime-types/LICENSE
-rw-r--r-- 1 amee amee 3.4K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mime-types/README.md
-rw-r--r-- 1 amee amee 8.7K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mime-types/HISTORY.md
-rw-r--r-- 1 amee amee 3.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mime-types/index.js
-rw-r--r-- 1 amee amee 804 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mkdirp/package.json
-rw-r--r-- 1 amee amee 763 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mkdirp/lib/find-made.js
-rw-r--r-- 1 amee amee 448 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mkdirp/lib/use-native.js
-rw-r--r-- 1 amee amee 784 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mkdirp/lib/opts-arg.js
-rw-r--r-- 1 amee amee 1.6K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mkdirp/lib/mkdirp-manual.js
-rw-r--r-- 1 amee amee 730 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mkdirp/lib/path-arg.js
-rw-r--r-- 1 amee amee 969 Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mkdirp/lib/mkdirp-native.js
-rwxr-xr-x 1 amee amee 1.8K Jan 16 14:06 ./packages/reasonex-n8n-nodes/node_modules/mkdirp/bin/cmd.js

### 1.3 Tree Structure
./packages
├── reasonex-core-api
│   ├── COMPLIANCE_REPORT.md
│   ├── Dockerfile
│   ├── README.md
│   ├── dist
│   │   ├── config
│   │   │   ├── rule-sets
│   │   │   └── validation-profiles
│   │   ├── engines
│   │   │   ├── change-detector.d.ts
│   │   │   ├── change-detector.d.ts.map
│   │   │   ├── change-detector.js
│   │   │   ├── change-detector.js.map
│   │   │   ├── explanation-generator.d.ts
│   │   │   ├── explanation-generator.d.ts.map
│   │   │   ├── explanation-generator.js
│   │   │   ├── explanation-generator.js.map
│   │   │   ├── lock-manager.d.ts
│   │   │   ├── lock-manager.d.ts.map
│   │   │   ├── lock-manager.js
│   │   │   ├── lock-manager.js.map
│   │   │   ├── rule-engine.d.ts
│   │   │   ├── rule-engine.d.ts.map
│   │   │   ├── rule-engine.js
│   │   │   ├── rule-engine.js.map
│   │   │   ├── tier-router.d.ts
│   │   │   ├── tier-router.d.ts.map
│   │   │   ├── tier-router.js
│   │   │   ├── tier-router.js.map
│   │   │   ├── tree-builder.d.ts
│   │   │   ├── tree-builder.d.ts.map
│   │   │   ├── tree-builder.js
│   │   │   ├── tree-builder.js.map
│   │   │   ├── validator.d.ts
│   │   │   ├── validator.d.ts.map
│   │   │   ├── validator.js
│   │   │   └── validator.js.map
│   │   ├── index.d.ts
│   │   ├── index.d.ts.map
│   │   ├── index.js
│   │   ├── index.js.map
│   │   ├── lib
│   │   │   ├── logger.d.ts
│   │   │   ├── logger.d.ts.map
│   │   │   ├── logger.js
│   │   │   ├── logger.js.map
│   │   │   ├── tracer.d.ts
│   │   │   ├── tracer.d.ts.map
│   │   │   ├── tracer.js
│   │   │   └── tracer.js.map
│   │   └── routes
│   │       ├── detect.d.ts
│   │       ├── detect.d.ts.map
│   │       ├── detect.js
│   │       ├── detect.js.map
│   │       ├── lock.d.ts
│   │       ├── lock.d.ts.map
│   │       ├── lock.js
│   │       ├── lock.js.map
│   │       ├── route.d.ts
│   │       ├── route.d.ts.map
│   │       ├── route.js
│   │       ├── route.js.map
│   │       ├── score.d.ts
│   │       ├── score.d.ts.map
│   │       ├── score.js
│   │       ├── score.js.map
│   │       ├── tree.d.ts
│   │       ├── tree.d.ts.map
│   │       ├── tree.js
│   │       ├── tree.js.map
│   │       ├── validate.d.ts
│   │       ├── validate.d.ts.map
│   │       ├── validate.js
│   │       └── validate.js.map
│   ├── node_modules  [397 entries exceeds filelimit, not opening dir]
│   ├── package-lock.json
│   ├── package.json
│   ├── railway.toml
│   ├── src
│   │   ├── config
│   │   │   ├── rule-sets
│   │   │   └── validation-profiles
│   │   ├── engines
│   │   │   ├── change-detector.ts
│   │   │   ├── explanation-generator.ts
│   │   │   ├── lock-manager.ts
│   │   │   ├── rule-engine.ts
│   │   │   ├── tier-router.ts
│   │   │   ├── tree-builder.ts
│   │   │   └── validator.ts
│   │   ├── index.ts
│   │   ├── lib
│   │   │   ├── logger.ts
│   │   │   └── tracer.ts
│   │   └── routes
│   │       ├── detect.ts
│   │       ├── lock.ts
│   │       ├── route.ts
│   │       ├── score.ts
│   │       ├── tree.ts
│   │       └── validate.ts
│   ├── test-api.sh
│   └── tsconfig.json
└── reasonex-n8n-nodes
    ├── credentials
    │   └── ReasonexApi.credentials.ts
    ├── dist
    │   ├── ReasonexChangeDetector
    │   │   └── detect.svg
    │   ├── ReasonexExplanation
    │   │   └── explanation.svg
    │   ├── ReasonexLock
    │   │   └── lock.svg
    │   ├── ReasonexReviewRouter
    │   │   └── router.svg
    │   ├── ReasonexRuleEngine
    │   │   └── engine.svg
    │   ├── ReasonexTreeBuilder
    │   │   └── tree.svg
    │   ├── ReasonexValidation
    │   │   └── validation.svg
    │   ├── credentials
    │   │   ├── ReasonexApi.credentials.d.ts
    │   │   ├── ReasonexApi.credentials.d.ts.map
    │   │   ├── ReasonexApi.credentials.js
    │   │   └── ReasonexApi.credentials.js.map
    │   ├── index.d.ts
    │   ├── index.d.ts.map
    │   ├── index.js
    │   ├── index.js.map
    │   ├── lib
    │   │   ├── api-client.d.ts
    │   │   ├── api-client.d.ts.map
    │   │   ├── api-client.js
    │   │   ├── api-client.js.map
    │   │   ├── logger.d.ts
    │   │   ├── logger.d.ts.map
    │   │   ├── logger.js
    │   │   └── logger.js.map
    │   └── nodes
    │       ├── ReasonexChangeDetector
    │       ├── ReasonexExplanation
    │       ├── ReasonexLock
    │       ├── ReasonexReviewRouter
    │       ├── ReasonexRuleEngine
    │       ├── ReasonexTreeBuilder
    │       └── ReasonexValidation
    ├── index.ts
    ├── lib
    │   ├── api-client.ts
    │   └── logger.ts
    ├── node_modules  [209 entries exceeds filelimit, not opening dir]
    ├── nodes
    │   ├── ReasonexChangeDetector
    │   │   ├── ReasonexChangeDetector.node.ts
    │   │   └── detect.svg
    │   ├── ReasonexExplanation
    │   │   ├── ReasonexExplanation.node.ts
    │   │   └── explanation.svg
    │   ├── ReasonexLock
    │   │   ├── ReasonexLock.node.ts
    │   │   └── lock.svg
    │   ├── ReasonexReviewRouter
    │   │   ├── ReasonexReviewRouter.node.ts
    │   │   └── router.svg
    │   ├── ReasonexRuleEngine
    │   │   ├── ReasonexRuleEngine.node.ts
    │   │   └── engine.svg
    │   ├── ReasonexTreeBuilder
    │   │   ├── ReasonexTreeBuilder.node.ts
    │   │   └── tree.svg
    │   └── ReasonexValidation
    │       ├── ReasonexValidation.node.ts
    │       └── validation.svg
    ├── package-lock.json
    ├── package.json
    └── tsconfig.json

47 directories, 132 files
./packages
./packages/reasonex-n8n-nodes
./packages/reasonex-n8n-nodes/credentials
./packages/reasonex-n8n-nodes/lib
./packages/reasonex-n8n-nodes/nodes
./packages/reasonex-n8n-nodes/nodes/ReasonexRuleEngine
./packages/reasonex-n8n-nodes/nodes/ReasonexChangeDetector
./packages/reasonex-n8n-nodes/nodes/ReasonexExplanation
./packages/reasonex-n8n-nodes/nodes/ReasonexValidation
./packages/reasonex-n8n-nodes/nodes/ReasonexLock
./packages/reasonex-n8n-nodes/nodes/ReasonexReviewRouter
./packages/reasonex-n8n-nodes/nodes/ReasonexTreeBuilder
./packages/reasonex-n8n-nodes/dist
./packages/reasonex-n8n-nodes/dist/credentials
./packages/reasonex-n8n-nodes/dist/lib
./packages/reasonex-n8n-nodes/dist/ReasonexRuleEngine
./packages/reasonex-n8n-nodes/dist/nodes
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexRuleEngine
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexChangeDetector
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexExplanation
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexValidation
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexLock
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexReviewRouter
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexTreeBuilder
./packages/reasonex-n8n-nodes/dist/ReasonexChangeDetector
./packages/reasonex-n8n-nodes/dist/ReasonexExplanation
./packages/reasonex-n8n-nodes/dist/ReasonexValidation
./packages/reasonex-n8n-nodes/dist/ReasonexLock
./packages/reasonex-n8n-nodes/dist/ReasonexReviewRouter
./packages/reasonex-n8n-nodes/dist/ReasonexTreeBuilder
./packages/reasonex-n8n-nodes/node_modules
./packages/reasonex-n8n-nodes/node_modules/untildify
./packages/reasonex-n8n-nodes/node_modules/axios
./packages/reasonex-n8n-nodes/node_modules/axios/lib
./packages/reasonex-n8n-nodes/node_modules/axios/lib/cancel
./packages/reasonex-n8n-nodes/node_modules/axios/lib/defaults
./packages/reasonex-n8n-nodes/node_modules/axios/lib/adapters
./packages/reasonex-n8n-nodes/node_modules/axios/lib/core
./packages/reasonex-n8n-nodes/node_modules/axios/lib/env
./packages/reasonex-n8n-nodes/node_modules/axios/lib/env/classes
./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers
./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform
./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/browser
./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/browser/classes
./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/common
./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/node
./packages/reasonex-n8n-nodes/node_modules/axios/lib/platform/node/classes
./packages/reasonex-n8n-nodes/node_modules/axios/dist
./packages/reasonex-n8n-nodes/node_modules/axios/dist/browser
./packages/reasonex-n8n-nodes/node_modules/axios/dist/esm
./packages/reasonex-n8n-nodes/node_modules/axios/dist/node
./packages/reasonex-n8n-nodes/node_modules/asynckit
./packages/reasonex-n8n-nodes/node_modules/asynckit/lib
./packages/reasonex-n8n-nodes/node_modules/safe-buffer
./packages/reasonex-n8n-nodes/node_modules/esprima
./packages/reasonex-n8n-nodes/node_modules/esprima/dist
./packages/reasonex-n8n-nodes/node_modules/esprima/bin
./packages/reasonex-n8n-nodes/node_modules/es-object-atoms
./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/test
./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/.github
./packages/reasonex-n8n-nodes/node_modules/@n8n
./packages/reasonex-n8n-nodes/node_modules/@n8n/errors
./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/dist
./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament
./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/dist
./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/src
./packages/reasonex-n8n-nodes/node_modules/gopd
./packages/reasonex-n8n-nodes/node_modules/gopd/test
./packages/reasonex-n8n-nodes/node_modules/gopd/.github
./packages/reasonex-n8n-nodes/node_modules/fill-range
./packages/reasonex-n8n-nodes/node_modules/mime-types
./packages/reasonex-n8n-nodes/node_modules/mkdirp
./packages/reasonex-n8n-nodes/node_modules/mkdirp/lib
./packages/reasonex-n8n-nodes/node_modules/mkdirp/bin
./packages/reasonex-n8n-nodes/node_modules/recast
./packages/reasonex-n8n-nodes/node_modules/recast/lib
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types/lib
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types/def
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types/def/operators
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types/gen
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types/.github
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types/.github/workflows
./packages/reasonex-n8n-nodes/node_modules/recast/example
./packages/reasonex-n8n-nodes/node_modules/recast/parsers
./packages/reasonex-n8n-nodes/node_modules/recast/.github
./packages/reasonex-n8n-nodes/node_modules/recast/.github/workflows
./packages/reasonex-n8n-nodes/node_modules/json-schema-traverse
./packages/reasonex-n8n-nodes/node_modules/json-schema-traverse/spec
./packages/reasonex-n8n-nodes/node_modules/json-schema-traverse/spec/fixtures
./packages/reasonex-n8n-nodes/node_modules/deep-is
./packages/reasonex-n8n-nodes/node_modules/deep-is/example
./packages/reasonex-n8n-nodes/node_modules/deep-is/test
./packages/reasonex-n8n-nodes/node_modules/minimatch
./packages/reasonex-n8n-nodes/node_modules/minimatch/dist
./packages/reasonex-n8n-nodes/node_modules/minimatch/dist/mjs
./packages/reasonex-n8n-nodes/node_modules/minimatch/dist/cjs
./packages/reasonex-n8n-nodes/node_modules/eslint-scope
./packages/reasonex-n8n-nodes/node_modules/eslint-scope/lib

### 1.4 Count Files by Extension
   8618 js
   3312 ts
   3069 map
   1362 md
   1159 json
    260 mjs
    137 yml
     75 jst
     71 eslintrc
     49 nycrc
     41 cjs
     40 txt
     39 mts
     32 cts
     26 npmignore
     19 editorconfig
     16 markdown
     15 def
     14 svg
     10 jshintrc

========================================
SECTION 2: Package Dependencies
========================================

### 2.1 Core API package.json
{
  "name": "@reasonex/core-api",
  "version": "1.0.0",
  "description": "Reasonex Core API - Scoring, Validation, and Lock Management",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts"
  },
  "keywords": [
    "reasonex",
    "scoring",
    "validation",
    "value-investing"
  ],
  "author": "Reasonex",
  "license": "UNLICENSED",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "winston": "^3.11.0",
    "uuid": "^9.0.1",
    "ajv": "^8.12.0",
    "ajv-formats": "^2.1.1",
    "crypto-js": "^4.2.0",
    "deep-diff": "^1.0.2",
    "openai": "^4.28.0",
    "dotenv": "^16.4.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/node": "^20.11.5",
    "@types/uuid": "^9.0.7",
    "@types/crypto-js": "^4.2.1",
    "@types/deep-diff": "^1.0.5",
    "@types/jest": "^29.5.11",
    "typescript": "^5.3.3",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}

### 2.2 n8n Nodes package.json
{
  "name": "@reasonex/n8n-nodes",
  "version": "1.0.0",
  "description": "Reasonex proprietary n8n nodes for scoring, validation, and analysis",
  "keywords": [
    "n8n-community-node-package",
    "n8n",
    "reasonex",
    "scoring",
    "validation",
    "value-investing"
  ],
  "license": "UNLICENSED",
  "author": "Reasonex",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc && npm run copy-icons",
    "copy-icons": "copyfiles -u 1 \"nodes/**/*.svg\" dist/",
    "dev": "tsc --watch",
    "lint": "eslint nodes/**/*.ts credentials/**/*.ts lib/**/*.ts",
    "prepublishOnly": "npm run build"
  },
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/ReasonexApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/ReasonexLock/ReasonexLock.node.js",
      "dist/nodes/ReasonexRuleEngine/ReasonexRuleEngine.node.js",
      "dist/nodes/ReasonexValidation/ReasonexValidation.node.js",
      "dist/nodes/ReasonexTreeBuilder/ReasonexTreeBuilder.node.js",
      "dist/nodes/ReasonexChangeDetector/ReasonexChangeDetector.node.js",
      "dist/nodes/ReasonexReviewRouter/ReasonexReviewRouter.node.js",
      "dist/nodes/ReasonexExplanation/ReasonexExplanation.node.js"
    ]
  },
  "dependencies": {
    "axios": "^1.6.5",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/uuid": "^9.0.7",
    "copyfiles": "^2.4.1",
    "n8n-workflow": "^1.22.0",
    "typescript": "^5.3.3",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint": "^8.56.0"
  },
  "peerDependencies": {
    "n8n-workflow": ">=1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}

### 2.3 requirements.txt (Python)
NOT FOUND - No Python requirements

### 2.4 docker-compose.yml
# Docker Compose for local development/testing
# Run: docker-compose up -d

version: '3.8'

services:
  n8n:
    build: .
    container_name: valueinvest-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      # n8n Configuration
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD:-changeme}
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=${WEBHOOK_URL:-http://localhost:5678}
      - GENERIC_TIMEZONE=America/New_York

      # API Keys (from .env file)
      - FMP_API_KEY=${FMP_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_SHEET_ID=${GOOGLE_SHEET_ID}

      # Execution settings
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168
      - N8N_METRICS=true
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/home/node/.n8n/workflows:ro
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

volumes:
  n8n_data:
    driver: local

========================================
SECTION 3: Environment Configuration
========================================

### 3.1 .env Files Found
./.env.example

### 3.2 .env Keys (values masked)

### 3.3 Config Files
./packages/reasonex-n8n-nodes/node_modules/fast-glob/out/settings.js
./packages/reasonex-n8n-nodes/node_modules/fast-glob/out/settings.d.ts
./packages/reasonex-n8n-nodes/node_modules/zod/dist/esm/v4/core/config.js
./packages/reasonex-n8n-nodes/node_modules/zod/dist/types/v4/core/config.d.ts
./packages/reasonex-n8n-nodes/node_modules/zod/dist/cjs/v4/core/config.js
./packages/reasonex-n8n-nodes/node_modules/md5/webpack.config.js
./packages/reasonex-n8n-nodes/node_modules/jssha/rollup.config.mjs
./packages/reasonex-n8n-nodes/node_modules/fastq/eslint.config.js
./packages/reasonex-n8n-nodes/node_modules/@nodelib/fs.walk/out/settings.js
./packages/reasonex-n8n-nodes/node_modules/@nodelib/fs.walk/out/settings.d.ts
./packages/reasonex-n8n-nodes/node_modules/@nodelib/fs.scandir/out/settings.js
./packages/reasonex-n8n-nodes/node_modules/@nodelib/fs.scandir/out/settings.d.ts
./packages/reasonex-n8n-nodes/node_modules/@nodelib/fs.stat/out/settings.js
./packages/reasonex-n8n-nodes/node_modules/@nodelib/fs.stat/out/settings.d.ts
./packages/reasonex-n8n-nodes/node_modules/luxon/src/settings.js
./packages/reasonex-n8n-nodes/node_modules/reusify/eslint.config.js
./packages/reasonex-core-api/node_modules/fast-glob/out/settings.js
./packages/reasonex-core-api/node_modules/fast-glob/out/settings.d.ts
./packages/reasonex-core-api/node_modules/@so-ric/colorspace/rollup.config.js
./packages/reasonex-core-api/node_modules/qs/eslint.config.mjs

========================================
SECTION 4: Database Files
========================================

### 4.1 SQL Files

### 4.2 schema.sql Content
NOT FOUND - No schema.sql

### 4.3 Migration Files

### 4.4 Database Connection
psql (PostgreSQL) 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
========================================
SECTION 5: n8n Node Files
========================================

### 5.1 Node Directories
./packages/reasonex-n8n-nodes/nodes/ReasonexRuleEngine
./packages/reasonex-n8n-nodes/nodes/ReasonexChangeDetector
./packages/reasonex-n8n-nodes/nodes/ReasonexExplanation
./packages/reasonex-n8n-nodes/nodes/ReasonexValidation
./packages/reasonex-n8n-nodes/nodes/ReasonexLock
./packages/reasonex-n8n-nodes/nodes/ReasonexReviewRouter
./packages/reasonex-n8n-nodes/nodes/ReasonexTreeBuilder
./packages/reasonex-n8n-nodes/dist/ReasonexRuleEngine
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexRuleEngine
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexChangeDetector
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexExplanation
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexValidation
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexLock
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexReviewRouter
./packages/reasonex-n8n-nodes/dist/nodes/ReasonexTreeBuilder
./packages/reasonex-n8n-nodes/dist/ReasonexChangeDetector
./packages/reasonex-n8n-nodes/dist/ReasonexExplanation
./packages/reasonex-n8n-nodes/dist/ReasonexValidation
./packages/reasonex-n8n-nodes/dist/ReasonexLock
./packages/reasonex-n8n-nodes/dist/ReasonexReviewRouter
./packages/reasonex-n8n-nodes/dist/ReasonexTreeBuilder

### 5.2 ReasonexLock.node.ts
```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexLock implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reasonex Lock',
    name: 'reasonexLock',
    icon: 'file:lock.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Lock data with cryptographic hashing for immutability',
    defaults: {
      name: 'Reasonex Lock',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'reasonexApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Create Lock',
            value: 'createLock',
            description: 'Create a cryptographic lock for data',
            action: 'Create a cryptographic lock',
          },
          {
            name: 'Verify Lock',
            value: 'verifyLock',
            description: 'Verify data integrity against a lock',
            action: 'Verify a cryptographic lock',
          },
        ],
        default: 'createLock',
      },
      // Create Lock fields
      {
        displayName: 'Data',
        name: 'data',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        displayOptions: {
          show: {
            operation: ['createLock'],
          },
        },
        description: 'The data object to lock',
      },
      {
        displayName: 'Hash Algorithm',
        name: 'algorithm',
        type: 'options',
        options: [
          { name: 'SHA-256', value: 'SHA256' },
          { name: 'SHA3-256', value: 'SHA3-256' },
          { name: 'SHA-512', value: 'SHA512' },
        ],
        default: 'SHA256',
        displayOptions: {
          show: {
            operation: ['createLock'],
          },
        },
        description: 'Hash algorithm to use',
      },
      {
        displayName: 'Include Timestamp',
        name: 'includeTimestamp',
        type: 'boolean',
        default: true,
        displayOptions: {
          show: {
            operation: ['createLock'],
          },
        },
        description: 'Whether to include timestamp in hash calculation',
      },
      {
        displayName: 'Canonicalization',
        name: 'canonicalization',
        type: 'options',
        options: [
          { name: 'Strict', value: 'strict' },
          { name: 'Relaxed', value: 'relaxed' },
        ],
        default: 'strict',
        displayOptions: {
          show: {
            operation: ['createLock'],
          },
        },
        description: 'JSON canonicalization mode',
      },
      {
        displayName: 'Schema ID',
        name: 'schemaId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['createLock'],
          },
        },
        description: 'Optional schema identifier for the data',
      },
      // Verify Lock fields
      {
        displayName: 'Data to Verify',
        name: 'verifyData',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        displayOptions: {
          show: {
            operation: ['verifyLock'],
          },
        },
        description: 'The data to verify',
      },
      {
        displayName: 'Expected Hash',
        name: 'expectedHash',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['verifyLock'],
          },
        },
        description: 'The hash to verify against',
      },
      {
        displayName: 'Lock Timestamp',
        name: 'lockTimestamp',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['verifyLock'],
          },
        },
        description: 'Original lock timestamp (if timestamp was included in hash)',
      },
      // Debug mode
      {
        displayName: 'Debug Mode',
        name: 'debugMode',
        type: 'boolean',
        default: false,
        description: 'Whether to enable detailed logging',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexLock', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;

        if (operation === 'createLock') {
          const data = this.getNodeParameter('data', i) as object;
          const algorithm = this.getNodeParameter('algorithm', i) as string;
          const includeTimestamp = this.getNodeParameter('includeTimestamp', i) as boolean;
          const canonicalization = this.getNodeParameter('canonicalization', i) as string;
          const schemaId = this.getNodeParameter('schemaId', i) as string;

          logger.info('Creating lock', { algorithm, includeTimestamp, canonicalization });

          const response = await apiClient.createLock(data as IDataObject, {
            algorithm: algorithm as 'SHA256' | 'SHA3-256' | 'SHA512',
            includeTimestamp,
            canonicalization: canonicalization as 'strict' | 'relaxed',
            schemaId: schemaId || undefined,
          });

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Lock creation failed');
          }
        } else if (operation === 'verifyLock') {
          const verifyData = this.getNodeParameter('verifyData', i) as object;
          const expectedHash = this.getNodeParameter('expectedHash', i) as string;
          const lockTimestamp = this.getNodeParameter('lockTimestamp', i) as string;

          logger.info('Verifying lock', { hashPrefix: expectedHash.slice(0, 16) });

          const response = await apiClient.verifyLock(
            verifyData as IDataObject,
            expectedHash,
            lockTimestamp || undefined
          );

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Lock verification failed');
          }
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
```

### 5.3 ReasonexRuleEngine.node.ts
```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexRuleEngine implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reasonex Rule Engine',
    name: 'reasonexRuleEngine',
    icon: 'file:engine.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Score data using configurable rule sets',
    defaults: {
      name: 'Reasonex Rule Engine',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'reasonexApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Score',
            value: 'score',
            description: 'Score data against a rule set',
            action: 'Score data',
          },
          {
            name: 'Batch Score',
            value: 'batchScore',
            description: 'Score multiple items in batch',
            action: 'Batch score data',
          },
          {
            name: 'Get Rule Sets',
            value: 'getRuleSets',
            description: 'Get available rule sets',
            action: 'Get rule sets',
          },
        ],
        default: 'score',
      },
      // Score fields
      {
        displayName: 'Data',
        name: 'data',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        displayOptions: {
          show: {
            operation: ['score'],
          },
        },
        description: 'The data object to score',
      },
      {
        displayName: 'Rule Set ID',
        name: 'ruleSetId',
        type: 'options',
        options: [
          { name: 'Investment V1', value: 'investment-v1' },
          { name: 'Legal Costs V1', value: 'legal-costs-v1' },
          { name: 'Custom', value: 'custom' },
        ],
        default: 'investment-v1',
        displayOptions: {
          show: {
            operation: ['score', 'batchScore'],
          },
        },
        description: 'The rule set to use for scoring',
      },
      {
        displayName: 'Custom Rule Set ID',
        name: 'customRuleSetId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['score', 'batchScore'],
            ruleSetId: ['custom'],
          },
        },
        description: 'Custom rule set ID',
      },
      {
        displayName: 'Context',
        name: 'context',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            operation: ['score', 'batchScore'],
          },
        },
        description: 'Additional context for scoring (e.g., vertical, jurisdiction)',
      },
      // Batch Score fields
      {
        displayName: 'Items Field',
        name: 'itemsField',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['batchScore'],
          },
        },
        description: 'Field containing array of items to score (leave empty to use all input items)',
      },
      // Debug mode
      {
        displayName: 'Debug Mode',
        name: 'debugMode',
        type: 'boolean',
        default: false,
        description: 'Whether to include detailed scoring breakdown in output',
      },
      {
        displayName: 'Return Explanation',
        name: 'returnExplanation',
        type: 'boolean',
        default: true,
        displayOptions: {
          show: {
            operation: ['score'],
          },
        },
        description: 'Whether to include human-readable explanation',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexRuleEngine', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    const operation = this.getNodeParameter('operation', 0) as string;

    if (operation === 'getRuleSets') {
      logger.info('Getting rule sets');
      const response = await apiClient.getRuleSets();

      if (response.success && response.result) {
        returnData.push({
          json: response.result,
        });
      } else {
        throw new Error(response.message || response.error || 'Failed to get rule sets');
      }
    } else if (operation === 'batchScore') {
      const ruleSetIdParam = this.getNodeParameter('ruleSetId', 0) as string;
      const customRuleSetId = this.getNodeParameter('customRuleSetId', 0) as string;
      const ruleSetId = ruleSetIdParam === 'custom' ? customRuleSetId : ruleSetIdParam;
      const context = this.getNodeParameter('context', 0) as object;
      const itemsField = this.getNodeParameter('itemsField', 0) as string;

      // Get items to score
      let itemsToScore: Record<string, unknown>[];
      if (itemsField) {
        itemsToScore = items[0].json[itemsField] as IDataObject[];
      } else {
        itemsToScore = items.map(item => item.json);
      }

      logger.info('Batch scoring', { ruleSetId, itemCount: itemsToScore.length });

      const response = await apiClient.batchScore(itemsToScore, ruleSetId, context as IDataObject, debugMode);

      if (response.success && response.result) {
        returnData.push({
          json: response.result as IDataObject,
        });
      } else {
        throw new Error(response.message || response.error || 'Batch scoring failed');
      }
    } else {
      // Single score operation
      for (let i = 0; i < items.length; i++) {
        try {
          const data = this.getNodeParameter('data', i) as object;
          const ruleSetIdParam = this.getNodeParameter('ruleSetId', i) as string;
          const customRuleSetId = this.getNodeParameter('customRuleSetId', i) as string;
          const ruleSetId = ruleSetIdParam === 'custom' ? customRuleSetId : ruleSetIdParam;
          const context = this.getNodeParameter('context', i) as object;

          logger.info('Scoring item', { index: i, ruleSetId });

          const response = await apiClient.score(
            data as IDataObject,
            ruleSetId,
            context as IDataObject,
            debugMode
          );

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Scoring failed');
          }
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({
              json: {
                error: error instanceof Error ? error.message : String(error),
              },
              pairedItem: { item: i },
            });
            continue;
          }
          throw error;
        }
      }
    }

    return [returnData];
  }
}
```

### 5.4 ReasonexValidation.node.ts
```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexValidation implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reasonex Validation',
    name: 'reasonexValidation',
    icon: 'file:validation.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Validate data with 5-check framework including hallucination detection',
    defaults: {
      name: 'Reasonex Validation',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'reasonexApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Validate',
            value: 'validate',
            description: 'Validate analysis data',
            action: 'Validate data',
          },
          {
            name: 'Get Profiles',
            value: 'getProfiles',
            description: 'Get available validation profiles',
            action: 'Get profiles',
          },
        ],
        default: 'validate',
      },
      // Validate fields
      {
        displayName: 'Analysis Data',
        name: 'analysis',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        displayOptions: {
          show: {
            operation: ['validate'],
          },
        },
        description: 'The analysis data to validate',
      },
      {
        displayName: 'Validation Profile',
        name: 'profile',
        type: 'options',
        options: [
          { name: 'Financial Strict', value: 'financial-strict' },
          { name: 'General', value: 'general' },
          { name: 'Custom', value: 'custom' },
        ],
        default: 'financial-strict',
        displayOptions: {
          show: {
            operation: ['validate'],
          },
        },
        description: 'Validation profile to use',
      },
      {
        displayName: 'Custom Profile ID',
        name: 'customProfile',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['validate'],
            profile: ['custom'],
          },
        },
        description: 'Custom profile ID',
      },
      {
        displayName: 'Checks to Run',
        name: 'checks',
        type: 'multiOptions',
        options: [
          { name: 'Schema Validation', value: 'schema' },
          { name: 'Coverage Check', value: 'coverage' },
          { name: 'Source Verification', value: 'sources' },
          { name: 'Hallucination Detection', value: 'hallucination' },
          { name: 'Rules Validation', value: 'rules' },
        ],
        default: ['schema', 'coverage', 'hallucination', 'rules'],
        displayOptions: {
          show: {
            operation: ['validate'],
          },
        },
        description: 'Which validation checks to run',
      },
      {
        displayName: 'Strictness',
        name: 'strictness',
        type: 'options',
        options: [
          { name: 'Strict', value: 'strict' },
          { name: 'Normal', value: 'normal' },
          { name: 'Lenient', value: 'lenient' },
        ],
        default: 'normal',
        displayOptions: {
          show: {
            operation: ['validate'],
          },
        },
        description: 'Validation strictness level',
      },
      {
        displayName: 'Hallucination Sensitivity',
        name: 'hallucinationSensitivity',
        type: 'options',
        options: [
          { name: 'High', value: 'high' },
          { name: 'Medium', value: 'medium' },
          { name: 'Low', value: 'low' },
        ],
        default: 'medium',
        displayOptions: {
          show: {
            operation: ['validate'],
          },
        },
        description: 'Sensitivity for hallucination detection',
      },
      {
        displayName: 'Source Documents',
        name: 'sources',
        type: 'json',
        default: '[]',
        displayOptions: {
          show: {
            operation: ['validate'],
          },
        },
        description: 'Source documents for verification',
      },
      {
        displayName: 'Scores',
        name: 'scores',
        type: 'json',
        default: '',
        displayOptions: {
          show: {
            operation: ['validate'],
          },
        },
        description: 'Scores to validate (from Rule Engine)',
      },
      // Debug mode
      {
        displayName: 'Debug Mode',
        name: 'debugMode',
        type: 'boolean',
        default: false,
        description: 'Whether to include detailed validation breakdown',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexValidation', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    const operation = this.getNodeParameter('operation', 0) as string;

    if (operation === 'getProfiles') {
      logger.info('Getting validation profiles');
      const response = await apiClient.getValidationProfiles();

      if (response.success && response.result) {
        returnData.push({
          json: response.result,
        });
      } else {
        throw new Error(response.message || response.error || 'Failed to get profiles');
      }
    } else {
      for (let i = 0; i < items.length; i++) {
        try {
          const analysis = this.getNodeParameter('analysis', i) as object;
          const profileParam = this.getNodeParameter('profile', i) as string;
          const customProfile = this.getNodeParameter('customProfile', i) as string;
          const profile = profileParam === 'custom' ? customProfile : profileParam;
          const checks = this.getNodeParameter('checks', i) as string[];
          const strictness = this.getNodeParameter('strictness', i) as string;
          const hallucinationSensitivity = this.getNodeParameter('hallucinationSensitivity', i) as string;
          const sources = this.getNodeParameter('sources', i) as unknown[];
          const scoresStr = this.getNodeParameter('scores', i) as string;

          let scores: Record<string, unknown> | undefined;
          if (scoresStr && scoresStr.trim()) {
            scores = typeof scoresStr === 'string' ? JSON.parse(scoresStr) : scoresStr;
          }

          logger.info('Validating item', { index: i, profile, checks });

          const response = await apiClient.validate(
            analysis as IDataObject,
            {
              sources: sources as unknown[],
              scores,
              profile,
              checks,
              strictness: strictness as 'strict' | 'normal' | 'lenient',
              hallucinationSensitivity: hallucinationSensitivity as 'high' | 'medium' | 'low',
              debugMode,
            }
          );

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Validation failed');
          }
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({
              json: {
                error: error instanceof Error ? error.message : String(error),
              },
              pairedItem: { item: i },
            });
            continue;
          }
          throw error;
        }
      }
    }

    return [returnData];
  }
}
```

### 5.5 ReasonexTreeBuilder.node.ts
```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexTreeBuilder implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reasonex Tree Builder',
    name: 'reasonexTreeBuilder',
    icon: 'file:tree.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Build structured analysis trees using AI',
    defaults: {
      name: 'Reasonex Tree Builder',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'reasonexApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Build Tree',
            value: 'buildTree',
            description: 'Build analysis tree from entity and documents',
            action: 'Build analysis tree',
          },
          {
            name: 'Get Schemas',
            value: 'getSchemas',
            description: 'Get available tree schemas',
            action: 'Get schemas',
          },
        ],
        default: 'buildTree',
      },
      // Build Tree fields
      {
        displayName: 'Entity',
        name: 'entity',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'The entity to analyze (e.g., company data)',
      },
      {
        displayName: 'Documents',
        name: 'documents',
        type: 'json',
        default: '[]',
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'Source documents for analysis',
      },
      {
        displayName: 'Schema',
        name: 'schema',
        type: 'options',
        options: [
          { name: 'Company Analysis (6D)', value: 'company-6d' },
          { name: 'Legal Cost Tree', value: 'legal-cost-tree' },
          { name: 'Custom', value: 'custom' },
        ],
        default: 'company-6d',
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'Tree schema to use',
      },
      {
        displayName: 'Custom Schema ID',
        name: 'customSchema',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['buildTree'],
            schema: ['custom'],
          },
        },
        description: 'Custom schema ID',
      },
      {
        displayName: 'LLM Provider',
        name: 'llmProvider',
        type: 'options',
        options: [
          { name: 'OpenAI', value: 'openai' },
          { name: 'Anthropic', value: 'anthropic' },
        ],
        default: 'openai',
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'AI provider to use',
      },
      {
        displayName: 'Model',
        name: 'llmModel',
        type: 'options',
        options: [
          { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
          { name: 'GPT-4o', value: 'gpt-4o' },
          { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
          { name: 'Claude 3 Sonnet', value: 'claude-sonnet-4-20250514' },
          { name: 'Claude 3 Opus', value: 'claude-opus-4-20250514' },
        ],
        default: 'gpt-4o-mini',
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'AI model to use',
      },
      {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 1,
          numberStepSize: 0.1,
        },
        default: 0.3,
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'AI temperature (0 = deterministic, 1 = creative)',
      },
      // Debug mode
      {
        displayName: 'Debug Mode',
        name: 'debugMode',
        type: 'boolean',
        default: false,
        description: 'Whether to include detailed metadata in output',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexTreeBuilder', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      openaiApiKey: credentials.openaiApiKey as string,
      debugMode,
    }, logger);

    const operation = this.getNodeParameter('operation', 0) as string;

    if (operation === 'getSchemas') {
      logger.info('Getting tree schemas');
      const response = await apiClient.getTreeSchemas();

      if (response.success && response.result) {
        returnData.push({
          json: response.result,
        });
      } else {
        throw new Error(response.message || response.error || 'Failed to get schemas');
      }
    } else {
      for (let i = 0; i < items.length; i++) {
        try {
          const entity = this.getNodeParameter('entity', i) as object;
          const documents = this.getNodeParameter('documents', i) as unknown[];
          const schemaParam = this.getNodeParameter('schema', i) as string;
          const customSchema = this.getNodeParameter('customSchema', i) as string;
          const schema = schemaParam === 'custom' ? customSchema : schemaParam;
          const llmProvider = this.getNodeParameter('llmProvider', i) as string;
          const llmModel = this.getNodeParameter('llmModel', i) as string;
          const temperature = this.getNodeParameter('temperature', i) as number;

          logger.info('Building tree', { index: i, schema, llmProvider, llmModel });

          const response = await apiClient.buildTree(
            entity as IDataObject,
            documents,
            schema,
            {
              llmConfig: {
                provider: llmProvider as 'openai' | 'anthropic',
                model: llmModel,
                temperature,
              },
              debugMode,
            }
          );

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Tree building failed');
          }
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({
              json: {
                error: error instanceof Error ? error.message : String(error),
              },
              pairedItem: { item: i },
            });
            continue;
          }
          throw error;
        }
      }
    }

    return [returnData];
  }
}
```

### 5.6 ReasonexChangeDetector.node.ts
```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexChangeDetector implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reasonex Change Detector',
    name: 'reasonexChangeDetector',
    icon: 'file:detect.svg',
    group: ['transform'],
    version: 1,
    subtitle: 'Detect changes between versions',
    description: 'Detect and assess impact of changes between data versions',
    defaults: {
      name: 'Reasonex Change Detector',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'reasonexApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Old Version',
        name: 'oldVersion',
        type: 'json',
        default: '',
        required: true,
        description: 'The previous version of the data',
      },
      {
        displayName: 'New Version',
        name: 'newVersion',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        description: 'The new version of the data',
      },
      {
        displayName: 'Comparison Depth',
        name: 'comparisonDepth',
        type: 'options',
        options: [
          { name: 'Deep', value: 'deep' },
          { name: 'Shallow', value: 'shallow' },
        ],
        default: 'deep',
        description: 'Depth of comparison',
      },
      {
        displayName: 'High Impact Fields',
        name: 'highImpactFields',
        type: 'string',
        default: 'totalScore,classification,recommendation',
        description: 'Comma-separated list of high impact fields',
      },
      {
        displayName: 'Numeric Tolerance (%)',
        name: 'numericTolerance',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 100,
          numberStepSize: 0.5,
        },
        default: 1,
        description: 'Percentage tolerance for numeric changes',
      },
      {
        displayName: 'Ignore Fields',
        name: 'ignoreFields',
        type: 'string',
        default: 'timestamp,lastUpdated,_id',
        description: 'Comma-separated list of fields to ignore',
      },
      // Debug mode
      {
        displayName: 'Debug Mode',
        name: 'debugMode',
        type: 'boolean',
        default: false,
        description: 'Whether to include detailed debug info',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexChangeDetector', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    for (let i = 0; i < items.length; i++) {
      try {
        const oldVersionStr = this.getNodeParameter('oldVersion', i) as string;
        const newVersionStr = this.getNodeParameter('newVersion', i) as string;
        const comparisonDepth = this.getNodeParameter('comparisonDepth', i) as string;
        const highImpactFieldsStr = this.getNodeParameter('highImpactFields', i) as string;
        const numericTolerance = this.getNodeParameter('numericTolerance', i) as number;
        const ignoreFieldsStr = this.getNodeParameter('ignoreFields', i) as string;

        const oldVersion = typeof oldVersionStr === 'string' ? JSON.parse(oldVersionStr) : oldVersionStr;
        const newVersion = typeof newVersionStr === 'string' ? JSON.parse(newVersionStr) : newVersionStr;

        const highImpactFields = highImpactFieldsStr.split(',').map(f => f.trim()).filter(f => f);
        const ignoreFields = ignoreFieldsStr.split(',').map(f => f.trim()).filter(f => f);

        logger.info('Detecting changes', { index: i, comparisonDepth });

        const response = await apiClient.detectChanges(
          oldVersion,
          newVersion,
          {
            materialityConfig: {
              highImpactFields,
              numericTolerance,
              ignoreFields,
            },
            comparisonDepth: comparisonDepth as 'shallow' | 'deep',
            debugMode,
          }
        );

        if (response.success && response.result) {
          returnData.push({
            json: response.result as IDataObject,
            pairedItem: { item: i },
          });
        } else {
          throw new Error(response.message || response.error || 'Change detection failed');
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
```

### 5.7 ReasonexReviewRouter.node.ts
```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexReviewRouter implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reasonex Review Router',
    name: 'reasonexReviewRouter',
    icon: 'file:router.svg',
    group: ['transform'],
    version: 1,
    subtitle: 'Route to Tier {{$parameter["outputTier"]}}',
    description: 'Route changes to appropriate review tiers',
    defaults: {
      name: 'Reasonex Review Router',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'reasonexApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Route',
            value: 'route',
            description: 'Route change to review tier',
            action: 'Route change',
          },
          {
            name: 'Get Tier Config',
            value: 'getTierConfig',
            description: 'Get tier configuration for a vertical',
            action: 'Get tier config',
          },
        ],
        default: 'route',
      },
      // Route fields
      {
        displayName: 'Impact Score',
        name: 'impactScore',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: {
          show: {
            operation: ['route'],
          },
        },
        description: 'Impact score from Change Detector (0-100)',
      },
      {
        displayName: 'Materiality',
        name: 'materiality',
        type: 'options',
        options: [
          { name: 'High', value: 'HIGH' },
          { name: 'Medium', value: 'MEDIUM' },
          { name: 'Low', value: 'LOW' },
        ],
        default: 'MEDIUM',
        required: true,
        displayOptions: {
          show: {
            operation: ['route'],
          },
        },
        description: 'Materiality level from Change Detector',
      },
      {
        displayName: 'Changes Count',
        name: 'changesCount',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            operation: ['route'],
          },
        },
        description: 'Number of changes detected',
      },
      {
        displayName: 'Affected Paths',
        name: 'affectedPaths',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['route'],
          },
        },
        description: 'Comma-separated list of affected data paths',
      },
      {
        displayName: 'Urgency',
        name: 'urgency',
        type: 'options',
        options: [
          { name: 'Critical', value: 'critical' },
          { name: 'High', value: 'high' },
          { name: 'Normal', value: 'normal' },
          { name: 'Low', value: 'low' },
        ],
        default: 'normal',
        displayOptions: {
          show: {
            operation: ['route'],
          },
        },
        description: 'Urgency level for review',
      },
      {
        displayName: 'Client Tier',
        name: 'clientTier',
        type: 'options',
        options: [
          { name: 'Enterprise', value: 'enterprise' },
          { name: 'Premium', value: 'premium' },
          { name: 'Standard', value: 'standard' },
          { name: 'Basic', value: 'basic' },
        ],
        default: 'standard',
        displayOptions: {
          show: {
            operation: ['route'],
          },
        },
        description: 'Client tier for SLA calculation',
      },
      {
        displayName: 'Vertical',
        name: 'vertical',
        type: 'options',
        options: [
          { name: 'Investment', value: 'investment' },
          { name: 'Legal', value: 'legal' },
          { name: 'Healthcare', value: 'healthcare' },
          { name: 'Insurance', value: 'insurance' },
        ],
        default: 'investment',
        description: 'Business vertical for tier configuration',
      },
      {
        displayName: 'Confidence',
        name: 'confidence',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 1,
          numberStepSize: 0.1,
        },
        default: 0.8,
        displayOptions: {
          show: {
            operation: ['route'],
          },
        },
        description: 'Confidence score (for auto-approve eligibility)',
      },
      // Debug mode
      {
        displayName: 'Debug Mode',
        name: 'debugMode',
        type: 'boolean',
        default: false,
        description: 'Whether to include routing reasoning in output',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexReviewRouter', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    const operation = this.getNodeParameter('operation', 0) as string;

    if (operation === 'getTierConfig') {
      const vertical = this.getNodeParameter('vertical', 0) as string;
      logger.info('Getting tier config', { vertical });

      // Call the API (this would need a corresponding endpoint)
      returnData.push({
        json: {
          vertical,
          message: 'Tier configuration retrieved',
        },
      });
    } else {
      for (let i = 0; i < items.length; i++) {
        try {
          const impactScore = this.getNodeParameter('impactScore', i) as number;
          const materiality = this.getNodeParameter('materiality', i) as string;
          const changesCount = this.getNodeParameter('changesCount', i) as number;
          const affectedPathsStr = this.getNodeParameter('affectedPaths', i) as string;
          const urgency = this.getNodeParameter('urgency', i) as string;
          const clientTier = this.getNodeParameter('clientTier', i) as string;
          const vertical = this.getNodeParameter('vertical', i) as string;
          const confidence = this.getNodeParameter('confidence', i) as number;

          const affectedPaths = affectedPathsStr.split(',').map(p => p.trim()).filter(p => p);

          logger.info('Routing change', { index: i, impactScore, materiality, urgency });

          const response = await apiClient.route(
            {
              impactScore,
              materiality: materiality as 'HIGH' | 'MEDIUM' | 'LOW',
              changesCount,
              affectedPaths,
            },
            {
              urgency: urgency as 'critical' | 'high' | 'normal' | 'low',
              clientTier: clientTier as 'enterprise' | 'premium' | 'standard' | 'basic',
              vertical,
              confidence,
            }
          );

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Routing failed');
          }
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({
              json: {
                error: error instanceof Error ? error.message : String(error),
              },
              pairedItem: { item: i },
            });
            continue;
          }
          throw error;
        }
      }
    }

    return [returnData];
  }
}
```

### 5.8 ReasonexExplanation.node.ts
```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexExplanation implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reasonex Explanation',
    name: 'reasonexExplanation',
    icon: 'file:explanation.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["audience"]}} explanation',
    description: 'Generate human-readable explanations for scoring results',
    defaults: {
      name: 'Reasonex Explanation',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'reasonexApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Scoring Result',
        name: 'scoringResult',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        description: 'The scoring result from Rule Engine to explain',
      },
      {
        displayName: 'Audience',
        name: 'audience',
        type: 'options',
        options: [
          { name: 'Expert', value: 'expert', description: 'Technical, detailed explanations' },
          { name: 'Professional', value: 'professional', description: 'Business-level explanations' },
          { name: 'Consumer', value: 'consumer', description: 'Simple, accessible explanations' },
        ],
        default: 'professional',
        description: 'Target audience for the explanation',
      },
      {
        displayName: 'Verbosity',
        name: 'verbosity',
        type: 'options',
        options: [
          { name: 'Brief', value: 'brief', description: 'Short summary only' },
          { name: 'Standard', value: 'standard', description: 'Summary with key factors' },
          { name: 'Detailed', value: 'detailed', description: 'Full breakdown with all details' },
        ],
        default: 'standard',
        description: 'Level of detail in explanation',
      },
      {
        displayName: 'Include Citations',
        name: 'includeCitations',
        type: 'boolean',
        default: true,
        description: 'Whether to include data citations in explanation',
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'options',
        options: [
          { name: 'English', value: 'en' },
        ],
        default: 'en',
        description: 'Language for explanation',
      },
      // Debug mode
      {
        displayName: 'Debug Mode',
        name: 'debugMode',
        type: 'boolean',
        default: false,
        description: 'Whether to include generation metadata',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexExplanation', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    for (let i = 0; i < items.length; i++) {
      try {
        const scoringResultStr = this.getNodeParameter('scoringResult', i) as string;
        const audience = this.getNodeParameter('audience', i) as string;
        const verbosity = this.getNodeParameter('verbosity', i) as string;
        const includeCitations = this.getNodeParameter('includeCitations', i) as boolean;
        const language = this.getNodeParameter('language', i) as string;

        const scoringResult = typeof scoringResultStr === 'string'
          ? JSON.parse(scoringResultStr)
          : scoringResultStr;

        logger.info('Generating explanation', { index: i, audience, verbosity });

        const response = await apiClient.generateExplanation(
          scoringResult,
          {
            audience: audience as 'expert' | 'professional' | 'consumer',
            verbosity: verbosity as 'brief' | 'standard' | 'detailed',
            includeCitations,
            language,
          }
        );

        if (response.success && response.result) {
          returnData.push({
            json: response.result as IDataObject,
            pairedItem: { item: i },
          });
        } else {
          throw new Error(response.message || response.error || 'Explanation generation failed');
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
```
========================================
SECTION 6: Core API Files
========================================

### 6.1 TypeScript API Files (Core API is TypeScript, not Python)
./packages/reasonex-core-api/dist/lib/logger.d.ts
./packages/reasonex-core-api/dist/lib/tracer.d.ts
./packages/reasonex-core-api/dist/engines/tree-builder.d.ts
./packages/reasonex-core-api/dist/engines/rule-engine.d.ts
./packages/reasonex-core-api/dist/engines/explanation-generator.d.ts
./packages/reasonex-core-api/dist/engines/tier-router.d.ts
./packages/reasonex-core-api/dist/engines/validator.d.ts
./packages/reasonex-core-api/dist/engines/change-detector.d.ts
./packages/reasonex-core-api/dist/engines/lock-manager.d.ts
./packages/reasonex-core-api/dist/index.d.ts
./packages/reasonex-core-api/dist/routes/detect.d.ts
./packages/reasonex-core-api/dist/routes/tree.d.ts
./packages/reasonex-core-api/dist/routes/validate.d.ts
./packages/reasonex-core-api/dist/routes/route.d.ts
./packages/reasonex-core-api/dist/routes/score.d.ts
./packages/reasonex-core-api/dist/routes/lock.d.ts
./packages/reasonex-core-api/node_modules/safe-buffer/index.d.ts
./packages/reasonex-core-api/node_modules/kleur/kleur.d.ts
./packages/reasonex-core-api/node_modules/sisteransi/src/sisteransi.d.ts
./packages/reasonex-core-api/node_modules/side-channel-map/index.d.ts
./packages/reasonex-core-api/node_modules/es-object-atoms/ToObject.d.ts
./packages/reasonex-core-api/node_modules/es-object-atoms/index.d.ts
./packages/reasonex-core-api/node_modules/es-object-atoms/isObject.d.ts
./packages/reasonex-core-api/node_modules/es-object-atoms/RequireObjectCoercible.d.ts
./packages/reasonex-core-api/node_modules/human-signals/build/src/main.d.ts
./packages/reasonex-core-api/node_modules/gopd/index.d.ts
./packages/reasonex-core-api/node_modules/gopd/gOPD.d.ts
./packages/reasonex-core-api/node_modules/json-schema-traverse/index.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/mjs/ast.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/mjs/unescape.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/mjs/brace-expressions.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/mjs/assert-valid-pattern.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/mjs/index.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/mjs/escape.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/cjs/ast.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/cjs/unescape.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/cjs/brace-expressions.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/cjs/assert-valid-pattern.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/cjs/index.d.ts
./packages/reasonex-core-api/node_modules/minimatch/dist/cjs/escape.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/sync.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/filters/entry.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/filters/error.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/filters/deep.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/matchers/matcher.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/matchers/partial.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/provider.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/async.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/transformers/entry.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/providers/stream.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/types/index.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/settings.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/utils/pattern.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/utils/fs.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/utils/index.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/utils/array.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/utils/errno.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/utils/string.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/utils/path.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/utils/stream.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/index.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/managers/tasks.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/readers/sync.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/readers/reader.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/readers/async.d.ts
./packages/reasonex-core-api/node_modules/fast-glob/out/readers/stream.d.ts
./packages/reasonex-core-api/node_modules/has-symbols/index.d.ts
./packages/reasonex-core-api/node_modules/has-symbols/shams.d.ts
./packages/reasonex-core-api/node_modules/acorn/dist/acorn.d.ts
./packages/reasonex-core-api/node_modules/stack-utils/node_modules/escape-string-regexp/index.d.ts
./packages/reasonex-core-api/node_modules/@humanwhocodes/module-importer/dist/module-importer.d.ts
./packages/reasonex-core-api/node_modules/picocolors/types.d.ts
./packages/reasonex-core-api/node_modules/picocolors/picocolors.d.ts
./packages/reasonex-core-api/node_modules/jest-environment-node/build/index.d.ts
./packages/reasonex-core-api/node_modules/winston/lib/winston/transports/index.d.ts
./packages/reasonex-core-api/node_modules/winston/lib/winston/config/index.d.ts
./packages/reasonex-core-api/node_modules/winston/index.d.ts
./packages/reasonex-core-api/node_modules/string-length/index.d.ts
./packages/reasonex-core-api/node_modules/anymatch/index.d.ts
./packages/reasonex-core-api/node_modules/call-bind-apply-helpers/applyBind.d.ts
./packages/reasonex-core-api/node_modules/call-bind-apply-helpers/actualApply.d.ts
./packages/reasonex-core-api/node_modules/call-bind-apply-helpers/reflectApply.d.ts
./packages/reasonex-core-api/node_modules/call-bind-apply-helpers/index.d.ts
./packages/reasonex-core-api/node_modules/call-bind-apply-helpers/functionApply.d.ts
./packages/reasonex-core-api/node_modules/call-bind-apply-helpers/functionCall.d.ts
./packages/reasonex-core-api/node_modules/color/node_modules/color-convert/index.d.ts
./packages/reasonex-core-api/node_modules/color/index.d.ts
./packages/reasonex-core-api/node_modules/make-error/index.d.ts
./packages/reasonex-core-api/node_modules/emoji-regex/index.d.ts
./packages/reasonex-core-api/node_modules/jest-resolve-dependencies/build/index.d.ts
./packages/reasonex-core-api/node_modules/jest-snapshot/build/index.d.ts
./packages/reasonex-core-api/node_modules/globals/index.d.ts
./packages/reasonex-core-api/node_modules/word-wrap/index.d.ts
./packages/reasonex-core-api/node_modules/get-proto/Object.getPrototypeOf.d.ts
./packages/reasonex-core-api/node_modules/get-proto/Reflect.getPrototypeOf.d.ts
./packages/reasonex-core-api/node_modules/get-proto/index.d.ts
./packages/reasonex-core-api/node_modules/chalk/index.d.ts
./packages/reasonex-core-api/node_modules/pirates/index.d.ts
./packages/reasonex-core-api/node_modules/find-up/index.d.ts
./packages/reasonex-core-api/node_modules/create-jest/build/index.d.ts
./packages/reasonex-core-api/node_modules/strip-json-comments/index.d.ts
./packages/reasonex-core-api/node_modules/acorn-jsx/index.d.ts
./packages/reasonex-core-api/node_modules/jest-watcher/build/index.d.ts
./packages/reasonex-core-api/node_modules/tsconfig/dist/tsconfig.spec.d.ts
./packages/reasonex-core-api/node_modules/tsconfig/dist/tsconfig.d.ts
./packages/reasonex-core-api/node_modules/p-try/index.d.ts
./packages/reasonex-core-api/node_modules/@eslint-community/eslint-utils/index.d.ts
./packages/reasonex-core-api/node_modules/@eslint-community/regexpp/index.d.ts
./packages/reasonex-core-api/node_modules/globby/index.d.ts
./packages/reasonex-core-api/node_modules/strip-bom/index.d.ts
./packages/reasonex-core-api/node_modules/es-set-tostringtag/index.d.ts
./packages/reasonex-core-api/node_modules/dunder-proto/get.d.ts
./packages/reasonex-core-api/node_modules/dunder-proto/set.d.ts
./packages/reasonex-core-api/node_modules/graphemer/lib/boundaries.d.ts
./packages/reasonex-core-api/node_modules/graphemer/lib/GraphemerHelper.d.ts
./packages/reasonex-core-api/node_modules/graphemer/lib/index.d.ts
./packages/reasonex-core-api/node_modules/graphemer/lib/Graphemer.d.ts
./packages/reasonex-core-api/node_modules/graphemer/lib/GraphemerIterator.d.ts
./packages/reasonex-core-api/node_modules/cjs-module-lexer/lexer.d.ts
./packages/reasonex-core-api/node_modules/web-streams-polyfill/types/ponyfill.d.ts
./packages/reasonex-core-api/node_modules/web-streams-polyfill/types/polyfill.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.symbol.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.decorators.legacy.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/tsserverlibrary.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2021.weakref.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.iterable.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.bigint.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.scripthost.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2018.full.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2023.array.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2018.intl.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es6.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2019.string.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2016.array.include.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.proxy.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2022.full.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.iterator.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.string.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2017.full.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2021.string.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2024.object.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2022.error.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2019.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.webworker.asynciterable.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2019.object.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2018.asynciterable.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.dom.asynciterable.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2023.full.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2024.promise.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2024.collection.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.reflect.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.collection.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2017.string.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.promise.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.symbol.wellknown.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2019.full.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.intl.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.number.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.dom.iterable.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2017.date.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.dom.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2022.array.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2022.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.promise.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.disposable.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2022.intl.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2023.collection.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.webworker.importscripts.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2016.full.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/typescript.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2021.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.decorators.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2018.asyncgenerator.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2024.sharedmemory.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.error.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2022.object.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2018.regexp.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2019.symbol.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2019.intl.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.webworker.iterable.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2023.intl.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2024.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.full.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2023.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es5.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.generator.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2017.sharedmemory.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2016.intl.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.array.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.sharedmemory.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.date.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.float16.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2017.intl.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2016.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.collection.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2018.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2024.regexp.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2024.string.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2017.object.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2021.promise.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2024.arraybuffer.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.intl.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2022.string.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.sharedmemory.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2017.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2017.arraybuffer.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.webworker.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2019.array.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2015.core.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.decorators.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2018.promise.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2021.intl.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2024.full.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2020.promise.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2021.full.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.es2022.regexp.d.ts
./packages/reasonex-core-api/node_modules/typescript/lib/lib.esnext.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/getContextualType.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/typeFlagUtils.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/isSymbolFromDefaultLibrary.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/getSourceFileOfNode.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/getTokenAtPosition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/getConstrainedTypeAtLocation.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/containsAllTypesByName.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/isUnsafeAssignment.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/getDeclaration.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/requiresQuoting.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/TypeOrValueSpecifier.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/isTypeReadonly.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/getTypeArguments.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/predicates.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/propertyTypes.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/builtinSymbolLikes.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/dist/getTypeName.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/types/dist/generated/ast-spec.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/types/dist/ts-estree.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/types/dist/lib.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/types/dist/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/types/dist/parser-options.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/source-files.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/ast-converter.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/simple-traverse.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/clear-caches.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/convert-comments.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/createParserServices.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/createSourceFile.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/getWatchProgramsForProjects.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/createIsolatedProgram.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/useProvidedPrograms.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/getScriptKind.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/createProjectService.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/createProjectProgram.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/WatchCompilerHostOfConfigFile.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/shared.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/describeFilePath.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/create-program/createDefaultProgram.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/semantic-or-syntactic-errors.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/node-utils.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/useProgramFromProjectService.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/getModifiers.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/parseSettings/getProjectConfigFiles.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/parseSettings/createParseSettings.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/parseSettings/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/parseSettings/ExpiringCache.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/parseSettings/warnAboutTSVersion.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/parseSettings/resolveProjectList.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/parseSettings/inferSingleRun.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/ts-estree/estree-to-ts-node-types.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/ts-estree/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/ts-estree/ts-nodes.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/jsx/xhtml-entities.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/parser-options.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/parser.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/convert.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/use-at-your-own-risk.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/dist/version-check.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/scopeAnalysis.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/PatternMatcher.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/astUtilities.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/predicates.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/ReferenceTracker.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/helpers.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/misc.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ast-utils/predicates.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-utils/isArray.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-utils/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/Parser.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/Rule.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/ParserOptions.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/ESLint.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/Linter.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/Config.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/Processor.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/RuleTester.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/Scope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/SourceCode.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/CLIEngine.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-eslint/AST.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/ts-estree.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/eslint-utils/parserPathSeemsToBeTSESLint.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/eslint-utils/nullThrows.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/eslint-utils/deepMerge.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/eslint-utils/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/eslint-utils/context.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/eslint-utils/InferTypesFromRule.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/eslint-utils/RuleCreator.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/eslint-utils/applyDefault.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/eslint-utils/getParserServices.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/dist/json-schema.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/parser/dist/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/parser/dist/parser.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/ID.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/ImportBindingDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/Definition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/ClassNameDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/DefinitionBase.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/DefinitionType.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/TypeDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/ParameterDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/TSEnumNameDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/TSEnumMemberDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/TSModuleNameDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/VariableDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/FunctionNameDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/ImplicitGlobalVariableDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/definition/CatchClauseDefinition.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/Visitor.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/ExportVisitor.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/VisitorBase.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/Reference.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/Referencer.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/TypeVisitor.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/ImportVisitor.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/ClassVisitor.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/referencer/PatternVisitor.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.string.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.object.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.sharedmemory.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.intl.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.number.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.array.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/base-config.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.string.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.bigint.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.asynciterable.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.array.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.symbol.wellknown.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.regexp.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.sharedmemory.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/decorators.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/webworker.iterable.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.intl.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.symbol.wellknown.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/lib.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/decorators.legacy.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.intl.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.sharedmemory.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.array.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.intl.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2016.array.include.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.asynciterable.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.iterable.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.collection.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/dom.iterable.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.reflect.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.string.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.intl.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.promise.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.generator.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.symbol.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2016.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.asyncgenerator.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.decorators.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.symbol.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2023.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2016.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.promise.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.collection.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/webworker.importscripts.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.object.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.regexp.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.error.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.intl.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.string.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.weakref.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.disposable.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.promise.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.date.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.promise.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es7.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/webworker.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/scripthost.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.bigint.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.string.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.intl.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2023.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2023.collection.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.core.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/dom.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2023.array.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.date.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.symbol.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.promise.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.string.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.object.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es6.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es5.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.proxy.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.full.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.typedarrays.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.weakref.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/assert.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/analyze.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/ScopeManager.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/variable/Variable.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/variable/ImplicitLibVariable.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/variable/VariableBase.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/variable/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/variable/ESLintScopeVariable.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/TSModuleScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/FunctionScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/ForScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/SwitchScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/CatchScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/ModuleScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/ScopeType.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/FunctionTypeScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/ClassFieldInitializerScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/Scope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/MappedTypeScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/ClassStaticBlockScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/TSEnumScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/FunctionExpressionNameScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/WithScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/ScopeBase.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/TypeScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/ConditionalTypeScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/ClassScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/BlockScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/dist/scope/GlobalScope.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/rules.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/visitor-keys/dist/index.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/visitor-keys/dist/visitor-keys.d.ts
./packages/reasonex-core-api/node_modules/@typescript-eslint/visitor-keys/dist/get-keys.d.ts
./packages/reasonex-core-api/node_modules/execa/index.d.ts
./packages/reasonex-core-api/node_modules/path-key/index.d.ts
./packages/reasonex-core-api/node_modules/collect-v8-coverage/index.d.ts
./packages/reasonex-core-api/node_modules/import-local/index.d.ts
./packages/reasonex-core-api/node_modules/@types/babel__template/index.d.ts
./packages/reasonex-core-api/node_modules/@types/stack-utils/index.d.ts
./packages/reasonex-core-api/node_modules/@types/compression/index.d.ts
./packages/reasonex-core-api/node_modules/@types/strip-json-comments/index.d.ts
./packages/reasonex-core-api/node_modules/@types/express/index.d.ts
./packages/reasonex-core-api/node_modules/@types/strip-bom/index.d.ts
./packages/reasonex-core-api/node_modules/@types/connect/index.d.ts
./packages/reasonex-core-api/node_modules/@types/qs/index.d.ts
./packages/reasonex-core-api/node_modules/@types/babel__traverse/index.d.ts
./packages/reasonex-core-api/node_modules/@types/express-serve-static-core/index.d.ts
./packages/reasonex-core-api/node_modules/@types/yargs-parser/index.d.ts
./packages/reasonex-core-api/node_modules/@types/uuid/index.d.ts
./packages/reasonex-core-api/node_modules/@types/http-errors/index.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/classes/semver.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/classes/comparator.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/classes/range.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/compare-loose.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/compare-build.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/minor.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/sort.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/valid.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/parse.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/diff.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/rsort.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/prerelease.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/neq.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/lt.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/gt.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/cmp.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/compare.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/major.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/clean.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/eq.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/inc.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/lte.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/satisfies.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/gte.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/patch.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/rcompare.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/functions/coerce.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/index.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/preload.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/internals/identifiers.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/subset.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/max-satisfying.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/ltr.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/valid.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/outside.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/min-version.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/simplify.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/intersects.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/to-comparators.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/gtr.d.ts
./packages/reasonex-core-api/node_modules/@types/semver/ranges/min-satisfying.d.ts
./packages/reasonex-core-api/node_modules/@types/istanbul-reports/index.d.ts
./packages/reasonex-core-api/node_modules/@types/body-parser/index.d.ts
./packages/reasonex-core-api/node_modules/@types/triple-beam/index.d.ts
./packages/reasonex-core-api/node_modules/@types/graceful-fs/index.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/hmac-sha224.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/format-hex.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/rabbit.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/lib-typedarrays.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/pad-iso10126.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/tripledes.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/md5.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/pad-zeropadding.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/hmac-sha3.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/enc-base64url.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/ripemd160.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/pad-iso97971.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/x64-core.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/hmac-sha512.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/format-openssl.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/pad-pkcs7.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/sha512.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/pbkdf2.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/hmac-sha1.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/pad-nopadding.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/enc-latin1.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/evpkdf.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/index.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/rc4.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/sha224.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/aes.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/hmac-ripemd160.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/rabbit-legacy.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/sha384.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/enc-utf8.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/mode-ctr-gladman.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/mode-ctr.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/sha1.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/enc-utf16.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/enc-hex.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/hmac-sha256.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/sha3.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/sha256.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/mode-cfb.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/pad-ansix923.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/hmac-sha384.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/enc-base64.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/blowfish.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/hmac-md5.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/mode-ecb.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/core.d.ts
./packages/reasonex-core-api/node_modules/@types/crypto-js/mode-ofb.d.ts
./packages/reasonex-core-api/node_modules/@types/cors/index.d.ts
./packages/reasonex-core-api/node_modules/@types/serve-static/node_modules/@types/send/index.d.ts
./packages/reasonex-core-api/node_modules/@types/serve-static/index.d.ts
./packages/reasonex-core-api/node_modules/@types/babel__core/index.d.ts
./packages/reasonex-core-api/node_modules/@types/json-schema/index.d.ts
./packages/reasonex-core-api/node_modules/@types/jest/index.d.ts
./packages/reasonex-core-api/node_modules/@types/range-parser/index.d.ts
./packages/reasonex-core-api/node_modules/@types/deep-diff/index.d.ts
./packages/reasonex-core-api/node_modules/@types/istanbul-lib-coverage/index.d.ts
./packages/reasonex-core-api/node_modules/@types/node/module.d.ts
./packages/reasonex-core-api/node_modules/@types/node/dns/promises.d.ts
./packages/reasonex-core-api/node_modules/@types/node/buffer.buffer.d.ts
./packages/reasonex-core-api/node_modules/@types/node/http2.d.ts
./packages/reasonex-core-api/node_modules/@types/node/zlib.d.ts
./packages/reasonex-core-api/node_modules/@types/node/crypto.d.ts
./packages/reasonex-core-api/node_modules/@types/node/util.d.ts
./packages/reasonex-core-api/node_modules/@types/node/fs/promises.d.ts
./packages/reasonex-core-api/node_modules/@types/node/vm.d.ts
./packages/reasonex-core-api/node_modules/@types/node/tty.d.ts
./packages/reasonex-core-api/node_modules/@types/node/stream/web.d.ts
./packages/reasonex-core-api/node_modules/@types/node/stream/consumers.d.ts
./packages/reasonex-core-api/node_modules/@types/node/stream/promises.d.ts
./packages/reasonex-core-api/node_modules/@types/node/timers/promises.d.ts
./packages/reasonex-core-api/node_modules/@types/node/async_hooks.d.ts
./packages/reasonex-core-api/node_modules/@types/node/compatibility/disposable.d.ts
./packages/reasonex-core-api/node_modules/@types/node/compatibility/index.d.ts
./packages/reasonex-core-api/node_modules/@types/node/compatibility/indexable.d.ts
./packages/reasonex-core-api/node_modules/@types/node/compatibility/iterators.d.ts
./packages/reasonex-core-api/node_modules/@types/node/assert.d.ts
./packages/reasonex-core-api/node_modules/@types/node/test.d.ts
./packages/reasonex-core-api/node_modules/@types/node/sea.d.ts
./packages/reasonex-core-api/node_modules/@types/node/domain.d.ts
./packages/reasonex-core-api/node_modules/@types/node/buffer.d.ts
./packages/reasonex-core-api/node_modules/@types/node/net.d.ts
./packages/reasonex-core-api/node_modules/@types/node/events.d.ts
./packages/reasonex-core-api/node_modules/@types/node/https.d.ts
./packages/reasonex-core-api/node_modules/@types/node/assert/strict.d.ts
./packages/reasonex-core-api/node_modules/@types/node/fs.d.ts
./packages/reasonex-core-api/node_modules/@types/node/web-globals/fetch.d.ts
./packages/reasonex-core-api/node_modules/@types/node/web-globals/domexception.d.ts
./packages/reasonex-core-api/node_modules/@types/node/web-globals/events.d.ts
./packages/reasonex-core-api/node_modules/@types/node/web-globals/abortcontroller.d.ts
./packages/reasonex-core-api/node_modules/@types/node/querystring.d.ts
./packages/reasonex-core-api/node_modules/@types/node/globals.d.ts
./packages/reasonex-core-api/node_modules/@types/node/constants.d.ts
./packages/reasonex-core-api/node_modules/@types/node/perf_hooks.d.ts
./packages/reasonex-core-api/node_modules/@types/node/string_decoder.d.ts
./packages/reasonex-core-api/node_modules/@types/node/index.d.ts
./packages/reasonex-core-api/node_modules/@types/node/http.d.ts
./packages/reasonex-core-api/node_modules/@types/node/ts5.6/buffer.buffer.d.ts
./packages/reasonex-core-api/node_modules/@types/node/ts5.6/index.d.ts
./packages/reasonex-core-api/node_modules/@types/node/ts5.6/globals.typedarray.d.ts
./packages/reasonex-core-api/node_modules/@types/node/trace_events.d.ts
./packages/reasonex-core-api/node_modules/@types/node/tls.d.ts
./packages/reasonex-core-api/node_modules/@types/node/punycode.d.ts
./packages/reasonex-core-api/node_modules/@types/node/readline.d.ts
./packages/reasonex-core-api/node_modules/@types/node/url.d.ts
./packages/reasonex-core-api/node_modules/@types/node/worker_threads.d.ts
./packages/reasonex-core-api/node_modules/@types/node/process.d.ts
./packages/reasonex-core-api/node_modules/@types/node/dgram.d.ts
./packages/reasonex-core-api/node_modules/@types/node/readline/promises.d.ts
./packages/reasonex-core-api/node_modules/@types/node/wasi.d.ts
./packages/reasonex-core-api/node_modules/@types/node/repl.d.ts
./packages/reasonex-core-api/node_modules/@types/node/os.d.ts
./packages/reasonex-core-api/node_modules/@types/node/child_process.d.ts
./packages/reasonex-core-api/node_modules/@types/node/cluster.d.ts
./packages/reasonex-core-api/node_modules/@types/node/console.d.ts
./packages/reasonex-core-api/node_modules/@types/node/v8.d.ts
./packages/reasonex-core-api/node_modules/@types/node/dns.d.ts
./packages/reasonex-core-api/node_modules/@types/node/globals.typedarray.d.ts
./packages/reasonex-core-api/node_modules/@types/node/diagnostics_channel.d.ts
./packages/reasonex-core-api/node_modules/@types/node/path.d.ts
./packages/reasonex-core-api/node_modules/@types/node/stream.d.ts
./packages/reasonex-core-api/node_modules/@types/node/timers.d.ts
./packages/reasonex-core-api/node_modules/@types/node/inspector.generated.d.ts
./packages/reasonex-core-api/node_modules/@types/istanbul-lib-report/index.d.ts
./packages/reasonex-core-api/node_modules/@types/node-fetch/externals.d.ts
./packages/reasonex-core-api/node_modules/@types/node-fetch/index.d.ts
./packages/reasonex-core-api/node_modules/@types/yargs/helpers.d.ts
./packages/reasonex-core-api/node_modules/@types/yargs/index.d.ts
./packages/reasonex-core-api/node_modules/@types/yargs/yargs.d.ts
./packages/reasonex-core-api/node_modules/@types/send/index.d.ts
./packages/reasonex-core-api/node_modules/@types/babel__generator/index.d.ts
./packages/reasonex-core-api/node_modules/@types/mime/lite.d.ts
./packages/reasonex-core-api/node_modules/@types/mime/Mime.d.ts
./packages/reasonex-core-api/node_modules/@types/mime/index.d.ts
./packages/reasonex-core-api/node_modules/char-regex/index.d.ts
./packages/reasonex-core-api/node_modules/hasown/index.d.ts
./packages/reasonex-core-api/node_modules/@jridgewell/resolve-uri/dist/types/resolve-uri.d.ts
./packages/reasonex-core-api/node_modules/@jridgewell/remapping/src/source-map.ts
./packages/reasonex-core-api/node_modules/@jridgewell/remapping/src/source-map-tree.ts
./packages/reasonex-core-api/node_modules/@jridgewell/remapping/src/remapping.ts
./packages/reasonex-core-api/node_modules/@jridgewell/remapping/src/build-source-map-tree.ts
./packages/reasonex-core-api/node_modules/@jridgewell/remapping/src/types.ts
./packages/reasonex-core-api/node_modules/@jridgewell/gen-mapping/dist/types/types.d.ts
./packages/reasonex-core-api/node_modules/@jridgewell/gen-mapping/dist/types/sourcemap-segment.d.ts
./packages/reasonex-core-api/node_modules/@jridgewell/gen-mapping/dist/types/set-array.d.ts
./packages/reasonex-core-api/node_modules/@jridgewell/gen-mapping/dist/types/gen-mapping.d.ts
./packages/reasonex-core-api/node_modules/@jridgewell/gen-mapping/src/set-array.ts
./packages/reasonex-core-api/node_modules/@jridgewell/gen-mapping/src/types.ts
./packages/reasonex-core-api/node_modules/@jridgewell/gen-mapping/src/gen-mapping.ts
./packages/reasonex-core-api/node_modules/@jridgewell/gen-mapping/src/sourcemap-segment.ts
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/src/trace-mapping.ts
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/src/strip-filename.ts
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/src/resolve.ts
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/src/binary-search.ts
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/src/by-source.ts
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/src/sort.ts
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/src/types.ts
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/src/sourcemap-segment.ts
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/src/flatten-map.ts
./packages/reasonex-core-api/node_modules/@jridgewell/sourcemap-codec/src/scopes.ts
./packages/reasonex-core-api/node_modules/@jridgewell/sourcemap-codec/src/strings.ts
./packages/reasonex-core-api/node_modules/@jridgewell/sourcemap-codec/src/vlq.ts
./packages/reasonex-core-api/node_modules/@jridgewell/sourcemap-codec/src/sourcemap-codec.ts
./packages/reasonex-core-api/node_modules/is-fullwidth-code-point/index.d.ts
./packages/reasonex-core-api/node_modules/ts-api-utils/lib/index.d.ts
./packages/reasonex-core-api/node_modules/resolve.exports/index.d.ts
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/find-up/index.d.ts
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/resolve-from/index.d.ts
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/p-locate/index.d.ts
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/p-limit/index.d.ts
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/locate-path/index.d.ts
./packages/reasonex-core-api/node_modules/path-type/index.d.ts
./packages/reasonex-core-api/node_modules/expect/build/index.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/util.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/schemes/urn-uuid.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/schemes/urn.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/schemes/https.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/schemes/http.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/schemes/wss.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/schemes/mailto.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/schemes/ws.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/regexps-uri.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/index.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/uri.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/esnext/regexps-iri.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/es5/uri.all.d.ts
./packages/reasonex-core-api/node_modules/uri-js/dist/es5/uri.all.min.d.ts
./packages/reasonex-core-api/node_modules/emittery/index.d.ts
./packages/reasonex-core-api/node_modules/create-require/create-require.d.ts
./packages/reasonex-core-api/node_modules/escalade/sync/index.d.ts
./packages/reasonex-core-api/node_modules/escalade/index.d.ts
./packages/reasonex-core-api/node_modules/jest-matcher-utils/build/index.d.ts
./packages/reasonex-core-api/node_modules/ci-info/index.d.ts
./packages/reasonex-core-api/node_modules/dedent/dist/dedent.d.ts
./packages/reasonex-core-api/node_modules/fecha/lib/fecha.d.ts
./packages/reasonex-core-api/node_modules/fecha/src/fecha.ts
./packages/reasonex-core-api/node_modules/jest-cli/build/index.d.ts
./packages/reasonex-core-api/node_modules/jest-leak-detector/build/index.d.ts
./packages/reasonex-core-api/node_modules/jest-diff/build/index.d.ts
./packages/reasonex-core-api/node_modules/v8-to-istanbul/index.d.ts
./packages/reasonex-core-api/node_modules/@eslint/eslintrc/node_modules/ajv/lib/ajv.d.ts
./packages/reasonex-core-api/node_modules/escape-string-regexp/index.d.ts
./packages/reasonex-core-api/node_modules/form-data/index.d.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/clone.d.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/range-tree.d.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/types.d.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/ascii.d.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/merge.d.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/_src/index.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/_src/ascii.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/_src/merge.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/_src/clone.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/_src/compare.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/_src/normalize.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/_src/range-tree.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/_src/types.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/index.d.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/compare.d.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/normalize.d.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/gulpfile.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/src/lib/index.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/src/lib/ascii.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/src/lib/merge.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/src/lib/clone.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/src/lib/compare.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/src/lib/normalize.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/src/lib/range-tree.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/src/lib/types.ts
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/src/test/merge.spec.ts
./packages/reasonex-core-api/node_modules/jest-pnp-resolver/index.d.ts
./packages/reasonex-core-api/node_modules/fast-deep-equal/react.d.ts
./packages/reasonex-core-api/node_modules/fast-deep-equal/index.d.ts
./packages/reasonex-core-api/node_modules/fast-deep-equal/es6/react.d.ts
./packages/reasonex-core-api/node_modules/fast-deep-equal/es6/index.d.ts
./packages/reasonex-core-api/node_modules/acorn-walk/dist/walk.d.ts
./packages/reasonex-core-api/node_modules/side-channel-list/list.d.ts
./packages/reasonex-core-api/node_modules/side-channel-list/index.d.ts
./packages/reasonex-core-api/node_modules/jest-config/build/index.d.ts
./packages/reasonex-core-api/node_modules/detect-newline/index.d.ts
./packages/reasonex-core-api/node_modules/logform/index.d.ts
./packages/reasonex-core-api/node_modules/ignore/index.d.ts
./packages/reasonex-core-api/node_modules/jest-message-util/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/test-result/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/fake-timers/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/globals/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/test-sequencer/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/expect/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/types/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/reporters/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/console/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/schemas/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/core/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/source-map/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/expect-utils/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/transform/build/index.d.ts
./packages/reasonex-core-api/node_modules/@jest/environment/build/index.d.ts
./packages/reasonex-core-api/node_modules/pkg-dir/node_modules/find-up/index.d.ts
./packages/reasonex-core-api/node_modules/pkg-dir/node_modules/p-locate/index.d.ts
./packages/reasonex-core-api/node_modules/pkg-dir/node_modules/p-limit/index.d.ts
./packages/reasonex-core-api/node_modules/pkg-dir/node_modules/locate-path/index.d.ts
./packages/reasonex-core-api/node_modules/pkg-dir/index.d.ts
./packages/reasonex-core-api/node_modules/side-channel/index.d.ts
./packages/reasonex-core-api/node_modules/jest-resolve/build/index.d.ts
./packages/reasonex-core-api/node_modules/abort-controller/dist/abort-controller.d.ts
./packages/reasonex-core-api/node_modules/p-locate/index.d.ts
./packages/reasonex-core-api/node_modules/ajv-formats/dist/limit.d.ts
./packages/reasonex-core-api/node_modules/ajv-formats/dist/index.d.ts
./packages/reasonex-core-api/node_modules/ajv-formats/dist/formats.d.ts
./packages/reasonex-core-api/node_modules/ajv-formats/src/index.ts
./packages/reasonex-core-api/node_modules/ajv-formats/src/limit.ts
./packages/reasonex-core-api/node_modules/ajv-formats/src/formats.ts
./packages/reasonex-core-api/node_modules/jest-docblock/build/index.d.ts
./packages/reasonex-core-api/node_modules/ansi-styles/index.d.ts
./packages/reasonex-core-api/node_modules/camelcase/index.d.ts
./packages/reasonex-core-api/node_modules/fastq/test/example.ts
./packages/reasonex-core-api/node_modules/fastq/index.d.ts
./packages/reasonex-core-api/node_modules/browserslist/error.d.ts
./packages/reasonex-core-api/node_modules/browserslist/index.d.ts
./packages/reasonex-core-api/node_modules/undici-types/handlers.d.ts
./packages/reasonex-core-api/node_modules/undici-types/fetch.d.ts
./packages/reasonex-core-api/node_modules/undici-types/file.d.ts
./packages/reasonex-core-api/node_modules/undici-types/retry-handler.d.ts
./packages/reasonex-core-api/node_modules/undici-types/mock-agent.d.ts
./packages/reasonex-core-api/node_modules/undici-types/util.d.ts
./packages/reasonex-core-api/node_modules/undici-types/connector.d.ts
./packages/reasonex-core-api/node_modules/undici-types/dispatcher.d.ts
./packages/reasonex-core-api/node_modules/undici-types/readable.d.ts
./packages/reasonex-core-api/node_modules/undici-types/errors.d.ts
./packages/reasonex-core-api/node_modules/undici-types/filereader.d.ts
./packages/reasonex-core-api/node_modules/undici-types/eventsource.d.ts
./packages/reasonex-core-api/node_modules/undici-types/pool.d.ts
./packages/reasonex-core-api/node_modules/undici-types/pool-stats.d.ts
./packages/reasonex-core-api/node_modules/undici-types/proxy-agent.d.ts
./packages/reasonex-core-api/node_modules/undici-types/cookies.d.ts
./packages/reasonex-core-api/node_modules/undici-types/index.d.ts
./packages/reasonex-core-api/node_modules/undici-types/mock-interceptor.d.ts
./packages/reasonex-core-api/node_modules/undici-types/websocket.d.ts
./packages/reasonex-core-api/node_modules/undici-types/diagnostics-channel.d.ts
./packages/reasonex-core-api/node_modules/undici-types/agent.d.ts
./packages/reasonex-core-api/node_modules/undici-types/cache.d.ts
./packages/reasonex-core-api/node_modules/undici-types/api.d.ts
./packages/reasonex-core-api/node_modules/undici-types/retry-agent.d.ts
./packages/reasonex-core-api/node_modules/undici-types/env-http-proxy-agent.d.ts
./packages/reasonex-core-api/node_modules/undici-types/mock-client.d.ts
./packages/reasonex-core-api/node_modules/undici-types/mock-pool.d.ts
./packages/reasonex-core-api/node_modules/undici-types/global-origin.d.ts
./packages/reasonex-core-api/node_modules/undici-types/webidl.d.ts
./packages/reasonex-core-api/node_modules/undici-types/formdata.d.ts
./packages/reasonex-core-api/node_modules/undici-types/global-dispatcher.d.ts
./packages/reasonex-core-api/node_modules/undici-types/client.d.ts
./packages/reasonex-core-api/node_modules/undici-types/mock-errors.d.ts
./packages/reasonex-core-api/node_modules/undici-types/header.d.ts
./packages/reasonex-core-api/node_modules/undici-types/content-type.d.ts
./packages/reasonex-core-api/node_modules/undici-types/interceptors.d.ts
./packages/reasonex-core-api/node_modules/undici-types/patch.d.ts
./packages/reasonex-core-api/node_modules/undici-types/balanced-pool.d.ts
./packages/reasonex-core-api/node_modules/jest-mock/build/index.d.ts
./packages/reasonex-core-api/node_modules/shebang-regex/index.d.ts
./packages/reasonex-core-api/node_modules/make-dir/index.d.ts
./packages/reasonex-core-api/node_modules/jest-each/build/index.d.ts
./packages/reasonex-core-api/node_modules/handlebars/runtime.d.ts
./packages/reasonex-core-api/node_modules/handlebars/types/index.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/tsconfigs.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/ts-transpile-module.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/module-type-classifier.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/cjs-resolve-hooks.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/bin-esm.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/util.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/transpilers/types.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/transpilers/swc.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/ts-compiler-types.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/configuration.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/resolver-functions.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/tsconfig-schema.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/index.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/bin.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/node-module-type-classifier.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/bin-cwd.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/bin-transpile.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/esm.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/bin-script-deprecated.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/repl.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/ts-internals.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/child/child-require.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/child/child-entrypoint.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/child/spawn-child.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/child/argv-payload.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/child/child-loader.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/bin-script.d.ts
./packages/reasonex-core-api/node_modules/ts-node/dist/file-extensions.d.ts
./packages/reasonex-core-api/node_modules/flatted/types/index.d.ts
./packages/reasonex-core-api/node_modules/yn/index.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/providers/sync.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/providers/index.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/providers/async.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/providers/stream.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/types/index.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/settings.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/index.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/readers/sync.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/readers/reader.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/readers/async.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/out/readers/common.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/providers/sync.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/providers/async.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/providers/common.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/types/index.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/settings.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/constants.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/utils/fs.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/utils/index.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/index.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/out/adapters/fs.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.stat/out/providers/sync.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.stat/out/providers/async.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.stat/out/types/index.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.stat/out/settings.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.stat/out/index.d.ts
./packages/reasonex-core-api/node_modules/@nodelib/fs.stat/out/adapters/fs.d.ts
./packages/reasonex-core-api/node_modules/slash/index.d.ts
./packages/reasonex-core-api/node_modules/lines-and-columns/build/index.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/raw-compiler-options.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/transpilers/typescript/transpile-module.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/types.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/legacy/ts-jest-transformer.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/legacy/compiler/compiler-utils.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/legacy/compiler/ts-jest-compiler.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/legacy/compiler/index.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/legacy/compiler/ts-compiler.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/legacy/index.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/legacy/config/config-set.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/constants.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/diagnostics.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/logger.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/memoize.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/jsonable-value.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/index.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/ts-error.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/backports.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/messages.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/normalize-slashes.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/json.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/sha1.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/get-package-version.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/utils/importer.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/index.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/presets/create-jest-preset.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/presets/all-presets.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/cli/index.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/cli/help.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/cli/config/migrate.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/cli/config/init.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/cli/helpers/presets.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/config/types.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/config/index.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/config/paths-to-module-name-mapper.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/dist/transformers/hoist-jest.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/index.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/is-literal.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/includes.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/is-unknown.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/array-splice.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/primitive.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/pascal-case.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/non-empty-tuple.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/kebab-case.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/if-empty-object.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/union-to-tuple.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/array-values.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/pick-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/pascal-cased-properties-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/distributed-pick.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/get.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/union-to-intersection.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/screaming-snake-case.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/less-than-or-equal.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/merge-exclusive.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/has-optional-keys.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/multidimensional-array.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/optional-keys-of.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/words.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/structured-cloneable.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/shared-union-fields-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/subtract.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/unknown-set.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/sum.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/camel-cased-properties-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/tsconfig-json.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/omit-index-signature.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/replace.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/delimiter-case.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/writable-keys-of.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/conditional-except.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/readonly-tuple.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/entry.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/required-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/trim.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/tagged.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/string-slice.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/override-properties.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/literal-to-primitive.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/has-writable-keys.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/if-any.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/opaque.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/numeric.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/partial-on-undefined-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/observable-like.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/less-than.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/unknown-array.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/array-tail.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/find-global-type.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/require-exactly-one.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/set-required.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/shared-union-fields.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/set-readonly.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/exact.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/snake-cased-properties.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/is-tuple.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/has-required-keys.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/set-field-type.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/all-union-fields.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/readonly-keys-of.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/tuple-to-object.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/if-unknown.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/stringified.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/greater-than.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/set-return-type.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/int-range.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/split.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/set-parameter-type.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/require-one-or-none.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/require-all-or-none.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/delimiter-cased-properties.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/arrayable.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/merge.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/string-repeat.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/typed-array.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/literal-union.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/paths.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/is-float.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/async-return-type.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/simplify-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/keys-of-union.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/literal-to-primitive-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/writable.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/join.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/basic.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/if-never.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/conditional-simplify.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/array-slice.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/conditional-pick-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/pascal-cased-properties.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/non-empty-string.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/camel-cased-properties.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/unknown-record.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/set-optional.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/array-indices.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/last-array-element.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/value-of.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/readonly-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/omit-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/fixed-length-array.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/writable-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/merge-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/iterable-element.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/package-json.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/has-readonly-keys.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/is-equal.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/entries.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/delimiter-cased-properties-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/is-null.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/global-this.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/except.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/simplify.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/tagged-union.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/pick-index-signature.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/conditional-keys.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/jsonifiable.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/distributed-omit.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/set-non-nullable-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/camel-case.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/asyncify.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/empty-object.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/partial-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/string-key-of.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/require-at-least-one.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/is-integer.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/is-never.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/undefined-on-partial-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/set-required-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/tuple-to-union.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/jsonify.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/non-empty-object.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/invariant-of.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/multidimensional-readonly-array.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/unknown-map.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/and.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/set-non-nullable.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/single-key-object.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/is-any.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/snake-case.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/promisable.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/kebab-cased-properties-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/spread.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/or.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/enforce-optional.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/schema.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/if-null.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/required-keys-of.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/greater-than-or-equal.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/kebab-cased-properties.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/int-closed-range.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/internal/object.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/internal/keys.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/internal/numeric.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/internal/type.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/internal/tuple.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/internal/characters.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/internal/index.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/internal/array.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/internal/string.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/conditional-pick.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/source/snake-cased-properties-deep.d.ts
./packages/reasonex-core-api/node_modules/ts-jest/presets/index.d.ts
./packages/reasonex-core-api/node_modules/jest-regex-util/build/index.d.ts
./packages/reasonex-core-api/node_modules/jest-validate/build/index.d.ts
./packages/reasonex-core-api/node_modules/jest-validate/node_modules/camelcase/index.d.ts
./packages/reasonex-core-api/node_modules/get-caller-file/index.d.ts
./packages/reasonex-core-api/node_modules/event-target-shim/index.d.ts
./packages/reasonex-core-api/node_modules/eslint-visitor-keys/dist/index.d.ts
./packages/reasonex-core-api/node_modules/eslint-visitor-keys/dist/visitor-keys.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/sign.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/floor.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/abs.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/constants/maxValue.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/constants/maxArrayLength.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/constants/maxSafeInteger.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/min.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/isNaN.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/max.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/round.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/isInteger.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/isNegativeZero.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/mod.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/pow.d.ts
./packages/reasonex-core-api/node_modules/math-intrinsics/isFinite.d.ts
./packages/reasonex-core-api/node_modules/eslint/node_modules/ajv/lib/ajv.d.ts
./packages/reasonex-core-api/node_modules/is-stream/index.d.ts
./packages/reasonex-core-api/node_modules/has-flag/index.d.ts
./packages/reasonex-core-api/node_modules/is-path-inside/index.d.ts
./packages/reasonex-core-api/node_modules/jest/build/index.d.ts
./packages/reasonex-core-api/node_modules/babel-plugin-jest-hoist/build/index.d.ts
./packages/reasonex-core-api/node_modules/yocto-queue/index.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/logger/root.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/logger/level.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/logger/index.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/logger/context.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/logger/target.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/logger/message.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/utils/cache-getters.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/index.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/testing/index.d.ts
./packages/reasonex-core-api/node_modules/bs-logger/dist/testing/target-mock.d.ts
./packages/reasonex-core-api/node_modules/mimic-fn/index.d.ts
./packages/reasonex-core-api/node_modules/callsites/index.d.ts
./packages/reasonex-core-api/node_modules/fast-json-stable-stringify/index.d.ts
./packages/reasonex-core-api/node_modules/setprototypeof/index.d.ts
./packages/reasonex-core-api/node_modules/side-channel-weakmap/index.d.ts
./packages/reasonex-core-api/node_modules/jest-runtime/build/index.d.ts
./packages/reasonex-core-api/node_modules/onetime/index.d.ts
./packages/reasonex-core-api/node_modules/keyv/src/index.d.ts
./packages/reasonex-core-api/node_modules/binary-extensions/binary-extensions.json.d.ts
./packages/reasonex-core-api/node_modules/binary-extensions/index.d.ts
./packages/reasonex-core-api/node_modules/strip-ansi/index.d.ts
./packages/reasonex-core-api/node_modules/es-define-property/index.d.ts
./packages/reasonex-core-api/node_modules/is-generator-fn/index.d.ts
./packages/reasonex-core-api/node_modules/source-map/source-map.d.ts
./packages/reasonex-core-api/node_modules/fast-uri/types/index.test-d.ts
./packages/reasonex-core-api/node_modules/fast-uri/types/index.d.ts
./packages/reasonex-core-api/node_modules/queue-microtask/index.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/register-hook-require.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/source-map-support.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/dist/types/by-source.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/dist/types/sort.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/dist/types/types.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/dist/types/sourcemap-segment.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/dist/types/binary-search.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/dist/types/strip-filename.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/dist/types/trace-mapping.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/dist/types/any-map.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/dist/types/resolve.d.ts
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/register.d.ts
./packages/reasonex-core-api/node_modules/ajv/lib/2019.ts
./packages/reasonex-core-api/node_modules/ajv/lib/ajv.ts
./packages/reasonex-core-api/node_modules/ajv/lib/types/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/types/json-schema.ts
./packages/reasonex-core-api/node_modules/ajv/lib/types/jtd-schema.ts
./packages/reasonex-core-api/node_modules/ajv/lib/refs/json-schema-2020-12/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/refs/json-schema-2019-09/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/refs/jtd-schema.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/util.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/codegen/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/codegen/scope.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/codegen/code.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/resolve.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/names.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/errors.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/ref_error.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/rules.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/jtd/serialize.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/jtd/parse.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/jtd/types.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/validate/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/validate/dataType.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/validate/applicability.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/validate/subschema.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/validate/defaults.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/validate/keyword.ts
./packages/reasonex-core-api/node_modules/ajv/lib/compile/validate/boolSchema.ts
./packages/reasonex-core-api/node_modules/ajv/lib/2020.ts
./packages/reasonex-core-api/node_modules/ajv/lib/jtd.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/format/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/format/format.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/dynamic/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/dynamic/dynamicAnchor.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/dynamic/recursiveAnchor.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/dynamic/recursiveRef.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/dynamic/dynamicRef.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/metadata.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/discriminator/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/discriminator/types.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/limitNumber.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/limitProperties.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/const.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/limitContains.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/required.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/pattern.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/uniqueItems.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/enum.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/limitLength.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/multipleOf.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/limitItems.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/validation/dependentRequired.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/draft2020.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/draft7.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/errors.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/items.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/patternProperties.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/propertyNames.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/dependencies.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/additionalProperties.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/properties.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/dependentSchemas.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/oneOf.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/thenElse.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/anyOf.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/allOf.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/if.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/contains.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/prefixItems.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/not.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/items2020.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/applicator/additionalItems.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/code.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/unevaluated/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/unevaluated/unevaluatedItems.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/unevaluated/unevaluatedProperties.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/core/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/core/ref.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/core/id.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/next.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/nullable.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/properties.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/error.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/enum.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/metadata.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/values.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/elements.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/discriminator.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/ref.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/optionalProperties.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/union.ts
./packages/reasonex-core-api/node_modules/ajv/lib/vocabularies/jtd/type.ts
./packages/reasonex-core-api/node_modules/ajv/lib/core.ts
./packages/reasonex-core-api/node_modules/ajv/lib/standalone/index.ts
./packages/reasonex-core-api/node_modules/ajv/lib/standalone/instance.ts
./packages/reasonex-core-api/node_modules/ajv/lib/runtime/parseJson.ts
./packages/reasonex-core-api/node_modules/ajv/lib/runtime/quote.ts
./packages/reasonex-core-api/node_modules/ajv/lib/runtime/ucs2length.ts
./packages/reasonex-core-api/node_modules/ajv/lib/runtime/equal.ts
./packages/reasonex-core-api/node_modules/ajv/lib/runtime/uri.ts
./packages/reasonex-core-api/node_modules/ajv/lib/runtime/validation_error.ts
./packages/reasonex-core-api/node_modules/ajv/lib/runtime/timestamp.ts
./packages/reasonex-core-api/node_modules/ajv/lib/runtime/re2.ts
./packages/reasonex-core-api/node_modules/ajv/dist/types/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/types/jtd-schema.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/types/json-schema.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/refs/json-schema-2020-12/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/refs/json-schema-2019-09/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/refs/jtd-schema.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/rules.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/names.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/codegen/code.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/codegen/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/codegen/scope.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/util.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/errors.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/ref_error.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/resolve.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/jtd/types.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/jtd/parse.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/jtd/serialize.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/validate/dataType.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/validate/keyword.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/validate/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/validate/applicability.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/validate/defaults.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/validate/boolSchema.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/compile/validate/subschema.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/ajv.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/2019.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/next.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/code.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/format/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/format/format.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/dynamic/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/errors.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/metadata.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/discriminator/types.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/discriminator/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/limitProperties.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/multipleOf.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/pattern.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/dependentRequired.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/limitContains.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/required.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/enum.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/limitItems.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/limitLength.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/uniqueItems.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/limitNumber.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/validation/const.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/oneOf.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/properties.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/contains.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/items.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/dependencies.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/additionalItems.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/anyOf.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/items2020.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/prefixItems.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/allOf.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/patternProperties.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/not.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/if.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/propertyNames.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/applicator/thenElse.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/draft7.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/unevaluated/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/core/ref.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/core/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/core/id.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/draft2020.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/optionalProperties.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/properties.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/union.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/ref.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/values.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/type.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/elements.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/discriminator.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/error.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/metadata.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/enum.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/vocabularies/jtd/nullable.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/standalone/index.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/standalone/instance.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/2020.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/jtd.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/runtime/equal.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/runtime/validation_error.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/runtime/uri.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/runtime/timestamp.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/runtime/parseJson.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/runtime/re2.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/runtime/quote.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/runtime/ucs2length.d.ts
./packages/reasonex-core-api/node_modules/ajv/dist/core.d.ts
./packages/reasonex-core-api/node_modules/has-tostringtag/index.d.ts
./packages/reasonex-core-api/node_modules/has-tostringtag/shams.d.ts
./packages/reasonex-core-api/node_modules/agentkeepalive/index.d.ts
./packages/reasonex-core-api/node_modules/dotenv/config.d.ts
./packages/reasonex-core-api/node_modules/dotenv/lib/main.d.ts
./packages/reasonex-core-api/node_modules/path-exists/index.d.ts
./packages/reasonex-core-api/node_modules/winston-transport/index.d.ts
./packages/reasonex-core-api/node_modules/p-limit/index.d.ts
./packages/reasonex-core-api/node_modules/jest-get-type/build/index.d.ts
./packages/reasonex-core-api/node_modules/babel-jest/build/index.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/fileFromPath.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/browser.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/Blob.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/isFunction.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/isPlainObject.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/index.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/FormData.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/File.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/deprecateConstructorEntries.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/blobHelpers.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/isFile.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/BlobPart.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/@type/isBlob.d.ts
./packages/reasonex-core-api/node_modules/formdata-node/lib/node-domexception.d.ts
./packages/reasonex-core-api/node_modules/import-fresh/index.d.ts
./packages/reasonex-core-api/node_modules/safe-stable-stringify/esm/wrapper.d.ts
./packages/reasonex-core-api/node_modules/safe-stable-stringify/index.d.ts
./packages/reasonex-core-api/node_modules/jest-runner/build/index.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/generator/XoroShiro.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/generator/XorShift.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/generator/MersenneTwister.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/generator/LinearCongruential.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/generator/RandomGenerator.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/UnsafeUniformArrayIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/Distribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/UniformBigIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/UnsafeUniformBigIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/UniformIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/UnsafeUniformIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/internals/ArrayInt.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/internals/UnsafeUniformArrayIntDistributionInternal.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/internals/UnsafeUniformIntDistributionInternal.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/distribution/UniformArrayIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/pure-rand-default.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/esm/types/pure-rand.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/generator/XoroShiro.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/generator/XorShift.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/generator/MersenneTwister.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/generator/LinearCongruential.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/generator/RandomGenerator.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/UnsafeUniformArrayIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/Distribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/UniformBigIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/UnsafeUniformBigIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/UniformIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/UnsafeUniformIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/internals/ArrayInt.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/internals/UnsafeUniformArrayIntDistributionInternal.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/internals/UnsafeUniformIntDistributionInternal.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/distribution/UniformArrayIntDistribution.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/pure-rand-default.d.ts
./packages/reasonex-core-api/node_modules/pure-rand/lib/types/pure-rand.d.ts
./packages/reasonex-core-api/node_modules/call-bound/index.d.ts
./packages/reasonex-core-api/node_modules/string-width/index.d.ts
./packages/reasonex-core-api/node_modules/diff-sequences/build/index.d.ts
./packages/reasonex-core-api/node_modules/resolve-cwd/node_modules/resolve-from/index.d.ts
./packages/reasonex-core-api/node_modules/resolve-cwd/index.d.ts
./packages/reasonex-core-api/node_modules/readdirp/index.d.ts
./packages/reasonex-core-api/node_modules/@colors/colors/index.d.ts
./packages/reasonex-core-api/node_modules/@colors/colors/safe.d.ts
./packages/reasonex-core-api/node_modules/@babel/types/lib/index-legacy.d.ts
./packages/reasonex-core-api/node_modules/@babel/types/lib/index.d.ts
./packages/reasonex-core-api/node_modules/@babel/parser/typings/babel-parser.d.ts
./packages/reasonex-core-api/node_modules/@babel/core/src/transform-file.ts
./packages/reasonex-core-api/node_modules/@babel/core/src/transform-file-browser.ts
./packages/reasonex-core-api/node_modules/@babel/core/src/config/resolve-targets-browser.ts
./packages/reasonex-core-api/node_modules/@babel/core/src/config/files/index.ts
./packages/reasonex-core-api/node_modules/@babel/core/src/config/files/index-browser.ts
./packages/reasonex-core-api/node_modules/@babel/core/src/config/resolve-targets.ts
./packages/reasonex-core-api/node_modules/ipaddr.js/lib/ipaddr.js.d.ts
./packages/reasonex-core-api/node_modules/jest-haste-map/build/index.d.ts
./packages/reasonex-core-api/node_modules/jest-util/build/index.d.ts
./packages/reasonex-core-api/node_modules/tree-kill/index.d.ts
./packages/reasonex-core-api/node_modules/get-stream/index.d.ts
./packages/reasonex-core-api/node_modules/reusify/reusify.d.ts
./packages/reasonex-core-api/node_modules/chokidar/types/index.d.ts
./packages/reasonex-core-api/node_modules/ansi-regex/index.d.ts
./packages/reasonex-core-api/node_modules/baseline-browser-mapping/dist/index.d.ts
./packages/reasonex-core-api/node_modules/openai/uploads.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/jsonschema.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/ChatCompletionStream.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/EventEmitter.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/responses/EventTypes.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/responses/ResponseStream.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/ChatCompletionStreamingRunner.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/Util.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/ResponsesParser.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/AbstractChatCompletionRunner.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/EventStream.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/RunnableFunction.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/parser.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/AssistantStream.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/ChatCompletionRunner.d.ts
./packages/reasonex-core-api/node_modules/openai/lib/chatCompletionUtils.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/util.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/Options.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/Refs.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/zodToJsonSchema.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/index.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/errorMessages.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/object.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/branded.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/number.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/union.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/pipeline.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/effects.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/default.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/readonly.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/null.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/catch.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/literal.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/tuple.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/never.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/set.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/map.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/record.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/enum.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/nullable.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/intersection.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/array.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/date.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/boolean.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/promise.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/string.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/bigint.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/unknown.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/any.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/nativeEnum.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/undefined.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parsers/optional.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/zod-to-json-schema/parseDef.d.ts
./packages/reasonex-core-api/node_modules/openai/_vendor/partial-json-parser/parser.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/node-runtime.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/auto/runtime-bun.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/auto/runtime.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/auto/types.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/auto/runtime-node.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/auto/types-node.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/registry.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/index.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/node-types.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/web-runtime.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/MultipartBody.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/web-types.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/manual-types.d.ts
./packages/reasonex-core-api/node_modules/openai/_shims/bun-runtime.d.ts
./packages/reasonex-core-api/node_modules/openai/error.d.ts
./packages/reasonex-core-api/node_modules/openai/beta/realtime/internal-base.d.ts
./packages/reasonex-core-api/node_modules/openai/beta/realtime/index.d.ts
./packages/reasonex-core-api/node_modules/openai/beta/realtime/websocket.d.ts
./packages/reasonex-core-api/node_modules/openai/beta/realtime/ws.d.ts
./packages/reasonex-core-api/node_modules/openai/resources.d.ts
./packages/reasonex-core-api/node_modules/openai/shims/web.d.ts
./packages/reasonex-core-api/node_modules/openai/shims/node.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/module.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/dns/promises.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/buffer.buffer.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/http2.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/zlib.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/crypto.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/util.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/fs/promises.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/vm.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/tty.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/stream/web.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/stream/consumers.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/stream/promises.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/timers/promises.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/async_hooks.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/compatibility/disposable.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/compatibility/index.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/compatibility/indexable.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/compatibility/iterators.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/assert.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/test.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/domain.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/buffer.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/net.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/events.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/https.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/assert/strict.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/fs.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/web-globals/fetch.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/web-globals/domexception.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/web-globals/events.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/web-globals/abortcontroller.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/querystring.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/globals.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/constants.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/perf_hooks.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/string_decoder.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/index.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/http.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/ts5.6/buffer.buffer.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/ts5.6/index.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/ts5.6/globals.typedarray.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/trace_events.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/tls.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/punycode.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/readline.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/url.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/worker_threads.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/process.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/dgram.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/readline/promises.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/wasi.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/repl.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/os.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/child_process.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/cluster.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/console.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/v8.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/dns.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/globals.typedarray.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/diagnostics_channel.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/path.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/stream.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/timers.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/inspector.generated.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/handlers.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/fetch.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/file.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/mock-agent.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/connector.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/dispatcher.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/readable.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/errors.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/filereader.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/pool.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/pool-stats.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/proxy-agent.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/cookies.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/index.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/mock-interceptor.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/websocket.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/diagnostics-channel.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/agent.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/cache.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/api.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/mock-client.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/mock-pool.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/global-origin.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/webidl.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/formdata.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/global-dispatcher.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/client.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/mock-errors.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/header.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/content-type.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/interceptors.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/patch.d.ts
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/balanced-pool.d.ts
./packages/reasonex-core-api/node_modules/openai/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/audio/translations.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/audio/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/audio/transcriptions.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/audio/audio.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/audio/speech.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/graders.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/embeddings.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/containers.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/responses/responses.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/responses/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/responses/input-items.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/vector-stores/vector-stores.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/vector-stores/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/vector-stores/file-batches.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/vector-stores/files.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/containers/containers.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/containers/files/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/containers/files/content.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/containers/files/files.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/containers/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/containers/files.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/graders/graders.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/graders/grader-models.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/graders/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/images.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/chat/chat.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/chat/completions/completions.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/chat/completions/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/chat/completions/messages.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/chat/completions.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/chat/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/uploads/uploads.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/uploads/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/uploads/parts.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/batches.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/models.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/assistants.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/realtime/sessions.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/realtime/realtime.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/realtime/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/realtime/transcription-sessions.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/chat/chat.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/chat/completions.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/chat/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/beta.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/threads/runs/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/threads/runs/steps.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/threads/runs/runs.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/threads/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/threads/messages.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/beta/threads/threads.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/completions.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/evals.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/fine-tuning.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/alpha.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/methods.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/jobs/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/jobs/checkpoints.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/jobs/jobs.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/checkpoints.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/checkpoints/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/checkpoints/checkpoints.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/checkpoints/permissions.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/alpha/graders.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/alpha/alpha.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/fine-tuning/alpha/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/files.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/shared.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/moderations.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/evals/runs/output-items.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/evals/runs/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/evals/runs/runs.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/evals/evals.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/evals/index.d.ts
./packages/reasonex-core-api/node_modules/openai/resources/evals/runs.d.ts
./packages/reasonex-core-api/node_modules/openai/resource.d.ts
./packages/reasonex-core-api/node_modules/openai/pagination.d.ts
./packages/reasonex-core-api/node_modules/openai/helpers/audio.d.ts
./packages/reasonex-core-api/node_modules/openai/helpers/zod.d.ts
./packages/reasonex-core-api/node_modules/openai/src/index.ts
./packages/reasonex-core-api/node_modules/openai/src/pagination.ts
./packages/reasonex-core-api/node_modules/openai/src/resources.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/jsonschema.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/responses/ResponseStream.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/responses/EventTypes.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/AssistantStream.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/EventEmitter.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/Util.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/EventStream.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/ResponsesParser.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/AbstractChatCompletionRunner.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/ChatCompletionRunner.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/chatCompletionUtils.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/RunnableFunction.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/ChatCompletionStream.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/parser.ts
./packages/reasonex-core-api/node_modules/openai/src/lib/ChatCompletionStreamingRunner.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/index.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/util.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/errorMessages.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/Refs.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parseDef.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/set.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/null.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/catch.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/never.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/nullable.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/tuple.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/intersection.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/bigint.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/effects.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/promise.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/number.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/enum.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/string.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/readonly.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/boolean.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/literal.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/record.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/branded.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/any.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/default.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/map.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/array.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/date.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/unknown.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/optional.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/union.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/undefined.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/pipeline.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/object.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/parsers/nativeEnum.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/Options.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/zodToJsonSchema.ts
./packages/reasonex-core-api/node_modules/openai/src/_vendor/partial-json-parser/parser.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/bun-runtime.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/registry.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/auto/runtime.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/auto/types.d.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/auto/runtime-node.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/auto/types-node.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/auto/runtime-bun.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/MultipartBody.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/node-runtime.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/web-runtime.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/index.d.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/node-types.d.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/web-types.d.ts
./packages/reasonex-core-api/node_modules/openai/src/_shims/manual-types.d.ts
./packages/reasonex-core-api/node_modules/openai/src/error.ts
./packages/reasonex-core-api/node_modules/openai/src/beta/realtime/index.ts
./packages/reasonex-core-api/node_modules/openai/src/beta/realtime/internal-base.ts
./packages/reasonex-core-api/node_modules/openai/src/beta/realtime/ws.ts
./packages/reasonex-core-api/node_modules/openai/src/beta/realtime/websocket.ts
./packages/reasonex-core-api/node_modules/openai/src/resource.ts
./packages/reasonex-core-api/node_modules/openai/src/shims/web.ts
./packages/reasonex-core-api/node_modules/openai/src/shims/node.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/batches.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/audio/speech.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/audio/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/audio/translations.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/audio/audio.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/audio/transcriptions.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/responses/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/responses/responses.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/responses/input-items.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/vector-stores/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/vector-stores/vector-stores.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/vector-stores/files.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/vector-stores/file-batches.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/containers/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/containers/containers.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/containers/files/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/containers/files/content.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/containers/files/files.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/containers/files.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/graders/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/graders/graders.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/graders/grader-models.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/images.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/chat/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/chat/chat.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/chat/completions/messages.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/chat/completions/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/chat/completions/completions.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/chat/completions.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/uploads/parts.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/uploads/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/uploads/uploads.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/realtime/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/realtime/realtime.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/realtime/sessions.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/realtime/transcription-sessions.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/beta.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/chat/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/chat/chat.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/chat/completions.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/assistants.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/threads/messages.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/threads/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/threads/threads.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/threads/runs/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/threads/runs/steps.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/beta/threads/runs/runs.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/graders.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/containers.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/files.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/embeddings.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/shared.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/checkpoints.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/jobs/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/jobs/checkpoints.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/jobs/jobs.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/fine-tuning.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/checkpoints/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/checkpoints/checkpoints.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/checkpoints/permissions.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/methods.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/alpha.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/alpha/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/alpha/graders.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/fine-tuning/alpha/alpha.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/moderations.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/evals.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/completions.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/models.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/evals/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/evals/runs/index.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/evals/runs/runs.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/evals/runs/output-items.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/evals/runs.ts
./packages/reasonex-core-api/node_modules/openai/src/resources/evals/evals.ts
./packages/reasonex-core-api/node_modules/openai/src/core.ts
./packages/reasonex-core-api/node_modules/openai/src/helpers/audio.ts
./packages/reasonex-core-api/node_modules/openai/src/helpers/zod.ts
./packages/reasonex-core-api/node_modules/openai/src/uploads.ts
./packages/reasonex-core-api/node_modules/openai/src/version.ts
./packages/reasonex-core-api/node_modules/openai/src/streaming.ts
./packages/reasonex-core-api/node_modules/openai/src/internal/decoders/line.ts
./packages/reasonex-core-api/node_modules/openai/src/internal/qs/index.ts
./packages/reasonex-core-api/node_modules/openai/src/internal/qs/stringify.ts
./packages/reasonex-core-api/node_modules/openai/src/internal/qs/formats.ts
./packages/reasonex-core-api/node_modules/openai/src/internal/qs/utils.ts
./packages/reasonex-core-api/node_modules/openai/src/internal/qs/types.ts
./packages/reasonex-core-api/node_modules/openai/src/internal/stream-utils.ts
./packages/reasonex-core-api/node_modules/openai/version.d.ts
./packages/reasonex-core-api/node_modules/openai/streaming.d.ts
./packages/reasonex-core-api/node_modules/openai/internal/stream-utils.d.ts
./packages/reasonex-core-api/node_modules/openai/internal/decoders/line.d.ts
./packages/reasonex-core-api/node_modules/openai/internal/qs/types.d.ts
./packages/reasonex-core-api/node_modules/openai/internal/qs/stringify.d.ts
./packages/reasonex-core-api/node_modules/openai/internal/qs/index.d.ts
./packages/reasonex-core-api/node_modules/openai/internal/qs/utils.d.ts
./packages/reasonex-core-api/node_modules/openai/internal/qs/formats.d.ts
./packages/reasonex-core-api/node_modules/openai/core.d.ts
./packages/reasonex-core-api/node_modules/es-errors/ref.d.ts
./packages/reasonex-core-api/node_modules/es-errors/type.d.ts
./packages/reasonex-core-api/node_modules/es-errors/eval.d.ts
./packages/reasonex-core-api/node_modules/es-errors/index.d.ts
./packages/reasonex-core-api/node_modules/es-errors/syntax.d.ts
./packages/reasonex-core-api/node_modules/es-errors/uri.d.ts
./packages/reasonex-core-api/node_modules/es-errors/range.d.ts
./packages/reasonex-core-api/node_modules/type-fest/ts41/pascal-case.d.ts
./packages/reasonex-core-api/node_modules/type-fest/ts41/kebab-case.d.ts
./packages/reasonex-core-api/node_modules/type-fest/ts41/delimiter-case.d.ts
./packages/reasonex-core-api/node_modules/type-fest/ts41/index.d.ts
./packages/reasonex-core-api/node_modules/type-fest/ts41/camel-case.d.ts
./packages/reasonex-core-api/node_modules/type-fest/ts41/snake-case.d.ts
./packages/reasonex-core-api/node_modules/type-fest/index.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/union-to-intersection.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/merge-exclusive.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/tsconfig-json.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/conditional-except.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/entry.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/opaque.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/require-exactly-one.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/set-required.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/stringified.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/set-return-type.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/merge.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/literal-union.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/utilities.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/async-return-type.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/basic.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/set-optional.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/value-of.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/readonly-deep.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/fixed-length-array.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/iterable-element.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/promise-value.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/package-json.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/entries.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/except.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/conditional-keys.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/asyncify.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/partial-deep.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/require-at-least-one.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/mutable.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/promisable.d.ts
./packages/reasonex-core-api/node_modules/type-fest/source/conditional-pick.d.ts
./packages/reasonex-core-api/node_modules/type-fest/base.d.ts
./packages/reasonex-core-api/node_modules/npm-run-path/index.d.ts
./packages/reasonex-core-api/node_modules/json5/lib/unicode.d.ts
./packages/reasonex-core-api/node_modules/json5/lib/util.d.ts
./packages/reasonex-core-api/node_modules/json5/lib/parse.d.ts
./packages/reasonex-core-api/node_modules/json5/lib/stringify.d.ts
./packages/reasonex-core-api/node_modules/json5/lib/index.d.ts
./packages/reasonex-core-api/node_modules/yargs/browser.d.ts
./packages/reasonex-core-api/node_modules/leven/index.d.ts
./packages/reasonex-core-api/node_modules/array-union/index.d.ts
./packages/reasonex-core-api/node_modules/jest-worker/build/index.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/util/escapeName.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/util/isFunction.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/util/isPlainObject.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/util/normalizeValue.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/util/createBoundary.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/util/isFileLike.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/util/isFormData.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/FormDataLike.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/index.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/FormDataEncoder.d.ts
./packages/reasonex-core-api/node_modules/form-data-encoder/@type/FileLike.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/errors/errors.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/errors/index.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/system/system.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/system/index.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/hash.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/clone.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/equal.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/pointer.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/create.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/value.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/check.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/index.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/cast.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/is.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/convert.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/delta.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/value/mutate.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/compiler/index.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/compiler/compiler.d.ts
./packages/reasonex-core-api/node_modules/@sinclair/typebox/typebox.d.ts
./packages/reasonex-core-api/node_modules/jest-changed-files/build/index.d.ts
./packages/reasonex-core-api/node_modules/arg/index.d.ts
./packages/reasonex-core-api/node_modules/jest-circus/build/index.d.ts
./packages/reasonex-core-api/node_modules/v8-compile-cache-lib/v8-compile-cache.d.ts
./packages/reasonex-core-api/node_modules/iconv-lite/lib/index.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/ts41/pascal-case.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/ts41/kebab-case.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/ts41/get.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/ts41/delimiter-case.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/ts41/utilities.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/ts41/index.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/ts41/camel-case.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/ts41/snake-case.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/index.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/union-to-intersection.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/merge-exclusive.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/tsconfig-json.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/conditional-except.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/entry.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/opaque.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/require-exactly-one.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/set-required.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/stringified.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/set-return-type.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/merge.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/typed-array.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/literal-union.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/utilities.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/async-return-type.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/basic.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/set-optional.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/value-of.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/readonly-deep.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/fixed-length-array.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/iterable-element.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/promise-value.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/package-json.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/entries.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/except.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/simplify.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/conditional-keys.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/asyncify.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/partial-deep.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/require-at-least-one.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/mutable.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/promisable.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/source/conditional-pick.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/base.d.ts
./packages/reasonex-core-api/node_modules/ansi-escapes/index.d.ts
./packages/reasonex-core-api/node_modules/raw-body/index.d.ts
./packages/reasonex-core-api/node_modules/color-string/index.d.ts
./packages/reasonex-core-api/node_modules/is-binary-path/index.d.ts
./packages/reasonex-core-api/node_modules/locate-path/index.d.ts
./packages/reasonex-core-api/node_modules/pretty-format/build/index.d.ts
./packages/reasonex-core-api/node_modules/pretty-format/node_modules/ansi-styles/index.d.ts
./packages/reasonex-core-api/node_modules/update-browserslist-db/index.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/order-by-first-call.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/type-of.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/deprecated.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/global.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/every.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/class-name.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/called-in-order.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/value-to-string.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/function-name.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/index.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/prototypes/object.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/prototypes/throws-on-proto.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/prototypes/function.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/prototypes/set.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/prototypes/map.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/prototypes/index.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/prototypes/copy-prototype-methods.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/prototypes/array.d.ts
./packages/reasonex-core-api/node_modules/@sinonjs/commons/types/prototypes/string.d.ts
./packages/reasonex-core-api/node_modules/deepmerge/index.d.ts
./packages/reasonex-core-api/src/index.ts
./packages/reasonex-core-api/src/lib/logger.ts
./packages/reasonex-core-api/src/lib/tracer.ts
./packages/reasonex-core-api/src/engines/rule-engine.ts
./packages/reasonex-core-api/src/engines/lock-manager.ts
./packages/reasonex-core-api/src/engines/tier-router.ts
./packages/reasonex-core-api/src/engines/validator.ts
./packages/reasonex-core-api/src/engines/tree-builder.ts
./packages/reasonex-core-api/src/engines/change-detector.ts
./packages/reasonex-core-api/src/engines/explanation-generator.ts
./packages/reasonex-core-api/src/routes/score.ts
./packages/reasonex-core-api/src/routes/route.ts
./packages/reasonex-core-api/src/routes/lock.ts
./packages/reasonex-core-api/src/routes/validate.ts
./packages/reasonex-core-api/src/routes/tree.ts
./packages/reasonex-core-api/src/routes/detect.ts

### 6.2 Main Entry Point (index.ts)
```typescript
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { Logger, createRequestLogger, TraceContext } from './lib/logger';
import { Tracer } from './lib/tracer';

// Load environment variables
dotenv.config();

// Import routes
import lockRouter from './routes/lock';
import scoreRouter from './routes/score';
import validateRouter from './routes/validate';
import treeRouter from './routes/tree';
import detectRouter from './routes/detect';
import routeRouter from './routes/route';

// Create app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize logger and tracer
const logger = new Logger(undefined, { service: 'reasonex-core-api', node: 'main' });
const tracer = new Tracer('reasonex-core-api', logger);

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      logger: Logger;
      traceContext: TraceContext;
    }
  }
}

// Middleware: Request logging and tracing
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestLogger = createRequestLogger(req);
  req.logger = requestLogger;
  req.traceContext = requestLogger.getContext();

  const start = Date.now();

  // Log request
  requestLogger.info(`${req.method} ${req.path}`, {
    operation: 'request_start',
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestLogger.info(`${req.method} ${req.path} ${res.statusCode}`, {
      operation: 'request_end',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration_ms: duration,
    });
  });

  next();
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Root endpoint - API info
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Reasonex Core API',
    version: '1.0.0',
    description: 'Proprietary scoring, validation, and analysis engine',
    endpoints: {
      health: 'GET /health',
      lock: 'POST /api/v1/lock',
      score: 'POST /api/v1/score',
      validate: 'POST /api/v1/validate',
      tree: 'POST /api/v1/tree',
      detect: 'POST /api/v1/detect',
      route: 'POST /api/v1/route',
    },
    documentation: 'See API documentation for request/response formats',
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'reasonex-core-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API version prefix
const API_PREFIX = '/api/v1';

// Mount routes
app.use(`${API_PREFIX}/lock`, lockRouter);
app.use(`${API_PREFIX}/score`, scoreRouter);
app.use(`${API_PREFIX}/validate`, validateRouter);
app.use(`${API_PREFIX}/tree`, treeRouter);
app.use(`${API_PREFIX}/detect`, detectRouter);
app.use(`${API_PREFIX}/route`, routeRouter);

// Debug endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/debug/spans', (req: Request, res: Response) => {
    res.json({
      active: tracer.getActiveSpans(),
      completed: tracer.getCompletedSpans().slice(-50),
    });
  });
}

// 404 handler
app.use((req: Request, res: Response) => {
  req.logger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    traceId: req.traceContext.traceId,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    traceId: req.traceContext?.traceId,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Reasonex Core API started`, {
    operation: 'server_start',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  });
});

export default app;
```

### 6.3 Route Files
total 48
drwxr-xr-x 2 amee amee 4096 Jan 16 13:57 .
drwxr-xr-x 6 amee amee 4096 Jan 16 14:24 ..
-rw-r--r-- 1 amee amee 4469 Jan 16 13:50 detect.ts
-rw-r--r-- 1 amee amee 4011 Jan 16 13:46 lock.ts
-rw-r--r-- 1 amee amee 6506 Jan 16 13:50 route.ts
-rw-r--r-- 1 amee amee 6403 Jan 16 13:46 score.ts
-rw-r--r-- 1 amee amee 3475 Jan 16 13:50 tree.ts
-rw-r--r-- 1 amee amee 6023 Jan 16 13:57 validate.ts

### 6.4 Lock Route
```typescript
import { Router, Request, Response } from 'express';
import { LockManager, LockOptions } from '../engines/lock-manager';

const router = Router();
const lockManager = new LockManager();

/**
 * POST /api/v1/lock
 * Create a lock for data
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { data, options = {} } = req.body as {
      data: Record<string, unknown>;
      options?: LockOptions;
    };

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "data" object',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Lock request received', {
      operation: 'createLock',
      dataKeys: Object.keys(data).length,
      algorithm: options.algorithm || 'SHA256',
    });

    const result = await req.logger.time('createLock', async () => {
      return lockManager.createLock(data, options);
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Lock creation failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/lock/verify
 * Verify a lock against data
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { data, hash, lockTimestamp, options = {} } = req.body as {
      data: Record<string, unknown>;
      hash: string;
      lockTimestamp?: string;
      options?: LockOptions;
    };

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "data" object',
        traceId: req.traceContext.traceId,
      });
    }

    if (!hash || typeof hash !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "hash" string',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Lock verification request received', {
      operation: 'verifyLock',
      hashPrefix: hash.slice(0, 16),
    });

    const result = await req.logger.time('verifyLock', async () => {
      return lockManager.verifyLock(data, hash, lockTimestamp, options);
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Lock verification failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/lock/compare
 * Compare hashes of two data objects
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { data1, data2, options = {} } = req.body as {
      data1: Record<string, unknown>;
      data2: Record<string, unknown>;
      options?: LockOptions;
    };

    if (!data1 || !data2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include "data1" and "data2" objects',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Hash comparison request received', {
      operation: 'compareHashes',
    });

    const result = lockManager.compareHashes(data1, data2, options);

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Hash comparison failed', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

export default router;
```

### 6.5 Score Route
```typescript
import { Router, Request, Response } from 'express';
import { RuleEngine } from '../engines/rule-engine';

const router = Router();
const ruleEngine = new RuleEngine();

/**
 * POST /api/v1/score
 * Score data against a rule set
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { data, ruleSetId, context, debugMode = false } = req.body as {
      data: Record<string, unknown>;
      ruleSetId: string;
      context?: Record<string, unknown>;
      debugMode?: boolean;
    };

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "data" object',
        traceId: req.traceContext.traceId,
      });
    }

    if (!ruleSetId || typeof ruleSetId !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "ruleSetId" string',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Score request received', {
      operation: 'score',
      ruleSetId,
      dataKeys: Object.keys(data).length,
      debugMode,
    });

    const result = await req.logger.time('score', async () => {
      return ruleEngine.score(data, ruleSetId, context, debugMode);
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Scoring failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    const statusCode = (error as Error).message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({
      error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/score/rule-sets
 * Get available rule sets
 */
router.get('/rule-sets', (req: Request, res: Response) => {
  try {
    const ruleSets = ruleEngine.getRuleSets();

    res.json({
      success: true,
      result: {
        ruleSets,
        count: ruleSets.length,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get rule sets', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/score/rule-sets/:id
 * Get a specific rule set definition
 */
router.get('/rule-sets/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ruleSet = ruleEngine.getRuleSet(id);

    if (!ruleSet) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Rule set not found: ${id}`,
        traceId: req.traceContext.traceId,
      });
    }

    res.json({
      success: true,
      result: ruleSet,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get rule set', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/score/validate-data
 * Validate data has required fields for a rule set
 */
router.post('/validate-data', async (req: Request, res: Response) => {
  try {
    const { data, ruleSetId } = req.body as {
      data: Record<string, unknown>;
      ruleSetId: string;
    };

    if (!data || !ruleSetId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include "data" and "ruleSetId"',
        traceId: req.traceContext.traceId,
      });
    }

    const result = ruleEngine.validateData(data, ruleSetId);

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Data validation failed', {
      error: (error as Error).message,
    });

    const statusCode = (error as Error).message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({
      error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/score/batch
 * Score multiple data items against a rule set
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { items, ruleSetId, context, debugMode = false } = req.body as {
      items: Record<string, unknown>[];
      ruleSetId: string;
      context?: Record<string, unknown>;
      debugMode?: boolean;
    };

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include an "items" array',
        traceId: req.traceContext.traceId,
      });
    }

    if (!ruleSetId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "ruleSetId"',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Batch score request received', {
      operation: 'batchScore',
      ruleSetId,
      itemCount: items.length,
    });

    const results = await req.logger.time('batchScore', async () => {
      return items.map((item, index) => {
        try {
          return {
            index,
            success: true,
            result: ruleEngine.score(item, ruleSetId, context, debugMode),
          };
        } catch (error) {
          return {
            index,
            success: false,
            error: (error as Error).message,
          };
        }
      });
    });

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      result: {
        items: results,
        summary: {
          total: items.length,
          successful: successCount,
          failed: items.length - successCount,
        },
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Batch scoring failed', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

export default router;
```

### 6.6 Validate Route
```typescript
import { Router, Request, Response } from 'express';
import { Validator, ValidationOptions } from '../engines/validator';

const router = Router();
const validator = new Validator();

/**
 * POST /api/v1/validate
 * Validate analysis data
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { analysis, sources, scores, profile, options = {} } = req.body as {
      analysis: Record<string, unknown>;
      sources?: unknown[];
      scores?: Record<string, unknown>;
      profile?: string;
      options?: Omit<ValidationOptions, 'profile'>;
    };

    if (!analysis || typeof analysis !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include an "analysis" object',
        traceId: req.traceContext.traceId,
      });
    }

    // Merge sources and scores into analysis if provided separately
    const analysisData = {
      ...analysis,
      ...(sources && { source_documents: sources }),
      ...(scores && { scores }),
    };

    req.logger.info('Validation request received', {
      operation: 'validate',
      profile: profile || 'general',
      dataKeys: Object.keys(analysis).length,
      hasSources: !!sources,
      hasScores: !!scores,
    });

    const result = await req.logger.time('validate', async () => {
      return validator.validate(analysisData, {
        profile: profile || 'general',
        ...options,
      });
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Validation failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    const statusCode = (error as Error).message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({
      error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/validate/profiles
 * Get available validation profiles
 */
router.get('/profiles', (req: Request, res: Response) => {
  try {
    const profiles = validator.getProfiles();

    res.json({
      success: true,
      result: {
        profiles,
        count: profiles.length,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get validation profiles', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/validate/quick
 * Quick validation with default profile
 */
router.post('/quick', async (req: Request, res: Response) => {
  try {
    const { data } = req.body as { data: Record<string, unknown> };

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "data" object',
        traceId: req.traceContext.traceId,
      });
    }

    const result = validator.validate(data, {
      profile: 'general',
      checks: ['schema', 'coverage'],
      strictness: 'lenient',
    });

    res.json({
      success: true,
      result: {
        status: result.status,
        confidence: result.confidence,
        issueCount: result.issues.length,
        summary: result.summary,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Quick validation failed', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/validate/batch
 * Validate multiple items
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { items, profile, options = {} } = req.body as {
      items: Record<string, unknown>[];
      profile?: string;
      options?: ValidationOptions;
    };

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include an "items" array',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Batch validation request received', {
      operation: 'batchValidate',
      profile: profile || 'general',
      itemCount: items.length,
    });

    const results = await req.logger.time('batchValidate', async () => {
      return items.map((item, index) => {
        try {
          return {
            index,
            success: true,
            result: validator.validate(item, {
              profile: profile || 'general',
              ...options,
            }),
          };
        } catch (error) {
          return {
            index,
            success: false,
            error: (error as Error).message,
          };
        }
      });
    });

    const successCount = results.filter(r => r.success).length;
    const passCount = results.filter(r => r.success && (r.result as { status: string })?.status === 'PASS').length;

    res.json({
      success: true,
      result: {
        items: results,
        summary: {
          total: items.length,
          successful: successCount,
          failed: items.length - successCount,
          passed: passCount,
          flagged: results.filter(r => r.success && (r.result as { status: string })?.status === 'FLAG').length,
          rejected: results.filter(r => r.success && (r.result as { status: string })?.status === 'FAIL').length,
        },
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Batch validation failed', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

export default router;
```

### 6.7 Tree Route
```typescript
import { Router, Request, Response } from 'express';
import { TreeBuilder, TreeBuildOptions } from '../engines/tree-builder';

const router = Router();
const treeBuilder = new TreeBuilder();

/**
 * POST /api/v1/tree
 * Build analysis tree
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { entity, documents = [], schema, llmConfig, guidanceProfile, debugMode = false } = req.body as {
      entity: Record<string, unknown>;
      documents?: unknown[];
      schema: string;
      llmConfig?: TreeBuildOptions['llmConfig'];
      guidanceProfile?: string;
      debugMode?: boolean;
    };

    if (!entity || typeof entity !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include an "entity" object',
        traceId: req.traceContext.traceId,
      });
    }

    if (!schema) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "schema" string',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Tree build request received', {
      operation: 'buildTree',
      schema,
      entityKeys: Object.keys(entity).length,
      documentCount: documents.length,
      debugMode,
    });

    const result = await req.logger.time('buildTree', async () => {
      return treeBuilder.buildTree(entity, documents, {
        schema,
        llmConfig,
        guidanceProfile,
        debugMode,
      });
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Tree building failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    const statusCode = (error as Error).message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({
      error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/tree/schemas
 * Get available tree schemas
 */
router.get('/schemas', (req: Request, res: Response) => {
  try {
    const schemas = treeBuilder.getSchemas();

    res.json({
      success: true,
      result: {
        schemas,
        count: schemas.length,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get schemas', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/tree/schemas/:id
 * Get a specific tree schema
 */
router.get('/schemas/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schema = treeBuilder.getSchema(id);

    if (!schema) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Schema not found: ${id}`,
        traceId: req.traceContext.traceId,
      });
    }

    res.json({
      success: true,
      result: schema,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get schema', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

export default router;
```

### 6.8 Detect Route
```typescript
import { Router, Request, Response } from 'express';
import { ChangeDetector, DetectionOptions } from '../engines/change-detector';

const router = Router();
const changeDetector = new ChangeDetector();

/**
 * POST /api/v1/detect
 * Detect changes between two versions
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { oldVersion, newVersion, materialityConfig, comparisonDepth, debugMode = false } = req.body as {
      oldVersion: Record<string, unknown>;
      newVersion: Record<string, unknown>;
      materialityConfig?: DetectionOptions['materialityConfig'];
      comparisonDepth?: 'shallow' | 'deep';
      debugMode?: boolean;
    };

    if (!oldVersion || typeof oldVersion !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include an "oldVersion" object',
        traceId: req.traceContext.traceId,
      });
    }

    if (!newVersion || typeof newVersion !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "newVersion" object',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Change detection request received', {
      operation: 'detectChanges',
      oldVersionKeys: Object.keys(oldVersion).length,
      newVersionKeys: Object.keys(newVersion).length,
      comparisonDepth: comparisonDepth || 'deep',
      debugMode,
    });

    const result = await req.logger.time('detectChanges', async () => {
      return changeDetector.detectChanges(oldVersion, newVersion, {
        materialityConfig,
        comparisonDepth,
        debugMode,
      });
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Change detection failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/detect/batch
 * Detect changes for multiple version pairs
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { pairs, options = {} } = req.body as {
      pairs: Array<{ oldVersion: Record<string, unknown>; newVersion: Record<string, unknown> }>;
      options?: DetectionOptions;
    };

    if (!pairs || !Array.isArray(pairs)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "pairs" array',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Batch change detection request received', {
      operation: 'batchDetectChanges',
      pairCount: pairs.length,
    });

    const results = await req.logger.time('batchDetectChanges', async () => {
      return pairs.map((pair, index) => {
        try {
          return {
            index,
            success: true,
            result: changeDetector.detectChanges(pair.oldVersion, pair.newVersion, options),
          };
        } catch (error) {
          return {
            index,
            success: false,
            error: (error as Error).message,
          };
        }
      });
    });

    const successCount = results.filter(r => r.success).length;
    const highMaterialityCount = results.filter(r =>
      r.success && (r.result as { materiality: string })?.materiality === 'HIGH'
    ).length;

    res.json({
      success: true,
      result: {
        items: results,
        summary: {
          total: pairs.length,
          successful: successCount,
          failed: pairs.length - successCount,
          highMateriality: highMaterialityCount,
          mediumMateriality: results.filter(r =>
            r.success && (r.result as { materiality: string })?.materiality === 'MEDIUM'
          ).length,
          lowMateriality: results.filter(r =>
            r.success && (r.result as { materiality: string })?.materiality === 'LOW'
          ).length,
        },
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Batch change detection failed', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

export default router;
```

### 6.9 Route Route
```typescript
import { Router, Request, Response } from 'express';
import { TierRouter, ChangeInput, RoutingContext } from '../engines/tier-router';
import { ExplanationGenerator, ExplanationOptions } from '../engines/explanation-generator';
import { ScoringResult } from '../engines/rule-engine';

const router = Router();
const tierRouter = new TierRouter();
const explanationGenerator = new ExplanationGenerator();

/**
 * POST /api/v1/route
 * Route a change to appropriate review tier
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { change, context = {} } = req.body as {
      change: ChangeInput;
      context?: RoutingContext;
    };

    if (!change || typeof change !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "change" object',
        traceId: req.traceContext.traceId,
      });
    }

    // Validate required change properties
    if (typeof change.impactScore !== 'number' ||
        typeof change.materiality !== 'string' ||
        typeof change.changesCount !== 'number') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Change object must include impactScore (number), materiality (string), and changesCount (number)',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Routing request received', {
      operation: 'route',
      impactScore: change.impactScore,
      materiality: change.materiality,
      changesCount: change.changesCount,
      urgency: context.urgency || 'normal',
    });

    const result = await req.logger.time('route', async () => {
      return tierRouter.route(change, context);
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Routing failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/route/tiers/:vertical
 * Get tier configurations for a vertical
 */
router.get('/tiers/:vertical', (req: Request, res: Response) => {
  try {
    const { vertical } = req.params;
    const configs = tierRouter.getTierConfigs(vertical);

    res.json({
      success: true,
      result: {
        vertical,
        tiers: configs,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get tier configs', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/route/explain
 * Generate explanation for a scoring result
 */
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { scoringResult, options = {} } = req.body as {
      scoringResult: ScoringResult;
      options?: ExplanationOptions;
    };

    if (!scoringResult || typeof scoringResult !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "scoringResult" object',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Explanation request received', {
      operation: 'explain',
      ruleSetId: scoringResult.ruleSetId,
      audience: options.audience || 'professional',
      verbosity: options.verbosity || 'standard',
    });

    const result = await req.logger.time('explain', async () => {
      return explanationGenerator.generate(scoringResult, options);
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Explanation generation failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/route/batch
 * Route multiple changes
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { changes, context = {} } = req.body as {
      changes: ChangeInput[];
      context?: RoutingContext;
    };

    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "changes" array',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Batch routing request received', {
      operation: 'batchRoute',
      changeCount: changes.length,
    });

    const results = await req.logger.time('batchRoute', async () => {
      return changes.map((change, index) => {
        try {
          return {
            index,
            success: true,
            result: tierRouter.route(change, context),
          };
        } catch (error) {
          return {
            index,
            success: false,
            error: (error as Error).message,
          };
        }
      });
    });

    const successCount = results.filter(r => r.success).length;
    const tierCounts = {
      tier1: results.filter(r => r.success && (r.result as { tier: number })?.tier === 1).length,
      tier2: results.filter(r => r.success && (r.result as { tier: number })?.tier === 2).length,
      tier3: results.filter(r => r.success && (r.result as { tier: number })?.tier === 3).length,
      tier4: results.filter(r => r.success && (r.result as { tier: number })?.tier === 4).length,
    };
    const autoApproveCount = results.filter(r =>
      r.success && (r.result as { autoApprove: boolean })?.autoApprove
    ).length;

    res.json({
      success: true,
      result: {
        items: results,
        summary: {
          total: changes.length,
          successful: successCount,
          failed: changes.length - successCount,
          autoApproved: autoApproveCount,
          ...tierCounts,
        },
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Batch routing failed', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

export default router;
```
========================================
SECTION 6B: Core API Engine Files
========================================

### 6B.1 Engine Files
total 120
drwxr-xr-x 2 amee amee  4096 Jan 16 13:57 .
drwxr-xr-x 6 amee amee  4096 Jan 16 14:24 ..
-rw-r--r-- 1 amee amee 12383 Jan 16 13:57 change-detector.ts
-rw-r--r-- 1 amee amee 13819 Jan 16 13:49 explanation-generator.ts
-rw-r--r-- 1 amee amee  8622 Jan 16 13:45 lock-manager.ts
-rw-r--r-- 1 amee amee 14016 Jan 16 13:45 rule-engine.ts
-rw-r--r-- 1 amee amee 10956 Jan 16 13:49 tier-router.ts
-rw-r--r-- 1 amee amee 13868 Jan 16 13:49 tree-builder.ts
-rw-r--r-- 1 amee amee 20845 Jan 16 13:45 validator.ts

### 6B.2 Lock Manager Engine
```typescript
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../lib/logger';
import { Tracer, SpanStatus } from '../lib/tracer';

// Hash algorithms supported
export type HashAlgorithm = 'SHA256' | 'SHA3-256' | 'SHA512';

// Canonicalization modes
export type CanonicalizationMode = 'strict' | 'relaxed';

// Lock options interface
export interface LockOptions {
  algorithm?: HashAlgorithm;
  includeTimestamp?: boolean;
  canonicalization?: CanonicalizationMode;
  schemaId?: string;
  metadata?: Record<string, unknown>;
}

// Lock result interface
export interface LockResult {
  locked_data: Record<string, unknown>;
  data_hash: string;
  lock_timestamp: string;
  lock_id: string;
  algorithm: HashAlgorithm;
  canonicalization: CanonicalizationMode;
  schema_id?: string;
  metadata?: Record<string, unknown>;
}

// Verification result interface
export interface VerificationResult {
  valid: boolean;
  expected_hash: string;
  actual_hash: string;
  lock_id: string;
  verified_at: string;
  issues?: string[];
}

// Lock Manager class
export class LockManager {
  private logger: Logger;
  private tracer: Tracer;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'LockManager' });
    this.tracer = new Tracer('LockManager', this.logger);
  }

  /**
   * Canonicalize data for consistent hashing
   * Ensures same data always produces same hash regardless of key order
   */
  canonicalize(data: unknown, mode: CanonicalizationMode = 'strict'): string {
    return this.tracer.withSpanSync('canonicalize', (span) => {
      span.setAttribute('mode', mode);
      span.setAttribute('data_type', typeof data);

      if (data === null || data === undefined) {
        return 'null';
      }

      if (typeof data !== 'object') {
        return JSON.stringify(data);
      }

      if (Array.isArray(data)) {
        const canonicalArray = data.map(item => this.canonicalize(item, mode));
        return `[${canonicalArray.join(',')}]`;
      }

      // Object canonicalization
      const obj = data as Record<string, unknown>;
      const keys = Object.keys(obj).sort();

      if (mode === 'relaxed') {
        // Relaxed mode: ignore null/undefined values
        const filtered = keys.filter(k => obj[k] !== null && obj[k] !== undefined);
        const pairs = filtered.map(k => `${JSON.stringify(k)}:${this.canonicalize(obj[k], mode)}`);
        return `{${pairs.join(',')}}`;
      }

      // Strict mode: include all keys
      const pairs = keys.map(k => `${JSON.stringify(k)}:${this.canonicalize(obj[k], mode)}`);
      const result = `{${pairs.join(',')}}`;

      span.setAttribute('output_length', result.length);
      return result;
    });
  }

  /**
   * Compute hash of canonicalized data
   */
  computeHash(canonicalData: string, algorithm: HashAlgorithm = 'SHA256'): string {
    return this.tracer.withSpanSync('computeHash', (span) => {
      span.setAttribute('algorithm', algorithm);
      span.setAttribute('input_length', canonicalData.length);

      let hash: string;

      switch (algorithm) {
        case 'SHA256':
          hash = CryptoJS.SHA256(canonicalData).toString(CryptoJS.enc.Hex);
          break;
        case 'SHA3-256':
          hash = CryptoJS.SHA3(canonicalData, { outputLength: 256 }).toString(CryptoJS.enc.Hex);
          break;
        case 'SHA512':
          hash = CryptoJS.SHA512(canonicalData).toString(CryptoJS.enc.Hex);
          break;
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      span.setAttribute('hash_length', hash.length);
      this.logger.debug(`Hash computed`, { algorithm, hashPrefix: hash.slice(0, 16) });

      return hash;
    });
  }

  /**
   * Create a lock for data
   */
  createLock(data: Record<string, unknown>, options: LockOptions = {}): LockResult {
    return this.tracer.withSpanSync('createLock', (span) => {
      const {
        algorithm = 'SHA256',
        includeTimestamp = true,
        canonicalization = 'strict',
        schemaId,
        metadata,
      } = options;

      span.setAttributes({
        algorithm,
        includeTimestamp,
        canonicalization,
        hasSchemaId: !!schemaId,
        hasMetadata: !!metadata,
      });

      const lockId = uuidv4();
      const lockTimestamp = new Date().toISOString();

      this.logger.info('Creating lock', {
        operation: 'createLock',
        lockId,
        algorithm,
        dataKeys: Object.keys(data).length,
      });

      // Prepare data for hashing
      let dataToHash = { ...data };

      if (includeTimestamp) {
        dataToHash = {
          ...dataToHash,
          _lock_timestamp: lockTimestamp,
        };
      }

      // Canonicalize and hash
      const canonicalData = this.canonicalize(dataToHash, canonicalization);
      const dataHash = this.computeHash(canonicalData, algorithm);

      const result: LockResult = {
        locked_data: data,
        data_hash: dataHash,
        lock_timestamp: lockTimestamp,
        lock_id: lockId,
        algorithm,
        canonicalization,
      };

      if (schemaId) {
        result.schema_id = schemaId;
      }

      if (metadata) {
        result.metadata = metadata;
      }

      this.logger.info('Lock created', {
        operation: 'createLock',
        lockId,
        hashPrefix: dataHash.slice(0, 16),
        dataSize: JSON.stringify(data).length,
      });

      span.setAttributes({
        lockId,
        hashPrefix: dataHash.slice(0, 16),
      });

      return result;
    });
  }

  /**
   * Verify a lock against data
   */
  verifyLock(
    data: Record<string, unknown>,
    expectedHash: string,
    lockTimestamp?: string,
    options: LockOptions = {}
  ): VerificationResult {
    return this.tracer.withSpanSync('verifyLock', (span) => {
      const {
        algorithm = 'SHA256',
        includeTimestamp = true,
        canonicalization = 'strict',
      } = options;

      span.setAttributes({
        algorithm,
        includeTimestamp,
        canonicalization,
      });

      const verifiedAt = new Date().toISOString();
      const verificationId = uuidv4();

      this.logger.info('Verifying lock', {
        operation: 'verifyLock',
        verificationId,
        expectedHashPrefix: expectedHash.slice(0, 16),
      });

      // Prepare data for hashing (same as createLock)
      let dataToHash = { ...data };

      if (includeTimestamp && lockTimestamp) {
        dataToHash = {
          ...dataToHash,
          _lock_timestamp: lockTimestamp,
        };
      }

      // Canonicalize and hash
      const canonicalData = this.canonicalize(dataToHash, canonicalization);
      const actualHash = this.computeHash(canonicalData, algorithm);

      const valid = actualHash === expectedHash;
      const issues: string[] = [];

      if (!valid) {
        issues.push('Hash mismatch - data may have been tampered with');
        this.logger.warn('Lock verification failed', {
          operation: 'verifyLock',
          verificationId,
          expectedHashPrefix: expectedHash.slice(0, 16),
          actualHashPrefix: actualHash.slice(0, 16),
        });
      }

      const result: VerificationResult = {
        valid,
        expected_hash: expectedHash,
        actual_hash: actualHash,
        lock_id: verificationId,
        verified_at: verifiedAt,
      };

      if (issues.length > 0) {
        result.issues = issues;
      }

      span.setAttributes({
        valid,
        verificationId,
      });

      if (!valid) {
        span.setStatus(SpanStatus.ERROR, 'Hash mismatch');
      }

      this.logger.info('Lock verification complete', {
        operation: 'verifyLock',
        verificationId,
        valid,
      });

      return result;
    });
  }

  /**
   * Compare two data objects and determine if they would produce the same hash
   */
  compareHashes(
    data1: Record<string, unknown>,
    data2: Record<string, unknown>,
    options: LockOptions = {}
  ): { equal: boolean; hash1: string; hash2: string } {
    const { algorithm = 'SHA256', canonicalization = 'strict' } = options;

    const canonical1 = this.canonicalize(data1, canonicalization);
    const canonical2 = this.canonicalize(data2, canonicalization);

    const hash1 = this.computeHash(canonical1, algorithm);
    const hash2 = this.computeHash(canonical2, algorithm);

    return {
      equal: hash1 === hash2,
      hash1,
      hash2,
    };
  }
}

// Default instance
export const lockManager = new LockManager();

export default lockManager;
```

### 6B.3 Rule Engine
```typescript
import { Logger } from '../lib/logger';
import { Tracer, SpanStatus } from '../lib/tracer';
import * as fs from 'fs';
import * as path from 'path';

// Rule operators
export type RuleOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'neq' | 'between' | 'in';

// Rule definition
export interface Rule {
  id: string;
  field: string;
  operator: RuleOperator;
  value: number | string | [number, number] | (number | string)[];
  scoreFormula: string; // JavaScript expression, e.g., "12 - (value - 5) * 0.8"
  maxScore: number;
  minScore?: number;
  description?: string;
}

// Dimension definition (group of related rules)
export interface Dimension {
  id: string;
  name: string;
  weight: number; // 0-1, weights across dimensions should sum to 1
  maxScore: number;
  rules: Rule[];
  aggregation: 'weighted_sum' | 'average' | 'max' | 'min';
  ruleWeights?: Record<string, number>; // Rule ID -> weight
}

// Rule set definition
export interface RuleSet {
  id: string;
  name: string;
  version: string;
  vertical: string; // 'investment' | 'legal' | 'healthcare' | 'insurance'
  description?: string;
  dimensions: Dimension[];
  aggregation: 'weighted_average' | 'sum' | 'max' | 'custom';
  totalMaxScore: number;
  classifications: Classification[];
}

// Classification thresholds
export interface Classification {
  name: string;
  minScore: number;
  maxScore: number;
  recommendation?: string;
}

// Rule execution result
export interface RuleExecution {
  ruleId: string;
  field: string;
  inputValue: unknown;
  operator: RuleOperator;
  targetValue: unknown;
  passed: boolean;
  rawScore: number;
  normalizedScore: number;
  explanation: string;
}

// Dimension score result
export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  weight: number;
  maxScore: number;
  rawScore: number;
  weightedScore: number;
  ruleExecutions: RuleExecution[];
  explanation: string;
}

// Scoring result
export interface ScoringResult {
  ruleSetId: string;
  ruleSetName: string;
  vertical: string;
  timestamp: string;
  scores: {
    dimensions: DimensionScore[];
    total: number;
    maxPossible: number;
    percentage: number;
  };
  classification: string;
  recommendation: string;
  explanation: string;
  debugInfo?: {
    inputData: Record<string, unknown>;
    ruleSetVersion: string;
    executionTime_ms: number;
  };
}

// Rule Engine class
export class RuleEngine {
  private logger: Logger;
  private tracer: Tracer;
  private ruleSets: Map<string, RuleSet> = new Map();
  private configPath: string;

  constructor(logger?: Logger, configPath?: string) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'RuleEngine' });
    this.tracer = new Tracer('RuleEngine', this.logger);
    this.configPath = configPath || path.join(__dirname, '../config/rule-sets');
    this.loadRuleSets();
  }

  /**
   * Load rule sets from config directory
   */
  private loadRuleSets(): void {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.logger.warn('Rule sets config path not found, using defaults', { path: this.configPath });
        return;
      }

      const files = fs.readdirSync(this.configPath).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(this.configPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const ruleSet = JSON.parse(content) as RuleSet;
        this.ruleSets.set(ruleSet.id, ruleSet);
        this.logger.info(`Loaded rule set: ${ruleSet.id}`, { version: ruleSet.version });
      }
    } catch (error) {
      this.logger.error('Failed to load rule sets', { error: (error as Error).message });
    }
  }

  /**
   * Register a rule set programmatically
   */
  registerRuleSet(ruleSet: RuleSet): void {
    this.ruleSets.set(ruleSet.id, ruleSet);
    this.logger.info(`Registered rule set: ${ruleSet.id}`, { version: ruleSet.version });
  }

  /**
   * Get available rule sets
   */
  getRuleSets(): string[] {
    return Array.from(this.ruleSets.keys());
  }

  /**
   * Get a specific rule set
   */
  getRuleSet(id: string): RuleSet | undefined {
    return this.ruleSets.get(id);
  }

  /**
   * Safely get a numeric value from data
   */
  private getValue(data: Record<string, unknown>, field: string): number | null {
    const parts = field.split('.');
    let value: unknown = data;

    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return null;
      }
      value = (value as Record<string, unknown>)[part];
    }

    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }

    return null;
  }

  /**
   * Evaluate a rule operator
   */
  private evaluateOperator(value: number, operator: RuleOperator, target: Rule['value']): boolean {
    switch (operator) {
      case 'lt':
        return value < (target as number);
      case 'lte':
        return value <= (target as number);
      case 'gt':
        return value > (target as number);
      case 'gte':
        return value >= (target as number);
      case 'eq':
        return value === (target as number);
      case 'neq':
        return value !== (target as number);
      case 'between':
        const [min, max] = target as [number, number];
        return value >= min && value <= max;
      case 'in':
        return (target as number[]).includes(value);
      default:
        return false;
    }
  }

  /**
   * Calculate score using formula
   */
  private calculateScore(value: number, formula: string, maxScore: number, minScore: number = 0): number {
    try {
      // Replace 'value' placeholder with actual value
      const expression = formula.replace(/\bvalue\b/g, value.toString());

      // Evaluate the expression (safe eval for numeric expressions)
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expression}`)() as number;

      // Clamp to valid range
      return Math.max(minScore, Math.min(maxScore, result));
    } catch (error) {
      this.logger.warn('Score formula evaluation failed', { formula, value, error: (error as Error).message });
      return 0;
    }
  }

  /**
   * Execute a single rule
   */
  private executeRule(rule: Rule, data: Record<string, unknown>): RuleExecution {
    const inputValue = this.getValue(data, rule.field);

    // Handle missing value
    if (inputValue === null) {
      return {
        ruleId: rule.id,
        field: rule.field,
        inputValue: null,
        operator: rule.operator,
        targetValue: rule.value,
        passed: false,
        rawScore: 0,
        normalizedScore: 0,
        explanation: `Missing or invalid value for field '${rule.field}'`,
      };
    }

    const passed = this.evaluateOperator(inputValue, rule.operator, rule.value);
    const rawScore = this.calculateScore(inputValue, rule.scoreFormula, rule.maxScore, rule.minScore || 0);
    const normalizedScore = rawScore / rule.maxScore;

    return {
      ruleId: rule.id,
      field: rule.field,
      inputValue,
      operator: rule.operator,
      targetValue: rule.value,
      passed,
      rawScore,
      normalizedScore,
      explanation: `${rule.field}=${inputValue} ${rule.operator} ${JSON.stringify(rule.value)} -> score: ${rawScore.toFixed(2)}/${rule.maxScore}`,
    };
  }

  /**
   * Score a dimension
   */
  private scoreDimension(dimension: Dimension, data: Record<string, unknown>): DimensionScore {
    const ruleExecutions: RuleExecution[] = [];
    let totalRawScore = 0;

    for (const rule of dimension.rules) {
      const execution = this.executeRule(rule, data);
      ruleExecutions.push(execution);

      // Apply rule weight if defined
      const ruleWeight = dimension.ruleWeights?.[rule.id] || 1 / dimension.rules.length;

      switch (dimension.aggregation) {
        case 'weighted_sum':
          totalRawScore += execution.rawScore * ruleWeight;
          break;
        case 'average':
          totalRawScore += execution.rawScore / dimension.rules.length;
          break;
        case 'max':
          totalRawScore = Math.max(totalRawScore, execution.rawScore);
          break;
        case 'min':
          if (totalRawScore === 0) {
            totalRawScore = execution.rawScore;
          } else {
            totalRawScore = Math.min(totalRawScore, execution.rawScore);
          }
          break;
      }
    }

    // Normalize to dimension max score
    const rawScore = Math.min(dimension.maxScore, totalRawScore);
    const weightedScore = rawScore * dimension.weight;

    const passedRules = ruleExecutions.filter(r => r.passed).length;
    const explanation = `${dimension.name}: ${rawScore.toFixed(2)}/${dimension.maxScore} (${passedRules}/${dimension.rules.length} rules passed)`;

    return {
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      weight: dimension.weight,
      maxScore: dimension.maxScore,
      rawScore,
      weightedScore,
      ruleExecutions,
      explanation,
    };
  }

  /**
   * Determine classification based on score
   */
  private classify(score: number, classifications: Classification[]): { name: string; recommendation: string } {
    for (const classification of classifications) {
      if (score >= classification.minScore && score <= classification.maxScore) {
        return {
          name: classification.name,
          recommendation: classification.recommendation || classification.name,
        };
      }
    }

    return { name: 'Unclassified', recommendation: 'Review manually' };
  }

  /**
   * Score data against a rule set
   */
  score(
    data: Record<string, unknown>,
    ruleSetId: string,
    context?: Record<string, unknown>,
    debugMode: boolean = false
  ): ScoringResult {
    return this.tracer.withSpanSync('score', (span) => {
      const startTime = Date.now();

      span.setAttributes({
        ruleSetId,
        debugMode,
        dataKeys: Object.keys(data).length,
      });

      this.logger.info('Starting scoring', {
        operation: 'score',
        ruleSetId,
        dataKeys: Object.keys(data).length,
      });

      // Get rule set
      const ruleSet = this.ruleSets.get(ruleSetId);
      if (!ruleSet) {
        span.setStatus(SpanStatus.ERROR, `Rule set not found: ${ruleSetId}`);
        throw new Error(`Rule set not found: ${ruleSetId}`);
      }

      // Score each dimension
      const dimensionScores: DimensionScore[] = [];
      let totalScore = 0;

      for (const dimension of ruleSet.dimensions) {
        const dimensionScore = this.scoreDimension(dimension, data);
        dimensionScores.push(dimensionScore);

        this.logger.debug(`Dimension scored: ${dimension.name}`, {
          dimensionId: dimension.id,
          rawScore: dimensionScore.rawScore,
          weightedScore: dimensionScore.weightedScore,
        });

        // Aggregate dimension scores
        switch (ruleSet.aggregation) {
          case 'weighted_average':
            totalScore += dimensionScore.weightedScore;
            break;
          case 'sum':
            totalScore += dimensionScore.rawScore;
            break;
          case 'max':
            totalScore = Math.max(totalScore, dimensionScore.rawScore);
            break;
        }
      }

      // Round total score
      totalScore = Math.round(totalScore * 100) / 100;

      // Get classification
      const { name: classification, recommendation } = this.classify(totalScore, ruleSet.classifications);

      // Build explanation
      const dimensionSummaries = dimensionScores.map(d => `${d.dimensionName}: ${d.rawScore.toFixed(1)}/${d.maxScore}`);
      const explanation = `Total Score: ${totalScore}/${ruleSet.totalMaxScore} (${(totalScore / ruleSet.totalMaxScore * 100).toFixed(1)}%)\n` +
        `Classification: ${classification}\n` +
        `Dimensions: ${dimensionSummaries.join(', ')}`;

      const executionTime = Date.now() - startTime;

      const result: ScoringResult = {
        ruleSetId: ruleSet.id,
        ruleSetName: ruleSet.name,
        vertical: ruleSet.vertical,
        timestamp: new Date().toISOString(),
        scores: {
          dimensions: dimensionScores,
          total: totalScore,
          maxPossible: ruleSet.totalMaxScore,
          percentage: (totalScore / ruleSet.totalMaxScore) * 100,
        },
        classification,
        recommendation,
        explanation,
      };

      // Add debug info if requested
      if (debugMode) {
        result.debugInfo = {
          inputData: data,
          ruleSetVersion: ruleSet.version,
          executionTime_ms: executionTime,
        };
      }

      span.setAttributes({
        totalScore,
        classification,
        executionTime_ms: executionTime,
      });

      this.logger.info('Scoring complete', {
        operation: 'score',
        ruleSetId,
        totalScore,
        classification,
        executionTime_ms: executionTime,
      });

      return result;
    });
  }

  /**
   * Validate data has required fields for a rule set
   */
  validateData(data: Record<string, unknown>, ruleSetId: string): { valid: boolean; missingFields: string[] } {
    const ruleSet = this.ruleSets.get(ruleSetId);
    if (!ruleSet) {
      throw new Error(`Rule set not found: ${ruleSetId}`);
    }

    const missingFields: string[] = [];

    for (const dimension of ruleSet.dimensions) {
      for (const rule of dimension.rules) {
        const value = this.getValue(data, rule.field);
        if (value === null) {
          missingFields.push(rule.field);
        }
      }
    }

    return {
      valid: missingFields.length === 0,
      missingFields: [...new Set(missingFields)], // Remove duplicates
    };
  }
}

// Default instance
export const ruleEngine = new RuleEngine();

export default ruleEngine;
```

### 6B.4 Validator Engine
```typescript
import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { Logger } from '../lib/logger';
import { Tracer, SpanStatus } from '../lib/tracer';

// Validation check types
export type CheckType = 'schema' | 'coverage' | 'sources' | 'hallucination' | 'rules';

// Validation status
export type ValidationStatus = 'PASS' | 'FLAG' | 'FAIL';

// Strictness levels
export type Strictness = 'strict' | 'normal' | 'lenient';

// Hallucination sensitivity
export type HallucinationSensitivity = 'high' | 'medium' | 'low';

// Check result
export interface CheckResult {
  checkType: CheckType;
  passed: boolean;
  score: number; // 0-1 confidence
  issues: Issue[];
  details: Record<string, unknown>;
  duration_ms: number;
}

// Issue definition
export interface Issue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
}

// Validation profile
export interface ValidationProfile {
  id: string;
  name: string;
  checks: CheckType[];
  strictness: Strictness;
  hallucinationSensitivity: HallucinationSensitivity;
  sourceVerificationDepth: 'sample' | 'full';
  schemas: Record<string, object>; // Schema ID -> JSON Schema
  requiredFields: string[];
  plausibilityRules: PlausibilityRule[];
}

// Plausibility rule for hallucination detection
export interface PlausibilityRule {
  field: string;
  type: 'range' | 'format' | 'consistency' | 'custom';
  params: Record<string, unknown>;
  message: string;
}

// Validation options
export interface ValidationOptions {
  profile?: string;
  checks?: CheckType[];
  strictness?: Strictness;
  hallucinationSensitivity?: HallucinationSensitivity;
  sourceVerificationDepth?: 'sample' | 'full';
  customSchema?: object;
  debugMode?: boolean;
}

// Validation result
export interface ValidationResult {
  status: ValidationStatus;
  checks: CheckResult[];
  issues: Issue[];
  confidence: number;
  timestamp: string;
  profile: string;
  summary: string;
  debugInfo?: {
    inputData: Record<string, unknown>;
    executionTime_ms: number;
  };
}

// Validator class
export class Validator {
  private logger: Logger;
  private tracer: Tracer;
  private ajv: Ajv;
  private profiles: Map<string, ValidationProfile> = new Map();
  private compiledSchemas: Map<string, ValidateFunction> = new Map();

  constructor(logger?: Logger) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'Validator' });
    this.tracer = new Tracer('Validator', this.logger);

    // Initialize AJV with formats
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);

    // Load default profiles
    this.loadDefaultProfiles();
  }

  /**
   * Load default validation profiles
   */
  private loadDefaultProfiles(): void {
    // Financial strict profile
    const financialStrict: ValidationProfile = {
      id: 'financial-strict',
      name: 'Financial Data Strict Validation',
      checks: ['schema', 'coverage', 'hallucination', 'rules'],
      strictness: 'strict',
      hallucinationSensitivity: 'high',
      sourceVerificationDepth: 'sample',
      schemas: {
        'financial-data': {
          type: 'object',
          properties: {
            symbol: { type: 'string', minLength: 1, maxLength: 10 },
            companyName: { type: 'string', minLength: 1 },
            peRatio: { type: 'number' },
            pbRatio: { type: 'number' },
            roe: { type: 'number' },
            marketCap: { type: 'number', minimum: 0 },
            totalScore: { type: 'number', minimum: 0, maximum: 100 },
          },
          required: ['symbol'],
        },
      },
      requiredFields: ['symbol', 'companyName', 'peRatio', 'roe', 'totalScore'],
      plausibilityRules: [
        { field: 'peRatio', type: 'range', params: { min: -100, max: 1000 }, message: 'P/E ratio outside plausible range' },
        { field: 'pbRatio', type: 'range', params: { min: 0, max: 100 }, message: 'P/B ratio outside plausible range' },
        { field: 'roe', type: 'range', params: { min: -1, max: 2 }, message: 'ROE outside plausible range (-100% to 200%)' },
        { field: 'totalScore', type: 'range', params: { min: 0, max: 100 }, message: 'Total score must be 0-100' },
        { field: 'marketCap', type: 'range', params: { min: 0, max: 1e15 }, message: 'Market cap outside plausible range' },
      ],
    };

    this.profiles.set(financialStrict.id, financialStrict);

    // General validation profile
    const generalProfile: ValidationProfile = {
      id: 'general',
      name: 'General Validation',
      checks: ['schema', 'coverage'],
      strictness: 'normal',
      hallucinationSensitivity: 'medium',
      sourceVerificationDepth: 'sample',
      schemas: {},
      requiredFields: [],
      plausibilityRules: [],
    };

    this.profiles.set(generalProfile.id, generalProfile);

    this.logger.info('Loaded default validation profiles', {
      profiles: Array.from(this.profiles.keys()),
    });
  }

  /**
   * Register a custom validation profile
   */
  registerProfile(profile: ValidationProfile): void {
    this.profiles.set(profile.id, profile);
    this.logger.info(`Registered validation profile: ${profile.id}`);
  }

  /**
   * Get available profiles
   */
  getProfiles(): string[] {
    return Array.from(this.profiles.keys());
  }

  /**
   * Compile and cache a JSON schema
   */
  private getCompiledSchema(schema: object, schemaId: string): ValidateFunction {
    const cacheKey = `${schemaId}-${JSON.stringify(schema).slice(0, 50)}`;

    if (!this.compiledSchemas.has(cacheKey)) {
      const compiled = this.ajv.compile(schema);
      this.compiledSchemas.set(cacheKey, compiled);
    }

    return this.compiledSchemas.get(cacheKey)!;
  }

  /**
   * Run schema validation check
   */
  private runSchemaCheck(
    data: Record<string, unknown>,
    profile: ValidationProfile,
    customSchema?: object
  ): CheckResult {
    const startTime = Date.now();
    const issues: Issue[] = [];

    // Use custom schema or first schema from profile
    const schema = customSchema || Object.values(profile.schemas)[0];

    if (!schema) {
      return {
        checkType: 'schema',
        passed: true,
        score: 1,
        issues: [{ severity: 'info', code: 'NO_SCHEMA', message: 'No schema defined for validation' }],
        details: {},
        duration_ms: Date.now() - startTime,
      };
    }

    const validate = this.getCompiledSchema(schema, 'custom');
    const valid = validate(data);

    if (!valid && validate.errors) {
      for (const error of validate.errors) {
        issues.push({
          severity: 'error',
          code: 'SCHEMA_VIOLATION',
          message: error.message || 'Schema validation failed',
          field: error.instancePath.replace(/^\//, '').replace(/\//g, '.') || undefined,
          suggestion: `Check the value at ${error.instancePath || 'root'}`,
        });
      }
    }

    const score = valid ? 1 : Math.max(0, 1 - (issues.length * 0.2));

    return {
      checkType: 'schema',
      passed: valid || false,
      score,
      issues,
      details: { schemaErrors: validate.errors || [] },
      duration_ms: Date.now() - startTime,
    };
  }

  /**
   * Run coverage check (required fields)
   */
  private runCoverageCheck(
    data: Record<string, unknown>,
    profile: ValidationProfile
  ): CheckResult {
    const startTime = Date.now();
    const issues: Issue[] = [];
    const missingFields: string[] = [];

    for (const field of profile.requiredFields) {
      const value = this.getNestedValue(data, field);
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
        issues.push({
          severity: profile.strictness === 'strict' ? 'error' : 'warning',
          code: 'MISSING_FIELD',
          message: `Required field '${field}' is missing or empty`,
          field,
          suggestion: `Provide a value for ${field}`,
        });
      }
    }

    const coverageRatio = profile.requiredFields.length > 0
      ? (profile.requiredFields.length - missingFields.length) / profile.requiredFields.length
      : 1;

    const passed = profile.strictness === 'strict'
      ? missingFields.length === 0
      : coverageRatio >= 0.7;

    return {
      checkType: 'coverage',
      passed,
      score: coverageRatio,
      issues,
      details: {
        requiredFields: profile.requiredFields,
        missingFields,
        coverageRatio,
      },
      duration_ms: Date.now() - startTime,
    };
  }

  /**
   * Run hallucination/plausibility check
   */
  private runHallucinationCheck(
    data: Record<string, unknown>,
    profile: ValidationProfile
  ): CheckResult {
    const startTime = Date.now();
    const issues: Issue[] = [];
    let failedChecks = 0;

    for (const rule of profile.plausibilityRules) {
      const value = this.getNestedValue(data, rule.field);

      if (value === undefined || value === null) {
        continue; // Skip missing fields (handled by coverage check)
      }

      let passed = true;

      switch (rule.type) {
        case 'range':
          if (typeof value === 'number') {
            const { min, max } = rule.params as { min: number; max: number };
            passed = value >= min && value <= max;
          }
          break;

        case 'format':
          if (typeof value === 'string') {
            const { pattern } = rule.params as { pattern: string };
            passed = new RegExp(pattern).test(value);
          }
          break;

        case 'consistency':
          // Check consistency between related fields
          const { relatedField, relationship } = rule.params as {
            relatedField: string;
            relationship: 'equal' | 'greater' | 'less'
          };
          const relatedValue = this.getNestedValue(data, relatedField);
          if (typeof value === 'number' && typeof relatedValue === 'number') {
            switch (relationship) {
              case 'equal': passed = value === relatedValue; break;
              case 'greater': passed = value > relatedValue; break;
              case 'less': passed = value < relatedValue; break;
            }
          }
          break;
      }

      if (!passed) {
        failedChecks++;
        const severity = this.getSeverityFromSensitivity(profile.hallucinationSensitivity);
        issues.push({
          severity,
          code: 'PLAUSIBILITY_FAILURE',
          message: rule.message,
          field: rule.field,
          suggestion: `Verify the value of ${rule.field}: ${value}`,
        });
      }
    }

    const totalRules = profile.plausibilityRules.length;
    const score = totalRules > 0 ? (totalRules - failedChecks) / totalRules : 1;
    const passThreshold = profile.hallucinationSensitivity === 'high' ? 1
      : profile.hallucinationSensitivity === 'medium' ? 0.8
      : 0.6;

    return {
      checkType: 'hallucination',
      passed: score >= passThreshold,
      score,
      issues,
      details: {
        totalRules,
        failedChecks,
        sensitivity: profile.hallucinationSensitivity,
      },
      duration_ms: Date.now() - startTime,
    };
  }

  /**
   * Run rules validation check (verify scores are within expected ranges)
   */
  private runRulesCheck(
    data: Record<string, unknown>,
    scores?: Record<string, unknown>
  ): CheckResult {
    const startTime = Date.now();
    const issues: Issue[] = [];

    if (!scores) {
      return {
        checkType: 'rules',
        passed: true,
        score: 1,
        issues: [{ severity: 'info', code: 'NO_SCORES', message: 'No scores provided for rules check' }],
        details: {},
        duration_ms: Date.now() - startTime,
      };
    }

    // Check dimension scores are within expected ranges
    const dimensions = (scores as { dimensions?: Array<{ dimensionName: string; rawScore: number; maxScore: number }> }).dimensions;
    if (dimensions && Array.isArray(dimensions)) {
      for (const dim of dimensions) {
        if (dim.rawScore < 0) {
          issues.push({
            severity: 'error',
            code: 'NEGATIVE_SCORE',
            message: `Dimension '${dim.dimensionName}' has negative score: ${dim.rawScore}`,
            field: `scores.dimensions.${dim.dimensionName}`,
          });
        }
        if (dim.rawScore > dim.maxScore) {
          issues.push({
            severity: 'error',
            code: 'SCORE_EXCEEDED',
            message: `Dimension '${dim.dimensionName}' exceeds max: ${dim.rawScore} > ${dim.maxScore}`,
            field: `scores.dimensions.${dim.dimensionName}`,
          });
        }
      }
    }

    // Check total score
    const total = (scores as { total?: number }).total;
    const maxPossible = (scores as { maxPossible?: number }).maxPossible;
    if (typeof total === 'number' && typeof maxPossible === 'number') {
      if (total < 0 || total > maxPossible) {
        issues.push({
          severity: 'error',
          code: 'INVALID_TOTAL',
          message: `Total score ${total} is outside valid range 0-${maxPossible}`,
          field: 'scores.total',
        });
      }
    }

    const passed = issues.filter(i => i.severity === 'error').length === 0;
    const score = passed ? 1 : 0.5;

    return {
      checkType: 'rules',
      passed,
      score,
      issues,
      details: { scores },
      duration_ms: Date.now() - startTime,
    };
  }

  /**
   * Run source verification check
   */
  private runSourcesCheck(
    data: Record<string, unknown>,
    sources?: unknown[],
    depth: 'sample' | 'full' = 'sample'
  ): CheckResult {
    const startTime = Date.now();
    const issues: Issue[] = [];

    if (!sources || sources.length === 0) {
      return {
        checkType: 'sources',
        passed: true,
        score: 0.5,
        issues: [{ severity: 'info', code: 'NO_SOURCES', message: 'No source documents provided for verification' }],
        details: { sourcesProvided: false },
        duration_ms: Date.now() - startTime,
      };
    }

    // Basic source verification - check that sources are valid objects
    let validSources = 0;
    const totalToCheck = depth === 'sample' ? Math.min(3, sources.length) : sources.length;

    for (let i = 0; i < totalToCheck; i++) {
      const source = sources[i];
      if (source && typeof source === 'object') {
        validSources++;
      }
    }

    const score = validSources / totalToCheck;
    const passed = score >= 0.8;

    return {
      checkType: 'sources',
      passed,
      score,
      issues,
      details: {
        totalSources: sources.length,
        checkedSources: totalToCheck,
        validSources,
        depth,
      },
      duration_ms: Date.now() - startTime,
    };
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let value: unknown = obj;

    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return undefined;
      }
      value = (value as Record<string, unknown>)[part];
    }

    return value;
  }

  /**
   * Convert sensitivity to severity
   */
  private getSeverityFromSensitivity(sensitivity: HallucinationSensitivity): 'error' | 'warning' | 'info' {
    switch (sensitivity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
    }
  }

  /**
   * Determine overall status from check results
   */
  private determineStatus(checks: CheckResult[], strictness: Strictness): ValidationStatus {
    const errorChecks = checks.filter(c => !c.passed && c.issues.some(i => i.severity === 'error'));
    const warningChecks = checks.filter(c => !c.passed && c.issues.some(i => i.severity === 'warning'));

    if (strictness === 'strict') {
      if (errorChecks.length > 0) return 'FAIL';
      if (warningChecks.length > 0) return 'FLAG';
      return 'PASS';
    }

    if (strictness === 'normal') {
      if (errorChecks.length >= 2) return 'FAIL';
      if (errorChecks.length > 0 || warningChecks.length > 0) return 'FLAG';
      return 'PASS';
    }

    // Lenient
    if (errorChecks.length >= 3) return 'FAIL';
    if (errorChecks.length > 0) return 'FLAG';
    return 'PASS';
  }

  /**
   * Main validation method
   */
  validate(
    analysis: Record<string, unknown>,
    options: ValidationOptions = {}
  ): ValidationResult {
    return this.tracer.withSpanSync('validate', (span) => {
      const startTime = Date.now();

      const {
        profile: profileId = 'general',
        checks: checksToRun,
        strictness,
        hallucinationSensitivity,
        sourceVerificationDepth,
        customSchema,
        debugMode = false,
      } = options;

      span.setAttributes({
        profile: profileId,
        debugMode,
      });

      this.logger.info('Starting validation', {
        operation: 'validate',
        profile: profileId,
        dataKeys: Object.keys(analysis).length,
      });

      // Get profile
      const profile = this.profiles.get(profileId);
      if (!profile) {
        span.setStatus(SpanStatus.ERROR, `Profile not found: ${profileId}`);
        throw new Error(`Validation profile not found: ${profileId}`);
      }

      // Apply overrides
      const effectiveProfile: ValidationProfile = {
        ...profile,
        checks: checksToRun || profile.checks,
        strictness: strictness || profile.strictness,
        hallucinationSensitivity: hallucinationSensitivity || profile.hallucinationSensitivity,
        sourceVerificationDepth: sourceVerificationDepth || profile.sourceVerificationDepth,
      };

      // Extract sources and scores from analysis if present
      const sources = (analysis.source_documents || analysis.sources) as unknown[] | undefined;
      const scores = (analysis.scores) as Record<string, unknown> | undefined;

      // Run checks
      const checkResults: CheckResult[] = [];

      for (const checkType of effectiveProfile.checks) {
        let result: CheckResult;

        switch (checkType) {
          case 'schema':
            result = this.runSchemaCheck(analysis, effectiveProfile, customSchema);
            break;
          case 'coverage':
            result = this.runCoverageCheck(analysis, effectiveProfile);
            break;
          case 'hallucination':
            result = this.runHallucinationCheck(analysis, effectiveProfile);
            break;
          case 'rules':
            result = this.runRulesCheck(analysis, scores);
            break;
          case 'sources':
            result = this.runSourcesCheck(analysis, sources, effectiveProfile.sourceVerificationDepth);
            break;
          default:
            continue;
        }

        checkResults.push(result);

        this.logger.debug(`Check completed: ${checkType}`, {
          checkType,
          passed: result.passed,
          score: result.score,
          issueCount: result.issues.length,
        });
      }

      // Aggregate issues
      const allIssues = checkResults.flatMap(c => c.issues);

      // Calculate overall confidence
      const confidence = checkResults.length > 0
        ? checkResults.reduce((sum, c) => sum + c.score, 0) / checkResults.length
        : 1;

      // Determine status
      const status = this.determineStatus(checkResults, effectiveProfile.strictness);

      // Build summary
      const passedChecks = checkResults.filter(c => c.passed).length;
      const summary = `${status}: ${passedChecks}/${checkResults.length} checks passed, ` +
        `confidence: ${(confidence * 100).toFixed(1)}%, ` +
        `issues: ${allIssues.filter(i => i.severity === 'error').length} errors, ` +
        `${allIssues.filter(i => i.severity === 'warning').length} warnings`;

      const executionTime = Date.now() - startTime;

      const result: ValidationResult = {
        status,
        checks: checkResults,
        issues: allIssues,
        confidence,
        timestamp: new Date().toISOString(),
        profile: profileId,
        summary,
      };

      if (debugMode) {
        result.debugInfo = {
          inputData: analysis,
          executionTime_ms: executionTime,
        };
      }

      span.setAttributes({
        status,
        confidence,
        issueCount: allIssues.length,
        executionTime_ms: executionTime,
      });

      this.logger.info('Validation complete', {
        operation: 'validate',
        status,
        confidence,
        issueCount: allIssues.length,
        executionTime_ms: executionTime,
      });

      return result;
    });
  }
}

// Default instance
export const validator = new Validator();

export default validator;
```
========================================
SECTION 6C: Core API Engine Files (cont)
========================================

### 6C.1 Tree Builder Engine
```typescript
import OpenAI from 'openai';
import { Logger } from '../lib/logger';
import { Tracer, SpanStatus } from '../lib/tracer';

// LLM Provider types
export type LLMProvider = 'openai' | 'anthropic';

// LLM Configuration
export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  maxRetries?: number;
}

// Tree schema definition
export interface TreeSchema {
  id: string;
  name: string;
  vertical: string;
  sections: TreeSection[];
  outputFormat: 'json' | 'markdown' | 'html';
}

// Tree section definition
export interface TreeSection {
  id: string;
  name: string;
  description: string;
  required: boolean;
  subSections?: TreeSection[];
}

// Tree node (output)
export interface TreeNode {
  sectionId: string;
  sectionName: string;
  content: string;
  confidence: number;
  sources?: string[];
  children?: TreeNode[];
}

// Build tree options
export interface TreeBuildOptions {
  schema: string | TreeSchema;
  llmConfig?: Partial<LLMConfig>;
  guidanceProfile?: string;
  debugMode?: boolean;
}

// Tree build result
export interface TreeBuildResult {
  tree: TreeNode[];
  metadata: {
    schema: string;
    provider: string;
    model: string;
    tokensUsed: number;
    executionTime_ms: number;
    retries: number;
  };
  coverageReport: {
    totalSections: number;
    completedSections: number;
    missingSections: string[];
    coveragePercentage: number;
  };
  confidenceMap: Record<string, number>;
}

// Default schemas
const DEFAULT_SCHEMAS: Record<string, TreeSchema> = {
  'company-6d': {
    id: 'company-6d',
    name: 'Company Analysis (6D Framework)',
    vertical: 'investment',
    outputFormat: 'json',
    sections: [
      {
        id: 'executive-summary',
        name: 'Executive Summary',
        description: 'Brief overview of investment thesis, key strengths, risks, and recommendation',
        required: true,
      },
      {
        id: 'business-overview',
        name: 'Business Overview',
        description: 'Company description, products/services, market position, business model',
        required: true,
      },
      {
        id: 'financial-health',
        name: 'Financial Health Assessment',
        description: 'Revenue trends, profitability, cash flow quality, balance sheet strength',
        required: true,
      },
      {
        id: 'competitive-moat',
        name: 'Competitive Moat Analysis',
        description: 'Competitive advantages, barriers to entry, market share, brand strength',
        required: true,
      },
      {
        id: 'growth-prospects',
        name: 'Growth Prospects',
        description: 'Growth drivers, market expansion opportunities, product pipeline',
        required: true,
      },
      {
        id: 'valuation',
        name: 'Valuation Assessment',
        description: 'Current multiples, historical comparison, peer comparison, intrinsic value',
        required: true,
      },
      {
        id: 'risks',
        name: 'Key Risks',
        description: 'Company-specific risks, industry headwinds, regulatory concerns',
        required: true,
      },
      {
        id: 'recommendation',
        name: 'Investment Recommendation',
        description: 'Buy/Hold/Sell recommendation with target price and time horizon',
        required: true,
      },
    ],
  },
  'legal-cost-tree': {
    id: 'legal-cost-tree',
    name: 'Legal Cost Analysis',
    vertical: 'legal',
    outputFormat: 'json',
    sections: [
      { id: 'case-summary', name: 'Case Summary', description: 'Brief overview of the case', required: true },
      { id: 'cost-breakdown', name: 'Cost Breakdown', description: 'Itemized legal costs', required: true },
      { id: 'time-allocation', name: 'Time Allocation', description: 'Time spent by task category', required: true },
      { id: 'reasonableness', name: 'Reasonableness Assessment', description: 'Assessment of cost reasonableness', required: true },
    ],
  },
};

// Tree Builder class
export class TreeBuilder {
  private logger: Logger;
  private tracer: Tracer;
  private schemas: Map<string, TreeSchema> = new Map();
  private openaiClient?: OpenAI;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'TreeBuilder' });
    this.tracer = new Tracer('TreeBuilder', this.logger);

    // Load default schemas
    for (const [id, schema] of Object.entries(DEFAULT_SCHEMAS)) {
      this.schemas.set(id, schema);
    }

    // Initialize OpenAI client if API key available
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  /**
   * Register a custom schema
   */
  registerSchema(schema: TreeSchema): void {
    this.schemas.set(schema.id, schema);
    this.logger.info(`Registered tree schema: ${schema.id}`);
  }

  /**
   * Get available schemas
   */
  getSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Get a specific schema
   */
  getSchema(id: string): TreeSchema | undefined {
    return this.schemas.get(id);
  }

  /**
   * Build system prompt for tree generation
   */
  private buildSystemPrompt(schema: TreeSchema): string {
    const sectionsDescription = schema.sections
      .map(s => `- ${s.name}: ${s.description}${s.required ? ' (required)' : ''}`)
      .join('\n');

    return `You are an expert ${schema.vertical} analyst. Your task is to generate a structured analysis following the ${schema.name} framework.

Output Format: ${schema.outputFormat.toUpperCase()}

Required Sections:
${sectionsDescription}

Guidelines:
1. Be specific and factual, avoid vague statements
2. Support assertions with data when available
3. Acknowledge uncertainty where information is incomplete
4. Use professional, objective language
5. Structure output as valid JSON with the following format:

{
  "sections": [
    {
      "sectionId": "section-id",
      "sectionName": "Section Name",
      "content": "Detailed analysis content...",
      "confidence": 0.0-1.0,
      "sources": ["source1", "source2"]
    }
  ]
}`;
  }

  /**
   * Build user prompt for tree generation
   */
  private buildUserPrompt(
    entity: Record<string, unknown>,
    documents: unknown[],
    schema: TreeSchema
  ): string {
    const entityJson = JSON.stringify(entity, null, 2);
    const docsPreview = documents.slice(0, 3).map((d, i) => {
      if (typeof d === 'string') return `Document ${i + 1}: ${d.slice(0, 500)}...`;
      if (typeof d === 'object') return `Document ${i + 1}: ${JSON.stringify(d).slice(0, 500)}...`;
      return `Document ${i + 1}: (unknown format)`;
    }).join('\n\n');

    return `Analyze the following entity and generate a ${schema.name}:

Entity Data:
${entityJson}

${documents.length > 0 ? `Supporting Documents (${documents.length} total):\n${docsPreview}` : 'No supporting documents provided.'}

Generate the analysis following the schema structure. Ensure all required sections are included.`;
  }

  /**
   * Call LLM to generate tree
   */
  private async callLLM(
    systemPrompt: string,
    userPrompt: string,
    config: LLMConfig
  ): Promise<{ content: string; tokensUsed: number }> {
    const { provider, model, temperature = 0.3, maxTokens = 4000 } = config;

    if (provider === 'openai') {
      if (!this.openaiClient) {
        throw new Error('OpenAI client not initialized - set OPENAI_API_KEY');
      }

      const response = await this.openaiClient.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });

      return {
        content: response.choices[0]?.message?.content || '',
        tokensUsed: response.usage?.total_tokens || 0,
      };
    }

    throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  /**
   * Parse LLM response into tree nodes
   */
  private parseResponse(content: string, schema: TreeSchema): TreeNode[] {
    try {
      // Clean up response
      let cleaned = content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleaned) as {
        sections?: Array<{
          sectionId: string;
          sectionName: string;
          content: string;
          confidence?: number;
          sources?: string[];
          children?: TreeNode[];
        }>;
      };

      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        throw new Error('Response missing sections array');
      }

      return parsed.sections.map(s => ({
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        content: s.content,
        confidence: s.confidence || 0.5,
        sources: s.sources,
        children: s.children,
      }));
    } catch (error) {
      this.logger.warn('Failed to parse LLM response as JSON', { error: (error as Error).message });

      // Return raw content as single node
      return [{
        sectionId: 'raw-content',
        sectionName: 'Analysis',
        content,
        confidence: 0.5,
      }];
    }
  }

  /**
   * Calculate coverage report
   */
  private calculateCoverage(
    tree: TreeNode[],
    schema: TreeSchema
  ): TreeBuildResult['coverageReport'] {
    const requiredSections = schema.sections.filter(s => s.required).map(s => s.id);
    const completedSections = tree.map(n => n.sectionId);
    const missingSections = requiredSections.filter(id => !completedSections.includes(id));

    return {
      totalSections: schema.sections.length,
      completedSections: completedSections.length,
      missingSections,
      coveragePercentage: requiredSections.length > 0
        ? ((requiredSections.length - missingSections.length) / requiredSections.length) * 100
        : 100,
    };
  }

  /**
   * Calculate confidence map
   */
  private calculateConfidenceMap(tree: TreeNode[]): Record<string, number> {
    const map: Record<string, number> = {};

    for (const node of tree) {
      map[node.sectionId] = node.confidence;
      if (node.children) {
        for (const child of node.children) {
          map[`${node.sectionId}.${child.sectionId}`] = child.confidence;
        }
      }
    }

    return map;
  }

  /**
   * Build analysis tree
   */
  async buildTree(
    entity: Record<string, unknown>,
    documents: unknown[] = [],
    options: TreeBuildOptions
  ): Promise<TreeBuildResult> {
    return this.tracer.withSpan('buildTree', async (span) => {
      const startTime = Date.now();

      // Get schema
      const schema = typeof options.schema === 'string'
        ? this.schemas.get(options.schema)
        : options.schema;

      if (!schema) {
        span.setStatus(SpanStatus.ERROR, 'Schema not found');
        throw new Error(`Schema not found: ${options.schema}`);
      }

      span.setAttributes({
        schemaId: schema.id,
        entityKeys: Object.keys(entity).length,
        documentCount: documents.length,
      });

      this.logger.info('Building tree', {
        operation: 'buildTree',
        schemaId: schema.id,
        entityKeys: Object.keys(entity).length,
        documentCount: documents.length,
      });

      // Default LLM config
      const llmConfig: LLMConfig = {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 4000,
        maxRetries: 3,
        ...options.llmConfig,
      };

      // Build prompts
      const systemPrompt = this.buildSystemPrompt(schema);
      const userPrompt = this.buildUserPrompt(entity, documents, schema);

      // Call LLM with retries
      let response: { content: string; tokensUsed: number } | null = null;
      let retries = 0;

      while (retries < (llmConfig.maxRetries || 3)) {
        try {
          response = await this.callLLM(systemPrompt, userPrompt, llmConfig);
          break;
        } catch (error) {
          retries++;
          this.logger.warn(`LLM call failed, retry ${retries}`, { error: (error as Error).message });

          if (retries >= (llmConfig.maxRetries || 3)) {
            span.setStatus(SpanStatus.ERROR, 'LLM call failed');
            throw error;
          }

          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }

      if (!response) {
        throw new Error('Failed to get LLM response');
      }

      // Parse response
      const tree = this.parseResponse(response.content, schema);

      // Calculate metrics
      const coverageReport = this.calculateCoverage(tree, schema);
      const confidenceMap = this.calculateConfidenceMap(tree);
      const executionTime = Date.now() - startTime;

      const result: TreeBuildResult = {
        tree,
        metadata: {
          schema: schema.id,
          provider: llmConfig.provider,
          model: llmConfig.model,
          tokensUsed: response.tokensUsed,
          executionTime_ms: executionTime,
          retries,
        },
        coverageReport,
        confidenceMap,
      };

      span.setAttributes({
        tokensUsed: response.tokensUsed,
        coveragePercentage: coverageReport.coveragePercentage,
        executionTime_ms: executionTime,
      });

      this.logger.info('Tree built successfully', {
        operation: 'buildTree',
        schemaId: schema.id,
        tokensUsed: response.tokensUsed,
        coveragePercentage: coverageReport.coveragePercentage,
        executionTime_ms: executionTime,
      });

      return result;
    });
  }
}

// Default instance
export const treeBuilder = new TreeBuilder();

export default treeBuilder;
```

### 6C.2 Change Detector Engine
```typescript
import * as deepDiff from 'deep-diff';
import { Logger } from '../lib/logger';
import { Tracer } from '../lib/tracer';

// Change types
export type ChangeType = 'added' | 'removed' | 'modified' | 'array_change';

// Materiality levels
export type Materiality = 'HIGH' | 'MEDIUM' | 'LOW';

// Individual change record
export interface Change {
  path: string;
  changeType: ChangeType;
  oldValue: unknown;
  newValue: unknown;
  impact: number; // 0-1 normalized impact
  description: string;
}

// Materiality configuration
export interface MaterialityConfig {
  highImpactFields: string[];
  mediumImpactFields: string[];
  numericTolerance: number; // Percentage (0-100)
  ignoreFields: string[];
  customRules?: MaterialityRule[];
}

// Custom materiality rule
export interface MaterialityRule {
  field: string;
  condition: 'increase' | 'decrease' | 'change' | 'threshold';
  threshold?: number;
  impact: number;
  message: string;
}

// Detection options
export interface DetectionOptions {
  materialityConfig?: Partial<MaterialityConfig>;
  comparisonDepth?: 'shallow' | 'deep';
  debugMode?: boolean;
}

// Detection result
export interface DetectionResult {
  changes: Change[];
  impactScore: number;
  materiality: Materiality;
  affectedPaths: string[];
  summary: string;
  timestamp: string;
  debugInfo?: {
    totalFieldsCompared: number;
    changesDetected: number;
    executionTime_ms: number;
  };
}

// Default materiality config
const DEFAULT_MATERIALITY_CONFIG: MaterialityConfig = {
  highImpactFields: [
    'totalScore',
    'classification',
    'recommendation',
    'peRatio',
    'roe',
    'debtEquity',
    'marketCap',
  ],
  mediumImpactFields: [
    'valuationScore',
    'qualityScore',
    'growthScore',
    'dividendScore',
    'moatScore',
    'pbRatio',
    'netMargin',
    'revenueGrowth',
  ],
  numericTolerance: 1, // 1% tolerance
  ignoreFields: [
    'timestamp',
    'lastUpdated',
    'updatedAt',
    'createdAt',
    '_id',
    'id',
  ],
  customRules: [
    {
      field: 'totalScore',
      condition: 'change',
      threshold: 5,
      impact: 0.8,
      message: 'Total score changed by more than 5 points',
    },
    {
      field: 'classification',
      condition: 'change',
      threshold: 0,
      impact: 1.0,
      message: 'Classification changed',
    },
  ],
};

// Change Detector class
export class ChangeDetector {
  private logger: Logger;
  private tracer: Tracer;
  private defaultConfig: MaterialityConfig;

  constructor(logger?: Logger, config?: Partial<MaterialityConfig>) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'ChangeDetector' });
    this.tracer = new Tracer('ChangeDetector', this.logger);
    this.defaultConfig = { ...DEFAULT_MATERIALITY_CONFIG, ...config };
  }

  /**
   * Flatten object to dot-notation paths
   */
  private flattenObject(obj: Record<string, unknown>, prefix = ''): Map<string, unknown> {
    const result = new Map<string, unknown>();

    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nested = this.flattenObject(value as Record<string, unknown>, path);
        for (const [nestedPath, nestedValue] of nested) {
          result.set(nestedPath, nestedValue);
        }
      } else {
        result.set(path, value);
      }
    }

    return result;
  }

  /**
   * Check if a field should be ignored
   */
  private shouldIgnore(path: string, config: MaterialityConfig): boolean {
    return config.ignoreFields.some(ignore =>
      path === ignore || path.endsWith(`.${ignore}`)
    );
  }

  /**
   * Calculate impact for a field
   */
  private calculateFieldImpact(path: string, config: MaterialityConfig): number {
    // Check high impact fields
    if (config.highImpactFields.some(f => path === f || path.endsWith(`.${f}`))) {
      return 1.0;
    }

    // Check medium impact fields
    if (config.mediumImpactFields.some(f => path === f || path.endsWith(`.${f}`))) {
      return 0.5;
    }

    // Default low impact
    return 0.2;
  }

  /**
   * Check if numeric change is within tolerance
   */
  private isWithinTolerance(
    oldValue: number,
    newValue: number,
    tolerancePercent: number
  ): boolean {
    if (oldValue === 0) {
      return newValue === 0;
    }

    const changePercent = Math.abs((newValue - oldValue) / oldValue) * 100;
    return changePercent <= tolerancePercent;
  }

  /**
   * Apply custom materiality rules
   */
  private applyCustomRules(
    path: string,
    oldValue: unknown,
    newValue: unknown,
    config: MaterialityConfig
  ): { impact: number; message: string } | null {
    for (const rule of config.customRules || []) {
      if (path !== rule.field && !path.endsWith(`.${rule.field}`)) {
        continue;
      }

      switch (rule.condition) {
        case 'change':
          if (oldValue !== newValue) {
            if (typeof rule.threshold === 'number' &&
                typeof oldValue === 'number' &&
                typeof newValue === 'number') {
              const diff = Math.abs(newValue - oldValue);
              if (diff > rule.threshold) {
                return { impact: rule.impact, message: rule.message };
              }
            } else if (rule.threshold === 0) {
              return { impact: rule.impact, message: rule.message };
            }
          }
          break;

        case 'increase':
          if (typeof oldValue === 'number' &&
              typeof newValue === 'number' &&
              newValue > oldValue) {
            const diff = newValue - oldValue;
            if (!rule.threshold || diff > rule.threshold) {
              return { impact: rule.impact, message: rule.message };
            }
          }
          break;

        case 'decrease':
          if (typeof oldValue === 'number' &&
              typeof newValue === 'number' &&
              newValue < oldValue) {
            const diff = oldValue - newValue;
            if (!rule.threshold || diff > rule.threshold) {
              return { impact: rule.impact, message: rule.message };
            }
          }
          break;

        case 'threshold':
          if (typeof newValue === 'number' && rule.threshold !== undefined) {
            if (newValue > rule.threshold) {
              return { impact: rule.impact, message: rule.message };
            }
          }
          break;
      }
    }

    return null;
  }

  /**
   * Detect changes between two versions
   */
  detectChanges(
    oldVersion: Record<string, unknown>,
    newVersion: Record<string, unknown>,
    options: DetectionOptions = {}
  ): DetectionResult {
    return this.tracer.withSpanSync('detectChanges', (span) => {
      const startTime = Date.now();

      const config: MaterialityConfig = {
        ...this.defaultConfig,
        ...options.materialityConfig,
      };

      span.setAttributes({
        comparisonDepth: options.comparisonDepth || 'deep',
        debugMode: options.debugMode || false,
      });

      this.logger.info('Detecting changes', {
        operation: 'detectChanges',
        oldKeys: Object.keys(oldVersion).length,
        newKeys: Object.keys(newVersion).length,
      });

      const changes: Change[] = [];
      const affectedPaths: string[] = [];
      let totalImpact = 0;

      // Get all differences using deep-diff
      const differences = deepDiff.diff(oldVersion, newVersion) || [];

      // Flatten objects for comparison
      const oldFlat = this.flattenObject(oldVersion);
      const newFlat = this.flattenObject(newVersion);
      const allPaths = new Set([...oldFlat.keys(), ...newFlat.keys()]);

      for (const diff of differences) {
        if (!diff.path) continue;

        const path = diff.path.join('.');

        // Skip ignored fields
        if (this.shouldIgnore(path, config)) {
          continue;
        }

        let changeType: ChangeType;
        let oldValue: unknown;
        let newValue: unknown;

        switch (diff.kind) {
          case 'N': // New property
            changeType = 'added';
            oldValue = undefined;
            newValue = diff.rhs;
            break;

          case 'D': // Deleted property
            changeType = 'removed';
            oldValue = diff.lhs;
            newValue = undefined;
            break;

          case 'E': // Edited property
            changeType = 'modified';
            oldValue = diff.lhs;
            newValue = diff.rhs;

            // Check numeric tolerance
            if (typeof oldValue === 'number' &&
                typeof newValue === 'number' &&
                this.isWithinTolerance(oldValue, newValue, config.numericTolerance)) {
              continue; // Skip within tolerance
            }
            break;

          case 'A': // Array change
            changeType = 'array_change';
            const arrayDiff = diff as deepDiff.DiffArray<Record<string, unknown>, Record<string, unknown>>;
            const item = arrayDiff.item;
            if (item) {
              oldValue = 'lhs' in item ? item.lhs : undefined;
              newValue = 'rhs' in item ? item.rhs : undefined;
            }
            break;

          default:
            continue;
        }

        // Calculate impact
        let impact = this.calculateFieldImpact(path, config);

        // Apply custom rules
        const customRule = this.applyCustomRules(path, oldValue, newValue, config);
        if (customRule) {
          impact = Math.max(impact, customRule.impact);
        }

        // Build description
        let description = `${path}: ${changeType}`;
        if (changeType === 'modified') {
          description = `${path}: changed from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}`;
        } else if (changeType === 'added') {
          description = `${path}: added with value ${JSON.stringify(newValue)}`;
        } else if (changeType === 'removed') {
          description = `${path}: removed (was ${JSON.stringify(oldValue)})`;
        }

        if (customRule) {
          description += ` - ${customRule.message}`;
        }

        changes.push({
          path,
          changeType,
          oldValue,
          newValue,
          impact,
          description,
        });

        affectedPaths.push(path);
        totalImpact += impact;
      }

      // Calculate overall impact score (0-100)
      const maxPossibleImpact = changes.length * 1.0;
      const impactScore = maxPossibleImpact > 0
        ? Math.min(100, (totalImpact / maxPossibleImpact) * 100)
        : 0;

      // Determine materiality
      let materiality: Materiality;
      if (impactScore >= 70 || changes.some(c => c.impact >= 0.8)) {
        materiality = 'HIGH';
      } else if (impactScore >= 30 || changes.some(c => c.impact >= 0.5)) {
        materiality = 'MEDIUM';
      } else {
        materiality = 'LOW';
      }

      // Build summary
      const summary = changes.length === 0
        ? 'No significant changes detected'
        : `${changes.length} changes detected (${materiality} materiality): ` +
          changes.slice(0, 3).map(c => c.path).join(', ') +
          (changes.length > 3 ? ` and ${changes.length - 3} more` : '');

      const executionTime = Date.now() - startTime;

      const result: DetectionResult = {
        changes,
        impactScore: Math.round(impactScore * 100) / 100,
        materiality,
        affectedPaths,
        summary,
        timestamp: new Date().toISOString(),
      };

      if (options.debugMode) {
        result.debugInfo = {
          totalFieldsCompared: allPaths.size,
          changesDetected: changes.length,
          executionTime_ms: executionTime,
        };
      }

      span.setAttributes({
        changesDetected: changes.length,
        impactScore: result.impactScore,
        materiality,
        executionTime_ms: executionTime,
      });

      this.logger.info('Change detection complete', {
        operation: 'detectChanges',
        changesDetected: changes.length,
        impactScore: result.impactScore,
        materiality,
        executionTime_ms: executionTime,
      });

      return result;
    });
  }
}

// Default instance
export const changeDetector = new ChangeDetector();

export default changeDetector;
```

### 6C.3 Tier Router Engine
```typescript
import { Logger } from '../lib/logger';
import { Tracer } from '../lib/tracer';
import { Materiality } from './change-detector';

// Review tiers
export type ReviewTier = 1 | 2 | 3 | 4;

// Urgency levels
export type Urgency = 'critical' | 'high' | 'normal' | 'low';

// Client tiers
export type ClientTier = 'enterprise' | 'premium' | 'standard' | 'basic';

// Reviewer role
export interface Reviewer {
  role: string;
  level: 'junior' | 'senior' | 'manager' | 'executive';
  skills?: string[];
}

// Tier configuration
export interface TierConfig {
  tier: ReviewTier;
  name: string;
  description: string;
  slaHours: number;
  autoApproveEligible: boolean;
  requiredReviewers: Reviewer[];
  notificationChannel: string;
}

// Default tier configurations by vertical
const DEFAULT_TIER_CONFIGS: Record<string, TierConfig[]> = {
  investment: [
    {
      tier: 1,
      name: 'Auto-Approve',
      description: 'Low impact changes with high confidence',
      slaHours: 0,
      autoApproveEligible: true,
      requiredReviewers: [],
      notificationChannel: 'automated',
    },
    {
      tier: 2,
      name: 'Standard Review',
      description: 'Routine changes requiring analyst review',
      slaHours: 24,
      autoApproveEligible: false,
      requiredReviewers: [{ role: 'analyst', level: 'junior' }],
      notificationChannel: 'slack-analysis',
    },
    {
      tier: 3,
      name: 'Senior Review',
      description: 'High impact changes requiring senior oversight',
      slaHours: 48,
      autoApproveEligible: false,
      requiredReviewers: [
        { role: 'analyst', level: 'senior' },
        { role: 'analyst', level: 'junior' },
      ],
      notificationChannel: 'slack-senior',
    },
    {
      tier: 4,
      name: 'Exception Handling',
      description: 'Critical changes requiring executive approval',
      slaHours: 72,
      autoApproveEligible: false,
      requiredReviewers: [
        { role: 'manager', level: 'manager' },
        { role: 'analyst', level: 'senior' },
      ],
      notificationChannel: 'slack-escalation',
    },
  ],
  legal: [
    {
      tier: 1,
      name: 'Auto-Approve',
      description: 'Minor cost adjustments within tolerance',
      slaHours: 0,
      autoApproveEligible: true,
      requiredReviewers: [],
      notificationChannel: 'automated',
    },
    {
      tier: 2,
      name: 'Paralegal Review',
      description: 'Standard cost changes',
      slaHours: 8,
      autoApproveEligible: false,
      requiredReviewers: [{ role: 'paralegal', level: 'junior' }],
      notificationChannel: 'email-legal-team',
    },
    {
      tier: 3,
      name: 'Associate Review',
      description: 'Significant cost changes',
      slaHours: 24,
      autoApproveEligible: false,
      requiredReviewers: [{ role: 'associate', level: 'senior' }],
      notificationChannel: 'email-associates',
    },
    {
      tier: 4,
      name: 'Partner Review',
      description: 'Major cost disputes or exceptions',
      slaHours: 48,
      autoApproveEligible: false,
      requiredReviewers: [{ role: 'partner', level: 'executive' }],
      notificationChannel: 'email-partners',
    },
  ],
};

// Auto-approve rules
interface AutoApproveRule {
  condition: 'impact_below' | 'confidence_above' | 'materiality_is' | 'client_tier_is';
  value: number | string | string[];
}

// Routing context
export interface RoutingContext {
  urgency?: Urgency;
  clientTier?: ClientTier;
  vertical?: string;
  customRules?: AutoApproveRule[];
  confidence?: number;
}

// Change input for routing
export interface ChangeInput {
  impactScore: number;
  materiality: Materiality;
  changesCount: number;
  affectedPaths: string[];
}

// Routing result
export interface RoutingResult {
  tier: ReviewTier;
  tierConfig: TierConfig;
  reviewers: Reviewer[];
  channel: string;
  slaHours: number;
  autoApprove: boolean;
  reasoning: string[];
  timestamp: string;
}

// Tier Router class
export class TierRouter {
  private logger: Logger;
  private tracer: Tracer;
  private tierConfigs: Record<string, TierConfig[]>;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'TierRouter' });
    this.tracer = new Tracer('TierRouter', this.logger);
    this.tierConfigs = { ...DEFAULT_TIER_CONFIGS };
  }

  /**
   * Register custom tier configuration for a vertical
   */
  registerTierConfig(vertical: string, configs: TierConfig[]): void {
    this.tierConfigs[vertical] = configs;
    this.logger.info(`Registered tier config for vertical: ${vertical}`);
  }

  /**
   * Get tier configurations for a vertical
   */
  getTierConfigs(vertical: string): TierConfig[] {
    return this.tierConfigs[vertical] || this.tierConfigs['investment'];
  }

  /**
   * Check auto-approve eligibility
   */
  private checkAutoApprove(
    change: ChangeInput,
    context: RoutingContext
  ): { eligible: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let eligible = true;

    // Default rules
    const rules: AutoApproveRule[] = context.customRules || [
      { condition: 'impact_below', value: 20 },
      { condition: 'materiality_is', value: ['LOW'] },
      { condition: 'confidence_above', value: 0.9 },
    ];

    for (const rule of rules) {
      switch (rule.condition) {
        case 'impact_below':
          if (change.impactScore >= (rule.value as number)) {
            eligible = false;
            reasons.push(`Impact score ${change.impactScore} >= threshold ${rule.value}`);
          } else {
            reasons.push(`Impact score ${change.impactScore} < threshold ${rule.value}`);
          }
          break;

        case 'confidence_above':
          const confidence = context.confidence || 0;
          if (confidence < (rule.value as number)) {
            eligible = false;
            reasons.push(`Confidence ${confidence} < threshold ${rule.value}`);
          } else {
            reasons.push(`Confidence ${confidence} >= threshold ${rule.value}`);
          }
          break;

        case 'materiality_is':
          const allowedMateriality = rule.value as string[];
          if (!allowedMateriality.includes(change.materiality)) {
            eligible = false;
            reasons.push(`Materiality ${change.materiality} not in allowed list`);
          } else {
            reasons.push(`Materiality ${change.materiality} is acceptable`);
          }
          break;

        case 'client_tier_is':
          const allowedClientTiers = rule.value as string[];
          if (context.clientTier && !allowedClientTiers.includes(context.clientTier)) {
            eligible = false;
            reasons.push(`Client tier ${context.clientTier} requires manual review`);
          }
          break;
      }
    }

    return { eligible, reasons };
  }

  /**
   * Determine review tier based on change and context
   */
  private determineTier(
    change: ChangeInput,
    context: RoutingContext
  ): { tier: ReviewTier; reasons: string[] } {
    const reasons: string[] = [];

    // Check for critical urgency
    if (context.urgency === 'critical') {
      reasons.push('Critical urgency escalates to Tier 4');
      return { tier: 4, reasons };
    }

    // Check for enterprise client
    if (context.clientTier === 'enterprise') {
      reasons.push('Enterprise client requires at least Tier 3 review');
      const tier = change.materiality === 'HIGH' ? 4 : 3;
      return { tier: tier as ReviewTier, reasons };
    }

    // Determine tier based on materiality and impact
    if (change.materiality === 'HIGH' || change.impactScore >= 70) {
      reasons.push(`High materiality (${change.materiality}) or impact (${change.impactScore})`);
      return { tier: 4, reasons };
    }

    if (change.materiality === 'MEDIUM' || change.impactScore >= 30) {
      reasons.push(`Medium materiality (${change.materiality}) or impact (${change.impactScore})`);

      // Check urgency for potential escalation
      if (context.urgency === 'high') {
        reasons.push('High urgency escalates to Tier 3');
        return { tier: 3, reasons };
      }

      return { tier: 2, reasons };
    }

    // Low materiality - check for auto-approve
    reasons.push(`Low materiality (${change.materiality}) and impact (${change.impactScore})`);

    const autoApproveCheck = this.checkAutoApprove(change, context);
    if (autoApproveCheck.eligible) {
      reasons.push('Eligible for auto-approve (Tier 1)');
      reasons.push(...autoApproveCheck.reasons);
      return { tier: 1, reasons };
    }

    reasons.push('Not eligible for auto-approve');
    reasons.push(...autoApproveCheck.reasons);
    return { tier: 2, reasons };
  }

  /**
   * Route a change to appropriate review tier
   */
  route(
    change: ChangeInput,
    context: RoutingContext = {}
  ): RoutingResult {
    return this.tracer.withSpanSync('route', (span) => {
      const vertical = context.vertical || 'investment';

      span.setAttributes({
        vertical,
        impactScore: change.impactScore,
        materiality: change.materiality,
        urgency: context.urgency || 'normal',
        clientTier: context.clientTier || 'standard',
      });

      this.logger.info('Routing change for review', {
        operation: 'route',
        vertical,
        impactScore: change.impactScore,
        materiality: change.materiality,
      });

      // Determine tier
      const { tier, reasons } = this.determineTier(change, context);

      // Get tier configuration
      const configs = this.getTierConfigs(vertical);
      const tierConfig = configs.find(c => c.tier === tier) || configs[tier - 1];

      // Check auto-approve for tier 1
      const autoApprove = tier === 1 && tierConfig.autoApproveEligible;

      // Adjust SLA based on urgency
      let slaHours = tierConfig.slaHours;
      if (context.urgency === 'critical') {
        slaHours = Math.max(1, Math.floor(slaHours / 4));
        reasons.push(`SLA reduced due to critical urgency: ${slaHours}h`);
      } else if (context.urgency === 'high') {
        slaHours = Math.max(2, Math.floor(slaHours / 2));
        reasons.push(`SLA reduced due to high urgency: ${slaHours}h`);
      }

      const result: RoutingResult = {
        tier,
        tierConfig,
        reviewers: tierConfig.requiredReviewers,
        channel: tierConfig.notificationChannel,
        slaHours,
        autoApprove,
        reasoning: reasons,
        timestamp: new Date().toISOString(),
      };

      span.setAttributes({
        tier,
        autoApprove,
        slaHours,
        reviewerCount: result.reviewers.length,
      });

      this.logger.info('Routing complete', {
        operation: 'route',
        tier,
        autoApprove,
        slaHours,
        channel: result.channel,
      });

      return result;
    });
  }
}

// Default instance
export const tierRouter = new TierRouter();

export default tierRouter;
```

### 6C.4 Explanation Generator Engine
```typescript
import { Logger } from '../lib/logger';
import { Tracer } from '../lib/tracer';
import { ScoringResult, DimensionScore, RuleExecution } from './rule-engine';

// Audience types
export type Audience = 'expert' | 'professional' | 'consumer';

// Verbosity levels
export type Verbosity = 'brief' | 'standard' | 'detailed';

// Explanation options
export interface ExplanationOptions {
  audience?: Audience;
  verbosity?: Verbosity;
  includeCitations?: boolean;
  language?: string;
  maxLength?: number;
}

// Key factor
export interface KeyFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  score: number;
  explanation: string;
}

// Citation
export interface Citation {
  field: string;
  value: unknown;
  source?: string;
}

// Explanation result
export interface ExplanationResult {
  summary: string;
  keyFactors: KeyFactor[];
  detailedExplanation: string;
  citations: Citation[];
  metadata: {
    audience: Audience;
    verbosity: Verbosity;
    language: string;
    generatedAt: string;
  };
}

// Explanation templates by audience
const TEMPLATES = {
  expert: {
    summary: {
      prefix: '',
      scoreFormat: (score: number, max: number) => `Score: ${score.toFixed(2)}/${max}`,
      classificationFormat: (c: string) => `Classification: ${c}`,
    },
    dimension: {
      format: (name: string, score: number, max: number, pct: number) =>
        `${name}: ${score.toFixed(2)}/${max} (${pct.toFixed(1)}%)`,
    },
    rule: {
      format: (rule: RuleExecution) =>
        `${rule.field}=${rule.inputValue} [${rule.operator} ${JSON.stringify(rule.targetValue)}] -> ${rule.rawScore.toFixed(2)}`,
    },
  },
  professional: {
    summary: {
      prefix: 'Based on our analysis, ',
      scoreFormat: (score: number, max: number) => `overall score of ${Math.round(score)} out of ${max}`,
      classificationFormat: (c: string) => `rated as "${c}"`,
    },
    dimension: {
      format: (name: string, score: number, max: number, pct: number) =>
        `${name}: ${Math.round(score)}/${max} points (${Math.round(pct)}%)`,
    },
    rule: {
      format: (rule: RuleExecution) =>
        `${formatFieldName(rule.field)}: ${formatValue(rule.inputValue)} (${rule.passed ? 'meets' : 'below'} threshold)`,
    },
  },
  consumer: {
    summary: {
      prefix: 'We analyzed this investment opportunity and found ',
      scoreFormat: (score: number, max: number) => `a score of ${Math.round(score)} out of ${max}`,
      classificationFormat: (c: string) => `Our recommendation: ${formatClassification(c)}`,
    },
    dimension: {
      format: (name: string, score: number, max: number, pct: number) =>
        `${formatDimensionName(name)}: ${getScoreEmoji(pct)} ${Math.round(pct)}%`,
    },
    rule: {
      format: (rule: RuleExecution) =>
        `${formatFieldNameConsumer(rule.field)}: ${formatValueConsumer(rule.inputValue, rule.field)}`,
    },
  },
};

// Helper functions
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function formatFieldNameConsumer(field: string): string {
  const mappings: Record<string, string> = {
    peRatio: 'Price-to-Earnings',
    pbRatio: 'Price-to-Book Value',
    roe: 'Return on Investment',
    roic: 'Capital Efficiency',
    netMargin: 'Profit Margin',
    debtEquity: 'Debt Level',
    dividendYield: 'Dividend Payment',
    revenueGrowth: 'Sales Growth',
    epsGrowth: 'Earnings Growth',
  };
  return mappings[field] || formatFieldName(field);
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (Math.abs(value) < 1) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toFixed(2);
  }
  return String(value);
}

function formatValueConsumer(value: unknown, field: string): string {
  if (typeof value !== 'number') return String(value);

  const percentFields = ['roe', 'roic', 'netMargin', 'dividendYield', 'revenueGrowth', 'epsGrowth'];
  if (percentFields.includes(field)) {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (field === 'marketCap') {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)} trillion`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)} billion`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)} million`;
    return `$${value.toLocaleString()}`;
  }

  return value.toFixed(1);
}

function formatClassification(classification: string): string {
  const mappings: Record<string, string> = {
    'Strong Buy': 'Strong opportunity - consider adding to portfolio',
    'Buy': 'Good opportunity - worth considering',
    'Hold': 'Fair value - wait for better entry point',
    'Watch': 'Below average - monitor for improvement',
    'Avoid': 'Not recommended at current valuation',
  };
  return mappings[classification] || classification;
}

function formatDimensionName(name: string): string {
  const mappings: Record<string, string> = {
    'Valuation': 'Value for Money',
    'Quality': 'Business Quality',
    'Growth': 'Growth Potential',
    'Dividend': 'Income Potential',
    'Competitive Moat': 'Competitive Strength',
  };
  return mappings[name] || name;
}

function getScoreEmoji(percentage: number): string {
  if (percentage >= 80) return '';
  if (percentage >= 60) return '';
  if (percentage >= 40) return '';
  return '';
}

// Explanation Generator class
export class ExplanationGenerator {
  private logger: Logger;
  private tracer: Tracer;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'ExplanationGenerator' });
    this.tracer = new Tracer('ExplanationGenerator', this.logger);
  }

  /**
   * Generate summary paragraph
   */
  private generateSummary(
    scoringResult: ScoringResult,
    audience: Audience,
    verbosity: Verbosity
  ): string {
    const template = TEMPLATES[audience].summary;

    const scoreStr = template.scoreFormat(scoringResult.scores.total, scoringResult.scores.maxPossible);
    const classStr = template.classificationFormat(scoringResult.classification);

    if (verbosity === 'brief') {
      return `${template.prefix}${scoreStr}. ${classStr}.`;
    }

    // Standard or detailed
    const dimensionSummaries = scoringResult.scores.dimensions
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, 3)
      .map(d => `${d.dimensionName.toLowerCase()} (${Math.round(d.rawScore / d.maxScore * 100)}%)`);

    const strengthsStr = dimensionSummaries.length > 0
      ? ` Key strengths: ${dimensionSummaries.join(', ')}.`
      : '';

    return `${template.prefix}${scoreStr}, ${classStr.toLowerCase()}.${strengthsStr}`;
  }

  /**
   * Extract key factors from scoring result
   */
  private extractKeyFactors(
    scoringResult: ScoringResult,
    audience: Audience,
    count: number = 5
  ): KeyFactor[] {
    const factors: KeyFactor[] = [];

    // Get top and bottom performing dimensions
    const sortedDimensions = [...scoringResult.scores.dimensions]
      .sort((a, b) => (b.rawScore / b.maxScore) - (a.rawScore / a.maxScore));

    for (const dim of sortedDimensions) {
      const percentage = (dim.rawScore / dim.maxScore) * 100;
      const impact: 'positive' | 'negative' | 'neutral' =
        percentage >= 70 ? 'positive' :
        percentage <= 30 ? 'negative' : 'neutral';

      // Get best/worst rule in dimension
      const sortedRules = [...dim.ruleExecutions]
        .sort((a, b) => b.normalizedScore - a.normalizedScore);

      const explanation = audience === 'consumer'
        ? this.getConsumerExplanation(dim, sortedRules)
        : this.getProfessionalExplanation(dim, sortedRules);

      factors.push({
        factor: dim.dimensionName,
        impact,
        score: percentage,
        explanation,
      });
    }

    return factors.slice(0, count);
  }

  /**
   * Get consumer-friendly explanation for a dimension
   */
  private getConsumerExplanation(dim: DimensionScore, rules: RuleExecution[]): string {
    const percentage = (dim.rawScore / dim.maxScore) * 100;
    const quality = percentage >= 70 ? 'strong' : percentage >= 50 ? 'moderate' : 'weak';

    const bestRule = rules[0];
    const worstRule = rules[rules.length - 1];

    if (percentage >= 70) {
      return `Shows ${quality} ${formatDimensionName(dim.dimensionName).toLowerCase()}. ` +
        `${formatFieldNameConsumer(bestRule?.field || '')} is particularly good.`;
    } else if (percentage <= 30) {
      return `${formatDimensionName(dim.dimensionName)} is a concern. ` +
        `${formatFieldNameConsumer(worstRule?.field || '')} needs improvement.`;
    }

    return `${formatDimensionName(dim.dimensionName)} is ${quality}.`;
  }

  /**
   * Get professional explanation for a dimension
   */
  private getProfessionalExplanation(dim: DimensionScore, rules: RuleExecution[]): string {
    const percentage = (dim.rawScore / dim.maxScore) * 100;

    const passingRules = rules.filter(r => r.passed).length;
    const totalRules = rules.length;

    return `${dim.dimensionName}: ${dim.rawScore.toFixed(1)}/${dim.maxScore} points ` +
      `(${passingRules}/${totalRules} metrics passed). ` +
      rules.slice(0, 2).map(r => `${formatFieldName(r.field)}: ${formatValue(r.inputValue)}`).join(', ') + '.';
  }

  /**
   * Generate detailed explanation
   */
  private generateDetailedExplanation(
    scoringResult: ScoringResult,
    audience: Audience,
    verbosity: Verbosity
  ): string {
    const template = TEMPLATES[audience];
    const sections: string[] = [];

    // Overall section
    sections.push(`## Overall Assessment\n${this.generateSummary(scoringResult, audience, 'standard')}`);

    // Dimension sections
    if (verbosity !== 'brief') {
      sections.push('\n## Breakdown by Category');

      for (const dim of scoringResult.scores.dimensions) {
        const pct = (dim.rawScore / dim.maxScore) * 100;
        const dimHeader = template.dimension.format(dim.dimensionName, dim.rawScore, dim.maxScore, pct);

        if (verbosity === 'detailed') {
          const ruleDetails = dim.ruleExecutions
            .map(r => `  - ${template.rule.format(r)}`)
            .join('\n');
          sections.push(`\n### ${dimHeader}\n${ruleDetails}`);
        } else {
          sections.push(`\n### ${dimHeader}`);
        }
      }
    }

    // Recommendation section
    sections.push(`\n## Recommendation\n${scoringResult.recommendation}`);

    return sections.join('\n');
  }

  /**
   * Extract citations from scoring result
   */
  private extractCitations(scoringResult: ScoringResult): Citation[] {
    const citations: Citation[] = [];

    for (const dim of scoringResult.scores.dimensions) {
      for (const rule of dim.ruleExecutions) {
        if (rule.inputValue !== null && rule.inputValue !== undefined) {
          citations.push({
            field: rule.field,
            value: rule.inputValue,
            source: 'financial_data',
          });
        }
      }
    }

    return citations;
  }

  /**
   * Generate explanation for a scoring result
   */
  generate(
    scoringResult: ScoringResult,
    options: ExplanationOptions = {}
  ): ExplanationResult {
    return this.tracer.withSpanSync('generate', (span) => {
      const {
        audience = 'professional',
        verbosity = 'standard',
        includeCitations = true,
        language = 'en',
      } = options;

      span.setAttributes({
        audience,
        verbosity,
        includeCitations,
        language,
      });

      this.logger.info('Generating explanation', {
        operation: 'generate',
        audience,
        verbosity,
        ruleSetId: scoringResult.ruleSetId,
      });

      const summary = this.generateSummary(scoringResult, audience, verbosity);
      const keyFactors = this.extractKeyFactors(scoringResult, audience);
      const detailedExplanation = this.generateDetailedExplanation(scoringResult, audience, verbosity);
      const citations = includeCitations ? this.extractCitations(scoringResult) : [];

      const result: ExplanationResult = {
        summary,
        keyFactors,
        detailedExplanation,
        citations,
        metadata: {
          audience,
          verbosity,
          language,
          generatedAt: new Date().toISOString(),
        },
      };

      span.setAttributes({
        summaryLength: summary.length,
        keyFactorCount: keyFactors.length,
        citationCount: citations.length,
      });

      this.logger.info('Explanation generated', {
        operation: 'generate',
        summaryLength: summary.length,
        keyFactorCount: keyFactors.length,
      });

      return result;
    });
  }

  /**
   * Generate explanation from rule executions only
   */
  generateFromRuleExecutions(
    ruleExecutions: RuleExecution[],
    recommendation: string,
    options: ExplanationOptions = {}
  ): Partial<ExplanationResult> {
    const { audience = 'professional', verbosity = 'standard' } = options;
    const template = TEMPLATES[audience];

    const summary = `${template.summary.prefix}Analysis complete. ${recommendation}`;

    const keyFactors: KeyFactor[] = ruleExecutions
      .sort((a, b) => b.rawScore - a.rawScore)
      .slice(0, 5)
      .map(rule => ({
        factor: formatFieldName(rule.field),
        impact: rule.passed ? 'positive' : 'negative' as const,
        score: rule.normalizedScore * 100,
        explanation: template.rule.format(rule),
      }));

    return {
      summary,
      keyFactors,
      metadata: {
        audience,
        verbosity,
        language: 'en',
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

// Default instance
export const explanationGenerator = new ExplanationGenerator();

export default explanationGenerator;
```
========================================
SECTION 7: Credentials & Auth
========================================

### 7.1 Credentials Files
./packages/reasonex-n8n-nodes/credentials/ReasonexApi.credentials.ts
./packages/reasonex-n8n-nodes/dist/credentials/ReasonexApi.credentials.d.ts

### 7.2 ReasonexApi.credentials.ts
```typescript
import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ReasonexApi implements ICredentialType {
  name = 'reasonexApi';
  displayName = 'Reasonex API';
  documentationUrl = 'https://docs.reasonex.ai/api';

  properties: INodeProperties[] = [
    {
      displayName: 'API Base URL',
      name: 'apiBaseUrl',
      type: 'string',
      default: 'https://reasonex-core-api-production.up.railway.app',
      description: 'The base URL for the Reasonex Core API',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Your Reasonex API key (optional for basic usage)',
    },
    {
      displayName: 'OpenAI API Key',
      name: 'openaiApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'OpenAI API key for Tree Builder operations (optional)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
        'X-OpenAI-Key': '={{$credentials.openaiApiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.apiBaseUrl}}',
      url: '/health',
      method: 'GET',
    },
  };
}
```

========================================
SECTION 8: Test Files
========================================

### 8.1 Test Files
./packages/reasonex-n8n-nodes/node_modules/json-schema-traverse/spec/index.spec.js
./packages/reasonex-n8n-nodes/node_modules/has-symbols/test/tests.js
./packages/reasonex-n8n-nodes/node_modules/@n8n_io/riot-tmpl/test/specs/brackets.specs.js
./packages/reasonex-n8n-nodes/node_modules/@n8n_io/riot-tmpl/test/specs/core.specs.js
./packages/reasonex-n8n-nodes/node_modules/title-case/dist.es2015/index.spec.js
./packages/reasonex-n8n-nodes/node_modules/title-case/dist.es2015/index.spec.d.ts
./packages/reasonex-n8n-nodes/node_modules/title-case/dist/index.spec.js
./packages/reasonex-n8n-nodes/node_modules/title-case/dist/index.spec.d.ts
./packages/reasonex-n8n-nodes/node_modules/xtend/test.js
./packages/reasonex-n8n-nodes/node_modules/md5/test.js
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/types/dist/generated/ast-spec.js
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/types/dist/generated/ast-spec.d.ts
./packages/reasonex-n8n-nodes/node_modules/object.assign/test/tests.js
./packages/reasonex-n8n-nodes/node_modules/@types/node/test.d.ts
./packages/reasonex-n8n-nodes/node_modules/@types/node/inspector.generated.d.ts
./packages/reasonex-n8n-nodes/node_modules/object-is/test/tests.js
./packages/reasonex-n8n-nodes/node_modules/@eslint/eslintrc/lib/config-array/override-tester.js
./packages/reasonex-n8n-nodes/node_modules/noms/test.js
./packages/reasonex-n8n-nodes/node_modules/fastq/test/test.js
./packages/reasonex-n8n-nodes/node_modules/eslint/lib/rule-tester/flat-rule-tester.js

### 8.2 Test Script (if any)
#!/bin/bash
API_URL="https://reasonex-core-api-production.up.railway.app"

echo "=== Testing Reasonex Core API ==="
echo ""

echo "1. Health Check..."
curl -s "$API_URL/health" | jq -r '.status'
echo ""

echo "2. Lock Endpoint..."
curl -s -X POST "$API_URL/api/v1/lock" \
  -H "Content-Type: application/json" \
  -d '{"data": {"test": "data"}}' | jq -r '.success'
echo ""

echo "3. Score Endpoint..."
curl -s -X POST "$API_URL/api/v1/score" \
  -H "Content-Type: application/json" \
  -d '{"data": {"peRatio": 15, "roe": 18}, "ruleSetId": "investment-v1"}' | jq -r '.success'
echo ""

echo "4. Validate Endpoint..."
curl -s -X POST "$API_URL/api/v1/validate" \
  -H "Content-Type: application/json" \
  -d '{"analysis": {"ticker": "AAPL"}}' | jq -r '.success'
echo ""

echo "5. Detect Endpoint..."
curl -s -X POST "$API_URL/api/v1/detect" \
  -H "Content-Type: application/json" \
  -d '{"oldVersion": {"score": 70}, "newVersion": {"score": 85}}' | jq -r '.success'
echo ""

echo "6. Route Endpoint..."
curl -s -X POST "$API_URL/api/v1/route" \
  -H "Content-Type: application/json" \
  -d '{"change": {"impactScore": 50, "materiality": "MEDIUM"}, "context": {}}' | jq -r '.success'
echo ""

echo "=== All tests complete ==="

========================================
SECTION 9: Documentation
========================================

### 9.1 Documentation Files
./packages/reasonex-n8n-nodes/node_modules/untildify/readme.md
./packages/reasonex-n8n-nodes/node_modules/axios/lib/adapters/README.md
./packages/reasonex-n8n-nodes/node_modules/axios/lib/core/README.md
./packages/reasonex-n8n-nodes/node_modules/axios/lib/env/README.md
./packages/reasonex-n8n-nodes/node_modules/axios/lib/helpers/README.md
./packages/reasonex-n8n-nodes/node_modules/axios/MIGRATION_GUIDE.md
./packages/reasonex-n8n-nodes/node_modules/axios/README.md
./packages/reasonex-n8n-nodes/node_modules/axios/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/asynckit/README.md
./packages/reasonex-n8n-nodes/node_modules/safe-buffer/README.md
./packages/reasonex-n8n-nodes/node_modules/esprima/README.md
./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/README.md
./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/LICENSE_EE.md
./packages/reasonex-n8n-nodes/node_modules/@n8n/errors/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/@n8n/tournament/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/gopd/README.md
./packages/reasonex-n8n-nodes/node_modules/gopd/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/fill-range/README.md
./packages/reasonex-n8n-nodes/node_modules/mime-types/README.md
./packages/reasonex-n8n-nodes/node_modules/mime-types/HISTORY.md
./packages/reasonex-n8n-nodes/node_modules/mkdirp/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types/README.md
./packages/reasonex-n8n-nodes/node_modules/recast/README.md
./packages/reasonex-n8n-nodes/node_modules/json-schema-traverse/README.md
./packages/reasonex-n8n-nodes/node_modules/minimatch/README.md
./packages/reasonex-n8n-nodes/node_modules/eslint-scope/README.md
./packages/reasonex-n8n-nodes/node_modules/fast-glob/node_modules/glob-parent/README.md
./packages/reasonex-n8n-nodes/node_modules/fast-glob/node_modules/glob-parent/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/fast-glob/README.md
./packages/reasonex-n8n-nodes/node_modules/has-symbols/README.md
./packages/reasonex-n8n-nodes/node_modules/has-symbols/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/is-regex/README.md
./packages/reasonex-n8n-nodes/node_modules/is-regex/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/acorn/README.md
./packages/reasonex-n8n-nodes/node_modules/acorn/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/supports-color/readme.md
./packages/reasonex-n8n-nodes/node_modules/esquery/README.md
./packages/reasonex-n8n-nodes/node_modules/merge2/README.md
./packages/reasonex-n8n-nodes/node_modules/is-typed-array/README.md
./packages/reasonex-n8n-nodes/node_modules/is-typed-array/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/@humanwhocodes/object-schema/README.md
./packages/reasonex-n8n-nodes/node_modules/@humanwhocodes/object-schema/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/@humanwhocodes/config-array/node_modules/minimatch/README.md
./packages/reasonex-n8n-nodes/node_modules/@humanwhocodes/config-array/node_modules/brace-expansion/README.md
./packages/reasonex-n8n-nodes/node_modules/@humanwhocodes/config-array/README.md
./packages/reasonex-n8n-nodes/node_modules/@humanwhocodes/module-importer/README.md
./packages/reasonex-n8n-nodes/node_modules/@humanwhocodes/module-importer/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/function-bind/README.md
./packages/reasonex-n8n-nodes/node_modules/function-bind/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/function-bind/.github/SECURITY.md
./packages/reasonex-n8n-nodes/node_modules/espree/README.md
./packages/reasonex-n8n-nodes/node_modules/call-bind-apply-helpers/README.md
./packages/reasonex-n8n-nodes/node_modules/call-bind-apply-helpers/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/flat-cache/README.md
./packages/reasonex-n8n-nodes/node_modules/flat-cache/changelog.md
./packages/reasonex-n8n-nodes/node_modules/emoji-regex/README.md
./packages/reasonex-n8n-nodes/node_modules/shebang-command/readme.md
./packages/reasonex-n8n-nodes/node_modules/globals/readme.md
./packages/reasonex-n8n-nodes/node_modules/@n8n_io/riot-tmpl/doc/CHANGES.md
./packages/reasonex-n8n-nodes/node_modules/@n8n_io/riot-tmpl/doc/API.md
./packages/reasonex-n8n-nodes/node_modules/@n8n_io/riot-tmpl/README.md
./packages/reasonex-n8n-nodes/node_modules/word-wrap/README.md
./packages/reasonex-n8n-nodes/node_modules/title-case/README.md
./packages/reasonex-n8n-nodes/node_modules/get-proto/README.md
./packages/reasonex-n8n-nodes/node_modules/get-proto/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/chalk/readme.md
./packages/reasonex-n8n-nodes/node_modules/find-up/readme.md
./packages/reasonex-n8n-nodes/node_modules/has-property-descriptors/README.md
./packages/reasonex-n8n-nodes/node_modules/has-property-descriptors/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/strip-json-comments/readme.md
./packages/reasonex-n8n-nodes/node_modules/acorn-jsx/README.md
./packages/reasonex-n8n-nodes/node_modules/xtend/README.md
./packages/reasonex-n8n-nodes/node_modules/call-bind/README.md
./packages/reasonex-n8n-nodes/node_modules/call-bind/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/@eslint-community/eslint-utils/README.md
./packages/reasonex-n8n-nodes/node_modules/@eslint-community/regexpp/README.md
./packages/reasonex-n8n-nodes/node_modules/zod/README.md
./packages/reasonex-n8n-nodes/node_modules/globby/readme.md
./packages/reasonex-n8n-nodes/node_modules/core-util-is/README.md
./packages/reasonex-n8n-nodes/node_modules/possible-typed-array-names/README.md
./packages/reasonex-n8n-nodes/node_modules/possible-typed-array-names/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/es-set-tostringtag/README.md
./packages/reasonex-n8n-nodes/node_modules/es-set-tostringtag/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/resolve-from/readme.md
./packages/reasonex-n8n-nodes/node_modules/dunder-proto/README.md
./packages/reasonex-n8n-nodes/node_modules/dunder-proto/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/graphemer/README.md
./packages/reasonex-n8n-nodes/node_modules/graphemer/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/util-deprecate/History.md
./packages/reasonex-n8n-nodes/node_modules/util-deprecate/README.md
./packages/reasonex-n8n-nodes/node_modules/json-buffer/README.md
./packages/reasonex-n8n-nodes/node_modules/md5/README.md
./packages/reasonex-n8n-nodes/node_modules/typescript/README.md
./packages/reasonex-n8n-nodes/node_modules/typescript/SECURITY.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/type-utils/README.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/types/README.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/typescript-estree/README.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/utils/README.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/parser/README.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/scope-manager/README.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/README.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-call.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-type-assertion.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/strict-boolean-expressions.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/space-before-blocks.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-floating-promises.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-duplicate-enum-values.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-readonly.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-loop-func.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/type-annotation-spacing.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-includes.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-type-exports.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-base-to-string.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/class-literal-property-style.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-argument.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-namespace-keyword.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-non-null-asserted-nullish-coalescing.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unused-vars.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-useless-template-literals.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-type-alias.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/adjacent-overload-signatures.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/return-await.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/ban-ts-comment.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-explicit-any.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/ban-tslint-comment.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-non-null-asserted-optional-chain.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-loss-of-precision.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/func-call-spacing.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/key-spacing.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/quotes.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-type-constraint.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/dot-notation.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/default-param-last.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/object-curly-spacing.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-enum-comparison.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/comma-spacing.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-shadow.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-condition.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-optional-chain.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/parameter-properties.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/indent.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/comma-dangle.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-namespace.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-magic-numbers.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-redundant-type-constituents.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-confusing-non-null-assertion.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-type-assertions.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/max-params.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/restrict-plus-operands.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/promise-function-async.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-var-requires.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/keyword-spacing.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-duplicate-type-constituents.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/unified-signatures.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-for-in-array.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-as-const.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-string-starts-ends-with.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/method-signature-style.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-array-delete.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-empty-interface.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-confusing-void-expression.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/triple-slash-reference.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-regexp-exec.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/naming-convention.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-ts-expect-error.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/space-before-function-paren.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-type-arguments.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-type-definitions.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-misused-promises.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-extraneous-class.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-nullish-coalescing.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-dupe-class-members.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-find.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-generic-constructors.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-meaningless-void-operator.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-this-alias.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/explicit-member-accessibility.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/ban-types.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-invalid-this.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-invalid-void-type.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-unary-minus.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/README.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/restrict-template-expressions.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-qualifier.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-return-this-type.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-import-type-side-effects.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/array-type.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-indexed-object-style.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-useless-constructor.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-useless-empty-export.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/switch-exhaustiveness-check.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-dynamic-delete.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-for-of.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-assignment.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-require-imports.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/member-ordering.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-inferrable-types.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-boolean-literal-compare.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-type-imports.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-readonly-parameter-types.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-misused-new.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-extra-semi.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-enum-initializers.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/TEMPLATE.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/require-array-sort-compare.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/lines-around-comment.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-empty-function.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/require-await.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-use-before-define.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-redeclare.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/lines-between-class-members.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/unbound-method.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-literal-enum-member.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/brace-style.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-mixed-enums.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-extra-parens.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/member-delimiter-style.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unused-expressions.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-non-null-assertion.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-duplicate-imports.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-member-access.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/explicit-function-return-type.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/semi.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-implied-eval.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/padding-line-between-statements.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-function-type.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-throw-literal.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-promise-reject-errors.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/space-infix-ops.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-return.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-parameter-properties.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-array-constructor.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/init-declarations.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-declaration-merging.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/await-thenable.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-destructuring.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/explicit-module-boundary-types.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-extra-non-null-assertion.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/non-nullable-type-assertion-style.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-reduce-type-parameter.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/typedef.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/camelcase.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/sort-type-constituents.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/block-spacing.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-restricted-imports.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/eslint-plugin/docs/rules/class-methods-use-this.md
./packages/reasonex-n8n-nodes/node_modules/@typescript-eslint/visitor-keys/README.md
./packages/reasonex-n8n-nodes/node_modules/path-key/readme.md
./packages/reasonex-n8n-nodes/node_modules/is-callable/README.md
./packages/reasonex-n8n-nodes/node_modules/is-callable/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/ast-types/README.md
./packages/reasonex-n8n-nodes/node_modules/object.assign/README.md
./packages/reasonex-n8n-nodes/node_modules/object.assign/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/@types/uuid/README.md
./packages/reasonex-n8n-nodes/node_modules/@types/semver/README.md
./packages/reasonex-n8n-nodes/node_modules/@types/json-schema/README.md
./packages/reasonex-n8n-nodes/node_modules/@types/node/README.md
./packages/reasonex-n8n-nodes/node_modules/optionator/README.md
./packages/reasonex-n8n-nodes/node_modules/optionator/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/which/README.md
./packages/reasonex-n8n-nodes/node_modules/which/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/hasown/README.md
./packages/reasonex-n8n-nodes/node_modules/hasown/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/once/README.md
./packages/reasonex-n8n-nodes/node_modules/is-fullwidth-code-point/readme.md
./packages/reasonex-n8n-nodes/node_modules/js-base64/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/js-base64/README.md
./packages/reasonex-n8n-nodes/node_modules/ts-api-utils/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/ts-api-utils/README.md
./packages/reasonex-n8n-nodes/node_modules/xmlbuilder/README.md
./packages/reasonex-n8n-nodes/node_modules/xmlbuilder/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/path-type/readme.md
./packages/reasonex-n8n-nodes/node_modules/get-intrinsic/README.md
./packages/reasonex-n8n-nodes/node_modules/get-intrinsic/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/uri-js/README.md
./packages/reasonex-n8n-nodes/node_modules/object-is/README.md
./packages/reasonex-n8n-nodes/node_modules/object-is/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/escalade/readme.md
./packages/reasonex-n8n-nodes/node_modules/jssha/CONTRIBUTING.md
./packages/reasonex-n8n-nodes/node_modules/jssha/README.md
./packages/reasonex-n8n-nodes/node_modules/jssha/SECURITY.md
./packages/reasonex-n8n-nodes/node_modules/jssha/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/y18n/README.md
./packages/reasonex-n8n-nodes/node_modules/y18n/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/n8n-workflow/LICENSE_EE.md
./packages/reasonex-n8n-nodes/node_modules/n8n-workflow/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/n8n-workflow/node_modules/form-data/Readme.md
./packages/reasonex-n8n-nodes/node_modules/n8n-workflow/README.md
./packages/reasonex-n8n-nodes/node_modules/mime-db/README.md
./packages/reasonex-n8n-nodes/node_modules/mime-db/HISTORY.md
./packages/reasonex-n8n-nodes/node_modules/yargs-parser/README.md
./packages/reasonex-n8n-nodes/node_modules/yargs-parser/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/sax/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/sax/README.md
./packages/reasonex-n8n-nodes/node_modules/is-buffer/README.md
./packages/reasonex-n8n-nodes/node_modules/uuid/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/uuid/CONTRIBUTING.md
./packages/reasonex-n8n-nodes/node_modules/uuid/README.md
./packages/reasonex-n8n-nodes/node_modules/uuid/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/semver/README.md
./packages/reasonex-n8n-nodes/node_modules/@eslint/js/README.md
./packages/reasonex-n8n-nodes/node_modules/@eslint/eslintrc/node_modules/minimatch/README.md
./packages/reasonex-n8n-nodes/node_modules/@eslint/eslintrc/node_modules/brace-expansion/README.md
./packages/reasonex-n8n-nodes/node_modules/@eslint/eslintrc/README.md
./packages/reasonex-n8n-nodes/node_modules/escape-string-regexp/readme.md
./packages/reasonex-n8n-nodes/node_modules/form-data/README.md
./packages/reasonex-n8n-nodes/node_modules/form-data/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/rimraf/README.md
./packages/reasonex-n8n-nodes/node_modules/rimraf/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/@ungap/structured-clone/README.md
./packages/reasonex-n8n-nodes/node_modules/util/README.md
./packages/reasonex-n8n-nodes/node_modules/debug/README.md
./packages/reasonex-n8n-nodes/node_modules/file-entry-cache/README.md
./packages/reasonex-n8n-nodes/node_modules/file-entry-cache/changelog.md
./packages/reasonex-n8n-nodes/node_modules/fast-deep-equal/README.md
./packages/reasonex-n8n-nodes/node_modules/dir-glob/readme.md
./packages/reasonex-n8n-nodes/node_modules/transliteration/node_modules/yargs-parser/README.md
./packages/reasonex-n8n-nodes/node_modules/transliteration/node_modules/yargs-parser/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/transliteration/node_modules/yargs/README.md
./packages/reasonex-n8n-nodes/node_modules/transliteration/node_modules/cliui/README.md
./packages/reasonex-n8n-nodes/node_modules/transliteration/node_modules/cliui/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/transliteration/README.md
./packages/reasonex-n8n-nodes/node_modules/transliteration/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/js-yaml/README.md
./packages/reasonex-n8n-nodes/node_modules/esrecurse/README.md
./packages/reasonex-n8n-nodes/node_modules/punycode/README.md
./packages/reasonex-n8n-nodes/node_modules/delayed-stream/Readme.md
./packages/reasonex-n8n-nodes/node_modules/esprima-next/README.md
./packages/reasonex-n8n-nodes/node_modules/assert/README.md
./packages/reasonex-n8n-nodes/node_modules/ignore/README.md
./packages/reasonex-n8n-nodes/node_modules/noms/readme.md
./packages/reasonex-n8n-nodes/node_modules/to-regex-range/README.md
./packages/reasonex-n8n-nodes/node_modules/eslint-config-riot/README.md
./packages/reasonex-n8n-nodes/node_modules/p-locate/readme.md
./packages/reasonex-n8n-nodes/node_modules/jsonrepair/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/jsonrepair/README.md
./packages/reasonex-n8n-nodes/node_modules/ansi-styles/readme.md
./packages/reasonex-n8n-nodes/node_modules/braces/README.md
./packages/reasonex-n8n-nodes/node_modules/lodash.merge/README.md
./packages/reasonex-n8n-nodes/node_modules/fastq/README.md
./packages/reasonex-n8n-nodes/node_modules/fastq/SECURITY.md
./packages/reasonex-n8n-nodes/node_modules/inherits/README.md
./packages/reasonex-n8n-nodes/node_modules/undici-types/README.md
./packages/reasonex-n8n-nodes/node_modules/shebang-regex/readme.md
./packages/reasonex-n8n-nodes/node_modules/available-typed-arrays/README.md
./packages/reasonex-n8n-nodes/node_modules/available-typed-arrays/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/fast-levenshtein/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/fast-levenshtein/README.md
./packages/reasonex-n8n-nodes/node_modules/micromatch/README.md
./packages/reasonex-n8n-nodes/node_modules/esutils/README.md
./packages/reasonex-n8n-nodes/node_modules/flatted/README.md
./packages/reasonex-n8n-nodes/node_modules/is-glob/README.md
./packages/reasonex-n8n-nodes/node_modules/set-function-length/README.md
./packages/reasonex-n8n-nodes/node_modules/set-function-length/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/color-convert/README.md
./packages/reasonex-n8n-nodes/node_modules/color-convert/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/@nodelib/fs.walk/README.md
./packages/reasonex-n8n-nodes/node_modules/@nodelib/fs.scandir/README.md
./packages/reasonex-n8n-nodes/node_modules/@nodelib/fs.stat/README.md
./packages/reasonex-n8n-nodes/node_modules/string_decoder/README.md
./packages/reasonex-n8n-nodes/node_modules/slash/readme.md
./packages/reasonex-n8n-nodes/node_modules/define-properties/README.md
./packages/reasonex-n8n-nodes/node_modules/define-properties/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/get-caller-file/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/get-caller-file/README.md
./packages/reasonex-n8n-nodes/node_modules/eslint-visitor-keys/README.md
./packages/reasonex-n8n-nodes/node_modules/math-intrinsics/README.md
./packages/reasonex-n8n-nodes/node_modules/math-intrinsics/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/eslint/node_modules/minimatch/README.md
./packages/reasonex-n8n-nodes/node_modules/eslint/node_modules/brace-expansion/README.md
./packages/reasonex-n8n-nodes/node_modules/eslint/README.md
./packages/reasonex-n8n-nodes/node_modules/readable-stream/README.md
./packages/reasonex-n8n-nodes/node_modules/luxon/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/luxon/README.md
./packages/reasonex-n8n-nodes/node_modules/has-flag/readme.md
./packages/reasonex-n8n-nodes/node_modules/argparse/README.md
./packages/reasonex-n8n-nodes/node_modules/argparse/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/is-path-inside/readme.md
./packages/reasonex-n8n-nodes/node_modules/proxy-from-env/README.md
./packages/reasonex-n8n-nodes/node_modules/yocto-queue/readme.md
./packages/reasonex-n8n-nodes/node_modules/object-keys/README.md
./packages/reasonex-n8n-nodes/node_modules/object-keys/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/is-extglob/README.md
./packages/reasonex-n8n-nodes/node_modules/jmespath/README.md
./packages/reasonex-n8n-nodes/node_modules/imurmurhash/README.md
./packages/reasonex-n8n-nodes/node_modules/callsites/readme.md
./packages/reasonex-n8n-nodes/node_modules/fast-json-stable-stringify/README.md
./packages/reasonex-n8n-nodes/node_modules/glob/node_modules/minimatch/README.md
./packages/reasonex-n8n-nodes/node_modules/glob/node_modules/brace-expansion/README.md
./packages/reasonex-n8n-nodes/node_modules/glob/README.md
./packages/reasonex-n8n-nodes/node_modules/ms/license.md
./packages/reasonex-n8n-nodes/node_modules/ms/readme.md
./packages/reasonex-n8n-nodes/node_modules/glob-parent/README.md
./packages/reasonex-n8n-nodes/node_modules/natural-compare/README.md
./packages/reasonex-n8n-nodes/node_modules/is-nan/README.md
./packages/reasonex-n8n-nodes/node_modules/is-nan/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/generator-function/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/generator-function/README.md
./packages/reasonex-n8n-nodes/node_modules/generator-function/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/cross-spawn/README.md
./packages/reasonex-n8n-nodes/node_modules/keyv/README.md
./packages/reasonex-n8n-nodes/node_modules/strip-ansi/readme.md
./packages/reasonex-n8n-nodes/node_modules/follow-redirects/README.md
./packages/reasonex-n8n-nodes/node_modules/es-define-property/README.md
./packages/reasonex-n8n-nodes/node_modules/es-define-property/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/source-map/README.md
./packages/reasonex-n8n-nodes/node_modules/source-map/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/parent-module/readme.md
./packages/reasonex-n8n-nodes/node_modules/queue-microtask/README.md
./packages/reasonex-n8n-nodes/node_modules/for-each/README.md
./packages/reasonex-n8n-nodes/node_modules/for-each/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/for-each/.github/SECURITY.md
./packages/reasonex-n8n-nodes/node_modules/ajv/lib/dotjs/README.md
./packages/reasonex-n8n-nodes/node_modules/ajv/README.md
./packages/reasonex-n8n-nodes/node_modules/prelude-ls/README.md
./packages/reasonex-n8n-nodes/node_modules/prelude-ls/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/is-arguments/README.md
./packages/reasonex-n8n-nodes/node_modules/is-arguments/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/has-tostringtag/README.md
./packages/reasonex-n8n-nodes/node_modules/has-tostringtag/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/color-name/README.md
./packages/reasonex-n8n-nodes/node_modules/copyfiles/license.md
./packages/reasonex-n8n-nodes/node_modules/copyfiles/readme.md
./packages/reasonex-n8n-nodes/node_modules/copyfiles/node_modules/minimatch/README.md
./packages/reasonex-n8n-nodes/node_modules/copyfiles/node_modules/brace-expansion/README.md
./packages/reasonex-n8n-nodes/node_modules/path-exists/readme.md
./packages/reasonex-n8n-nodes/node_modules/safe-regex-test/README.md
./packages/reasonex-n8n-nodes/node_modules/safe-regex-test/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/p-limit/readme.md
./packages/reasonex-n8n-nodes/node_modules/wrap-ansi/readme.md
./packages/reasonex-n8n-nodes/node_modules/run-parallel/README.md
./packages/reasonex-n8n-nodes/node_modules/import-fresh/readme.md
./packages/reasonex-n8n-nodes/node_modules/balanced-match/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/balanced-match/README.md
./packages/reasonex-n8n-nodes/node_modules/path-is-absolute/readme.md
./packages/reasonex-n8n-nodes/node_modules/xml2js/README.md
./packages/reasonex-n8n-nodes/node_modules/is-number/README.md
./packages/reasonex-n8n-nodes/node_modules/combined-stream/Readme.md
./packages/reasonex-n8n-nodes/node_modules/call-bound/README.md
./packages/reasonex-n8n-nodes/node_modules/call-bound/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/tslib/README.md
./packages/reasonex-n8n-nodes/node_modules/tslib/SECURITY.md
./packages/reasonex-n8n-nodes/node_modules/string-width/readme.md
./packages/reasonex-n8n-nodes/node_modules/is-generator-function/README.md
./packages/reasonex-n8n-nodes/node_modules/is-generator-function/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/estraverse/README.md
./packages/reasonex-n8n-nodes/node_modules/which-typed-array/README.md
./packages/reasonex-n8n-nodes/node_modules/which-typed-array/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/wrappy/README.md
./packages/reasonex-n8n-nodes/node_modules/reusify/README.md
./packages/reasonex-n8n-nodes/node_modules/reusify/SECURITY.md
./packages/reasonex-n8n-nodes/node_modules/process-nextick-args/license.md
./packages/reasonex-n8n-nodes/node_modules/process-nextick-args/readme.md
./packages/reasonex-n8n-nodes/node_modules/fs.realpath/README.md
./packages/reasonex-n8n-nodes/node_modules/doctrine/README.md
./packages/reasonex-n8n-nodes/node_modules/doctrine/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/ansi-regex/readme.md
./packages/reasonex-n8n-nodes/node_modules/lodash/release.md
./packages/reasonex-n8n-nodes/node_modules/lodash/README.md
./packages/reasonex-n8n-nodes/node_modules/levn/README.md
./packages/reasonex-n8n-nodes/node_modules/es-errors/README.md
./packages/reasonex-n8n-nodes/node_modules/es-errors/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/isarray/README.md
./packages/reasonex-n8n-nodes/node_modules/type-fest/readme.md
./packages/reasonex-n8n-nodes/node_modules/yargs/README.md
./packages/reasonex-n8n-nodes/node_modules/yargs/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/inflight/README.md
./packages/reasonex-n8n-nodes/node_modules/array-union/readme.md
./packages/reasonex-n8n-nodes/node_modules/brace-expansion/README.md
./packages/reasonex-n8n-nodes/node_modules/isexe/README.md
./packages/reasonex-n8n-nodes/node_modules/define-data-property/README.md
./packages/reasonex-n8n-nodes/node_modules/define-data-property/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/cliui/README.md
./packages/reasonex-n8n-nodes/node_modules/cliui/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/picomatch/README.md
./packages/reasonex-n8n-nodes/node_modules/picomatch/CHANGELOG.md
./packages/reasonex-n8n-nodes/node_modules/type-check/README.md
./packages/reasonex-n8n-nodes/node_modules/locate-path/readme.md
./packages/reasonex-n8n-nodes/node_modules/through2/LICENSE.md
./packages/reasonex-n8n-nodes/node_modules/through2/node_modules/string_decoder/README.md
./packages/reasonex-n8n-nodes/node_modules/through2/node_modules/readable-stream/doc/wg-meetings/2015-01-30.md
./packages/reasonex-n8n-nodes/node_modules/through2/node_modules/readable-stream/CONTRIBUTING.md
./packages/reasonex-n8n-nodes/node_modules/through2/node_modules/readable-stream/GOVERNANCE.md
./packages/reasonex-n8n-nodes/node_modules/through2/node_modules/readable-stream/README.md
./packages/reasonex-n8n-nodes/node_modules/through2/node_modules/isarray/README.md
./packages/reasonex-n8n-nodes/node_modules/through2/README.md
./packages/reasonex-core-api/node_modules/type-detect/README.md
./packages/reasonex-core-api/node_modules/asynckit/README.md
./packages/reasonex-core-api/node_modules/accepts/node_modules/negotiator/README.md
./packages/reasonex-core-api/node_modules/accepts/node_modules/negotiator/HISTORY.md
./packages/reasonex-core-api/node_modules/accepts/README.md
./packages/reasonex-core-api/node_modules/accepts/HISTORY.md
./packages/reasonex-core-api/node_modules/safe-buffer/README.md
./packages/reasonex-core-api/node_modules/kleur/readme.md
./packages/reasonex-core-api/node_modules/sisteransi/readme.md
./packages/reasonex-core-api/node_modules/cookie-signature/Readme.md
./packages/reasonex-core-api/node_modules/cookie-signature/History.md
./packages/reasonex-core-api/node_modules/side-channel-map/README.md
./packages/reasonex-core-api/node_modules/side-channel-map/CHANGELOG.md
./packages/reasonex-core-api/node_modules/esprima/README.md
./packages/reasonex-core-api/node_modules/supports-preserve-symlinks-flag/README.md
./packages/reasonex-core-api/node_modules/supports-preserve-symlinks-flag/CHANGELOG.md
./packages/reasonex-core-api/node_modules/on-headers/README.md
./packages/reasonex-core-api/node_modules/on-headers/HISTORY.md
./packages/reasonex-core-api/node_modules/es-object-atoms/README.md
./packages/reasonex-core-api/node_modules/es-object-atoms/CHANGELOG.md
./packages/reasonex-core-api/node_modules/human-signals/README.md
./packages/reasonex-core-api/node_modules/human-signals/CHANGELOG.md
./packages/reasonex-core-api/node_modules/gopd/README.md
./packages/reasonex-core-api/node_modules/gopd/CHANGELOG.md
./packages/reasonex-core-api/node_modules/fill-range/README.md
./packages/reasonex-core-api/node_modules/parse-json/readme.md
./packages/reasonex-core-api/node_modules/fn.name/README.md
./packages/reasonex-core-api/node_modules/mime-types/node_modules/mime-db/README.md
./packages/reasonex-core-api/node_modules/mime-types/node_modules/mime-db/HISTORY.md
./packages/reasonex-core-api/node_modules/mime-types/README.md
./packages/reasonex-core-api/node_modules/mime-types/HISTORY.md
./packages/reasonex-core-api/node_modules/mkdirp/CHANGELOG.md
./packages/reasonex-core-api/node_modules/electron-to-chromium/README.md
./packages/reasonex-core-api/node_modules/stack-trace/Readme.md
./packages/reasonex-core-api/node_modules/json-schema-traverse/README.md
./packages/reasonex-core-api/node_modules/minimatch/README.md
./packages/reasonex-core-api/node_modules/eslint-scope/README.md
./packages/reasonex-core-api/node_modules/fast-glob/node_modules/glob-parent/README.md
./packages/reasonex-core-api/node_modules/fast-glob/node_modules/glob-parent/CHANGELOG.md
./packages/reasonex-core-api/node_modules/fast-glob/README.md
./packages/reasonex-core-api/node_modules/has-symbols/README.md
./packages/reasonex-core-api/node_modules/has-symbols/CHANGELOG.md
./packages/reasonex-core-api/node_modules/path-parse/README.md
./packages/reasonex-core-api/node_modules/acorn/README.md
./packages/reasonex-core-api/node_modules/acorn/CHANGELOG.md
./packages/reasonex-core-api/node_modules/supports-color/readme.md
./packages/reasonex-core-api/node_modules/esquery/README.md
./packages/reasonex-core-api/node_modules/stack-utils/readme.md
./packages/reasonex-core-api/node_modules/stack-utils/LICENSE.md
./packages/reasonex-core-api/node_modules/stack-utils/node_modules/escape-string-regexp/readme.md
./packages/reasonex-core-api/node_modules/lodash.memoize/README.md
./packages/reasonex-core-api/node_modules/merge2/README.md
./packages/reasonex-core-api/node_modules/bytes/Readme.md
./packages/reasonex-core-api/node_modules/bytes/History.md
./packages/reasonex-core-api/node_modules/@humanwhocodes/object-schema/README.md
./packages/reasonex-core-api/node_modules/@humanwhocodes/object-schema/CHANGELOG.md
./packages/reasonex-core-api/node_modules/@humanwhocodes/config-array/node_modules/minimatch/README.md
./packages/reasonex-core-api/node_modules/@humanwhocodes/config-array/node_modules/brace-expansion/README.md
./packages/reasonex-core-api/node_modules/@humanwhocodes/config-array/README.md
./packages/reasonex-core-api/node_modules/@humanwhocodes/module-importer/README.md
./packages/reasonex-core-api/node_modules/@humanwhocodes/module-importer/CHANGELOG.md
./packages/reasonex-core-api/node_modules/picocolors/README.md
./packages/reasonex-core-api/node_modules/function-bind/README.md
./packages/reasonex-core-api/node_modules/function-bind/CHANGELOG.md
./packages/reasonex-core-api/node_modules/function-bind/.github/SECURITY.md
./packages/reasonex-core-api/node_modules/espree/README.md
./packages/reasonex-core-api/node_modules/winston/README.md
./packages/reasonex-core-api/node_modules/string-length/readme.md
./packages/reasonex-core-api/node_modules/anymatch/README.md
./packages/reasonex-core-api/node_modules/call-bind-apply-helpers/README.md
./packages/reasonex-core-api/node_modules/call-bind-apply-helpers/CHANGELOG.md
./packages/reasonex-core-api/node_modules/color/node_modules/color-convert/README.md
./packages/reasonex-core-api/node_modules/color/node_modules/color-name/README.md
./packages/reasonex-core-api/node_modules/color/README.md
./packages/reasonex-core-api/node_modules/flat-cache/README.md
./packages/reasonex-core-api/node_modules/flat-cache/changelog.md
./packages/reasonex-core-api/node_modules/make-error/README.md
./packages/reasonex-core-api/node_modules/emoji-regex/README.md
./packages/reasonex-core-api/node_modules/shebang-command/readme.md
./packages/reasonex-core-api/node_modules/uglify-js/README.md
./packages/reasonex-core-api/node_modules/@so-ric/colorspace/LICENSE.md
./packages/reasonex-core-api/node_modules/@so-ric/colorspace/README.md
./packages/reasonex-core-api/node_modules/@so-ric/colorspace/CHANGELOG.md
./packages/reasonex-core-api/node_modules/globals/readme.md
./packages/reasonex-core-api/node_modules/istanbul-lib-source-maps/README.md
./packages/reasonex-core-api/node_modules/istanbul-lib-source-maps/CHANGELOG.md
./packages/reasonex-core-api/node_modules/word-wrap/README.md
./packages/reasonex-core-api/node_modules/proxy-addr/README.md
./packages/reasonex-core-api/node_modules/proxy-addr/HISTORY.md
./packages/reasonex-core-api/node_modules/compression/node_modules/debug/README.md
./packages/reasonex-core-api/node_modules/compression/node_modules/debug/CHANGELOG.md
./packages/reasonex-core-api/node_modules/compression/node_modules/ms/license.md
./packages/reasonex-core-api/node_modules/compression/node_modules/ms/readme.md
./packages/reasonex-core-api/node_modules/compression/README.md
./packages/reasonex-core-api/node_modules/compression/HISTORY.md
./packages/reasonex-core-api/node_modules/get-proto/README.md
./packages/reasonex-core-api/node_modules/get-proto/CHANGELOG.md
./packages/reasonex-core-api/node_modules/chalk/readme.md
./packages/reasonex-core-api/node_modules/pirates/README.md
./packages/reasonex-core-api/node_modules/find-up/readme.md
./packages/reasonex-core-api/node_modules/co/Readme.md
./packages/reasonex-core-api/node_modules/co/History.md
./packages/reasonex-core-api/node_modules/create-jest/README.md
./packages/reasonex-core-api/node_modules/strip-json-comments/readme.md
./packages/reasonex-core-api/node_modules/escape-html/Readme.md
./packages/reasonex-core-api/node_modules/acorn-jsx/README.md
./packages/reasonex-core-api/node_modules/xtend/README.md
./packages/reasonex-core-api/node_modules/tsconfig/node_modules/strip-json-comments/readme.md
./packages/reasonex-core-api/node_modules/tsconfig/node_modules/strip-bom/readme.md
./packages/reasonex-core-api/node_modules/tsconfig/README.md
./packages/reasonex-core-api/node_modules/p-try/readme.md
./packages/reasonex-core-api/node_modules/express/Readme.md
./packages/reasonex-core-api/node_modules/express/node_modules/debug/README.md
./packages/reasonex-core-api/node_modules/express/node_modules/debug/CHANGELOG.md
./packages/reasonex-core-api/node_modules/express/node_modules/ms/license.md
./packages/reasonex-core-api/node_modules/express/node_modules/ms/readme.md
./packages/reasonex-core-api/node_modules/express/History.md
./packages/reasonex-core-api/node_modules/neo-async/README.md
./packages/reasonex-core-api/node_modules/destroy/README.md
./packages/reasonex-core-api/node_modules/@eslint-community/eslint-utils/README.md
./packages/reasonex-core-api/node_modules/@eslint-community/regexpp/README.md
./packages/reasonex-core-api/node_modules/content-disposition/README.md
./packages/reasonex-core-api/node_modules/content-disposition/HISTORY.md
./packages/reasonex-core-api/node_modules/globby/readme.md
./packages/reasonex-core-api/node_modules/strip-bom/readme.md
./packages/reasonex-core-api/node_modules/async/README.md
./packages/reasonex-core-api/node_modules/async/CHANGELOG.md
./packages/reasonex-core-api/node_modules/es-set-tostringtag/README.md
./packages/reasonex-core-api/node_modules/es-set-tostringtag/CHANGELOG.md
./packages/reasonex-core-api/node_modules/resolve-from/readme.md
./packages/reasonex-core-api/node_modules/dunder-proto/README.md
./packages/reasonex-core-api/node_modules/dunder-proto/CHANGELOG.md
./packages/reasonex-core-api/node_modules/graphemer/README.md
./packages/reasonex-core-api/node_modules/graphemer/CHANGELOG.md
./packages/reasonex-core-api/node_modules/util-deprecate/History.md
./packages/reasonex-core-api/node_modules/util-deprecate/README.md
./packages/reasonex-core-api/node_modules/json-buffer/README.md
./packages/reasonex-core-api/node_modules/type-is/README.md
./packages/reasonex-core-api/node_modules/type-is/HISTORY.md
./packages/reasonex-core-api/node_modules/cjs-module-lexer/README.md
./packages/reasonex-core-api/node_modules/web-streams-polyfill/README.md
./packages/reasonex-core-api/node_modules/helmet/README.md
./packages/reasonex-core-api/node_modules/helmet/SECURITY.md
./packages/reasonex-core-api/node_modules/helmet/CHANGELOG.md
./packages/reasonex-core-api/node_modules/typescript/README.md
./packages/reasonex-core-api/node_modules/typescript/SECURITY.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/type-utils/README.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/types/README.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/typescript-estree/README.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/utils/README.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/parser/README.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/scope-manager/README.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/README.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-call.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-type-assertion.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/strict-boolean-expressions.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/space-before-blocks.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-floating-promises.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-duplicate-enum-values.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-readonly.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-loop-func.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/type-annotation-spacing.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-includes.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-type-exports.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-base-to-string.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/class-literal-property-style.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-argument.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-namespace-keyword.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-non-null-asserted-nullish-coalescing.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unused-vars.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-useless-template-literals.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-type-alias.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/adjacent-overload-signatures.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/return-await.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/ban-ts-comment.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-explicit-any.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/ban-tslint-comment.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-non-null-asserted-optional-chain.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-loss-of-precision.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/func-call-spacing.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/key-spacing.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/quotes.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-type-constraint.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/dot-notation.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/default-param-last.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/object-curly-spacing.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-enum-comparison.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/comma-spacing.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-shadow.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-condition.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-optional-chain.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/parameter-properties.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/indent.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/comma-dangle.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-namespace.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-magic-numbers.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-redundant-type-constituents.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-confusing-non-null-assertion.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-type-assertions.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/max-params.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/restrict-plus-operands.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/promise-function-async.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-var-requires.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/keyword-spacing.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-duplicate-type-constituents.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/unified-signatures.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-for-in-array.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-as-const.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-string-starts-ends-with.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/method-signature-style.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-array-delete.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-empty-interface.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-confusing-void-expression.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/triple-slash-reference.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-regexp-exec.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/naming-convention.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-ts-expect-error.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/space-before-function-paren.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-type-arguments.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-type-definitions.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-misused-promises.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-extraneous-class.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-nullish-coalescing.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-dupe-class-members.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-find.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-generic-constructors.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-meaningless-void-operator.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-this-alias.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/explicit-member-accessibility.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/ban-types.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-invalid-this.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-invalid-void-type.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-unary-minus.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/README.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/restrict-template-expressions.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-qualifier.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-return-this-type.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-import-type-side-effects.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/array-type.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-indexed-object-style.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-useless-constructor.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-useless-empty-export.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/switch-exhaustiveness-check.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-dynamic-delete.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-for-of.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-assignment.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-require-imports.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/member-ordering.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-inferrable-types.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unnecessary-boolean-literal-compare.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-type-imports.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-readonly-parameter-types.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-misused-new.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-extra-semi.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-enum-initializers.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/TEMPLATE.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/require-array-sort-compare.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/lines-around-comment.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-empty-function.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/require-await.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-use-before-define.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-redeclare.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/lines-between-class-members.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/unbound-method.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-literal-enum-member.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/brace-style.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-mixed-enums.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-extra-parens.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/member-delimiter-style.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unused-expressions.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-non-null-assertion.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-duplicate-imports.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-member-access.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/explicit-function-return-type.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/semi.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-implied-eval.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/padding-line-between-statements.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-function-type.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-throw-literal.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-promise-reject-errors.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/space-infix-ops.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-return.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-parameter-properties.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-array-constructor.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/init-declarations.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-unsafe-declaration-merging.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/await-thenable.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-destructuring.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/explicit-module-boundary-types.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-extra-non-null-assertion.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/non-nullable-type-assertion-style.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/prefer-reduce-type-parameter.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/typedef.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/camelcase.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/sort-type-constituents.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/block-spacing.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/no-restricted-imports.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/eslint-plugin/docs/rules/class-methods-use-this.md
./packages/reasonex-core-api/node_modules/@typescript-eslint/visitor-keys/README.md
./packages/reasonex-core-api/node_modules/get-package-type/README.md
./packages/reasonex-core-api/node_modules/get-package-type/CHANGELOG.md
./packages/reasonex-core-api/node_modules/execa/readme.md
./packages/reasonex-core-api/node_modules/path-key/readme.md
./packages/reasonex-core-api/node_modules/is-core-module/README.md
./packages/reasonex-core-api/node_modules/is-core-module/CHANGELOG.md
./packages/reasonex-core-api/node_modules/collect-v8-coverage/README.md
./packages/reasonex-core-api/node_modules/collect-v8-coverage/CHANGELOG.md
./packages/reasonex-core-api/node_modules/ts-node-dev/node_modules/rimraf/README.md
./packages/reasonex-core-api/node_modules/ts-node-dev/README.md
./packages/reasonex-core-api/node_modules/enabled/README.md
./packages/reasonex-core-api/node_modules/import-local/readme.md
./packages/reasonex-core-api/node_modules/@types/babel__template/README.md
./packages/reasonex-core-api/node_modules/@types/stack-utils/README.md
./packages/reasonex-core-api/node_modules/@types/compression/README.md
./packages/reasonex-core-api/node_modules/@types/strip-json-comments/README.md
./packages/reasonex-core-api/node_modules/@types/express/README.md
./packages/reasonex-core-api/node_modules/@types/strip-bom/README.md
./packages/reasonex-core-api/node_modules/@types/connect/README.md
./packages/reasonex-core-api/node_modules/@types/qs/README.md
./packages/reasonex-core-api/node_modules/@types/babel__traverse/README.md
./packages/reasonex-core-api/node_modules/@types/express-serve-static-core/README.md
./packages/reasonex-core-api/node_modules/@types/yargs-parser/README.md
./packages/reasonex-core-api/node_modules/@types/uuid/README.md
./packages/reasonex-core-api/node_modules/@types/http-errors/README.md
./packages/reasonex-core-api/node_modules/@types/semver/README.md
./packages/reasonex-core-api/node_modules/@types/istanbul-reports/README.md
./packages/reasonex-core-api/node_modules/@types/body-parser/README.md
./packages/reasonex-core-api/node_modules/@types/triple-beam/README.md
./packages/reasonex-core-api/node_modules/@types/graceful-fs/README.md
./packages/reasonex-core-api/node_modules/@types/crypto-js/README.md
./packages/reasonex-core-api/node_modules/@types/cors/README.md
./packages/reasonex-core-api/node_modules/@types/serve-static/node_modules/@types/send/README.md
./packages/reasonex-core-api/node_modules/@types/serve-static/README.md
./packages/reasonex-core-api/node_modules/@types/babel__core/README.md
./packages/reasonex-core-api/node_modules/@types/json-schema/README.md
./packages/reasonex-core-api/node_modules/@types/jest/README.md
./packages/reasonex-core-api/node_modules/@types/range-parser/README.md
./packages/reasonex-core-api/node_modules/@types/deep-diff/README.md
./packages/reasonex-core-api/node_modules/@types/istanbul-lib-coverage/README.md
./packages/reasonex-core-api/node_modules/@types/node/README.md
./packages/reasonex-core-api/node_modules/@types/istanbul-lib-report/README.md
./packages/reasonex-core-api/node_modules/@types/node-fetch/README.md
./packages/reasonex-core-api/node_modules/@types/yargs/README.md
./packages/reasonex-core-api/node_modules/@types/send/README.md
./packages/reasonex-core-api/node_modules/@types/babel__generator/README.md
./packages/reasonex-core-api/node_modules/@types/mime/README.md
./packages/reasonex-core-api/node_modules/optionator/README.md
./packages/reasonex-core-api/node_modules/optionator/CHANGELOG.md
./packages/reasonex-core-api/node_modules/which/README.md
./packages/reasonex-core-api/node_modules/which/CHANGELOG.md
./packages/reasonex-core-api/node_modules/char-regex/README.md
./packages/reasonex-core-api/node_modules/hasown/README.md
./packages/reasonex-core-api/node_modules/hasown/CHANGELOG.md
./packages/reasonex-core-api/node_modules/node-releases/README.md
./packages/reasonex-core-api/node_modules/@jridgewell/resolve-uri/README.md
./packages/reasonex-core-api/node_modules/@jridgewell/remapping/README.md
./packages/reasonex-core-api/node_modules/@jridgewell/gen-mapping/README.md
./packages/reasonex-core-api/node_modules/@jridgewell/trace-mapping/README.md
./packages/reasonex-core-api/node_modules/@jridgewell/sourcemap-codec/README.md
./packages/reasonex-core-api/node_modules/qs/LICENSE.md
./packages/reasonex-core-api/node_modules/qs/README.md
./packages/reasonex-core-api/node_modules/qs/CHANGELOG.md
./packages/reasonex-core-api/node_modules/qs/.github/THREAT_MODEL.md
./packages/reasonex-core-api/node_modules/qs/.github/SECURITY.md
./packages/reasonex-core-api/node_modules/once/README.md
./packages/reasonex-core-api/node_modules/is-fullwidth-code-point/readme.md
./packages/reasonex-core-api/node_modules/ts-api-utils/LICENSE.md
./packages/reasonex-core-api/node_modules/ts-api-utils/README.md
./packages/reasonex-core-api/node_modules/dynamic-dedupe/README.md
./packages/reasonex-core-api/node_modules/resolve.exports/readme.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/find-up/readme.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/resolve-from/readme.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml/README.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/p-locate/readme.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/argparse/README.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/argparse/CHANGELOG.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/p-limit/readme.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/node_modules/locate-path/readme.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/README.md
./packages/reasonex-core-api/node_modules/@istanbuljs/load-nyc-config/CHANGELOG.md
./packages/reasonex-core-api/node_modules/@istanbuljs/schema/README.md
./packages/reasonex-core-api/node_modules/@istanbuljs/schema/CHANGELOG.md
./packages/reasonex-core-api/node_modules/path-type/readme.md
./packages/reasonex-core-api/node_modules/get-intrinsic/README.md
./packages/reasonex-core-api/node_modules/get-intrinsic/CHANGELOG.md
./packages/reasonex-core-api/node_modules/expect/README.md
./packages/reasonex-core-api/node_modules/uri-js/README.md
./packages/reasonex-core-api/node_modules/fb-watchman/README.md
./packages/reasonex-core-api/node_modules/source-map-support/LICENSE.md
./packages/reasonex-core-api/node_modules/source-map-support/README.md
./packages/reasonex-core-api/node_modules/emittery/readme.md
./packages/reasonex-core-api/node_modules/create-require/README.md
./packages/reasonex-core-api/node_modules/create-require/CHANGELOG.md
./packages/reasonex-core-api/node_modules/caniuse-lite/README.md
./packages/reasonex-core-api/node_modules/buffer-from/readme.md
./packages/reasonex-core-api/node_modules/escalade/readme.md
./packages/reasonex-core-api/node_modules/y18n/README.md
./packages/reasonex-core-api/node_modules/y18n/CHANGELOG.md
./packages/reasonex-core-api/node_modules/jest-matcher-utils/README.md
./packages/reasonex-core-api/node_modules/ci-info/README.md
./packages/reasonex-core-api/node_modules/ci-info/CHANGELOG.md
./packages/reasonex-core-api/node_modules/dedent/LICENSE.md
./packages/reasonex-core-api/node_modules/dedent/README.md
./packages/reasonex-core-api/node_modules/fecha/README.md
./packages/reasonex-core-api/node_modules/mime-db/README.md
./packages/reasonex-core-api/node_modules/mime-db/HISTORY.md
./packages/reasonex-core-api/node_modules/jest-cli/README.md
./packages/reasonex-core-api/node_modules/yargs-parser/README.md
./packages/reasonex-core-api/node_modules/yargs-parser/CHANGELOG.md
./packages/reasonex-core-api/node_modules/jest-leak-detector/README.md
./packages/reasonex-core-api/node_modules/jest-diff/README.md
./packages/reasonex-core-api/node_modules/uuid/LICENSE.md
./packages/reasonex-core-api/node_modules/uuid/CONTRIBUTING.md
./packages/reasonex-core-api/node_modules/uuid/README.md
./packages/reasonex-core-api/node_modules/uuid/CHANGELOG.md
./packages/reasonex-core-api/node_modules/http-errors/README.md
./packages/reasonex-core-api/node_modules/http-errors/HISTORY.md
./packages/reasonex-core-api/node_modules/v8-to-istanbul/README.md
./packages/reasonex-core-api/node_modules/v8-to-istanbul/CHANGELOG.md
./packages/reasonex-core-api/node_modules/walker/readme.md
./packages/reasonex-core-api/node_modules/semver/README.md
./packages/reasonex-core-api/node_modules/@eslint/js/README.md
./packages/reasonex-core-api/node_modules/@eslint/eslintrc/node_modules/json-schema-traverse/README.md
./packages/reasonex-core-api/node_modules/@eslint/eslintrc/node_modules/minimatch/README.md
./packages/reasonex-core-api/node_modules/@eslint/eslintrc/node_modules/ajv/lib/dotjs/README.md
./packages/reasonex-core-api/node_modules/@eslint/eslintrc/node_modules/ajv/README.md
./packages/reasonex-core-api/node_modules/@eslint/eslintrc/node_modules/brace-expansion/README.md
./packages/reasonex-core-api/node_modules/@eslint/eslintrc/README.md
./packages/reasonex-core-api/node_modules/escape-string-regexp/readme.md
./packages/reasonex-core-api/node_modules/form-data/README.md
./packages/reasonex-core-api/node_modules/form-data/CHANGELOG.md
./packages/reasonex-core-api/node_modules/convert-source-map/README.md
./packages/reasonex-core-api/node_modules/minimist/README.md
./packages/reasonex-core-api/node_modules/minimist/CHANGELOG.md
./packages/reasonex-core-api/node_modules/rimraf/README.md
./packages/reasonex-core-api/node_modules/rimraf/CHANGELOG.md
./packages/reasonex-core-api/node_modules/@ungap/structured-clone/README.md
./packages/reasonex-core-api/node_modules/normalize-path/README.md
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/LICENSE.md
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/LICENSE.md
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/README.md
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/dist/lib/CHANGELOG.md
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/README.md
./packages/reasonex-core-api/node_modules/@bcoe/v8-coverage/CHANGELOG.md
./packages/reasonex-core-api/node_modules/debug/README.md
./packages/reasonex-core-api/node_modules/file-entry-cache/README.md
./packages/reasonex-core-api/node_modules/file-entry-cache/changelog.md
./packages/reasonex-core-api/node_modules/jest-pnp-resolver/README.md
./packages/reasonex-core-api/node_modules/fast-deep-equal/README.md
./packages/reasonex-core-api/node_modules/statuses/README.md
./packages/reasonex-core-api/node_modules/statuses/HISTORY.md
./packages/reasonex-core-api/node_modules/exit/README.md
./packages/reasonex-core-api/node_modules/acorn-walk/README.md
./packages/reasonex-core-api/node_modules/acorn-walk/CHANGELOG.md
./packages/reasonex-core-api/node_modules/dir-glob/readme.md
./packages/reasonex-core-api/node_modules/side-channel-list/README.md
./packages/reasonex-core-api/node_modules/side-channel-list/CHANGELOG.md
./packages/reasonex-core-api/node_modules/lru-cache/README.md
./packages/reasonex-core-api/node_modules/istanbul-reports/README.md
./packages/reasonex-core-api/node_modules/istanbul-reports/CHANGELOG.md
./packages/reasonex-core-api/node_modules/forwarded/README.md
./packages/reasonex-core-api/node_modules/forwarded/HISTORY.md
./packages/reasonex-core-api/node_modules/js-yaml/README.md
./packages/reasonex-core-api/node_modules/ee-first/README.md
./packages/reasonex-core-api/node_modules/body-parser/node_modules/debug/README.md
./packages/reasonex-core-api/node_modules/body-parser/node_modules/debug/CHANGELOG.md
./packages/reasonex-core-api/node_modules/body-parser/node_modules/ms/license.md
./packages/reasonex-core-api/node_modules/body-parser/node_modules/ms/readme.md
./packages/reasonex-core-api/node_modules/body-parser/README.md
./packages/reasonex-core-api/node_modules/body-parser/HISTORY.md
./packages/reasonex-core-api/node_modules/esrecurse/README.md
./packages/reasonex-core-api/node_modules/resolve/SECURITY.md
./packages/reasonex-core-api/node_modules/resolve/.github/THREAT_MODEL.md
./packages/reasonex-core-api/node_modules/resolve/.github/INCIDENT_RESPONSE_PROCESS.md
./packages/reasonex-core-api/node_modules/content-type/README.md
./packages/reasonex-core-api/node_modules/content-type/HISTORY.md
./packages/reasonex-core-api/node_modules/detect-newline/readme.md
./packages/reasonex-core-api/node_modules/methods/README.md
./packages/reasonex-core-api/node_modules/methods/HISTORY.md
./packages/reasonex-core-api/node_modules/punycode/README.md
./packages/reasonex-core-api/node_modules/delayed-stream/Readme.md
./packages/reasonex-core-api/node_modules/logform/README.md
./packages/reasonex-core-api/node_modules/logform/CHANGELOG.md
./packages/reasonex-core-api/node_modules/ignore/README.md
./packages/reasonex-core-api/node_modules/is-arrayish/README.md
./packages/reasonex-core-api/node_modules/@jest/expect/README.md
./packages/reasonex-core-api/node_modules/@jest/types/README.md
./packages/reasonex-core-api/node_modules/@jest/schemas/README.md
./packages/reasonex-core-api/node_modules/@jest/core/README.md
./packages/reasonex-core-api/node_modules/@jest/expect-utils/README.md
./packages/reasonex-core-api/node_modules/pkg-dir/readme.md
./packages/reasonex-core-api/node_modules/pkg-dir/node_modules/find-up/readme.md
./packages/reasonex-core-api/node_modules/pkg-dir/node_modules/p-locate/readme.md
./packages/reasonex-core-api/node_modules/pkg-dir/node_modules/p-limit/readme.md
./packages/reasonex-core-api/node_modules/pkg-dir/node_modules/locate-path/readme.md
./packages/reasonex-core-api/node_modules/babel-preset-current-node-syntax/README.md
./packages/reasonex-core-api/node_modules/node-int64/README.md
./packages/reasonex-core-api/node_modules/to-regex-range/README.md
./packages/reasonex-core-api/node_modules/side-channel/README.md
./packages/reasonex-core-api/node_modules/side-channel/CHANGELOG.md
./packages/reasonex-core-api/node_modules/one-time/README.md
./packages/reasonex-core-api/node_modules/abort-controller/README.md
./packages/reasonex-core-api/node_modules/p-locate/readme.md
./packages/reasonex-core-api/node_modules/sprintf-js/README.md
./packages/reasonex-core-api/node_modules/ajv-formats/README.md
./packages/reasonex-core-api/node_modules/jest-docblock/README.md
./packages/reasonex-core-api/node_modules/ansi-styles/readme.md
./packages/reasonex-core-api/node_modules/camelcase/readme.md
./packages/reasonex-core-api/node_modules/compressible/README.md
./packages/reasonex-core-api/node_modules/compressible/HISTORY.md
./packages/reasonex-core-api/node_modules/braces/README.md
./packages/reasonex-core-api/node_modules/lodash.merge/README.md
./packages/reasonex-core-api/node_modules/fastq/README.md
./packages/reasonex-core-api/node_modules/fastq/SECURITY.md
./packages/reasonex-core-api/node_modules/inherits/README.md
./packages/reasonex-core-api/node_modules/browserslist/README.md
./packages/reasonex-core-api/node_modules/undici-types/README.md
./packages/reasonex-core-api/node_modules/jest-mock/README.md
./packages/reasonex-core-api/node_modules/jsesc/README.md
./packages/reasonex-core-api/node_modules/shebang-regex/readme.md
./packages/reasonex-core-api/node_modules/fast-levenshtein/LICENSE.md
./packages/reasonex-core-api/node_modules/fast-levenshtein/README.md
./packages/reasonex-core-api/node_modules/signal-exit/README.md
./packages/reasonex-core-api/node_modules/micromatch/README.md
./packages/reasonex-core-api/node_modules/make-dir/readme.md
./packages/reasonex-core-api/node_modules/esutils/README.md
./packages/reasonex-core-api/node_modules/triple-beam/README.md
./packages/reasonex-core-api/node_modules/triple-beam/CHANGELOG.md
./packages/reasonex-core-api/node_modules/jest-each/README.md
./packages/reasonex-core-api/node_modules/object-assign/readme.md
./packages/reasonex-core-api/node_modules/handlebars/release-notes.md
./packages/reasonex-core-api/node_modules/ts-node/dist-raw/NODE-LICENSE.md
./packages/reasonex-core-api/node_modules/ts-node/dist-raw/README.md
./packages/reasonex-core-api/node_modules/ts-node/README.md
./packages/reasonex-core-api/node_modules/flatted/README.md
./packages/reasonex-core-api/node_modules/yn/readme.md
./packages/reasonex-core-api/node_modules/is-glob/README.md
./packages/reasonex-core-api/node_modules/graceful-fs/README.md
./packages/reasonex-core-api/node_modules/crypto-js/CONTRIBUTING.md
./packages/reasonex-core-api/node_modules/crypto-js/README.md
./packages/reasonex-core-api/node_modules/@tsconfig/node10/README.md
./packages/reasonex-core-api/node_modules/@tsconfig/node16/README.md
./packages/reasonex-core-api/node_modules/@tsconfig/node12/README.md
./packages/reasonex-core-api/node_modules/@tsconfig/node14/README.md
./packages/reasonex-core-api/node_modules/color-convert/README.md
./packages/reasonex-core-api/node_modules/color-convert/CHANGELOG.md
./packages/reasonex-core-api/node_modules/@nodelib/fs.walk/README.md
./packages/reasonex-core-api/node_modules/@nodelib/fs.scandir/README.md
./packages/reasonex-core-api/node_modules/@nodelib/fs.stat/README.md
./packages/reasonex-core-api/node_modules/parseurl/README.md
./packages/reasonex-core-api/node_modules/parseurl/HISTORY.md
./packages/reasonex-core-api/node_modules/@dabh/diagnostics/README.md
./packages/reasonex-core-api/node_modules/@dabh/diagnostics/CHANGELOG.md
./packages/reasonex-core-api/node_modules/cors/CONTRIBUTING.md
./packages/reasonex-core-api/node_modules/cors/README.md
./packages/reasonex-core-api/node_modules/cors/HISTORY.md
./packages/reasonex-core-api/node_modules/string_decoder/README.md
./packages/reasonex-core-api/node_modules/slash/readme.md
./packages/reasonex-core-api/node_modules/lines-and-columns/README.md
./packages/reasonex-core-api/node_modules/ts-jest/LICENSE.md
./packages/reasonex-core-api/node_modules/ts-jest/node_modules/type-fest/readme.md
./packages/reasonex-core-api/node_modules/ts-jest/CONTRIBUTING.md
./packages/reasonex-core-api/node_modules/ts-jest/README.md
./packages/reasonex-core-api/node_modules/ts-jest/CHANGELOG.md
./packages/reasonex-core-api/node_modules/ts-jest/TROUBLESHOOTING.md
./packages/reasonex-core-api/node_modules/json-parse-even-better-errors/LICENSE.md
./packages/reasonex-core-api/node_modules/json-parse-even-better-errors/README.md
./packages/reasonex-core-api/node_modules/json-parse-even-better-errors/CHANGELOG.md
./packages/reasonex-core-api/node_modules/toidentifier/README.md
./packages/reasonex-core-api/node_modules/toidentifier/HISTORY.md
./packages/reasonex-core-api/node_modules/jest-validate/node_modules/camelcase/readme.md
./packages/reasonex-core-api/node_modules/jest-validate/README.md
./packages/reasonex-core-api/node_modules/get-caller-file/LICENSE.md
./packages/reasonex-core-api/node_modules/get-caller-file/README.md
./packages/reasonex-core-api/node_modules/html-escaper/README.md
./packages/reasonex-core-api/node_modules/event-target-shim/README.md
./packages/reasonex-core-api/node_modules/eslint-visitor-keys/README.md
./packages/reasonex-core-api/node_modules/babel-plugin-istanbul/node_modules/semver/README.md
./packages/reasonex-core-api/node_modules/babel-plugin-istanbul/node_modules/istanbul-lib-instrument/README.md
./packages/reasonex-core-api/node_modules/babel-plugin-istanbul/node_modules/istanbul-lib-instrument/CHANGELOG.md
./packages/reasonex-core-api/node_modules/babel-plugin-istanbul/README.md
./packages/reasonex-core-api/node_modules/babel-plugin-istanbul/CHANGELOG.md
./packages/reasonex-core-api/node_modules/math-intrinsics/README.md
./packages/reasonex-core-api/node_modules/math-intrinsics/CHANGELOG.md
./packages/reasonex-core-api/node_modules/eslint/node_modules/json-schema-traverse/README.md
./packages/reasonex-core-api/node_modules/eslint/node_modules/minimatch/README.md
./packages/reasonex-core-api/node_modules/eslint/node_modules/ajv/lib/dotjs/README.md
./packages/reasonex-core-api/node_modules/eslint/node_modules/ajv/README.md
./packages/reasonex-core-api/node_modules/eslint/node_modules/brace-expansion/README.md
./packages/reasonex-core-api/node_modules/eslint/README.md
./packages/reasonex-core-api/node_modules/test-exclude/node_modules/minimatch/README.md
./packages/reasonex-core-api/node_modules/test-exclude/node_modules/brace-expansion/README.md
./packages/reasonex-core-api/node_modules/test-exclude/README.md
./packages/reasonex-core-api/node_modules/test-exclude/CHANGELOG.md
./packages/reasonex-core-api/node_modules/serve-static/README.md
./packages/reasonex-core-api/node_modules/serve-static/HISTORY.md
./packages/reasonex-core-api/node_modules/readable-stream/CONTRIBUTING.md
./packages/reasonex-core-api/node_modules/readable-stream/GOVERNANCE.md
./packages/reasonex-core-api/node_modules/readable-stream/README.md
./packages/reasonex-core-api/node_modules/negotiator/README.md
./packages/reasonex-core-api/node_modules/negotiator/HISTORY.md
./packages/reasonex-core-api/node_modules/is-stream/readme.md
./packages/reasonex-core-api/node_modules/unpipe/README.md
./packages/reasonex-core-api/node_modules/unpipe/HISTORY.md
./packages/reasonex-core-api/node_modules/vary/README.md
./packages/reasonex-core-api/node_modules/vary/HISTORY.md
./packages/reasonex-core-api/node_modules/strip-final-newline/readme.md
./packages/reasonex-core-api/node_modules/node-domexception/.history/README_20210527213345.md
./packages/reasonex-core-api/node_modules/node-domexception/.history/README_20210527212714.md
./packages/reasonex-core-api/node_modules/node-domexception/.history/README_20210527203617.md
./packages/reasonex-core-api/node_modules/node-domexception/.history/README_20210527213803.md
./packages/reasonex-core-api/node_modules/node-domexception/.history/README_20210527213411.md
./packages/reasonex-core-api/node_modules/node-domexception/.history/README_20210527214323.md
./packages/reasonex-core-api/node_modules/node-domexception/.history/README_20210527214408.md
./packages/reasonex-core-api/node_modules/node-domexception/README.md
./packages/reasonex-core-api/node_modules/has-flag/readme.md
./packages/reasonex-core-api/node_modules/argparse/README.md
./packages/reasonex-core-api/node_modules/argparse/CHANGELOG.md
./packages/reasonex-core-api/node_modules/is-path-inside/readme.md
./packages/reasonex-core-api/node_modules/encodeurl/README.md
./packages/reasonex-core-api/node_modules/js-tokens/README.md
./packages/reasonex-core-api/node_modules/js-tokens/CHANGELOG.md
./packages/reasonex-core-api/node_modules/istanbul-lib-instrument/README.md
./packages/reasonex-core-api/node_modules/istanbul-lib-instrument/CHANGELOG.md
./packages/reasonex-core-api/node_modules/jest/README.md
./packages/reasonex-core-api/node_modules/merge-stream/README.md
./packages/reasonex-core-api/node_modules/babel-plugin-jest-hoist/README.md
./packages/reasonex-core-api/node_modules/yocto-queue/readme.md
./packages/reasonex-core-api/node_modules/is-extglob/README.md
./packages/reasonex-core-api/node_modules/finalhandler/node_modules/debug/README.md
./packages/reasonex-core-api/node_modules/finalhandler/node_modules/debug/CHANGELOG.md
./packages/reasonex-core-api/node_modules/finalhandler/node_modules/ms/license.md
./packages/reasonex-core-api/node_modules/finalhandler/node_modules/ms/readme.md
./packages/reasonex-core-api/node_modules/finalhandler/README.md
./packages/reasonex-core-api/node_modules/finalhandler/HISTORY.md
./packages/reasonex-core-api/node_modules/finalhandler/SECURITY.md
./packages/reasonex-core-api/node_modules/imurmurhash/README.md
./packages/reasonex-core-api/node_modules/bs-logger/README.md
./packages/reasonex-core-api/node_modules/bs-logger/CHANGELOG.md
./packages/reasonex-core-api/node_modules/mimic-fn/readme.md
./packages/reasonex-core-api/node_modules/callsites/readme.md
./packages/reasonex-core-api/node_modules/fast-json-stable-stringify/README.md
./packages/reasonex-core-api/node_modules/glob/node_modules/minimatch/README.md
./packages/reasonex-core-api/node_modules/glob/node_modules/brace-expansion/README.md
./packages/reasonex-core-api/node_modules/glob/README.md
./packages/reasonex-core-api/node_modules/makeerror/readme.md
./packages/reasonex-core-api/node_modules/array-flatten/README.md
./packages/reasonex-core-api/node_modules/setprototypeof/README.md
./packages/reasonex-core-api/node_modules/ms/license.md
./packages/reasonex-core-api/node_modules/ms/readme.md
./packages/reasonex-core-api/node_modules/glob-parent/README.md
./packages/reasonex-core-api/node_modules/side-channel-weakmap/README.md
./packages/reasonex-core-api/node_modules/side-channel-weakmap/CHANGELOG.md
./packages/reasonex-core-api/node_modules/natural-compare/README.md
./packages/reasonex-core-api/node_modules/cross-spawn/README.md
./packages/reasonex-core-api/node_modules/onetime/readme.md
./packages/reasonex-core-api/node_modules/keyv/README.md
./packages/reasonex-core-api/node_modules/binary-extensions/readme.md
./packages/reasonex-core-api/node_modules/range-parser/README.md
./packages/reasonex-core-api/node_modules/range-parser/HISTORY.md
./packages/reasonex-core-api/node_modules/strip-ansi/readme.md
./packages/reasonex-core-api/node_modules/text-hex/README.md
./packages/reasonex-core-api/node_modules/deep-diff/ChangeLog.md
./packages/reasonex-core-api/node_modules/deep-diff/Readme.md
./packages/reasonex-core-api/node_modules/es-define-property/README.md
./packages/reasonex-core-api/node_modules/es-define-property/CHANGELOG.md
./packages/reasonex-core-api/node_modules/is-generator-fn/readme.md
./packages/reasonex-core-api/node_modules/source-map/README.md
./packages/reasonex-core-api/node_modules/source-map/CHANGELOG.md
./packages/reasonex-core-api/node_modules/fast-uri/README.md
./packages/reasonex-core-api/node_modules/parent-module/readme.md
./packages/reasonex-core-api/node_modules/queue-microtask/README.md
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/LICENSE.md
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/node_modules/@jridgewell/trace-mapping/README.md
./packages/reasonex-core-api/node_modules/@cspotcode/source-map-support/README.md
./packages/reasonex-core-api/node_modules/ajv/README.md
./packages/reasonex-core-api/node_modules/prelude-ls/README.md
./packages/reasonex-core-api/node_modules/prelude-ls/CHANGELOG.md
./packages/reasonex-core-api/node_modules/has-tostringtag/README.md
./packages/reasonex-core-api/node_modules/has-tostringtag/CHANGELOG.md
./packages/reasonex-core-api/node_modules/color-name/README.md
./packages/reasonex-core-api/node_modules/agentkeepalive/README.md
./packages/reasonex-core-api/node_modules/istanbul-lib-coverage/README.md
./packages/reasonex-core-api/node_modules/istanbul-lib-coverage/CHANGELOG.md
./packages/reasonex-core-api/node_modules/dotenv/README-es.md
./packages/reasonex-core-api/node_modules/dotenv/README.md
./packages/reasonex-core-api/node_modules/dotenv/SECURITY.md
./packages/reasonex-core-api/node_modules/dotenv/CHANGELOG.md
./packages/reasonex-core-api/node_modules/path-exists/readme.md
./packages/reasonex-core-api/node_modules/babel-preset-jest/README.md
./packages/reasonex-core-api/node_modules/winston-transport/README.md
./packages/reasonex-core-api/node_modules/winston-transport/CHANGELOG.md
./packages/reasonex-core-api/node_modules/diff/release-notes.md
./packages/reasonex-core-api/node_modules/diff/CONTRIBUTING.md
./packages/reasonex-core-api/node_modules/diff/README.md
./packages/reasonex-core-api/node_modules/p-limit/readme.md
./packages/reasonex-core-api/node_modules/wrap-ansi/readme.md
./packages/reasonex-core-api/node_modules/run-parallel/README.md
./packages/reasonex-core-api/node_modules/humanize-ms/History.md
./packages/reasonex-core-api/node_modules/humanize-ms/README.md
./packages/reasonex-core-api/node_modules/kuler/README.md
./packages/reasonex-core-api/node_modules/on-finished/README.md
./packages/reasonex-core-api/node_modules/on-finished/HISTORY.md
./packages/reasonex-core-api/node_modules/babel-jest/README.md
./packages/reasonex-core-api/node_modules/formdata-node/readme.md
./packages/reasonex-core-api/node_modules/import-fresh/readme.md
./packages/reasonex-core-api/node_modules/balanced-match/LICENSE.md
./packages/reasonex-core-api/node_modules/balanced-match/README.md
./packages/reasonex-core-api/node_modules/safe-stable-stringify/readme.md
./packages/reasonex-core-api/node_modules/fresh/README.md
./packages/reasonex-core-api/node_modules/fresh/HISTORY.md
./packages/reasonex-core-api/node_modules/bser/README.md
./packages/reasonex-core-api/node_modules/path-is-absolute/readme.md
./packages/reasonex-core-api/node_modules/pure-rand/README.md
./packages/reasonex-core-api/node_modules/pure-rand/CHANGELOG.md
./packages/reasonex-core-api/node_modules/istanbul-lib-report/README.md
./packages/reasonex-core-api/node_modules/istanbul-lib-report/CHANGELOG.md
./packages/reasonex-core-api/node_modules/react-is/README.md
./packages/reasonex-core-api/node_modules/is-number/README.md
./packages/reasonex-core-api/node_modules/combined-stream/Readme.md
./packages/reasonex-core-api/node_modules/call-bound/README.md
./packages/reasonex-core-api/node_modules/call-bound/CHANGELOG.md
./packages/reasonex-core-api/node_modules/string-width/readme.md
./packages/reasonex-core-api/node_modules/webidl-conversions/LICENSE.md
./packages/reasonex-core-api/node_modules/webidl-conversions/README.md
./packages/reasonex-core-api/node_modules/diff-sequences/README.md
./packages/reasonex-core-api/node_modules/resolve-cwd/readme.md
./packages/reasonex-core-api/node_modules/resolve-cwd/node_modules/resolve-from/readme.md
./packages/reasonex-core-api/node_modules/cookie/README.md
./packages/reasonex-core-api/node_modules/cookie/SECURITY.md
./packages/reasonex-core-api/node_modules/prompts/readme.md
./packages/reasonex-core-api/node_modules/readdirp/README.md
./packages/reasonex-core-api/node_modules/@colors/colors/README.md
./packages/reasonex-core-api/node_modules/write-file-atomic/LICENSE.md
./packages/reasonex-core-api/node_modules/write-file-atomic/README.md
./packages/reasonex-core-api/node_modules/estraverse/README.md
./packages/reasonex-core-api/node_modules/@babel/traverse/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-bigint/README.md
./packages/reasonex-core-api/node_modules/@babel/generator/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-object-rest-spread/README.md
./packages/reasonex-core-api/node_modules/@babel/compat-data/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-class-static-block/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-typescript/README.md
./packages/reasonex-core-api/node_modules/@babel/helper-module-imports/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-jsx/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-top-level-await/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-import-meta/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-async-generators/README.md
./packages/reasonex-core-api/node_modules/@babel/helper-module-transforms/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-optional-chaining/README.md
./packages/reasonex-core-api/node_modules/@babel/helper-plugin-utils/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-private-property-in-object/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-nullish-coalescing-operator/README.md
./packages/reasonex-core-api/node_modules/@babel/types/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-class-properties/README.md
./packages/reasonex-core-api/node_modules/@babel/helper-validator-option/README.md
./packages/reasonex-core-api/node_modules/@babel/helper-globals/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-json-strings/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-numeric-separator/README.md
./packages/reasonex-core-api/node_modules/@babel/parser/README.md
./packages/reasonex-core-api/node_modules/@babel/parser/CHANGELOG.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-logical-assignment-operators/README.md
./packages/reasonex-core-api/node_modules/@babel/helper-validator-identifier/README.md
./packages/reasonex-core-api/node_modules/@babel/core/node_modules/semver/README.md
./packages/reasonex-core-api/node_modules/@babel/core/README.md
./packages/reasonex-core-api/node_modules/@babel/code-frame/README.md
./packages/reasonex-core-api/node_modules/@babel/template/README.md
./packages/reasonex-core-api/node_modules/@babel/helper-string-parser/README.md
./packages/reasonex-core-api/node_modules/@babel/helpers/README.md
./packages/reasonex-core-api/node_modules/@babel/helper-compilation-targets/node_modules/semver/README.md
./packages/reasonex-core-api/node_modules/@babel/helper-compilation-targets/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-import-attributes/README.md
./packages/reasonex-core-api/node_modules/@babel/plugin-syntax-optional-catch-binding/README.md
./packages/reasonex-core-api/node_modules/ipaddr.js/README.md
./packages/reasonex-core-api/node_modules/utils-merge/README.md
./packages/reasonex-core-api/node_modules/wrappy/README.md
./packages/reasonex-core-api/node_modules/tmpl/readme.md
./packages/reasonex-core-api/node_modules/jest-util/Readme.md
./packages/reasonex-core-api/node_modules/tree-kill/README.md
./packages/reasonex-core-api/node_modules/get-stream/readme.md
./packages/reasonex-core-api/node_modules/reusify/README.md
./packages/reasonex-core-api/node_modules/reusify/SECURITY.md
./packages/reasonex-core-api/node_modules/fs.realpath/README.md
./packages/reasonex-core-api/node_modules/merge-descriptors/README.md
./packages/reasonex-core-api/node_modules/merge-descriptors/HISTORY.md
./packages/reasonex-core-api/node_modules/depd/Readme.md
./packages/reasonex-core-api/node_modules/depd/History.md
./packages/reasonex-core-api/node_modules/chokidar/node_modules/glob-parent/README.md
./packages/reasonex-core-api/node_modules/chokidar/node_modules/glob-parent/CHANGELOG.md
./packages/reasonex-core-api/node_modules/chokidar/README.md
./packages/reasonex-core-api/node_modules/doctrine/README.md
./packages/reasonex-core-api/node_modules/doctrine/CHANGELOG.md
./packages/reasonex-core-api/node_modules/ansi-regex/readme.md
./packages/reasonex-core-api/node_modules/whatwg-url/README.md
./packages/reasonex-core-api/node_modules/media-typer/README.md
./packages/reasonex-core-api/node_modules/media-typer/HISTORY.md
./packages/reasonex-core-api/node_modules/object-inspect/CHANGELOG.md
./packages/reasonex-core-api/node_modules/gensync/README.md
./packages/reasonex-core-api/node_modules/baseline-browser-mapping/README.md
./packages/reasonex-core-api/node_modules/levn/README.md
./packages/reasonex-core-api/node_modules/error-ex/README.md
./packages/reasonex-core-api/node_modules/openai/_shims/README.md
./packages/reasonex-core-api/node_modules/openai/node_modules/@types/node/README.md
./packages/reasonex-core-api/node_modules/openai/node_modules/undici-types/README.md
./packages/reasonex-core-api/node_modules/openai/README.md
./packages/reasonex-core-api/node_modules/openai/CHANGELOG.md
./packages/reasonex-core-api/node_modules/openai/src/_vendor/zod-to-json-schema/README.md
./packages/reasonex-core-api/node_modules/openai/src/_vendor/partial-json-parser/README.md
./packages/reasonex-core-api/node_modules/openai/src/_shims/README.md
./packages/reasonex-core-api/node_modules/openai/src/internal/qs/LICENSE.md
./packages/reasonex-core-api/node_modules/openai/src/internal/qs/README.md
./packages/reasonex-core-api/node_modules/es-errors/README.md
./packages/reasonex-core-api/node_modules/es-errors/CHANGELOG.md
./packages/reasonex-core-api/node_modules/type-fest/readme.md
./packages/reasonex-core-api/node_modules/npm-run-path/readme.md
./packages/reasonex-core-api/node_modules/node-fetch/LICENSE.md
./packages/reasonex-core-api/node_modules/node-fetch/README.md
./packages/reasonex-core-api/node_modules/json5/LICENSE.md
./packages/reasonex-core-api/node_modules/json5/README.md
./packages/reasonex-core-api/node_modules/etag/README.md
./packages/reasonex-core-api/node_modules/etag/HISTORY.md
./packages/reasonex-core-api/node_modules/yargs/README.md
./packages/reasonex-core-api/node_modules/safer-buffer/Readme.md
./packages/reasonex-core-api/node_modules/safer-buffer/Porting-Buffer.md
./packages/reasonex-core-api/node_modules/inflight/README.md
./packages/reasonex-core-api/node_modules/send/node_modules/debug/node_modules/ms/license.md
./packages/reasonex-core-api/node_modules/send/node_modules/debug/node_modules/ms/readme.md
./packages/reasonex-core-api/node_modules/send/node_modules/debug/README.md
./packages/reasonex-core-api/node_modules/send/node_modules/debug/CHANGELOG.md
./packages/reasonex-core-api/node_modules/send/README.md
./packages/reasonex-core-api/node_modules/send/HISTORY.md
./packages/reasonex-core-api/node_modules/send/SECURITY.md
./packages/reasonex-core-api/node_modules/leven/readme.md
./packages/reasonex-core-api/node_modules/array-union/readme.md
./packages/reasonex-core-api/node_modules/jest-worker/node_modules/supports-color/readme.md
./packages/reasonex-core-api/node_modules/jest-worker/README.md
./packages/reasonex-core-api/node_modules/form-data-encoder/readme.md
./packages/reasonex-core-api/node_modules/brace-expansion/README.md
./packages/reasonex-core-api/node_modules/path-to-regexp/Readme.md
./packages/reasonex-core-api/node_modules/isexe/README.md
./packages/reasonex-core-api/node_modules/@sinclair/typebox/readme.md
./packages/reasonex-core-api/node_modules/jest-changed-files/README.md
./packages/reasonex-core-api/node_modules/arg/LICENSE.md
./packages/reasonex-core-api/node_modules/arg/README.md
./packages/reasonex-core-api/node_modules/jest-circus/README.md
./packages/reasonex-core-api/node_modules/v8-compile-cache-lib/README.md
./packages/reasonex-core-api/node_modules/v8-compile-cache-lib/CHANGELOG.md
./packages/reasonex-core-api/node_modules/cliui/README.md
./packages/reasonex-core-api/node_modules/cliui/CHANGELOG.md
./packages/reasonex-core-api/node_modules/iconv-lite/Changelog.md
./packages/reasonex-core-api/node_modules/iconv-lite/README.md
./packages/reasonex-core-api/node_modules/ansi-escapes/readme.md
./packages/reasonex-core-api/node_modules/ansi-escapes/node_modules/type-fest/readme.md
./packages/reasonex-core-api/node_modules/raw-body/README.md
./packages/reasonex-core-api/node_modules/picomatch/README.md
./packages/reasonex-core-api/node_modules/picomatch/CHANGELOG.md
./packages/reasonex-core-api/node_modules/color-string/node_modules/color-name/README.md
./packages/reasonex-core-api/node_modules/color-string/README.md
./packages/reasonex-core-api/node_modules/is-binary-path/readme.md
./packages/reasonex-core-api/node_modules/yallist/README.md
./packages/reasonex-core-api/node_modules/type-check/README.md
./packages/reasonex-core-api/node_modules/locate-path/readme.md
./packages/reasonex-core-api/node_modules/pretty-format/node_modules/ansi-styles/readme.md
./packages/reasonex-core-api/node_modules/pretty-format/README.md
./packages/reasonex-core-api/node_modules/update-browserslist-db/README.md
./packages/reasonex-core-api/node_modules/@sinonjs/fake-timers/README.md
./packages/reasonex-core-api/node_modules/@sinonjs/commons/lib/prototypes/README.md
./packages/reasonex-core-api/node_modules/@sinonjs/commons/README.md
./packages/reasonex-core-api/node_modules/mime/README.md
./packages/reasonex-core-api/node_modules/mime/CHANGELOG.md
./packages/reasonex-core-api/node_modules/deepmerge/readme.md
./packages/reasonex-core-api/node_modules/deepmerge/changelog.md
./packages/reasonex-core-api/node_modules/require-from-string/readme.md
./packages/reasonex-core-api/README.md
./packages/reasonex-core-api/COMPLIANCE_REPORT.md

### 9.2 README.md
```markdown
# Reasonex Core API & n8n Nodes

## Documentation

A proprietary scoring, validation, and analysis engine with custom n8n nodes for workflow automation.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Core API Reference](#core-api-reference)
   - [Health Check](#health-check)
   - [Lock Endpoint](#lock-endpoint)
   - [Score Endpoint](#score-endpoint)
   - [Validate Endpoint](#validate-endpoint)
   - [Tree Endpoint](#tree-endpoint)
   - [Detect Endpoint](#detect-endpoint)
   - [Route Endpoint](#route-endpoint)
5. [n8n Nodes Reference](#n8n-nodes-reference)
   - [Reasonex Lock](#reasonex-lock-node)
   - [Reasonex Rule Engine](#reasonex-rule-engine-node)
   - [Reasonex Validation](#reasonex-validation-node)
   - [Reasonex Tree Builder](#reasonex-tree-builder-node)
   - [Reasonex Change Detector](#reasonex-change-detector-node)
   - [Reasonex Review Router](#reasonex-review-router-node)
   - [Reasonex Explanation](#reasonex-explanation-node)
6. [Installation](#installation)
7. [Configuration](#configuration)
8. [Rule Sets](#rule-sets)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Reasonex is a hybrid system consisting of:

- **Core API**: Express.js backend deployed on Railway that handles scoring algorithms, validation logic, and data processing
- **n8n Nodes**: 7 custom nodes for n8n workflow automation that communicate with the Core API

### Key Features

- **Data Locking**: Cryptographic hashing (SHA-256, SHA3-256, SHA-512) for data immutability
- **Rule-Based Scoring**: Configurable rule sets for multi-dimensional scoring
- **5-Check Validation**: Schema, coverage, sources, hallucination, and rules validation
- **AI-Powered Analysis**: LLM integration for structured data extraction
- **Change Detection**: Deep diff with materiality assessment
- **Tiered Review Routing**: Automatic routing based on impact and confidence
- **Explanation Generation**: Human-readable explanations for any audience

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         n8n Workflows                           │
│                    (Visual Workflow Editor)                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                  @reasonex/n8n-nodes (NPM)                      │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │  Lock   │ │  Rule   │ │Validate │ │  Tree   │              │
│  │  Node   │ │ Engine  │ │  Node   │ │ Builder │              │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘              │
│       │           │           │           │                    │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐                          │
│  │ Change  │ │ Review  │ │  Explan │                          │
│  │Detector │ │ Router  │ │ ation   │                          │
│  └────┬────┘ └────┬────┘ └────┬────┘                          │
└───────┼───────────┼───────────┼─────────────────────────────────┘
        │           │           │
        └───────────┼───────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              Reasonex Core API (Railway)                        │
│              https://reasonex-core-api-production.up.railway.app│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Express.js                          │   │
│  │  /api/v1/lock  /api/v1/score  /api/v1/validate          │   │
│  │  /api/v1/tree  /api/v1/detect /api/v1/route             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│  │   Lock    │ │   Rule    │ │ Validator │ │   Tree    │      │
│  │  Manager  │ │  Engine   │ │           │ │  Builder  │      │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                    │
│  │  Change   │ │   Tier    │ │Explanation│                    │
│  │ Detector  │ │  Router   │ │ Generator │                    │
│  └───────────┘ └───────────┘ └───────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Test the API

```bash
# Check API is running
curl https://reasonex-core-api-production.up.railway.app/

# Health check
curl https://reasonex-core-api-production.up.railway.app/health

# Score some data
curl -X POST https://reasonex-core-api-production.up.railway.app/api/v1/score \
  -H "Content-Type: application/json" \
  -d '{"data": {"peRatio": 12, "roe": 20}, "ruleSetId": "investment-v1"}'
```

### Install n8n Nodes

```bash
cd /home/amee/ValueInvest/packages/reasonex-n8n-nodes
npm link

mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm link @reasonex/n8n-nodes

# Restart n8n
```

---

## Core API Reference

**Base URL**: `https://reasonex-core-api-production.up.railway.app`

### Health Check

Check if the API is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "reasonex-core-api",
  "version": "1.0.0",
  "timestamp": "2026-01-16T06:24:10.789Z",
  "uptime": 1364.38
}
```

---

### Lock Endpoint

Create cryptographic locks for data immutability or verify existing locks.

**Endpoint**: `POST /api/v1/lock`

#### Create Lock

**Request**:
```json
{
  "data": {
    "ticker": "AAPL",
    "score": 85,
    "analysis": { ... }
  },
  "options": {
    "algorithm": "SHA256",
    "includeTimestamp": true,
    "canonicalization": "strict",
    "schemaId": "company-analysis-v1"
  }
}
```

**Options**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `algorithm` | string | `"SHA256"` | Hash algorithm: `SHA256`, `SHA3-256`, `SHA512` |
| `includeTimestamp` | boolean | `true` | Include timestamp in hash calculation |
| `canonicalization` | string | `"strict"` | JSON serialization mode: `strict`, `relaxed` |
| `schemaId` | string | `null` | Optional schema identifier |

**Response**:
```json
{
  "success": true,
  "result": {
    "locked_data": { ... },
    "data_hash": "372cfa5847c619bb42be46b95eb8051bdf2de33d3176f6a07eb86ba9d0f6b991",
    "lock_timestamp": "2026-01-16T06:09:18.966Z",
```
(truncated to first 200 lines)

========================================
SECTION 10: Deployment Info
========================================

### 10.1 Railway Config
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### 10.2 Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy config files
COPY --from=builder /app/src/config ./dist/config

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
```

### 10.3 CI/CD Config
./packages/reasonex-n8n-nodes/node_modules/es-object-atoms/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/gopd/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types/.github/workflows/main.yml
./packages/reasonex-n8n-nodes/node_modules/recast/node_modules/ast-types/.github/dependabot.yml
./packages/reasonex-n8n-nodes/node_modules/recast/.github/workflows/main.yml
./packages/reasonex-n8n-nodes/node_modules/recast/.github/dependabot.yml
./packages/reasonex-n8n-nodes/node_modules/has-symbols/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/is-typed-array/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/function-bind/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/call-bind-apply-helpers/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/get-proto/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/has-property-descriptors/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/call-bind/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/possible-typed-array-names/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/dunder-proto/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/is-callable/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/object.assign/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/hasown/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/get-intrinsic/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/@ungap/structured-clone/.github/workflows/node.js.yml
./packages/reasonex-n8n-nodes/node_modules/available-typed-arrays/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/set-function-length/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/define-properties/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/math-intrinsics/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/fast-json-stable-stringify/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/is-nan/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/generator-function/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/es-define-property/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/for-each/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/is-arguments/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/has-tostringtag/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/safe-regex-test/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/balanced-match/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/call-bound/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/which-typed-array/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/reusify/.github/workflows/ci.yml
./packages/reasonex-n8n-nodes/node_modules/reusify/.github/dependabot.yml
./packages/reasonex-n8n-nodes/node_modules/es-errors/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/brace-expansion/.github/FUNDING.yml
./packages/reasonex-n8n-nodes/node_modules/define-data-property/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/side-channel-map/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/supports-preserve-symlinks-flag/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/es-object-atoms/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/gopd/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/json-schema-traverse/.github/workflows/build.yml
./packages/reasonex-core-api/node_modules/json-schema-traverse/.github/workflows/publish.yml
./packages/reasonex-core-api/node_modules/json-schema-traverse/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/has-symbols/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/function-bind/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/call-bind-apply-helpers/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/get-proto/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/dunder-proto/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/hasown/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/qs/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/get-intrinsic/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/minimist/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/@ungap/structured-clone/.github/workflows/node.js.yml
./packages/reasonex-core-api/node_modules/side-channel-list/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/resolve/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/babel-preset-current-node-syntax/.github/workflows/nodejs.yml
./packages/reasonex-core-api/node_modules/babel-preset-current-node-syntax/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/side-channel/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/math-intrinsics/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/fast-json-stable-stringify/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/side-channel-weakmap/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/es-define-property/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/fast-uri/.github/.stale.yml
./packages/reasonex-core-api/node_modules/fast-uri/.github/workflows/package-manager-ci.yml
./packages/reasonex-core-api/node_modules/fast-uri/.github/workflows/ci.yml
./packages/reasonex-core-api/node_modules/fast-uri/.github/dependabot.yml
./packages/reasonex-core-api/node_modules/fast-uri/.github/tests_checker.yml
./packages/reasonex-core-api/node_modules/has-tostringtag/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/balanced-match/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/call-bound/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/reusify/.github/workflows/ci.yml
./packages/reasonex-core-api/node_modules/reusify/.github/dependabot.yml
./packages/reasonex-core-api/node_modules/object-inspect/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/es-errors/.github/FUNDING.yml
./packages/reasonex-core-api/node_modules/brace-expansion/.github/FUNDING.yml

========================================
SECTION 11: Git Status
========================================

### 11.1 Git Status
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
  (use "git push" to publish your local commits)

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	Reasonex_Phase0_Status_Dump_Prompt.md
	Reasonex_Phase0_Status_Dump_Prompt.md:Zone.Identifier
	Reasonex_Proprietary_n8n_Nodes_Specification (1).md:Zone.Identifier
	Reasonex_Proprietary_n8n_Nodes_Specification.md
	docs/stage2_scoring_explained.md
	docs/stage2_workflow_guide.md
	packages/

nothing added to commit but untracked files present (use "git add" to track)

### 11.2 Recent Commits
e252fea Replace env vars with hardcoded values in stage2_scoring
d3598c4 Fix rate limiting in Stage 2 workflows
88dce24 Fix rate limiting: reduce to 100 stocks, slower batching (5 per 3s)
7df1e47 Add 3-stage value investing pipeline
5e03511 Add expanded Stage 1 with S&P 500 + European stocks
60715ef Update docs with AI workflow instructions
088bebe Add Content-Type header for OpenAI API
86e5d0c Fix: Use POST method for OpenAI API
47920f6 Simplify AI workflow - remove batch node
1d0a8ff Add Stage 2 workflow with AI moat analysis
777a047 Add detailed resume prompt for project continuation
53ebd55 Add Stage 2 with full fields including simulated data
aa6445b Add complete Stage 1 and Stage 2 workflows with more fields
d19e848 Add Stage 1 with 50 stocks
823e60a Add Stage 2 using profile data only (free tier compatible)
4e187e7 Add simple Stage 2 scoring workflow
8a129b5 Add no-loop Stage 1 - let n8n handle multiple items automatically
6ba8052 Add loop-based Stage 1 workflow - writes each stock immediately
2203f13 Add final simplified Stage 1 workflow
6ac4bc5 Add HTTP-based Stage 1 workflow

### 11.3 Git Remotes
origin	https://github.com/Koulsami/ValueInvest.git (fetch)
origin	https://github.com/Koulsami/ValueInvest.git (push)

========================================
SECTION 12: Running Services Check
========================================

### 12.1 Running Processes
root         109  0.0  0.0 152936  1412 ?        Ssl  13:24   0:00 snapfuse /var/lib/snapd/snaps/code_212.snap /snap/code/212 -o ro,nodev,allow_other,suid
root         112  0.0  0.0 153596  1924 ?        Ssl  13:24   0:00 snapfuse /var/lib/snapd/snaps/code_217.snap /snap/code/217 -o ro,nodev,allow_other,suid
root         116  0.0  0.0 152936  1412 ?        Ssl  13:24   0:00 snapfuse /var/lib/snapd/snaps/core20_2682.snap /snap/core20/2682 -o ro,nodev,allow_other,suid
root         117  0.0  0.0 227700  1540 ?        Ssl  13:24   0:00 snapfuse /var/lib/snapd/snaps/core20_2686.snap /snap/core20/2686 -o ro,nodev,allow_other,suid
root         127  0.0  0.0 152936  1284 ?        Ssl  13:24   0:00 snapfuse /var/lib/snapd/snaps/snapd_25577.snap /snap/snapd/25577 -o ro,nodev,allow_other,suid
root         130  0.0  0.2 451992 11492 ?        Ssl  13:24   0:03 snapfuse /var/lib/snapd/snaps/snapd_25935.snap /snap/snapd/25935 -o ro,nodev,allow_other,suid
root         350  0.0  0.5 107024 22144 ?        Ssl  13:24   0:00 /usr/bin/python3 /usr/share/unattended-upgrades/unattended-upgrade-shutdown --wait-for-signal
postgres     399  0.0  0.7 220268 30208 ?        Ss   13:24   0:00 /usr/lib/postgresql/16/bin/postgres -D /var/lib/postgresql/16/main -c config_file=/etc/postgresql/16/main/postgresql.conf
postgres     412  0.0  0.1 220400  7672 ?        Ss   13:24   0:00 postgres: 16/main: checkpointer 
postgres     414  0.0  0.1 220416  7032 ?        Ss   13:24   0:00 postgres: 16/main: background writer 

### 12.2 Listening Ports
State  Recv-Q Send-Q  Local Address:Port  Peer Address:PortProcess
LISTEN 0      1000   10.255.255.254:53         0.0.0.0:*          
LISTEN 0      4096    127.0.0.53%lo:53         0.0.0.0:*          
LISTEN 0      4096       127.0.0.54:53         0.0.0.0:*          
LISTEN 0      4096        127.0.0.1:46333      0.0.0.0:*          
LISTEN 0      200         127.0.0.1:5432       0.0.0.0:*          
LISTEN 0      4096          0.0.0.0:5678       0.0.0.0:*          
LISTEN 0      50                  *:8080             *:*          
LISTEN 0      4096             [::]:5678          [::]:*          
LISTEN 0      50                  *:40333            *:*          

### 12.3 Docker Containers
CONTAINER ID   IMAGE              COMMAND                  CREATED       STATUS       PORTS                                         NAMES
f963bc5bdee8   n8nio/n8n:latest   "tini -- /docker-ent…"   2 weeks ago   Up 2 hours   0.0.0.0:5678->5678/tcp, [::]:5678->5678/tcp   reasonex-n8n_n8n_1
1199ea54af9d   postgres:16        "docker-entrypoint.s…"   2 weeks ago   Up 2 hours   5432/tcp                                      reasonex-n8n_postgres_1

========================================
SECTION 13: Rule Set Configuration
========================================

### 13.1 Rule Set Files
./packages/reasonex-n8n-nodes/node_modules/eslint/conf/rule-type-list.json
./packages/reasonex-core-api/dist/config/rule-sets/investment-v1.json
./packages/reasonex-core-api/node_modules/eslint/conf/rule-type-list.json
./packages/reasonex-core-api/src/config/rule-sets/investment-v1.json

### 13.2 investment-v1.json
```json
{
  "id": "investment-v1",
  "name": "Value Investment Scoring",
  "version": "1.0.0",
  "vertical": "investment",
  "description": "Comprehensive value investment scoring based on valuation, quality, growth, dividend, and moat metrics",
  "totalMaxScore": 100,
  "aggregation": "weighted_average",
  "dimensions": [
    {
      "id": "valuation",
      "name": "Valuation",
      "weight": 0.30,
      "maxScore": 30,
      "aggregation": "weighted_sum",
      "ruleWeights": {
        "pe-ratio": 0.40,
        "pb-ratio": 0.25,
        "ev-ebitda": 0.20,
        "p-fcf": 0.15
      },
      "rules": [
        {
          "id": "pe-ratio",
          "field": "peRatio",
          "operator": "lt",
          "value": 25,
          "scoreFormula": "Math.max(0, Math.min(12, 12 - (value - 5) * 0.8))",
          "maxScore": 12,
          "minScore": 0,
          "description": "P/E ratio score - lower is better, baseline 5x"
        },
        {
          "id": "pb-ratio",
          "field": "pbRatio",
          "operator": "lt",
          "value": 5,
          "scoreFormula": "Math.max(0, Math.min(12, 12 - value * 4))",
          "maxScore": 12,
          "minScore": 0,
          "description": "P/B ratio score - lower is better"
        },
        {
          "id": "ev-ebitda",
          "field": "evEbitda",
          "operator": "lt",
          "value": 20,
          "scoreFormula": "Math.max(0, Math.min(12, 12 - (value - 4) * 0.8))",
          "maxScore": 12,
          "minScore": 0,
          "description": "EV/EBITDA score - lower is better, baseline 4x"
        },
        {
          "id": "p-fcf",
          "field": "pFcf",
          "operator": "lt",
          "value": 25,
          "scoreFormula": "Math.max(0, Math.min(12, 12 - (value - 5) * 0.6))",
          "maxScore": 12,
          "minScore": 0,
          "description": "Price to FCF score - lower is better, baseline 5x"
        }
      ]
    },
    {
      "id": "quality",
      "name": "Quality",
      "weight": 0.25,
      "maxScore": 25,
      "aggregation": "weighted_sum",
      "ruleWeights": {
        "roe": 0.30,
        "roic": 0.25,
        "net-margin": 0.20,
        "debt-equity": 0.15,
        "interest-coverage": 0.10
      },
      "rules": [
        {
          "id": "roe",
          "field": "roe",
          "operator": "gt",
          "value": 0,
          "scoreFormula": "Math.min(12, Math.abs(value) * 40)",
          "maxScore": 12,
          "minScore": 0,
          "description": "ROE score - higher is better, 20% ROE = 8 points"
        },
        {
          "id": "roic",
          "field": "roic",
          "operator": "gt",
          "value": 0,
          "scoreFormula": "Math.min(12, Math.abs(value) * 60)",
          "maxScore": 12,
          "minScore": 0,
          "description": "ROIC score - higher is better, 15% ROIC = 9 points"
        },
        {
          "id": "net-margin",
          "field": "netMargin",
          "operator": "gt",
          "value": 0,
          "scoreFormula": "Math.min(12, Math.abs(value) * 60)",
          "maxScore": 12,
          "minScore": 0,
          "description": "Net margin score - higher is better, 10% margin = 6 points"
        },
        {
          "id": "debt-equity",
          "field": "debtEquity",
          "operator": "lt",
          "value": 2,
          "scoreFormula": "Math.max(0, 12 - Math.abs(value) * 4)",
          "maxScore": 12,
          "minScore": 0,
          "description": "Debt/Equity score - lower is better, penalty of 4x per ratio point"
        },
        {
          "id": "interest-coverage",
          "field": "interestCoverage",
          "operator": "gt",
          "value": 2,
          "scoreFormula": "Math.min(12, Math.max(0, value) * 1.2)",
          "maxScore": 12,
          "minScore": 0,
          "description": "Interest coverage score - higher is better, 10x coverage = 12 points"
        }
      ]
    },
    {
      "id": "growth",
      "name": "Growth",
      "weight": 0.20,
      "maxScore": 20,
      "aggregation": "weighted_sum",
      "ruleWeights": {
        "revenue-growth": 0.40,
        "eps-growth": 0.35,
        "fcf-growth": 0.25
      },
      "rules": [
        {
          "id": "revenue-growth",
          "field": "revenueGrowth",
          "operator": "gt",
          "value": 0,
          "scoreFormula": "Math.min(12, Math.max(0, value * 60))",
          "maxScore": 12,
          "minScore": 0,
          "description": "Revenue growth score - 15% growth = 9 points"
        },
        {
          "id": "eps-growth",
          "field": "epsGrowth",
          "operator": "gt",
          "value": 0,
          "scoreFormula": "Math.min(12, Math.max(0, value * 40))",
          "maxScore": 12,
          "minScore": 0,
          "description": "EPS growth score - 20% growth = 8 points"
        },
        {
          "id": "fcf-growth",
          "field": "fcfGrowth",
          "operator": "gt",
          "value": 0,
          "scoreFormula": "Math.min(12, Math.max(0, value * 40))",
          "maxScore": 12,
          "minScore": 0,
          "description": "FCF growth score - 20% growth = 8 points"
        }
      ]
    },
    {
      "id": "dividend",
      "name": "Dividend",
      "weight": 0.15,
      "maxScore": 15,
      "aggregation": "weighted_sum",
      "ruleWeights": {
        "dividend-yield": 0.60,
        "payout-ratio": 0.40
      },
      "rules": [
        {
          "id": "dividend-yield",
          "field": "dividendYield",
          "operator": "gt",
          "value": 0,
          "scoreFormula": "Math.min(12, value * 300)",
          "maxScore": 12,
          "minScore": 0,
          "description": "Dividend yield score - 3% yield = 9 points"
        },
        {
          "id": "payout-ratio",
          "field": "payoutRatio",
          "operator": "between",
          "value": [0.2, 0.6],
          "scoreFormula": "Math.max(0, 12 - Math.abs(value - 0.40) * 20)",
          "maxScore": 12,
          "minScore": 0,
          "description": "Payout ratio score - 40% is ideal, penalty for deviation"
        }
      ]
    },
    {
      "id": "moat",
      "name": "Competitive Moat",
      "weight": 0.10,
      "maxScore": 10,
      "aggregation": "max",
      "rules": [
        {
          "id": "moat-score",
          "field": "moatScore",
          "operator": "gte",
          "value": 0,
          "scoreFormula": "Math.min(10, Math.max(0, value))",
          "maxScore": 10,
          "minScore": 0,
          "description": "AI-generated moat score (0-10)"
        }
      ]
    }
  ],
  "classifications": [
    {
      "name": "Strong Buy",
      "minScore": 80,
      "maxScore": 100,
      "recommendation": "Excellent value investment candidate with strong fundamentals"
    },
    {
      "name": "Buy",
      "minScore": 65,
      "maxScore": 79.99,
      "recommendation": "Good value investment with solid metrics"
    },
    {
      "name": "Hold",
      "minScore": 50,
      "maxScore": 64.99,
      "recommendation": "Moderate value - monitor for improvement"
    },
    {
      "name": "Watch",
      "minScore": 35,
      "maxScore": 49.99,
      "recommendation": "Below average value metrics - wait for better entry"
    },
    {
      "name": "Avoid",
      "minScore": 0,
      "maxScore": 34.99,
      "recommendation": "Poor value metrics - not recommended"
    }
  ]
}
```

========================================
SECTION 14: API Client Library
========================================

### 14.1 api-client.ts
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { NodeLogger } from './logger';

// API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  message?: string;
  traceId?: string;
}

// API Client configuration
export interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
  openaiApiKey?: string;
  timeout?: number;
  debugMode?: boolean;
}

// Reasonex API Client
export class ReasonexApiClient {
  private client: AxiosInstance;
  private logger: NodeLogger;
  private traceId: string;
  private debugMode: boolean;

  constructor(config: ApiClientConfig, logger?: NodeLogger) {
    this.traceId = uuidv4();
    this.debugMode = config.debugMode || false;
    this.logger = logger || new NodeLogger('ReasonexApiClient', undefined, this.debugMode);

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': this.traceId,
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
        ...(config.openaiApiKey && { 'X-OpenAI-Key': config.openaiApiKey }),
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (requestConfig) => {
        this.logger.debug('API Request', {
          method: requestConfig.method,
          url: requestConfig.url,
          dataSize: JSON.stringify(requestConfig.data || {}).length,
        });
        return requestConfig;
      },
      (error) => {
        this.logger.error('Request error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data || {}).length,
        });
        return response;
      },
      (error) => {
        this.logger.error('Response error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  // Get current trace ID
  getTraceId(): string {
    return this.traceId;
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request({
        method,
        url: endpoint,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<T>;
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        traceId: this.traceId,
      };
    }
  }

  // Lock API
  async createLock(data: Record<string, unknown>, options?: {
    algorithm?: 'SHA256' | 'SHA3-256' | 'SHA512';
    includeTimestamp?: boolean;
    canonicalization?: 'strict' | 'relaxed';
    schemaId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/lock', { data, options });
  }

  async verifyLock(data: Record<string, unknown>, hash: string, lockTimestamp?: string, options?: {
    algorithm?: 'SHA256' | 'SHA3-256' | 'SHA512';
    includeTimestamp?: boolean;
    canonicalization?: 'strict' | 'relaxed';
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/lock/verify', { data, hash, lockTimestamp, options });
  }

  // Score API
  async score(data: Record<string, unknown>, ruleSetId: string, context?: Record<string, unknown>, debugMode?: boolean): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/score', { data, ruleSetId, context, debugMode });
  }

  async getRuleSets(): Promise<ApiResponse<{ ruleSets: string[]; count: number }>> {
    return this.request('GET', '/api/v1/score/rule-sets');
  }

  async getRuleSet(id: string): Promise<ApiResponse> {
    return this.request('GET', `/api/v1/score/rule-sets/${id}`);
  }

  async batchScore(items: Record<string, unknown>[], ruleSetId: string, context?: Record<string, unknown>, debugMode?: boolean): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/score/batch', { items, ruleSetId, context, debugMode });
  }

  // Validate API
  async validate(analysis: Record<string, unknown>, options?: {
    sources?: unknown[];
    scores?: Record<string, unknown>;
    profile?: string;
    checks?: string[];
    strictness?: 'strict' | 'normal' | 'lenient';
    hallucinationSensitivity?: 'high' | 'medium' | 'low';
    debugMode?: boolean;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/validate', {
      analysis,
      sources: options?.sources,
      scores: options?.scores,
      profile: options?.profile,
      options: {
        checks: options?.checks,
        strictness: options?.strictness,
        hallucinationSensitivity: options?.hallucinationSensitivity,
        debugMode: options?.debugMode,
      },
    });
  }

  async getValidationProfiles(): Promise<ApiResponse<{ profiles: string[]; count: number }>> {
    return this.request('GET', '/api/v1/validate/profiles');
  }

  // Tree API
  async buildTree(entity: Record<string, unknown>, documents: unknown[], schema: string, options?: {
    llmConfig?: {
      provider?: 'openai' | 'anthropic';
      model?: string;
      temperature?: number;
      maxTokens?: number;
    };
    guidanceProfile?: string;
    debugMode?: boolean;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/tree', {
      entity,
      documents,
      schema,
      ...options,
    });
  }

  async getTreeSchemas(): Promise<ApiResponse<{ schemas: string[]; count: number }>> {
    return this.request('GET', '/api/v1/tree/schemas');
  }

  // Detect API
  async detectChanges(oldVersion: Record<string, unknown>, newVersion: Record<string, unknown>, options?: {
    materialityConfig?: {
      highImpactFields?: string[];
      mediumImpactFields?: string[];
      numericTolerance?: number;
      ignoreFields?: string[];
    };
    comparisonDepth?: 'shallow' | 'deep';
    debugMode?: boolean;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/detect', {
      oldVersion,
      newVersion,
      ...options,
    });
  }

  // Route API
  async route(change: {
    impactScore: number;
    materiality: 'HIGH' | 'MEDIUM' | 'LOW';
    changesCount: number;
    affectedPaths: string[];
  }, context?: {
    urgency?: 'critical' | 'high' | 'normal' | 'low';
    clientTier?: 'enterprise' | 'premium' | 'standard' | 'basic';
    vertical?: string;
    confidence?: number;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/route', { change, context });
  }

  async generateExplanation(scoringResult: Record<string, unknown>, options?: {
    audience?: 'expert' | 'professional' | 'consumer';
    verbosity?: 'brief' | 'standard' | 'detailed';
    includeCitations?: boolean;
    language?: string;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/route/explain', { scoringResult, options });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    service: string;
    version: string;
    timestamp: string;
    uptime: number;
  }>> {
    return this.request('GET', '/health');
  }
}

// Factory function
export function createApiClient(config: ApiClientConfig, logger?: NodeLogger): ReasonexApiClient {
  return new ReasonexApiClient(config, logger);
}
```

========================================
SECTION 15: Logger & Tracer Libraries
========================================

### 15.1 Core API Logger
```typescript
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Log levels with priorities
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

// Colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  trace: 'magenta',
};

winston.addColors(colors);

// Trace context interface
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  workflowId?: string;
  executionId?: string;
  nodeId?: string;
}

// Log metadata interface
export interface LogMetadata {
  service?: string;
  node?: string;
  operation?: string;
  duration_ms?: number;
  input_size?: number;
  output_size?: number;
  [key: string]: unknown;
}

// Create trace context
export function createTraceContext(parentContext?: Partial<TraceContext>): TraceContext {
  return {
    traceId: parentContext?.traceId || uuidv4(),
    spanId: uuidv4(),
    parentSpanId: parentContext?.spanId,
    workflowId: parentContext?.workflowId,
    executionId: parentContext?.executionId,
    nodeId: parentContext?.nodeId,
  };
}

// Custom format for structured logging
const structuredFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const logEntry = {
    level,
    timestamp,
    message,
    ...metadata,
  };
  return JSON.stringify(logEntry);
});

// Pretty format for development
const prettyFormat = winston.format.printf(({ level, message, timestamp, traceId, spanId, node, operation, duration_ms, ...rest }) => {
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const traceIdStr = typeof traceId === 'string' ? traceId : '';
  const spanIdStr = typeof spanId === 'string' ? spanId : '';
  const context = [
    traceIdStr ? `trace:${traceIdStr.slice(0, 8)}` : null,
    spanIdStr ? `span:${spanIdStr.slice(0, 8)}` : null,
    node ? `node:${node}` : null,
    operation ? `op:${operation}` : null,
    duration_ms !== undefined ? `${duration_ms}ms` : null,
  ].filter(Boolean).join(' | ');

  const contextStr = context ? ` (${context})` : '';
  const extra = Object.keys(rest).length > 0 ? `\n  ${JSON.stringify(rest, null, 2)}` : '';

  return `${prefix}${contextStr} ${message}${extra}`;
});

// Determine format based on environment
const isProduction = process.env.NODE_ENV === 'production';
const logFormat = isProduction
  ? winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      structuredFormat
    )
  : winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      prettyFormat
    );

// Create base logger
const baseLogger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
  defaultMeta: {
    service: 'reasonex-core-api',
  },
});

// Logger class with context support
export class Logger {
  private context: TraceContext;
  private metadata: LogMetadata;

  constructor(context?: Partial<TraceContext>, metadata?: LogMetadata) {
    this.context = createTraceContext(context);
    this.metadata = {
      service: 'reasonex-core-api',
      ...metadata,
    };
  }

  private log(level: string, message: string, data?: Record<string, unknown>) {
    baseLogger.log(level, message, {
      ...this.context,
      ...this.metadata,
      ...data,
    });
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }

  trace(message: string, data?: Record<string, unknown>) {
    this.log('trace', message, data);
  }

  // Create child logger with additional context
  child(metadata: LogMetadata): Logger {
    const child = new Logger(this.context, { ...this.metadata, ...metadata });
    return child;
  }

  // Get current trace context
  getContext(): TraceContext {
    return { ...this.context };
  }

  // Time an operation
  async time<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    this.debug(`Starting operation: ${operation}`);

    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`Completed operation: ${operation}`, { duration_ms: duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Failed operation: ${operation}`, {
        duration_ms: duration,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  // Synchronous timing
  timeSync<T>(operation: string, fn: () => T): T {
    const start = Date.now();
    this.debug(`Starting operation: ${operation}`);

    try {
      const result = fn();
      const duration = Date.now() - start;
      this.info(`Completed operation: ${operation}`, { duration_ms: duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Failed operation: ${operation}`, {
        duration_ms: duration,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}

// Default logger instance
export const logger = new Logger();

// Create logger from request context
export function createRequestLogger(req: {
  headers?: Record<string, string | string[] | undefined>;
  body?: { traceId?: string; workflowId?: string; executionId?: string; nodeId?: string };
}): Logger {
  const traceId = (req.headers?.['x-trace-id'] as string) || req.body?.traceId;
  const workflowId = (req.headers?.['x-workflow-id'] as string) || req.body?.workflowId;
  const executionId = (req.headers?.['x-execution-id'] as string) || req.body?.executionId;
  const nodeId = (req.headers?.['x-node-id'] as string) || req.body?.nodeId;

  return new Logger({
    traceId,
    workflowId,
    executionId,
    nodeId,
  });
}

export default logger;
```

### 15.2 Core API Tracer
```typescript
import { v4 as uuidv4 } from 'uuid';
import { Logger, TraceContext, createTraceContext } from './logger';

// Span status
export enum SpanStatus {
  OK = 'OK',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED',
}

// Span data interface
export interface SpanData {
  name: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startTime: number;
  endTime?: number;
  duration_ms?: number;
  status: SpanStatus;
  attributes: Record<string, unknown>;
  events: SpanEvent[];
}

// Span event interface
export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, unknown>;
}

// Span class for tracing operations
export class Span {
  private data: SpanData;
  private logger: Logger;
  private ended: boolean = false;

  constructor(
    name: string,
    context: Partial<TraceContext>,
    logger: Logger,
    attributes?: Record<string, unknown>
  ) {
    this.logger = logger;
    this.data = {
      name,
      traceId: context.traceId || uuidv4(),
      spanId: uuidv4(),
      parentSpanId: context.spanId,
      startTime: Date.now(),
      status: SpanStatus.OK,
      attributes: attributes || {},
      events: [],
    };

    this.logger.debug(`Span started: ${name}`, {
      spanId: this.data.spanId,
      parentSpanId: this.data.parentSpanId,
    });
  }

  // Add attribute to span
  setAttribute(key: string, value: unknown): this {
    this.data.attributes[key] = value;
    return this;
  }

  // Add multiple attributes
  setAttributes(attributes: Record<string, unknown>): this {
    Object.assign(this.data.attributes, attributes);
    return this;
  }

  // Add event to span
  addEvent(name: string, attributes?: Record<string, unknown>): this {
    this.data.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
    this.logger.trace(`Span event: ${name}`, { spanId: this.data.spanId, ...attributes });
    return this;
  }

  // Set span status
  setStatus(status: SpanStatus, message?: string): this {
    this.data.status = status;
    if (message) {
      this.data.attributes['status.message'] = message;
    }
    return this;
  }

  // Record exception
  recordException(error: Error): this {
    this.setStatus(SpanStatus.ERROR, error.message);
    this.addEvent('exception', {
      'exception.type': error.name,
      'exception.message': error.message,
      'exception.stacktrace': error.stack,
    });
    return this;
  }

  // End span
  end(): SpanData {
    if (this.ended) {
      this.logger.warn('Span already ended', { spanId: this.data.spanId });
      return this.data;
    }

    this.ended = true;
    this.data.endTime = Date.now();
    this.data.duration_ms = this.data.endTime - this.data.startTime;

    this.logger.debug(`Span ended: ${this.data.name}`, {
      spanId: this.data.spanId,
      duration_ms: this.data.duration_ms,
      status: this.data.status,
    });

    return this.data;
  }

  // Get span context for child spans
  getContext(): TraceContext {
    return {
      traceId: this.data.traceId,
      spanId: this.data.spanId,
      parentSpanId: this.data.parentSpanId,
    };
  }

  // Get span data
  getData(): SpanData {
    return { ...this.data };
  }
}

// Tracer class for creating spans
export class Tracer {
  private serviceName: string;
  private logger: Logger;
  private activeSpans: Map<string, Span> = new Map();
  private completedSpans: SpanData[] = [];

  constructor(serviceName: string, logger?: Logger) {
    this.serviceName = serviceName;
    this.logger = logger || new Logger(undefined, { service: serviceName });
  }

  // Start a new span
  startSpan(
    name: string,
    context?: Partial<TraceContext>,
    attributes?: Record<string, unknown>
  ): Span {
    const span = new Span(
      name,
      context || {},
      this.logger.child({ node: name }),
      {
        'service.name': this.serviceName,
        ...attributes,
      }
    );

    this.activeSpans.set(span.getData().spanId, span);
    return span;
  }

  // End and record a span
  endSpan(span: Span): SpanData {
    const data = span.end();
    this.activeSpans.delete(data.spanId);
    this.completedSpans.push(data);

    // Keep only last 1000 completed spans in memory
    if (this.completedSpans.length > 1000) {
      this.completedSpans = this.completedSpans.slice(-1000);
    }

    return data;
  }

  // Execute function within a span
  async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    context?: Partial<TraceContext>,
    attributes?: Record<string, unknown>
  ): Promise<T> {
    const span = this.startSpan(name, context, attributes);

    try {
      const result = await fn(span);
      span.setStatus(SpanStatus.OK);
      return result;
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.endSpan(span);
    }
  }

  // Synchronous version
  withSpanSync<T>(
    name: string,
    fn: (span: Span) => T,
    context?: Partial<TraceContext>,
    attributes?: Record<string, unknown>
  ): T {
    const span = this.startSpan(name, context, attributes);

    try {
      const result = fn(span);
      span.setStatus(SpanStatus.OK);
      return result;
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.endSpan(span);
    }
  }

  // Get completed spans for debugging
  getCompletedSpans(): SpanData[] {
    return [...this.completedSpans];
  }

  // Get active spans for debugging
  getActiveSpans(): SpanData[] {
    return Array.from(this.activeSpans.values()).map(s => s.getData());
  }

  // Clear completed spans
  clearCompletedSpans(): void {
    this.completedSpans = [];
  }
}

// Default tracer instance
export const tracer = new Tracer('reasonex-core-api');

export default tracer;
```

========================================
SECTION 16: IMPLEMENTATION GAP ANALYSIS
========================================

### What EXISTS (Implemented):

1. **Core API (TypeScript/Express on Railway)**
   - ✅ 6 API routes: /lock, /score, /validate, /tree, /detect, /route
   - ✅ 7 Engines: LockManager, RuleEngine, Validator, TreeBuilder, ChangeDetector, TierRouter, ExplanationGenerator
   - ✅ Winston logger with trace context
   - ✅ OpenTelemetry-style tracer
   - ✅ investment-v1 rule set configuration
   - ✅ Deployed and accessible at https://reasonex-core-api-production.up.railway.app

2. **n8n Nodes Package (TypeScript)**
   - ✅ 7 nodes: ReasonexLock, ReasonexRuleEngine, ReasonexValidation, ReasonexTreeBuilder, ReasonexChangeDetector, ReasonexReviewRouter, ReasonexExplanation
   - ✅ ReasonexApi credentials definition
   - ✅ API client library
   - ✅ SVG icons for each node
   - ✅ Built and ready for npm link

### What is MISSING (Not Implemented):

1. **Database**
   - ❌ No database whatsoever
   - ❌ No persistence of locks, scores, validation results
   - ❌ No audit trail
   - ❌ No schema.sql or migrations

2. **n8n Workflows**
   - ❌ No sample workflow JSON files
   - ❌ No investment analysis workflow
   - ❌ No demonstration workflows

3. **Additional Verticals**
   - ❌ Only investment-v1 rule set exists
   - ❌ No legal-costs-v1 rule set
   - ❌ No healthcare or insurance configurations

4. **Python Microservices (from original spec)**
   - ❌ No Python code at all
   - ❌ Implementation is 100% TypeScript (spec mentioned converting FROM Python)
   - This may be intentional (hybrid architecture uses server-side API instead)

5. **Tests**
   - ❌ No unit tests
   - ❌ No integration tests
   - Only a simple shell script test-api.sh

6. **Some Spec Features**
   - ❌ BLAKE3 hash algorithm (using SHA512 instead)
   - ❌ Source Verification Depth setting
   - ❌ Guidance Profile for Tree Builder
   - ❌ Configurable tier/escalation rules in UI

### Files Count Summary

| Category | Count |
|----------|-------|
| TypeScript source files (.ts) | ~30 |
| Compiled JavaScript (.js) | ~30 |
| SVG icons | 7 |
| JSON configs | 2 |
| Markdown docs | 3 |
| SQL files | 0 |
| Python files | 0 |
| Test files | 0 |
| Workflow files | 0 |

---

**END OF PHASE 0 STATUS DUMP**
