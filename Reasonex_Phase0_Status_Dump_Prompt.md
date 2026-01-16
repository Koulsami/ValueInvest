# Phase 0: Current State Dump

## Objective

Dump ALL information about the current Reasonex implementation. No analysis, no fixes - just show everything that exists. This output will be reviewed by the architect to understand the actual state.

---

## Instructions

Execute ALL commands below and capture the COMPLETE output. Do not summarize or truncate. If a command fails, show the error message.

---

## SECTION 1: Repository Structure

```bash
# 1.1 Show current working directory
pwd

# 1.2 Complete file tree (all files, with sizes)
find . -type f -exec ls -lh {} \; 2>/dev/null | head -200

# 1.3 Alternative: tree command if available
tree -L 4 --filelimit 50 2>/dev/null || find . -type d | head -50

# 1.4 Count files by extension
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

---

## SECTION 2: Package Dependencies

```bash
# 2.1 Node.js package.json (if exists)
echo "=== package.json ==="
cat package.json 2>/dev/null || echo "NOT FOUND"

# 2.2 Python requirements (if exists)
echo "=== requirements.txt ==="
cat requirements.txt 2>/dev/null || cat core-api/requirements.txt 2>/dev/null || cat api/requirements.txt 2>/dev/null || echo "NOT FOUND"

# 2.3 Docker compose (if exists)
echo "=== docker-compose.yml ==="
cat docker-compose.yml 2>/dev/null || cat docker-compose.yaml 2>/dev/null || echo "NOT FOUND"
```

---

## SECTION 3: Environment Configuration

```bash
# 3.1 Environment files (show structure, mask secrets)
echo "=== .env files found ==="
find . -name ".env*" -type f 2>/dev/null

# 3.2 Show .env structure (keys only, not values)
echo "=== .env keys ==="
cat .env 2>/dev/null | grep -v "^#" | cut -d'=' -f1 || echo "NOT FOUND"

# 3.3 Show any config files
echo "=== Config files ==="
find . -name "config.*" -o -name "*.config.*" -o -name "settings.*" 2>/dev/null | head -20
```

---

## SECTION 4: Database Files

```bash
# 4.1 Find SQL files
echo "=== SQL files ==="
find . -name "*.sql" -type f 2>/dev/null

# 4.2 Show schema file content (if exists)
echo "=== schema.sql content ==="
cat **/schema.sql 2>/dev/null || cat database/schema.sql 2>/dev/null || cat db/schema.sql 2>/dev/null || echo "NOT FOUND"

# 4.3 Show migration files
echo "=== Migration files ==="
find . -path "*migration*" -name "*.sql" -o -path "*migration*" -name "*.py" 2>/dev/null

# 4.4 Database connection test (if psql available)
echo "=== Database connection test ==="
psql --version 2>/dev/null || echo "psql not available"
```

---

## SECTION 5: n8n Node Files

For each node directory, show the main file content:

```bash
# 5.1 List all node directories
echo "=== Node directories ==="
find . -type d -name "*Reasonex*" 2>/dev/null

# 5.2 ReasonexLock
echo "=== ReasonexLock.node.ts ==="
find . -name "ReasonexLock.node.ts" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

# 5.3 ReasonexRuleEngine
echo "=== ReasonexRuleEngine.node.ts ==="
find . -name "ReasonexRuleEngine.node.ts" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

# 5.4 ReasonexValidation
echo "=== ReasonexValidation.node.ts ==="
find . -name "ReasonexValidation.node.ts" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

# 5.5 ReasonexTreeBuilder
echo "=== ReasonexTreeBuilder.node.ts ==="
find . -name "ReasonexTreeBuilder.node.ts" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

# 5.6 ReasonexChangeDetector
echo "=== ReasonexChangeDetector.node.ts ==="
find . -name "ReasonexChangeDetector.node.ts" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

# 5.7 ReasonexReviewRouter
echo "=== ReasonexReviewRouter.node.ts ==="
find . -name "ReasonexReviewRouter.node.ts" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

# 5.8 ReasonexExplanation
echo "=== ReasonexExplanation.node.ts ==="
find . -name "ReasonexExplanation.node.ts" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"
```

---

## SECTION 6: Core API Files

```bash
# 6.1 Find all Python API files
echo "=== Python API files ==="
find . -name "*.py" -type f 2>/dev/null | head -30

# 6.2 Main API entry point
echo "=== main.py or app.py ==="
find . -name "main.py" -exec cat {} \; 2>/dev/null || find . -name "app.py" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

# 6.3 Routes directory
echo "=== Route files ==="
find . -path "*route*" -name "*.py" 2>/dev/null

# 6.4 Show each route file
echo "=== lock route ==="
find . -name "*lock*.py" -path "*route*" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

echo "=== rules route ==="
find . -name "*rule*.py" -path "*route*" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

echo "=== validation route ==="
find . -name "*valid*.py" -path "*route*" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"

echo "=== tree route ==="
find . -name "*tree*.py" -path "*route*" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"
```

---

## SECTION 7: Credentials & Auth

```bash
# 7.1 n8n credentials file
echo "=== Credentials files ==="
find . -path "*credentials*" -name "*.ts" 2>/dev/null

# 7.2 Show credentials file content
echo "=== ReasonexApi.credentials.ts ==="
find . -name "*Reasonex*credentials*.ts" -exec cat {} \; 2>/dev/null || echo "NOT FOUND"
```

---

## SECTION 8: Test Files

```bash
# 8.1 Find all test files
echo "=== Test files ==="
find . -name "*test*" -o -name "*spec*" 2>/dev/null | grep -E "\.(ts|py|js)$" | head -20

# 8.2 Show test file contents (if any)
echo "=== Test file contents ==="
find . -name "*test*.py" -exec echo "--- {} ---" \; -exec cat {} \; 2>/dev/null | head -100
find . -name "*test*.ts" -exec echo "--- {} ---" \; -exec cat {} \; 2>/dev/null | head -100
```

---

## SECTION 9: Documentation

```bash
# 9.1 Find documentation files
echo "=== Documentation files ==="
find . -name "*.md" -type f 2>/dev/null

# 9.2 Show README
echo "=== README.md ==="
cat README.md 2>/dev/null || echo "NOT FOUND"
```

---

## SECTION 10: Deployment Info

```bash
# 10.1 Railway config
echo "=== railway.json or railway.toml ==="
cat railway.json 2>/dev/null || cat railway.toml 2>/dev/null || echo "NOT FOUND"

# 10.2 Dockerfile
echo "=== Dockerfile ==="
cat Dockerfile 2>/dev/null || echo "NOT FOUND"

# 10.3 Any CI/CD config
echo "=== CI/CD config ==="
find . -name "*.yml" -path "*github*" -o -name "*.yaml" -path "*github*" 2>/dev/null
cat .github/workflows/*.yml 2>/dev/null || echo "NOT FOUND"
```

---

## SECTION 11: Git Status

```bash
# 11.1 Git status
echo "=== Git status ==="
git status 2>/dev/null || echo "Not a git repository"

# 11.2 Recent commits
echo "=== Recent commits ==="
git log --oneline -20 2>/dev/null || echo "No git history"

# 11.3 Remote URLs
echo "=== Git remotes ==="
git remote -v 2>/dev/null || echo "No remotes"
```

---

## SECTION 12: Running Services Check

```bash
# 12.1 Check if any services are running
echo "=== Running processes ==="
ps aux | grep -E "(node|python|postgres)" | grep -v grep || echo "No relevant processes"

# 12.2 Check listening ports
echo "=== Listening ports ==="
netstat -tlnp 2>/dev/null || ss -tlnp 2>/dev/null || echo "Cannot check ports"

# 12.3 Docker containers
echo "=== Docker containers ==="
docker ps 2>/dev/null || echo "Docker not available or not running"
```

---

## OUTPUT FORMAT

Create a single file called `PHASE0_STATUS_DUMP.md` containing ALL output from the above commands, organized by section.

**Important**:
- Do NOT truncate output (show everything)
- Do NOT analyze or comment (just dump raw data)
- Do NOT skip any section (even if empty, show "NOT FOUND")
- Include error messages if commands fail

---

## After Completion

Share the complete `PHASE0_STATUS_DUMP.md` file with the architect for review.

The architect will analyze this dump and:
1. Understand what actually exists
2. Identify what's missing
3. Create the appropriate Phase 1 prompt based on actual state

---

**END OF PHASE 0 PROMPT**
