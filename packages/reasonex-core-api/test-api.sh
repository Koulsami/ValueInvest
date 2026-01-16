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
