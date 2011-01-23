// View used to create and edit items

var win = Titanium.UI.currentWindow;
win.backgroundColor = '#13386c';
var navGroup = win.navGroup;
var itemId = win.itemId;
var itemName = win.itemName;
var itemDescription = win.itemDescription;
var itemLocationId = win.itemLocationId;
var itemLocation = win.itemLocation;
var itemStatus = win.itemStatus;

var newName = '';
var newDescription = '';
var newLocation_id = '';
var newStatus_id = '';
var selectedLocationIndex;

var nameTextField = Titanium.UI.createTextField({
	color: '#336699',
	top: 10,
	left: 10,
	width: 300,
	height: 40,
	hintText: 'name',
	value: itemName,
	keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});
nameTextField.addEventListener('return', function (e) {
	nameTextField.blur();
});

var descriptionTextField = Titanium.UI.createTextField({
	color: '#336699',
	top: 55,
	left: 10,
	width: 300,
	height: 40,
	hintText: 'description',
	value: itemDescription,
	keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});
descriptionTextField.addEventListener('return', function (e) {
	descriptionTextField.blur();
});

win.addEventListener('click', function(e) {
	nameTextField.blur();
	descriptionTextField.blur();
});

var locationLabel = Ti.UI.createLabel({
	color: '#fff',
	text: 'Location',
	textAlign: 'center',
	width: 145,
	height: 'auto',
	top: 120,
	left: 10
});

var statusLabel = Ti.UI.createLabel({
	color: '#fff',
	text: 'Status',
	textAlign: 'center',
	width: 145,
	height: 'auto',
	top: 120,
	right: 10
});

var picker = Ti.UI.createPicker({
	bottom:0
});

var loadPicker = function () {
	var column1 = Ti.UI.createPickerColumn({opacity:0});
	var db = Ti.Database.install( 'shoppingDB.sql', '' );
	var locationRS = db.execute('SELECT id, name FROM location ORDER BY name');
	var locId, locName, locIndex = 0;

	while (locationRS.isValidRow()) {
		locId = locationRS.fieldByName('id');
		locName = locationRS.fieldByName('name');
		column1.addRow(Ti.UI.createPickerRow({title:locName, location_id:locId}));
		if (itemLocationId === locId) {
			Ti.API.info('FOUND: '+itemLocationId+' === '+locId+' at index: '+locIndex);
			selectedLocationIndex = locIndex;
		}
		locIndex++;
		locationRS.next();
	}

	var column2 = Ti.UI.createPickerColumn();
	column2.addRow(Ti.UI.createPickerRow({title:'Unknown', status_id:'0'}));
	column2.addRow(Ti.UI.createPickerRow({title:'In Stock', status_id:'1'}));
	column2.addRow(Ti.UI.createPickerRow({title:'Low', status_id:'2'}));
	column2.addRow(Ti.UI.createPickerRow({title:'Out of Stock', status_id:'3'}));

	// 2 columns as an array
	picker.add([column1, column2]);
	picker.addEventListener('change', function (e) {
		if (e.columnIndex === 0) {
			// location column
			Ti.API.info('change col0 to name: ' + e.row.title + ' w/ loc: ' + e.row.location_id);
		} else if (e.columnIndex === 1) {
			// item status column
			Ti.API.info('change col1 to name: ' + e.row.title + ' w/ loc: ' + e.row.status_id);
		} else {
			Ti.API.info('columnIndex is ' + e.columnIndex + ' ERROR!');
		}
	});
};

loadPicker();

// turn on the selection indicator (off by default)
picker.selectionIndicator = true;

var createButton = Titanium.UI.createButton({
	title: 'Add'
});
if (itemId) {
	createButton.title = 'Update';
}
createButton.addEventListener('click', function () {
	// save all form values
	newName = nameTextField.value;
	newDescription = descriptionTextField.value;
	var newLocRow = picker.getSelectedRow(0);
	newLocation_id = newLocRow.location_id;
	Ti.API.info('current loc row id: ' + newLocRow.title + ' location_id: ' + newLocRow.location_id);
	var newStatusRow = picker.getSelectedRow(1);
	newStatus_id = newStatusRow.status_id;
	Ti.API.info('current status row id: ' + newStatusRow.title + ' status_id: ' + newStatusRow.status_id);
	
	// Add the new item to the database
	var db = Ti.Database.install('shoppingDB.sql', '');
	var nameRS;
	if (newName) {
		if (itemId) {
			nameRS = db.execute('SELECT name FROM item WHERE id!=(?) AND name=(?)', itemId, newName);
			if (nameRS.rowCount === 0) {
				Ti.API.info('About to update with name: ' + newName + 
					' description: ' + newDescription + 
					' location_id: ' + newLocation_id + 
					' status_id: ' + newStatus_id
				);
				db.execute('UPDATE item SET name=(?),description=(?),location_id=(?),status=(?) WHERE id=(?)', 
					newName, newDescription, newLocation_id, newStatus_id, itemId
				);
				// alert confirmation
				alert(newName + ' updated');
				Ti.App.fireEvent('updateViewItemValues');
				Ti.App.fireEvent('updateItemInView',{
					title: newName, 
					itemId: itemId
				});
			} else {
				alert(newName +' already exists');
			}
			nameRS.close();
			db.close();
			// bug - If you close the window the rightNavButton will still be there
			// navGroup.close(win);
			Ti.App.fireEvent('closeCreateItem');
		} else {
			// check for item with that name in db
			var itemRS = db.execute('SELECT id FROM item WHERE name=(?)', newName);
			if (itemRS.rowCount === 0) {
				Ti.API.info('name: ' + newName + 
					' description: ' + newDescription + 
					' location_id: ' + newLocation_id +
					' status_id: ' + newStatus_id
				);
				db.execute('INSERT into item (name,description,location_id,status) VALUES (?,?,?,?)',
					newName, newDescription, newLocation_id, newStatus_id);
				// lookup item by name to get id
				var idRS = db.execute('SELECT id FROM item WHERE name=(?)', newName);
				var lastInsertId;
				if (idRS.isValidRow()) { 
					lastInsertId = idRS.fieldByName('id');
				}
				// custom event to add item to table view
				Ti.App.fireEvent('addItemToView', { 
					title: newName, 
					itemId: lastInsertId 
				});
				// alert confirmation
				alert(newName + " added");
				nameTextField.value = '';
				descriptionTextField.value = '';
			} else {
				alert(newName +' already exists');
			}
			itemRS.close();
		}
	}else{
		alert('Name can\'t be blank');
	}
	db.close();
});

// Add UI elements to window
win.rightNavButton = createButton;
win.add(nameTextField);
win.add(descriptionTextField);
win.add(locationLabel);
win.add(statusLabel);
win.add(picker);

picker.setSelectedRow(1, itemStatus);
picker.setSelectedRow(0, selectedLocationIndex);
