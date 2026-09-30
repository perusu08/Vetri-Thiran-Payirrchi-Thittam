/*
 * 02 - Creates (or updates) the three Business Rules that implement the automation.
 * Run in: All > System Definition > Scripts - Background (scope: Global). Safe to re-run.
 */
(function () {
    var RULES = [
        { name: 'Standard Laptop - Request Approval',          table: 'sc_req_item',          insert: true,  update: false, order: 200, script: "// Business Rule: Standard Laptop - Request Approval\n// Table: sc_req_item | When: after | Insert: true\n(function executeRule(current, previous /*null when async*/) {\n    if (current.cat_item.getDisplayValue() != 'Standard Laptop') return;\n\n    // Approver = requester's manager, fallback to admin\n    var approverId = current.request.requested_for.manager.toString();\n    if (!approverId) {\n        var adm = new GlideRecord('sys_user');\n        if (adm.get('user_name', 'admin')) approverId = adm.getUniqueValue();\n    }\n    if (!approverId) {\n        gs.warn('Standard Laptop: no approver found for ' + current.number);\n        return;\n    }\n\n    // Do not create duplicate approvals\n    var existing = new GlideRecord('sysapproval_approver');\n    existing.addQuery('sysapproval', current.getUniqueValue());\n    existing.query();\n    if (existing.hasNext()) return;\n\n    var appr = new GlideRecord('sysapproval_approver');\n    appr.initialize();\n    appr.sysapproval = current.getUniqueValue();\n    appr.approver = approverId;\n    appr.state = 'requested';\n    appr.comments = 'Auto-created approval for Standard Laptop request';\n    appr.insert();\n\n    var ritm = new GlideRecord('sc_req_item');\n    if (ritm.get(current.getUniqueValue())) {\n        ritm.approval = 'requested';\n        ritm.setWorkflow(false);\n        ritm.update();\n    }\n})(current, previous);\n" },
        { name: 'Standard Laptop - Approval Rollup',           table: 'sysapproval_approver', insert: false, update: true,  order: 200, script: "// Business Rule: Standard Laptop - Approval Rollup\n// Table: sysapproval_approver | When: after | Update: true\n(function executeRule(current, previous /*null when async*/) {\n    var approved = current.state.changesTo('approved');\n    var rejected = current.state.changesTo('rejected');\n    if (!approved && !rejected) return;\n\n    var ritm = new GlideRecord('sc_req_item');\n    if (!ritm.get(current.sysapproval.toString())) return;\n    if (ritm.cat_item.getDisplayValue() != 'Standard Laptop') return;\n\n    if (rejected) {\n        ritm.approval = 'rejected';\n        ritm.update();\n        return;\n    }\n\n    // Approve only when no other approvals are still pending\n    var pending = new GlideRecord('sysapproval_approver');\n    pending.addQuery('sysapproval', ritm.getUniqueValue());\n    pending.addQuery('state', 'requested');\n    pending.query();\n    if (pending.hasNext()) return;\n\n    if (ritm.getValue('approval') != 'approved') {\n        ritm.approval = 'approved';\n        ritm.update();\n    }\n})(current, previous);\n" },
        { name: 'Standard Laptop - Create Configuration Task', table: 'sc_req_item',          insert: false, update: true,  order: 300, script: "// Business Rule: Standard Laptop - Create Configuration Task\n// Table: sc_req_item | When: after | Update: true\n// Scripted equivalent of the Flow Designer \"Create Catalog Task\" action.\n(function executeRule(current, previous /*null when async*/) {\n    if (!current.approval.changesTo('approved')) return;\n    if (current.cat_item.getDisplayValue() != 'Standard Laptop') return;\n\n    var SHORT_DESC = 'Laptop needs to be configured';\n\n    // Avoid duplicate tasks\n    var dup = new GlideRecord('sc_task');\n    dup.addQuery('request_item', current.getUniqueValue());\n    dup.addQuery('short_description', SHORT_DESC);\n    dup.query();\n    if (dup.hasNext()) return;\n\n    var grp = new GlideRecord('sys_user_group');\n    var groupId = grp.get('name', 'Hardware') ? grp.getUniqueValue() : '';\n\n    var task = new GlideRecord('sc_task');\n    task.initialize();\n    task.request_item = current.getUniqueValue();\n    task.request = current.request;\n    task.short_description = SHORT_DESC;\n    task.description = SHORT_DESC;\n    task.assignment_group = groupId;\n    task.insert();\n})(current, previous);\n" }
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
