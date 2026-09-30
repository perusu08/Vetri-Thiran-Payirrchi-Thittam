/*
 * 99 - Cleanup. Removes the three Business Rules created by 02_create_business_rules.js.
 * Does NOT delete the Hardware group, catalog item, or any test requests.
 * Run in: All > System Definition > Scripts - Background (scope: Global).
 */
(function () {
    var gr = new GlideRecord('sys_script');
    gr.addQuery('name', 'STARTSWITH', 'Standard Laptop - ');
    gr.addQuery('description', 'Part of ServiceNow Standard Laptop project');
    gr.query();
    var n = 0;
    while (gr.next()) { gs.print('Deleting rule: ' + gr.name); gr.deleteRecord(); n++; }
    gs.print('Removed ' + n + ' rule(s)');
})();
