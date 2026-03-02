
const fs = require('fs');
const path = '/Users/rafa/Desktop/OpBy7Cn7 - cafe-moriah.json';

try {
    const rawData = fs.readFileSync(path, 'utf8');
    const data = JSON.parse(rawData);

    console.log("Top level keys:", Object.keys(data));

    if (data.lists) {
        console.log("\nLists sample (first 3):");
        data.lists.slice(0, 3).forEach(list => {
            console.log(`- ID: ${list.id}, Name: ${list.name}`);
        });
    }

    if (data.labels) {
        console.log("\n--- LABELS ---");
        data.labels.forEach(label => {
            console.log(`ID: ${label.id} | Name: ${label.name} | Color: ${label.color}`);
        });
    }

    if (data.members) {
        console.log("\n--- MEMBERS ---");
        data.members.forEach(member => {
            console.log(`ID: ${member.id} | FullName: ${member.fullName} | Username: ${member.username}`);
        });
    }

} catch (e) {
    console.error("Error reading/parsing file:", e);
}
