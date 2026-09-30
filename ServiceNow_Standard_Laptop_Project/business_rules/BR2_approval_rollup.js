// Business Rule: Standard Laptop - Approval Rollup
// Table: sysapproval_approver | When: after | Update: true
(function executeRule(current, previous /*null when async*/) {
    var approved = current.state.changesTo('approved');
    var rejected = current.state.changesTo('rejected');
    if (!approved && !rejected) return;

    var ritm = new GlideRecord('sc_req_item');
    if (!ritm.get(current.sysapproval.toString())) return;
    if (ritm.cat_item.getDisplayValue() != 'Standard Laptop') return;

    if (rejected) {
        ritm.approval = 'rejected';
        ritm.update();
        return;
    }

    // Approve only when no other approvals are still pending
    var pending = new GlideRecord('sysapproval_approver');
    pending.addQuery('sysapproval', ritm.getUniqueValue());
    pending.addQuery('state', 'requested');
    pending.query();
    if (pending.hasNext()) return;

    if (ritm.getValue('approval') != 'approved') {
        ritm.approval = 'approved';
        ritm.update();
    }
})(current, previous);
