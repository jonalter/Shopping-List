var win = Titanium.UI.currentWindow;
win.backgroundColor = '#13386c';
var navGroup = win.navGroup;

var locName = win.locName;
var locId = win.locId;
var data = [];

var myLabel = Titanium.UI.createLabel({
	color: '#fff',
	text: locName,
	top: 10,
	width: 'auto',
	height: 'auto'
});

var infoLabel = Titanium.UI.createLabel({
	color: '#fff',
	text: 'more info about this location',
	top: 50,
	width: 'auto',
	height: 'auto'
});

// Load Items by Location
var refreshItems = function () {
	var itemId, itemName;
	var db = Ti.Database.install('shoppingDB.sql', '');
	var itemRS = db.execute('SELECT id, name FROM item WHERE location_id=(?) ORDER BY name', locId); 
 
	while (itemRS.isValidRow()) { 
		itemId = itemRS.fieldByName('id'); 
		itemName = itemRS.fieldByName('name');
		data.push({
			title: itemName, 
			hasChild: true, 
			test: 'viewitem.js', 
			itemId: itemId
		}); 
		Ti.API.info(itemId + ' ' + itemName); 
		itemRS.next(); 
	} 

	itemRS.close(); 	
	db.close();
};

refreshItems();

var tableview = Ti.UI.createTableView({
	data: data,
	editable: false
});
tableview.addEventListener('click', function (e) {
	if (e.rowData.test)	{
		var locationWindow = Titanium.UI.createWindow({
		 	url: e.rowData.test,
			title: e.rowData.title
		});
		locationWindow.itemName = e.rowData.title;
		locationWindow.itemId = e.rowData.itemId;
		locationWindow.navGroup = navGroup;
		navGroup.open(locationWindow);
	}
});

// Add UI elements to window
win.add(tableview);
