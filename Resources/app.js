// ShoppingList
// main control window

Titanium.UI.setBackgroundColor('#000');

var itemData = [];
var locationData = [];

var tabGroup = Titanium.UI.createTabGroup({
	barColor: '#336699'
});

// create Items tab and root window
var itemWindowController = Ti.UI.createWindow({
	backgroundColor: '#fff',
	navBarHidden: true
});

var itemWindow = Titanium.UI.createWindow({  
   	title: 'Items',
    backgroundColor: '#fff'
});

var itemTab = Titanium.UI.createTab({  
    icon: 'KS_nav_views.png',
    title: 'Items',
    window: itemWindowController
});

var addItemButton = Titanium.UI.createButton({
	systemButton:Titanium.UI.iPhone.SystemButton.ADD
});

addItemButton.addEventListener('click', function () {
	var createItemWindow = Titanium.UI.createWindow({
	 	url: 'createitem.js',
		title: 'New Item'
	});
	itemNavGroup.open(createItemWindow);
});

// create Locations tab and root window
var locationWindowController = Titanium.UI.createWindow({
	backgroundColor: '#fff',
	navBarHidden: true
});

var locationWindow = Titanium.UI.createWindow({  
    title: 'Locations',
    backgroundColor: '#fff'	
});

var locationTab = Titanium.UI.createTab({  
    icon: 'KS_nav_ui.png',
    title: 'Locations',
    window: locationWindowController
});
var addLocationButton = Titanium.UI.createButton({
	systemButton: Titanium.UI.iPhone.SystemButton.ADD
});
addLocationButton.addEventListener('click', function () {
	// need to go to the add location window here
	var locationWindow = Titanium.UI.createWindow({
	 	url: 'createlocation.js',
		title: 'New Location'
	});
	locationWindow.navGroup = locationNavGroup;
	locationNavGroup.open(locationWindow);
});

// Navigation Groups
var itemNavGroup = Ti.UI.iPhone.createNavigationGroup({
	window: itemWindow
});
itemWindowController.add(itemNavGroup);

var locationNavGroup = Ti.UI.iPhone.createNavigationGroup({
	window: locationWindow
});
locationWindowController.add(locationNavGroup);

//  add tabs
tabGroup.addTab(itemTab);  
tabGroup.addTab(locationTab);  

tabGroup.open({
	transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
});

// Load Table Views
var refreshItems = function(){
	var itemId, itemName, itemDesc;
	var db = Ti.Database.install( 'shoppingDB.sql', '' );
	var itemRS = db.execute('SELECT id, name, description FROM item ORDER BY UPPER(name)'); 
 
	while (itemRS.isValidRow()) { 
		itemId = itemRS.fieldByName('id'); 
		itemName = itemRS.fieldByName('name'); 
		itemDesc = itemRS.fieldByName('description');
		itemData.push({
			title: itemName, 
			hasChild: true, 
			test: 'viewitem.js', 
			itemId: itemId
		}); 
		Ti.API.info(itemId + ' ' + itemName + ' ' + itemDesc); 
		itemRS.next(); 
	} 

	itemRS.close(); 	
	db.close();
};

refreshItems();

var refreshLocations = function(){
	var db = Ti.Database.install('shoppingDB.sql','');
	var itemRS = db.execute('SELECT id, name FROM location ORDER BY UPPER(name)'); 

	while (itemRS.isValidRow()) { 
		var itemId = itemRS.fieldByName('id'); 
			var itemName = itemRS.fieldByName('name'); 
			locationData.push({
				title: itemName, 
				hasChild: true, 
				test: 'viewlocation.js', 
				locId: itemId
			}); 
			Ti.API.info(itemId + ' ' + itemName); 
		itemRS.next(); 
	} 

	itemRS.close(); 	
	db.close();
};

refreshLocations();

// Table Views
var itemTableView = Ti.UI.createTableView({
	data: itemData,
	editable: true
});
itemTableView.addEventListener('delete', function (e) {
	var db = Ti.Database.install('shoppingDB.sql','');
	// check if row exists in table
	var itemRS = db.execute('SELECT id, name FROM item WHERE id=(?)', e.rowData.itemId);
	if (itemRS.rowCount != 0) {
		// delete row from item
		db.execute('DELETE FROM item WHERE id=(?)', e.rowData.itemId);
	} else {
		Ti.API.info('could not find id: ' + e.rowData.itemId + ' in item');
	}
			
	Ti.API.info('deleted: ' + e.rowData.title + 'with id: ' + e.rowData.itemId);
	
	itemRS.close(); 	
	db.close();
});
itemTableView.addEventListener('click', function (e) {
	if (e.rowData.test)	{
		var itemWindow = Titanium.UI.createWindow({
		 	url:e.rowData.test,
			title:e.rowData.title
		});
		itemWindow.itemName = e.rowData.title;
		itemWindow.itemId = e.rowData.itemId;		
		itemWindow.navGroup = itemNavGroup;

		itemNavGroup.open(itemWindow);
	}
});

var locationTableView = Ti.UI.createTableView({
	data:locationData,
	editable:true
});
locationTableView.addEventListener('delete', function (e) {
	var db = Ti.Database.install('shoppingDB.sql', '');
	var locId = e.rowData.locId;
	// check if row exists in table
	var locationRS = db.execute('SELECT id, name FROM location WHERE id=(?)', locId);
	if (locationRS.isValidRow()) {
		// check if reference to it exists in item table
		var itemRS = db.execute('SELECT id FROM item WHERE location_id=(?)', locId);
		if (itemRS.rowCount == 0){
			// delete row from location
			db.execute('DELETE FROM location WHERE id=(?)', locId);
			Ti.API.info('deleted: ' + e.rowData.title);
		} else {
			// add item back into table view because delete failed
			var newLocation = {
				title: e.rowData.title, 
				hasChild: true, 
				test: 'viewlocation.js', 
				locId: locId
			};
			if (locationTableView.data[0].rowCount == e.index) {
				locationTableView.appendRow(newLocation);
			} else {
				locationTableView.insertRowBefore(e.index, newLocation);
			}
			alert('remove all item references to this location and try again');
			Ti.API.info(itemRS.rowCount + ' item references to ' + e.rowData.title);
		}
	} else {
		Ti.API.info('could not find: ' + e.rowData.title + ' with id: ' + e.rowData.locId + ' in location or delete it');
	}
	
	locationRS.close(); 	
	db.close();
});
locationTableView.addEventListener('click', function (e)
{
	if (e.rowData.test)	{
		var locationDetailWindow = Titanium.UI.createWindow({
		 	url: e.rowData.test,
			title: e.rowData.title
		});
		locationDetailWindow.locName = e.rowData.title;
		locationDetailWindow.locId = e.rowData.locId;
		locationDetailWindow.navGroup = locationNavGroup;

		locationNavGroup.open(locationDetailWindow);
	}
});

// inserts item into tableview alphabetically 
var insertItemIntoTableViewArray = function (newItem, tableview) {
	var tableData = tableview.data[0];
	var newData = [];
	if (!tableData){
		Ti.API.info('tabledata not found');
		newData.push(newItem);
	} else {
		Ti.API.info('tabledata FOUND!');
		var j = 0;
		var spotFound = false;
		var tableSize = tableData.rowCount;
		for (var i = 0; i<tableSize; i++) {
			if( tableData.rows[i].title.toUpperCase() > newItem.title.toUpperCase() && !spotFound){
				newData[j] = newItem;
				spotFound = true;
				j++;
			}
			newData[j] = {
				title: tableData.rows[i].title, 
				hasChild: tableData.rows[i].hasChild, 
				test: tableData.rows[i].test 
			};
			if (tableData.rows[i].locId) { 
				newData[j].locId = tableData.rows[i].locId; 
			} else {
				newData[j].itemId = tableData.rows[i].itemId;
			}
			j++;
		}
		if (!spotFound) {
			newData[j] = newItem;
		}
	}
	
	tableview.setData(newData);
};

var updateItemNameInTable = function (item, tableview){
	var tableData = tableview.data[0];
	var newData = [];
	var tableSize = tableData.rowCount;
	for (var i = 0; i<tableSize; i++) {
		newData[i] = {
			hasChild: tableData.rows[i].hasChild, 
			test: tableData.rows[i].test ,
			itemId: tableData.rows[i].itemId
		};
		if ( tableData.rows[i].itemId == item.itemId ) {
			newData[i].title = item.title;
			Ti.API.info(tableData.rows[i].itemId +'=='+ item.itemId);
		} else {
			newData[i].title = tableData.rows[i].title;
			Ti.API.info(tableData.rows[i].itemId + '!=' + item.itemId);
		}
	}
	tableview.setData(newData);
};

// custom event fires after successful addition of item
Ti.App.addEventListener('addItemToView', function (e) { 
	var newItem = {
		title: e.title, 
		hasChild: true, 
		test: 'viewitem.js', 
		itemId: e.itemId
	};
	insertItemIntoTableViewArray(newItem, itemTableView);
	 
});
// custom event fires after successful addition of location
Ti.App.addEventListener('addLocationToView', function (e) { 
	var newLocation = {
		title: e.title, 
		hasChild: true, 
		test: 'viewlocation.js', 
		locId: e.locId
	};
	insertItemIntoTableViewArray(newLocation, locationTableView);
});
// custome even fires after successfull update to item
Ti.App.addEventListener('updateItemInView', function (e) {
	var updatedItem = {
		title: e.title, 
		itemId: e.itemId
	};
	updateItemNameInTable(updatedItem, itemTableView);
});

// Add UI elements to window
itemWindow.add(itemTableView);
itemWindow.rightNavButton = addItemButton;

locationWindow.add(locationTableView);
locationWindow.rightNavButton = addLocationButton;
