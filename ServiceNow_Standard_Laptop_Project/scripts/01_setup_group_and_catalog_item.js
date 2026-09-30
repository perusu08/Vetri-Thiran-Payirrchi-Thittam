/*
 * 01 - Setup: Hardware group, team members (from CSV), Hardware category, Standard Laptop item.
 * Run in: All > System Definition > Scripts - Background (scope: Global). Safe to re-run.
 */
(function () {
    var TEAM_CSV = "user_name\nbeth.anglin\nluke.wilson\ndavid.loo\ncharlie.whitherspoon\nbud.richman\n";

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

    // 1. Hardware group
    var grp = new GlideRecord('sys_user_group');
    if (!grp.get('name', 'Hardware')) {
        grp.initialize();
        grp.name = 'Hardware';
        grp.description = 'Hardware team - configures standard laptops';
        grp.insert();
        gs.print('Created group: Hardware');
    } else {
        gs.print('Group exists: Hardware');
    }

    // 2. Group members from CSV
    var team = parseCsv(TEAM_CSV);
    for (var i = 0; i < team.length; i++) {
        var u = new GlideRecord('sys_user');
        if (!u.get('user_name', team[i].user_name)) {
            gs.print('  user not found, skipped: ' + team[i].user_name);
            continue;
        }
        var m = new GlideRecord('sys_user_grmember');
        m.addQuery('group', grp.getUniqueValue());
        m.addQuery('user', u.getUniqueValue());
        m.query();
        if (!m.hasNext()) {
            m.initialize();
            m.group = grp.getUniqueValue();
            m.user = u.getUniqueValue();
            m.insert();
            gs.print('  added member: ' + team[i].user_name);
        }
    }

    // 3. Catalog + Hardware category
    var cat = new GlideRecord('sc_catalog');
    cat.get('title', 'Service Catalog');

    var category = new GlideRecord('sc_category');
    if (!category.get('title', 'Hardware')) {
        category.initialize();
        category.title = 'Hardware';
        category.sc_catalog = cat.getUniqueValue();
        category.active = true;
        category.insert();
        gs.print('Created category: Hardware');
    }

    // 4. Standard Laptop item (reuse existing if present)
    var item = new GlideRecord('sc_cat_item');
    item.addQuery('name', 'Standard Laptop');
    item.query();
    var isNew = !item.next();
    if (isNew) item.initialize();

    item.name = 'Standard Laptop';
    item.short_description = 'Standard issue laptop for employees';
    item.description = 'Standard laptop. A configuration task is created for the Hardware team after approval.';
    item.category = category.getUniqueValue();
    item.sc_catalogs = cat.getUniqueValue();
    item.active = true;
    // Milestone 2: remove other automations so only this project's rules run
    if (item.isValidField('workflow')) item.workflow = '';
    if (item.isValidField('flow')) item.flow = '';
    if (isNew) { item.insert(); gs.print('Created catalog item: Standard Laptop'); }
    else { item.update(); gs.print('Updated catalog item: Standard Laptop (workflow/flow cleared)'); }

    gs.print('SETUP COMPLETE');
})();
