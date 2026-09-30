// Business Rule: Standard Laptop - Create Configuration Task
// Table: sc_req_item | When: after | Update: true
// Scripted equivalent of the Flow Designer "Create Catalog Task" action.
(function executeRule(current, previous /*null when async*/) {
    if (!current.approval.changesTo('approved')) return;
    if (current.cat_item.getDisplayValue() != 'Standard Laptop') return;

    var SHORT_DESC = 'Laptop needs to be configured';

    // Avoid duplicate tasks
    var dup = new GlideRecord('sc_task');
    dup.addQuery('request_item', current.getUniqueValue());
    dup.addQuery('short_description', SHORT_DESC);
    dup.query();
    if (dup.hasNext()) return;

    var grp = new GlideRecord('sys_user_group');
    var groupId = grp.get('name', 'Hardware') ? grp.getUniqueValue() : '';

    var task = new GlideRecord('sc_task');
    task.initialize();
    task.request_item = current.getUniqueValue();
    task.request = current.request;
    task.short_description = SHORT_DESC;
    task.description = SHORT_DESC;
    task.assignment_group = groupId;
    task.insert();
})(current, previous);
