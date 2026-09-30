# Flow Designer version (manual build)

Use this instead of the business rules (run scripts/99_cleanup.js first).

## Milestone 1 - Flow
1. All > Flow Designer > New > Flow.
2. Name: `Standard Laptop Task`; Application: Global; Run as: System User; Submit.
3. Trigger: Service Catalog (filter to the Standard Laptop item) > Done.
4. Add action: Ask For Approval (approver = requester's manager). Only continue when Approved.
5. Add action: Create Catalog Task
   - Request Item: drag Requested Item from the trigger
   - Short description: `Laptop needs to be configured`
   - Description: `Laptop needs to be configured`
   - Assignment group: `Hardware`
6. Save > Activate.

## Milestone 2 - Attach to item
All > Maintain Items > Standard Laptop > Process Engine tab: remove other automation, add the flow, Save.

## Milestone 3 - Test
Service Catalog > Hardware > Standard Laptop > Order Now > approve in Approvers > check Catalog Tasks on the RITM.
