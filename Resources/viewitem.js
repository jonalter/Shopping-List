// View used to view items

var win = Titanium.UI.currentWindow;
win.backgroundColor = '#13386c';
var navGroup = win.navGroup;

var itemId = win.itemId;
var itemName = '';
var itemDescription = '';
var itemLocationId = '';
var itemLocation = '';
var itemStatus = '';
var editItemWin;

// Get Item from db
var getItem = function() {
	var db = Ti.Database.install( 'shoppingDB.sql', '' );
	var itemRS = db.execute('SELECT i.id, i.name, i.description, i.location_id, l.name as location, status '+
							'FROM item as i '+
							'INNER JOIN location as l '+
							'ON i.location_id=l.id '+
							'WHERE i.id=(?) ', itemId);
 	if (itemRS.rowCount === 0) {
		alert('could not find item');
		Ti.API.error('could not find item with id: ' + itemId + ' in database: item');
	}
	while (itemRS.isValidRow()) {  
		itemName = itemRS.fieldByName('name');
		itemDescription = itemRS.fieldByName('description');
		itemLocationId = itemRS.fieldByName('location_id');
		itemLocation = itemRS.fieldByName('location');
		itemStatus = itemRS.fieldByName('status');
		Ti.API.info(itemId + ' ' + itemName); 
		
		itemRS.next(); 
	} 

	itemRS.close(); 	
	db.close();
};

getItem();

var editButton = Ti.UI.createButton({
	title: 'Edit'
});
editButton.addEventListener('click', function () {
	// make new window for createitem.js to use for editing item
	editItemWin = Titanium.UI.createWindow({
	 	url: 'createitem.js',
		title: itemName
	});
	editItemWin.itemId = itemId;
	editItemWin.itemName = itemName;
	editItemWin.itemDescription = itemDescription;
	editItemWin.itemLocationId = itemLocationId;
	editItemWin.itemLocation = itemLocation;
	editItemWin.itemStatus = itemStatus;
	
	editItemWin.navGroup = navGroup;
	navGroup.open(editItemWin);
});

var nameLabel = Titanium.UI.createLabel({
	color: '#fff',
	text: 'Name',
	top: 10,
	left: 10,
	width: 'auto',
	height: 'auto'
});

var nameTextField = Titanium.UI.createTextField({
	color: '#336699',
	top: 35,
	left: 10,
	width: 300,
	height: 40,
	enabled: false,
	value: itemName,
	keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});

var descriptionLabel = Titanium.UI.createLabel({
	color: '#fff',
	text: 'Description',
	top: 80,
	left: 10,
	width: 'auto',
	height: 'auto'
});

var descriptionTextField = Titanium.UI.createTextField({
	color: '#336699',
	top: 105,
	left: 10,
	width: 300,
	height: 40,
	enabled: false,
	value: itemDescription,
	keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});

var locationLabel = Titanium.UI.createLabel({
	color: '#fff',
	text: 'Location',
	top: 150,
	left: 10,
	width: 'auto',
	height: 'auto'
});

var locationTextField = Titanium.UI.createTextField({
	color: '#336699',
	top: 175,
	left: 10,
	width: 300,
	height: 40,
	enabled: false,
	value: itemLocation,
	keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});

var statusLabel = Titanium.UI.createLabel({
	color: '#fff',
	text: 'Status',
	top: 220,
	left: 10,
	width: 'auto',
	height: 'auto'
});

var statusTextField = Titanium.UI.createTextField({
	color: '#336699',
	top: 245,
	left: 10,
	width: 300,
	height: 40,
	enabled: false,
	keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});

var setStatus = function(e) {
	switch(e){
		case 0: statusTextField.value = 'Unknown'; break;
		case 1: statusTextField.value = 'In Stock'; break;
		case 2: statusTextField.value = 'Low'; break;
		case 3: statusTextField.value = 'Out of Stock'; break;
		default: statusTextField.value = 'ERROR reading status: ' + itemStatus;
	}
};

setStatus(itemStatus);

var populateTableValues = function () {
	nameTextField.value = itemName;
	descriptionTextField.value = itemDescription;
	locationTextField.value = itemLocation;
	setStatus(itemStatus);
};

Ti.App.addEventListener('updateViewItemValues', function () {
	getItem();
	populateTableValues();
});

Ti.App.addEventListener('closeCreateItem', function () {
	// API Bug - when closing window, rightNavButton still remains
	// navGroup.close(editItemWin);
});

// Add UI elements to window
win.rightNavButton = editButton;
win.add(nameLabel);
win.add(nameTextField);
win.add(descriptionLabel);
win.add(descriptionTextField);
win.add(locationLabel);
win.add(locationTextField);
win.add(statusLabel);
win.add(statusTextField);
