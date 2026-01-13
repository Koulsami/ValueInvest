# Looker Studio Tutorial - Click-by-Click Instructions

## Prerequisites
- Google account (Gmail)
- ~30 minutes

---

# PART 1: SET UP GOOGLE SHEET (10 minutes)

## Step 1.1: Create New Google Sheet

1. Open your browser
2. Go to: **https://sheets.google.com**
3. Sign in with your Google account if prompted
4. Click the **+ Blank** button (big plus sign, top left)
5. A new spreadsheet opens

## Step 1.2: Name Your Spreadsheet

1. Click on "Untitled spreadsheet" at the top left
2. Type: **ValueInvest_StockData**
3. Press Enter (it auto-saves)

## Step 1.3: Import Sample Data

1. Go to menu: **File** → **Import**
2. Click **Upload** tab
3. Click **Browse** button
4. Find and select the file: `sample_stock_data.csv` from your computer
   - Location: `/home/amee/ValueInvest/dashboard/looker-studio/sample_stock_data.csv`
5. In the import dialog:
   - Import location: **Replace current sheet**
   - Separator type: **Comma**
   - Convert text to numbers: **Yes**
6. Click **Import data**

## Step 1.4: Verify Data Imported Correctly

You should see:
- Row 1: Headers (symbol, company_name, sector, etc.)
- Rows 2-41: Stock data (AAPL, MSFT, JNJ, etc.)
- 34 columns total (A through AH)

**If something looks wrong:** Delete everything and re-import.

## Step 1.5: Rename the Sheet Tab

1. At the bottom, right-click on "Sheet1" tab
2. Click **Rename**
3. Type: **stocks**
4. Press Enter

**CHECKPOINT: Your Google Sheet is ready. Keep this tab open.**

---

# PART 2: CREATE LOOKER STUDIO REPORT (5 minutes)

## Step 2.1: Open Looker Studio

1. Open a new browser tab
2. Go to: **https://lookerstudio.google.com**
3. Sign in with same Google account

## Step 2.2: Create New Report

1. Click **+ Create** button (top left)
2. Click **Report**
3. A blank report opens with "Add data to report" popup

## Step 2.3: Connect Google Sheets Data

1. In the "Add data to report" popup, click **Google Sheets**
2. You'll see a list of your spreadsheets
3. Find and click **ValueInvest_StockData**
4. Click on the **stocks** sheet (should be only option)
5. Click **Add** button (bottom right)
6. If popup asks "Add to report?", click **Add to report**

## Step 2.4: Verify Connection

You should see:
- A blank report canvas
- On the right side: Data panel showing your fields (symbol, company_name, etc.)

**CHECKPOINT: Report is connected to your data.**

---

# PART 3: SET UP THE PAGE (2 minutes)

## Step 3.1: Set Page Size

1. Click anywhere on the blank canvas
2. On the right side, find **Page** settings (or go to **File → Page settings**)
3. Set:
   - Width: **1200**
   - Height: **900**
4. Press Enter

## Step 3.2: Add Title

1. Go to menu: **Insert** → **Text**
2. Click and drag on the canvas (top area) to create text box
3. Type: **US Value Investing Dashboard**
4. With text selected, on the right panel:
   - Font size: **24**
   - Bold: **Click B**
   - Color: Dark gray or black

## Step 3.3: Position Title

1. Drag the text box to top-left of the page
2. Leave space below for filters

---

# PART 4: ADD FILTER CONTROLS (10 minutes)

## Step 4.1: Add Sector Filter

1. Go to menu: **Insert** → **Drop-down list**
2. Click and drag on the canvas (below title, left side)
3. Make it about 150px wide
4. On the right panel, under **Data**:
   - Control field: Click and select **sector**
5. Under **Style**:
   - Label: Type **Sector**

## Step 4.2: Add Exchange Filter

1. **Insert** → **Drop-down list**
2. Draw next to the Sector filter
3. Control field: **exchange**
4. Label: **Exchange**

## Step 4.3: Add Score Category Filter

1. **Insert** → **Drop-down list**
2. Draw next to Exchange filter
3. Control field: **score_category**
4. Label: **Score Rating**

## Step 4.4: Add Profitable Filter

1. **Insert** → **Drop-down list**
2. Draw next to previous filter
3. Control field: **is_profitable**
4. Label: **Profitable**

## Step 4.5: Add Dividend Filter

1. **Insert** → **Drop-down list**
2. Draw next to previous filter
3. Control field: **is_dividend_paying**
4. Label: **Pays Dividend**

**Your filter row should look like:**
```
[Sector ▼] [Exchange ▼] [Score Rating ▼] [Profitable ▼] [Pays Dividend ▼]
```

---

# PART 5: ADD THE MAIN DATA TABLE (10 minutes)

## Step 5.1: Insert Table

1. Go to menu: **Insert** → **Table**
2. Click and drag on the canvas (large area below filters)
3. Make it about 900px wide and 400px tall

## Step 5.2: Configure Table Columns

With the table selected, look at right panel under **Data**:

1. **Dimensions** (text columns) - Click **Add dimension** for each:
   - symbol
   - company_name
   - sector

2. **Metrics** (number columns) - Click **Add metric** for each:
   - rank
   - total_score
   - pe_ratio
   - roe
   - dividend_yield
   - debt_equity
   - market_cap

## Step 5.3: Remove Extra Columns

If there are any columns you didn't add (like "Record Count"), click the X next to them to remove.

## Step 5.4: Reorder Columns

Drag the fields in this order (top to bottom = left to right in table):
1. rank
2. symbol
3. company_name
4. total_score
5. pe_ratio
6. roe
7. dividend_yield
8. debt_equity
9. market_cap
10. sector

## Step 5.5: Set Default Sort

1. Under **Data**, find **Sort**
2. Click **Add sort**
3. Select **rank**
4. Direction: **Ascending** (1, 2, 3...)

## Step 5.6: Style the Table

Click **Style** tab on right panel:

1. **Table Header**:
   - Background: Click color → select dark blue (#1F2937)
   - Font color: White
   - Font size: 12

2. **Table Body**:
   - Font size: 11
   - Check **Wrap text**: OFF
   - Check **Row numbers**: OFF

3. **Table Colors**:
   - Check **Alternate row colors**: ON

4. **Pagination**:
   - Rows per page: **20**

## Step 5.7: Rename Column Headers

1. In the **Data** tab, click on each metric
2. Click the pencil icon or the field name
3. Rename:
   - total_score → **Score**
   - pe_ratio → **P/E**
   - roe → **ROE %**
   - dividend_yield → **Div Yield**
   - debt_equity → **D/E**
   - market_cap → **Market Cap**

---

# PART 6: ADD SCORE COLORS (5 minutes)

## Step 6.1: Add Conditional Formatting to Score

1. Click on your table to select it
2. In **Style** tab, scroll down to find **Conditional formatting**
3. Click **Add**

## Step 6.2: Create Rules

Add these rules one by one:

**Rule 1: Excellent (Green)**
- Field: **total_score**
- Condition: **Greater than or equal to**
- Value: **85**
- Format: Background color → Green (#10B981)
- Click **Save**

**Rule 2: Good (Yellow)**
- Click **Add** again
- Field: **total_score**
- Condition: **Between**
- Values: **70** and **84**
- Format: Background color → Yellow (#FCD34D)
- Click **Save**

**Rule 3: Poor (Red)**
- Click **Add** again
- Field: **total_score**
- Condition: **Less than**
- Value: **50**
- Format: Background color → Light Red (#FEE2E2)
- Click **Save**

---

# PART 7: ADD SCORECARDS (5 minutes)

Scorecards show single big numbers (KPIs).

## Step 7.1: Total Stocks Scorecard

1. **Insert** → **Scorecard**
2. Draw small box on right side of page
3. Under **Data**:
   - Metric: **Record Count**
4. Under **Style**:
   - Check **Compact numbers**: ON
   - Label: **Total Stocks**

## Step 7.2: Average Score Scorecard

1. **Insert** → **Scorecard**
2. Draw next to previous
3. Metric: **total_score**
4. Aggregation: Click dropdown → **Average**
5. Label: **Avg Score**
6. Decimal precision: **1**

## Step 7.3: Average P/E Scorecard

1. **Insert** → **Scorecard**
2. Draw next to previous
3. Metric: **pe_ratio**
4. Aggregation: **Average**
5. Label: **Avg P/E**
6. Decimal precision: **1**

## Step 7.4: Average Dividend Yield

1. **Insert** → **Scorecard**
2. Draw next to previous
3. Metric: **dividend_yield**
4. Aggregation: **Average**
5. Label: **Avg Div Yield**
6. Decimal precision: **2** (show as decimal, or format as percent)

---

# PART 8: ADD CHARTS (10 minutes)

## Step 8.1: Score Distribution Bar Chart

1. **Insert** → **Bar chart**
2. Draw on right side, below scorecards (about 300x250px)
3. Under **Data**:
   - Dimension: **score_category**
   - Metric: **Record Count**
4. Under **Style**:
   - Title: **Score Distribution**
   - Show data labels: ON

## Step 8.2: Sector Pie Chart

1. **Insert** → **Pie chart**
2. Draw below the bar chart (about 300x250px)
3. Under **Data**:
   - Dimension: **sector**
   - Metric: **Record Count**
4. Under **Style**:
   - Title: **By Sector**
   - Show legend: Right

---

# PART 9: FINAL LAYOUT ADJUSTMENTS

## Step 9.1: Arrange Components

Drag components to create this layout:

```
┌─────────────────────────────────────────────────────────────┐
│ US Value Investing Dashboard                                │
│ [Sector▼] [Exchange▼] [Score▼] [Profitable▼] [Dividend▼]   │
├─────────────────────────────────────────────────────┬───────┤
│                                                     │ 40    │
│                                                     │Stocks │
│                                                     │───────│
│                 MAIN TABLE                          │ 67.2  │
│                                                     │ Score │
│   Rank│Symbol│Name│Score│P/E│ROE│Div│D/E│Cap│Sector│───────│
│                                                     │ CHART │
│                                                     │ Score │
│                                                     │ Dist  │
│                                                     │───────│
│                                                     │ PIE   │
│                                                     │Sector │
└─────────────────────────────────────────────────────┴───────┘
```

## Step 9.2: Align Elements

1. Select multiple elements: Hold **Shift** and click each
2. Right-click → **Align** → choose alignment option
3. Use **Distribute** to space evenly

---

# PART 10: TEST YOUR DASHBOARD

## Step 10.1: Switch to View Mode

1. Click **View** button (top right, blue button)
2. Your dashboard is now interactive

## Step 10.2: Test Filters

1. Click **Sector** dropdown → select **Technology**
   - Table should show only tech stocks
   - Scorecards should update
   - Charts should update

2. Click **Score Rating** → select **Good**
   - Should filter to scores 70-84

3. Click **Profitable** → select **TRUE**
   - Should hide unprofitable companies

4. Try combining filters

## Step 10.3: Test Table

1. Click column headers to sort
2. Click **P/E** header to sort by P/E ratio
3. Notice score colors (green, yellow, red)

## Step 10.4: Reset Filters

- Click the X on each filter dropdown to clear it
- Or refresh the page

---

# PART 11: SHARE YOUR DASHBOARD

## Step 11.1: Get Shareable Link

1. Click **Share** button (top right)
2. Click **Get report link**
3. Change access to: **Anyone with the link can view**
4. Click **Copy link**

## Step 11.2: Save Link

Save this URL - you can share it or access your dashboard anytime.

---

# DONE!

You now have a working value investing dashboard with:
- 5 filters for screening stocks
- Interactive sortable table
- Color-coded scores
- KPI scorecards
- Distribution charts

---

# TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Data not showing | Check Google Sheet is named correctly, has "stocks" tab |
| Filters not working | Make sure control field matches column name exactly |
| Colors not showing | Check conditional formatting rules are saved |
| Table empty | Remove all filters, check data source connection |
| Can't find field | Check right panel "Data" section, scroll down |

---

# NEXT STEPS

Once your prototype is working:
1. Test with different filter combinations
2. Note what's missing vs your ideal dashboard
3. Decide: Is Looker Studio enough, or need custom app?

To add real stock data later, we'll:
1. Set up FMP API to fetch live data
2. Build n8n workflow to update Google Sheets daily
3. Dashboard auto-refreshes with new data

---

*You did it! You built a value investing dashboard.*
