// Business Rule: Standard Laptop - Request Approval
// Table: sc_req_item | When: after | Insert: true
(function executeRule(current, previous /*null when async*/) {
    if (current.cat_item.getDisplayValue() != 'Standard Laptop') return;

    // Approver = requester's manager, fallback to admin
    var approverId = current.request.requested_for.manager.toString();
    if (!approverId) {
        var adm = new GlideRecord('sys_user');
        if (adm.get('user_name', 'admin')) approverId = adm.getUniqueValue();
    }
    if (!approverId) {
        gs.warn('Standard Laptop: no approver found for ' + current.number);
        return;
    }

    // Do not create duplicate approvals
    var existing = new GlideRecord('sysapproval_approver');
    existing.addQuery('sysapproval', current.getUniqueValue());
    existing.query();
    if (existing.hasNext()) return;

    var appr = new GlideRecord('sysapproval_approver');
    appr.initialize();
    appr.sysapproval = current.getUniqueValue();
    appr.approver = approverId;
    appr.state = 'requested';
    appr.comments = 'Auto-created approval for Standard Laptop request';
    appr.insert();

    var ritm = new GlideRecord('sc_req_item');
    if (ritm.get(current.getUniqueValue())) {
        ritm.approval = 'requested';
        ritm.setWorkflow(false);
        ritm.update();
    }
})(current, previous);
