# Standard Laptop Automation (ServiceNow)

Order **Standard Laptop** > approver approves > a Catalog Task
**"Laptop needs to be configured"** is created and assigned to the **Hardware** group.

Flow Designer flows cannot be created from JS/CSV files, so this project implements the same
logic with three Business Rules (plain server-side JavaScript) that are installed by background scripts.
The manual Flow Designer version is in `docs/flow_designer_manual_steps.md`.

## Folder layout
```
data/                 CSV inputs (hardware team, test orders)
business_rules/       The 3 rules as readable source (BR1, BR2, BR3)
scripts/              Ready-to-run background scripts (01, 02, 03, 99)
src/ + build.py       Templates + generator (re-run `python build.py` after editing CSV/rules)
docs/                 Project document (.docx) and manual Flow Designer steps
```

## Run it (about 5 minutes)
Use a Personal Developer Instance (developer.servicenow.com) or a sub-production instance, logged in as admin.

For each script below: **All > System Definition > Scripts - Background**, set scope to **Global**,
paste the file contents, click **Run script**.

1. `scripts/01_setup_group_and_catalog_item.js`
   Creates the Hardware group, adds members from `hardware_team.csv` (missing users are skipped),
   creates the Hardware category and Standard Laptop item (or reuses the existing one and clears its workflow/flow).
2. `scripts/02_create_business_rules.js`
   Installs the 3 business rules.
3. `scripts/03_test_order_and_verify.js`
   Places an order per row in `laptop_test_orders.csv`, approves it, and prints PASS/FAIL.
   Expected last line: `RESULT: 3/3 passed`.

## Try it manually (like the original document)
1. **All > Service Catalog > Hardware > Standard Laptop > Order Now**
2. Open the request number > **Approvers** section > right-click the approval > **Approve**
3. Open the **Requested Item** > **Catalog Tasks** > confirm short description and assignment group.

## How it works
| Rule | Table | Trigger | Does |
|---|---|---|---|
| BR1 Request Approval | sc_req_item | after insert | Creates approval for requester's manager (fallback: admin) |
| BR2 Approval Rollup | sysapproval_approver | after update | Sets RITM approval to approved/rejected |
| BR3 Create Configuration Task | sc_req_item | after update (approval -> approved) | Creates catalog task, Hardware group, no duplicates |

This also fixes the source document's timing issue: the task is created only after approval.

## Customising
- Team members: edit `data/hardware_team.csv`, run `python build.py`, re-run script 01.
- Test cases: edit `data/laptop_test_orders.csv`, run `python build.py`.
- Task text: change `SHORT_DESC` in `business_rules/BR3_create_catalog_task.js`, rebuild, re-run script 02.

## Remove
Run `scripts/99_cleanup.js` to delete the business rules.

## Notes
- If you attach the Flow Designer flow to the item as well, run 99_cleanup first, otherwise you will get two tasks.
- Scripts use ES5 syntax (ServiceNow's Rhino engine) and are safe to re-run.
- Test script uses the legacy `Cart` API; if your release lacks it, use the manual test above.
