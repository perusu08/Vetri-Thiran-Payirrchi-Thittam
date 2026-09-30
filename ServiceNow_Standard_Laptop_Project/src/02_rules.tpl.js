/*
 * 02 - Creates (or updates) the three Business Rules that implement the automation.
 * Run in: All > System Definition > Scripts - Background (scope: Global). Safe to re-run.
 */
(function () {
    var RULES = [
        { name: 'Standard Laptop - Request Approval',          table: 'sc_req_item',          insert: true,  update: false, order: 200, script: __BR1__ },
        { name: 'Standard Laptop - Approval Rollup',           table: 'sysapproval_approver', insert: false, update: true,  order: 200, script: __BR2__ },
        { name: 'Standard Laptop - Create Configuration Task', table: 'sc_req_item',          insert: false, update: true,  order: 300, script: __BR3__ }
    ];

    for (var i = 0; i < RULES.length; i++) {
        var r = RULES[i];
        var gr = new GlideRecord('sys_script');
        var exists = gr.get('name', r.name);
        if (!exists) gr.initialize();
        gr.name = r.name;
        gr.collection = r.table;
        gr.when = 'after';
        gr.order = r.order;
        gr.active = true;
        gr.advanced = true;
        gr.action_insert = r.insert;
        gr.action_update = r.update;
        gr.action_delete = false;
        gr.action_query = false;
        gr.script = r.script;
        gr.description = 'Part of ServiceNow Standard Laptop project';
        if (exists) { gr.update(); gs.print('Updated rule: ' + r.name); }
        else { gr.insert(); gs.print('Created rule: ' + r.name); }
    }
    gs.print('BUSINESS RULES READY');
})();
