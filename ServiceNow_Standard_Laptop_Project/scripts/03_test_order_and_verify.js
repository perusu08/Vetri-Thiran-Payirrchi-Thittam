/*
 * 03 - End-to-end test. Orders Standard Laptop for each CSV row, approves it,
 * then checks the catalog task (short description + Hardware group).
 * Run in: All > System Definition > Scripts - Background (scope: Global).
 */
(function () {
    var TEST_CSV = "test_id,quantity,expected_short_description,expected_group\nTC01,1,Laptop needs to be configured,Hardware\nTC02,1,Laptop needs to be configured,Hardware\nTC03,2,Laptop needs to be configured,Hardware\n";

    function parseCsv(text) {
        var lines = text.split('\n'), out = [], header = null;
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i].replace(/^\s+|\s+$/g, '');
            if (!l) continue;
            var cols = l.split(',');
            if (!header) { header = cols; continue; }
            var row = {};
            for (var j = 0; j < header.length; j++) row[header[j]] = cols[j];
            out.push(row);
        }
        return out;
    }

    var item = new GlideRecord('sc_cat_item');
    if (!item.get('name', 'Standard Laptop')) { gs.print('FAIL: run 01_setup first'); return; }

    var tests = parseCsv(TEST_CSV), pass = 0;

    for (var t = 0; t < tests.length; t++) {
        var tc = tests[t], problems = [];

        // 1. Place order through the cart (same as clicking Order Now)
        var cart = new Cart();
        cart.addItem(item.getUniqueValue(), parseInt(tc.quantity, 10) || 1);
        var req = cart.placeOrder();

        // 2. Find requested item
        var ritm = new GlideRecord('sc_req_item');
        ritm.addQuery('request', req.getUniqueValue());
        ritm.query();
        if (!ritm.next()) { gs.print(tc.test_id + ' FAIL: no RITM'); continue; }

        // 3. Approve (same as right-click > Approve in Approvers section)
        var appr = new GlideRecord('sysapproval_approver');
        appr.addQuery('sysapproval', ritm.getUniqueValue());
        appr.query();
        if (!appr.next()) problems.push('no approval record');
        else { appr.state = 'approved'; appr.update(); }

        // 4. Verify catalog task
        var task = new GlideRecord('sc_task');
        task.addQuery('request_item', ritm.getUniqueValue());
        task.query();
        if (!task.next()) problems.push('no catalog task');
        else {
            if (task.getValue('short_description') != tc.expected_short_description)
                problems.push('short description = ' + task.getValue('short_description'));
            if (task.assignment_group.getDisplayValue() != tc.expected_group)
                problems.push('group = ' + task.assignment_group.getDisplayValue());
        }

        if (problems.length == 0) { pass++; gs.print(tc.test_id + ' PASS  ' + req.number + ' / ' + ritm.number + ' -> ' + task.number); }
        else gs.print(tc.test_id + ' FAIL  ' + req.number + ': ' + problems.join('; '));
    }
    gs.print('RESULT: ' + pass + '/' + tests.length + ' passed');
})();
